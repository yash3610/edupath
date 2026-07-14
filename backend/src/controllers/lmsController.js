import {
  AIChat,
  AISummary,
  Assignment,
  AssignmentSubmission,
  CalendarEvent,
  Category,
  Certificate,
  Conversation,
  Course,
  CourseAnalytics,
  Coupon,
  DiscussionAnswer,
  DiscussionQuestion,
  Enrollment,
  InstructorProfile,
  Lecture,
  LectureProgress,
  MLAnalytics,
  Message,
  Module,
  Note,
  Notification,
  Order,
  Payment,
  PlatformSettings,
  Payout,
  Quiz,
  QuizAttempt,
  RefundRequest,
  Reminder,
  Review,
  StudentProfile,
  User,
  Wishlist,
} from "../models/index.js";
import { fallbackCourses } from "../data/fallbackContent.js";
import { askAI, recommendCourses, summarizeText } from "../services/aiService.js";
import { buildMLAnalytics } from "../services/mlService.js";
import { createRazorpayOrder, verifyRazorpaySignature } from "../services/paymentService.js";
import { generateCertificatePdf } from "../services/pdfService.js";
import { emitMessageToConversation } from "../services/socketService.js";
import { deleteLocalAsset, deleteUploadedAsset, uploadBuffer, uploadLocalAsset } from "../services/uploadService.js";
import {
  PUBLIC_COURSE_STATUSES,
  courseCompletion,
  markCourseContentInProgress,
  normalizeCourseStatus,
  notifyCourseUsers,
} from "../services/courseLifecycleService.js";
import { randomUUID } from "node:crypto";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";

const ok = (res, data, message = "OK") => res.json({ success: true, message, data });
const created = (res, data, message = "Created") => res.status(201).json({ success: true, message, data });
const userId = (req) => req.user?._id;
const toList = (value) => Array.isArray(value) ? value : String(value || "").split(/\r?\n|,/).map((item) => item.trim()).filter(Boolean);
const slugify = (value) => String(value || "")
  .toLowerCase()
  .trim()
  .replace(/[^a-z0-9]+/g, "-")
  .replace(/^-+|-+$/g, "");

async function uniqueCourseSlug(source, ignoreId) {
  const base = slugify(source) || `course-${Date.now()}`;
  let slug = base;
  let suffix = 1;
  while (await Course.exists({ slug, ...(ignoreId ? { _id: { $ne: ignoreId } } : {}) })) {
    suffix += 1;
    slug = `${base}-${suffix}`;
  }
  return slug;
}

async function requireStudentEnrollment(req, courseId) {
  const enrollment = await Enrollment.findOne({
    student: userId(req),
    course: courseId,
    status: { $in: ["active", "completed"] },
  });
  if (!enrollment) throw new ApiError(403, "Enrollment required");
  return enrollment;
}

const normalizeCoursePayload = (body) => {
  const payload = { ...body };
  if (payload.landingPage !== undefined) payload.landingPage = toPlainObject(payload.landingPage);
  if (payload.status) payload.status = normalizeCourseStatus(payload.status);
  if (payload.instructor === "") payload.instructor = null;
  ["learningOutcomes", "objectives", "skills", "requirements", "prerequisites", "targetAudience", "tags"].forEach((key) => {
    if (payload[key] !== undefined) payload[key] = toList(payload[key]);
  });
  ["price", "discountPrice"].forEach((key) => {
    if (payload[key] !== undefined && payload[key] !== "") payload[key] = Number(payload[key]);
  });
  if (payload.pricingType === "free") {
    payload.price = 0;
    payload.discountPrice = 0;
  }
  if (payload.free === true || payload.free === "true") {
    payload.pricingType = "free";
    payload.price = 0;
    payload.discountPrice = 0;
  }
  if (payload.certificate !== undefined) payload.certificateEnabled = payload.certificate === true || payload.certificate === "true";
  if (payload.visibility === "private") payload.disabled = true;
  return payload;
};

async function attachCourseThumbnailUpload(req, payload) {
  if (!req.file) return;
  const thumbnail = await uploadLocalAsset(req.file, { owner: userId(req), usage: "course-thumbnail" });
  payload.thumbnail = thumbnail._id;
}

async function issueCertificateIfEligible(student, courseId, progress) {
  const platformSettings = await readPlatformSettings();
  const certificateSettings = platformSettings.certificate || {};
  if (!certificateSettings.autoIssue) return null;
  if (certificateSettings.requireFullProgress && progress < 100) return null;
  const course = await Course.findById(courseId);
  if (!course?.certificateEnabled) return null;
  const existing = await Certificate.findOne({ student, course: courseId });
  if (existing) return existing;

  if (course.certificateRules?.requireQuizzes || certificateSettings.requireQuizPass) {
    const quizIds = await Quiz.find({ course: courseId }).distinct("_id");
    const passed = await QuizAttempt.distinct("quiz", { student, quiz: { $in: quizIds }, status: "passed" });
    if (passed.length < quizIds.length) return null;
  }
  if (course.certificateRules?.requireAssignments || certificateSettings.requireAssignmentCompletion) {
    const assignmentIds = await Assignment.find({ course: courseId }).distinct("_id");
    const completed = await AssignmentSubmission.distinct("assignment", { student, assignment: { $in: assignmentIds }, status: { $in: ["submitted", "graded"] } });
    if (completed.length < assignmentIds.length) return null;
  }

  const certificateCode = `EDU-${randomUUID().slice(0, 8).toUpperCase()}`;
  const baseUrl = process.env.API_PUBLIC_URL || `http://localhost:${process.env.PORT || 5000}`;
  const verificationPrefix = certificateSettings.verificationPrefix || "/api/certificates/verify";
  const verificationUrl = `${baseUrl}${verificationPrefix.startsWith("/") ? "" : "/"}${verificationPrefix}/${certificateCode}`;
  const certificate = await Certificate.create({
    student,
    course: courseId,
    instructor: course.instructor,
    certificateCode,
    issuedAt: new Date(),
    completionDate: new Date(),
    verificationUrl,
    qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(verificationUrl)}`,
  });
  await notifyCourseUsers([student], { title: "Certificate generated", message: `Your certificate for ${course.title} is ready.` });
  return certificate;
}

export const dashboardStats = asyncHandler(async (req, res) => {
  const student = userId(req);
  const [enrollments, watchTime, certificates, quizScores] = await Promise.all([
    Enrollment.find({ student }).select("status progress").lean(),
    LectureProgress.aggregate([
      { $match: { student } },
      { $group: { _id: null, seconds: { $sum: "$watchTimeSeconds" } } },
    ]),
    Certificate.countDocuments({ student }),
    QuizAttempt.find({ student, status: { $in: ["submitted", "auto-submitted", "passed", "failed"] } }).select("percentage score").lean(),
  ]);
  const quizAverage = quizScores.length
    ? Math.round(quizScores.reduce((sum, item) => sum + Number(item.percentage ?? item.score ?? 0), 0) / quizScores.length)
    : 0;
  ok(res, {
    enrolledCourses: enrollments.length,
    completedCourses: enrollments.filter((item) => item.status === "completed" || item.progress >= 100).length,
    learningHours: Number(((watchTime[0]?.seconds || 0) / 3600).toFixed(1)),
    certificates,
    quizAverage,
  });
});
export const studentAnalytics = asyncHandler(async (req, res) => {
  const student = userId(req);
  const [enrollments, progress, attempts, certificateCount] = await Promise.all([
    Enrollment.find({ student }).populate("course", "title thumbnail tags").sort({ updatedAt: -1 }).lean(),
    LectureProgress.find({ student }).select("course completed watchTimeSeconds watchedPercentage updatedAt").lean(),
    QuizAttempt.find({ student, status: { $in: ["submitted", "auto-submitted", "passed", "failed"] } })
      .populate("quiz", "title")
      .sort({ submittedAt: 1, createdAt: 1 })
      .lean(),
    Certificate.countDocuments({ student }),
  ]);

  const totalWatchSeconds = progress.reduce((sum, item) => sum + Number(item.watchTimeSeconds || 0), 0);
  const completedLectures = progress.filter((item) => item.completed).length;
  const averageProgress = enrollments.length
    ? Math.round(enrollments.reduce((sum, item) => sum + Number(item.progress || 0), 0) / enrollments.length)
    : 0;
  const scoredAttempts = attempts.map((item) => Number(item.percentage ?? item.score ?? 0));
  const quizAverage = scoredAttempts.length
    ? Math.round(scoredAttempts.reduce((sum, score) => sum + score, 0) / scoredAttempts.length)
    : 0;

  const dayFormatter = new Intl.DateTimeFormat("en-US", { weekday: "short" });
  const activityByDay = new Map();
  for (let offset = 6; offset >= 0; offset -= 1) {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - offset);
    activityByDay.set(date.toISOString().slice(0, 10), { day: dayFormatter.format(date), minutes: 0, lectures: 0 });
  }
  progress.forEach((item) => {
    const key = new Date(item.updatedAt).toISOString().slice(0, 10);
    const day = activityByDay.get(key);
    if (!day) return;
    day.minutes += Math.round(Number(item.watchTimeSeconds || 0) / 60);
    if (item.completed) day.lectures += 1;
  });

  const courseProgress = enrollments.map((item) => ({
    id: item.course?._id || item.course,
    title: item.course?.title || "Course",
    thumbnail: item.course?.thumbnail || "",
    progress: Math.round(Number(item.progress || 0)),
    status: item.status,
  }));
  const quizTrend = attempts.slice(-8).map((item, index) => ({
    attempt: index + 1,
    title: item.quiz?.title || `Quiz ${index + 1}`,
    score: Math.round(Number(item.percentage ?? item.score ?? 0)),
  }));

  ok(res, {
    summary: {
      enrolledCourses: enrollments.length,
      completedCourses: enrollments.filter((item) => item.status === "completed" || Number(item.progress) >= 100).length,
      averageProgress,
      learningHours: Number((totalWatchSeconds / 3600).toFixed(1)),
      completedLectures,
      quizAverage,
      certificates: certificateCount,
    },
    weeklyActivity: [...activityByDay.values()],
    courseProgress,
    quizTrend,
    insights: {
      engagement: totalWatchSeconds > 5 * 3600 ? "High" : totalWatchSeconds > 3600 ? "Growing" : "Getting started",
      completionProbability: Math.min(100, Math.round(averageProgress * 0.7 + Math.min(completedLectures, 20) * 1.5)),
      strongestCourse: [...courseProgress].sort((a, b) => b.progress - a.progress)[0]?.title || "Complete a lesson to unlock insights",
      recommendation: averageProgress < 50
        ? "Continue one active course consistently before starting another."
        : "Your progress is strong. Keep the same weekly learning rhythm.",
    },
  });
});
export const continueLearning = asyncHandler(async (req, res) => ok(res, await Enrollment.findOne({ student: userId(req) }).populate("course")));
export const recommendedCourses = asyncHandler(async (_req, res) => ok(res, await Course.find({ status: { $in: PUBLIC_COURSE_STATUSES }, disabled: { $ne: true } }).sort({ featured: -1, rating: -1 }).limit(6)));
export const upcomingClasses = asyncHandler(async (req, res) => ok(res, await CalendarEvent.find({ user: userId(req), startAt: { $gte: new Date() } }).sort({ startAt: 1 }).limit(8)));
export const recentNotifications = asyncHandler(async (req, res) => ok(res, await Notification.find({ user: userId(req) }).sort({ createdAt: -1 }).limit(10)));
export const achievements = asyncHandler(async (req, res) => ok(res, { streak: 18, badges: ["Quiz Champion", "Fast Finisher"], student: userId(req) }));

export const myCourses = asyncHandler(async (req, res) => {
  const query = { student: userId(req) };
  const enrollments = await Enrollment.find(query).populate("course").lean();
  const filtered = enrollments.filter((item) => {
    const statusMatch = !req.query.status || item.status === req.query.status;
    const searchMatch = !req.query.search || item.course?.title?.toLowerCase().includes(String(req.query.search).toLowerCase());
    return statusMatch && searchMatch;
  });
  const hydrated = await Promise.all(filtered.map(async (item) => {
    if (!item.course?._id) return item;
    const [totalLectures, completedLectures, firstIncomplete] = await Promise.all([
      Lecture.countDocuments({ course: item.course._id, published: { $ne: false } }),
      LectureProgress.countDocuments({ student: userId(req), course: item.course._id, completed: true }),
      Lecture.findOne({
        course: item.course._id,
        published: { $ne: false },
        _id: { $nin: await LectureProgress.find({ student: userId(req), course: item.course._id, completed: true }).distinct("lecture") },
      }).sort({ order: 1 }).select("title").lean(),
    ]);
    return {
      ...item,
      progress: totalLectures ? Math.round((completedLectures / totalLectures) * 100) : Number(item.progress || 0),
      course: {
        ...item.course,
        totalLectures,
        completedLectures,
        currentLecture: firstIncomplete?.title || (totalLectures ? "Course completed" : "Open next lesson"),
      },
    };
  }));
  ok(res, hydrated);
});
export const courseProgress = asyncHandler(async (req, res) => ok(res, await LectureProgress.find({ student: userId(req), course: req.params.courseId })));

export const learningCourse = asyncHandler(async (req, res) => {
  const enrollment = await Enrollment.findOne({ student: userId(req), course: req.params.courseId });
  if (!enrollment) throw new ApiError(403, "Enroll in this course to access the learning room");
  const course = await Course.findOne({ _id: req.params.courseId, status: { $in: PUBLIC_COURSE_STATUSES }, disabled: { $ne: true } }).populate("instructor", "name");
  if (!course) throw new ApiError(404, "Course is unavailable");
  ok(res, course);
});
export const courseModules = asyncHandler(async (req, res) => {
  const enrollment = await Enrollment.findOne({ student: userId(req), course: req.params.courseId });
  if (!enrollment) throw new ApiError(403, "Enrollment required");
  const course = await Course.findOne({ _id: req.params.courseId, status: { $in: PUBLIC_COURSE_STATUSES }, disabled: { $ne: true } });
  if (!course) throw new ApiError(404, "Course is unavailable");
  const modules = await Module.find({ course: req.params.courseId }).sort({ order: 1 }).lean();
  const lectures = await Lecture.find({ course: req.params.courseId, published: { $ne: false } }).sort({ order: 1 }).lean();
  const progress = await LectureProgress.find({ student: userId(req), course: req.params.courseId }).lean();
  const completed = new Set(progress.filter((item) => item.completed).map((item) => String(item.lecture)));
  const now = new Date();
  let previousComplete = true;
  const orderedLectures = modules.flatMap((module) => lectures.filter((lecture) => String(lecture.module) === String(module._id)));
  const hydratedLectures = orderedLectures.map((lecture) => {
    const unlockDate = lecture.unlockType === "date" ? lecture.unlockAt
      : lecture.unlockType === "days" ? new Date(new Date(enrollment.enrolledAt).getTime() + Number(lecture.daysAfterEnrollment || 0) * 86400000)
      : null;
    const dripLocked = Boolean(lecture.dripEnabled && unlockDate && unlockDate > now);
    const locked = Boolean(lecture.isLocked || dripLocked || (course.sequentialLearning && !previousComplete));
    const isComplete = completed.has(String(lecture._id));
    previousComplete = isComplete;
    return { ...lecture, completed: isComplete, locked, unlockDate };
  });
  ok(res, modules.map((module) => ({
    ...module,
    lectures: hydratedLectures.filter((lecture) => String(lecture.module) === String(module._id)),
  })));
});
export const lectureDetails = asyncHandler(async (req, res) => {
  const lecture = await Lecture.findById(req.params.lectureId);
  if (!lecture || !(await Enrollment.exists({ student: userId(req), course: lecture.course }))) throw new ApiError(404, "Lecture not found");
  ok(res, lecture);
});
export const patchLectureProgress = asyncHandler(async (req, res) => {
  const lecture = await Lecture.findById(req.params.lectureId).select("course");
  if (!lecture) throw new ApiError(404, "Lecture not found");
  await requireStudentEnrollment(req, lecture.course);
  const progress = await LectureProgress.findOneAndUpdate({ student: userId(req), lecture: req.params.lectureId }, { $set: { ...req.body, course: lecture.course } }, { new: true, upsert: true });
  const totalLectures = await Lecture.countDocuments({ course: lecture.course, published: { $ne: false } });
  const completedLectures = await LectureProgress.countDocuments({ student: userId(req), course: lecture.course, completed: true });
  await Enrollment.findOneAndUpdate({ student: userId(req), course: lecture.course }, { progress: totalLectures ? Math.round((completedLectures / totalLectures) * 100) : 0 });
  ok(res, progress, "Progress updated");
});
export const completeLecture = asyncHandler(async (req, res) => {
  const lecture = await Lecture.findById(req.params.lectureId).select("course");
  if (!lecture) throw new ApiError(404, "Lecture not found");
  await requireStudentEnrollment(req, lecture.course);
  const progress = await LectureProgress.findOneAndUpdate({ student: userId(req), lecture: req.params.lectureId }, { $set: { completed: true, course: lecture.course } }, { new: true, upsert: true });
  const totalLectures = await Lecture.countDocuments({ course: lecture.course, published: { $ne: false } });
  const completedLectures = await LectureProgress.countDocuments({ student: userId(req), course: lecture.course, completed: true });
  const percent = totalLectures ? Math.round((completedLectures / totalLectures) * 100) : 0;
  await Enrollment.findOneAndUpdate({ student: userId(req), course: lecture.course }, { progress: percent, ...(percent === 100 ? { status: "completed" } : {}) });
  const certificate = await issueCertificateIfEligible(userId(req), lecture.course, percent);
  ok(res, { progress, certificate }, "Lecture completed");
});
export const bookmarkLecture = asyncHandler(async (req, res) => {
  const lecture = await Lecture.findById(req.params.lectureId).select("course");
  if (!lecture) throw new ApiError(404, "Lecture not found");
  await requireStudentEnrollment(req, lecture.course);
  ok(res, await LectureProgress.findOneAndUpdate({ student: userId(req), lecture: req.params.lectureId }, { $set: { bookmarked: true, course: lecture.course } }, { new: true, upsert: true }), "Bookmarked");
});
export const watchTime = asyncHandler(async (req, res) => {
  const lecture = await Lecture.findById(req.params.lectureId).select("course");
  if (!lecture) throw new ApiError(404, "Lecture not found");
  await requireStudentEnrollment(req, lecture.course);
  ok(res, await LectureProgress.findOneAndUpdate({ student: userId(req), lecture: req.params.lectureId }, { $inc: { watchTimeSeconds: Number(req.body.seconds || 0) }, $set: { course: lecture.course } }, { new: true, upsert: true }), "Watch time saved");
});
export const courseResources = asyncHandler(async (req, res) => {
  const enrolled = await Enrollment.exists({
    student: userId(req),
    course: req.params.courseId,
    status: { $in: ["active", "completed"] },
  });
  if (!enrolled) throw new ApiError(403, "Enroll in this course to access its resources");
  ok(res, await Lecture.find({ course: req.params.courseId }).select("resources title updatedAt").sort({ order: 1 }));
});
export const studentDownloads = asyncHandler(async (req, res) => {
  const courseIds = await Enrollment.find({
    student: userId(req),
    status: { $in: ["active", "completed"] },
  }).distinct("course");

  const lectures = await Lecture.find({ course: { $in: courseIds }, published: { $ne: false } })
    .select("title course module videoUrl notesPdfUrl captionsUrl resources downloadable updatedAt createdAt")
    .populate("course", "title")
    .populate("module", "title")
    .sort({ updatedAt: -1 })
    .lean();

  const directVideo = (url = "") => /\.(mp4|webm|mov|m4v)(\?|#|$)/i.test(String(url));
  const rows = lectures.flatMap((lecture) => {
    const base = {
      course: lecture.course?.title || "Course",
      courseId: lecture.course?._id || lecture.course,
      module: lecture.module?.title || "Module",
      lecture: lecture.title || "Lecture",
      lectureId: lecture._id,
      updatedAt: lecture.updatedAt || lecture.createdAt,
    };
    const resources = (lecture.resources || []).map((resource, index) => {
      const item = typeof resource === "string" ? { title: `Resource ${index + 1}`, url: resource, type: "resource" } : resource;
      return {
        ...base,
        id: `${lecture._id}-resource-${item._id || index}`,
        name: item.title || `Resource ${index + 1}`,
        url: item.url || item,
        type: item.type || "resource",
      };
    }).filter((item) => item.url);
    const notes = lecture.notesPdfUrl ? [{
      ...base,
      id: `${lecture._id}-notes`,
      name: `${lecture.title || "Lecture"} notes`,
      url: lecture.notesPdfUrl,
      type: "pdf",
    }] : [];
    const captions = lecture.captionsUrl ? [{
      ...base,
      id: `${lecture._id}-captions`,
      name: `${lecture.title || "Lecture"} captions`,
      url: lecture.captionsUrl,
      type: "vtt",
    }] : [];
    const videos = lecture.downloadable !== false && directVideo(lecture.videoUrl) ? [{
      ...base,
      id: `${lecture._id}-video`,
      name: `${lecture.title || "Lecture"} video`,
      url: lecture.videoUrl,
      type: "video",
    }] : [];
    return [...resources, ...notes, ...captions, ...videos];
  });

  ok(res, rows);
});

export const getNotes = asyncHandler(async (req, res) => ok(res, await Note.find({ student: userId(req) }).sort({ pinned: -1, updatedAt: -1 })));
export const getCourseNotes = asyncHandler(async (req, res) => ok(res, await Note.find({ student: userId(req), course: req.params.courseId })));
export const createNote = asyncHandler(async (req, res) => created(res, await Note.create({ ...req.body, student: userId(req) })));
export const updateNote = asyncHandler(async (req, res) => ok(res, await Note.findOneAndUpdate({ _id: req.params.noteId, student: userId(req) }, req.body, { new: true })));
export const deleteNote = asyncHandler(async (req, res) => ok(res, await Note.deleteOne({ _id: req.params.noteId, student: userId(req) }), "Note deleted"));
export const pinNote = asyncHandler(async (req, res) => {
  const note = await Note.findOne({ _id: req.params.noteId, student: userId(req) });
  if (!note) throw new ApiError(404, "Note not found");
  note.pinned = !note.pinned;
  await note.save();
  ok(res, note, note.pinned ? "Note pinned" : "Note unpinned");
});

export const courseQuizzes = asyncHandler(async (req, res) => ok(res, await Quiz.find({ course: req.params.courseId })));
export const startQuiz = asyncHandler(async (req, res) => ok(res, await Quiz.findById(req.params.quizId)));
export const submitQuiz = asyncHandler(async (req, res) => {
  const quiz = await Quiz.findById(req.params.quizId);
  if (!quiz) throw new ApiError(404, "Quiz not found");
  const answers = req.body.answers || [];
  const correct = quiz.questions.reduce((sum, q, index) => sum + (q.correctIndex === answers[index] ? 1 : 0), 0);
  const attempt = await QuizAttempt.create({ quiz: quiz._id, student: userId(req), answers, correct, wrong: quiz.questions.length - correct, score: Math.round((correct / quiz.questions.length) * 100), submittedAt: new Date() });
  created(res, attempt, "Quiz submitted");
});
export const quizResult = asyncHandler(async (req, res) => ok(res, await QuizAttempt.findOne({ quiz: req.params.quizId, student: userId(req) }).sort({ createdAt: -1 })));
export const retakeQuiz = asyncHandler(async (_req, res) => ok(res, { retakeAllowed: true }, "Retake started"));

export const studentAssignments = asyncHandler(async (req, res) => {
  const courseIds = await Enrollment.find({
    student: userId(req),
    status: { $in: ["active", "completed"] },
  }).distinct("course");
  ok(res, await Assignment.find({ course: { $in: courseIds } }).sort({ dueDate: 1 }));
});
export const assignmentDetails = asyncHandler(async (req, res) => {
  const assignment = await Assignment.findById(req.params.assignmentId);
  if (!assignment) throw new ApiError(404, "Assignment not found");
  await requireStudentEnrollment(req, assignment.course);
  ok(res, assignment);
});
export const submitAssignment = asyncHandler(async (req, res) => {
  const assignment = await Assignment.findById(req.params.assignmentId);
  if (!assignment) throw new ApiError(404, "Assignment not found");
  await requireStudentEnrollment(req, assignment.course);
  const upload = await uploadBuffer(req.file, "assignments");
  const submission = await AssignmentSubmission.findOneAndUpdate(
    { assignment: assignment._id, student: userId(req) },
    { fileUrl: upload?.url, status: "submitted" },
    { new: true, upsert: true }
  );
  created(res, submission, "Assignment submitted");
});
export const assignmentSubmission = asyncHandler(async (req, res) => {
  const assignment = await Assignment.findById(req.params.assignmentId);
  if (!assignment) throw new ApiError(404, "Assignment not found");
  await requireStudentEnrollment(req, assignment.course);
  ok(res, await AssignmentSubmission.findOne({ assignment: assignment._id, student: userId(req) }));
});

export const myCertificates = asyncHandler(async (req, res) => ok(res, await Certificate.find({ student: userId(req) }).populate("course")));
export const certificateDetails = asyncHandler(async (req, res) => {
  const certificate = await Certificate.findOne({ _id: req.params.certificateId, student: userId(req) }).populate("course student");
  if (!certificate) throw new ApiError(404, "Certificate not found");
  ok(res, certificate);
});
export const downloadCertificate = asyncHandler(async (req, res) => {
  const cert = await Certificate.findOne({ _id: req.params.certificateId, student: userId(req) }).populate("course student");
  if (!cert) throw new ApiError(404, "Certificate not found");
  const pdf = await generateCertificatePdf({
    studentName: cert.student?.name,
    courseTitle: cert.course?.title,
    certificateCode: cert.certificateCode,
    issuedAt: cert.issuedAt,
  });
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="${cert.certificateCode}.pdf"`);
  res.send(pdf);
});
export const verifyCertificate = asyncHandler(async (req, res) => ok(res, await Certificate.findOne({ certificateCode: req.params.certificateCode }).populate("course student")));

export const getWishlist = asyncHandler(async (req, res) => ok(res, await Wishlist.find({ student: userId(req) }).populate("course")));
export const addWishlist = asyncHandler(async (req, res) => created(res, await Wishlist.findOneAndUpdate({ student: userId(req), course: req.params.courseId }, {}, { upsert: true, new: true })));
export const removeWishlist = asyncHandler(async (req, res) => ok(res, await Wishlist.deleteOne({ student: userId(req), course: req.params.courseId }), "Removed"));

export const calendarEvents = asyncHandler(async (req, res) => {
  const query = { user: userId(req) };
  if (req.query.month) {
    const start = new Date(`${req.query.month}-01T00:00:00.000Z`);
    const end = new Date(start);
    end.setMonth(end.getMonth() + 1);
    query.startAt = { $gte: start, $lt: end };
  }
  ok(res, await CalendarEvent.find(query).sort({ startAt: 1 }));
});
export const createCalendarEvent = asyncHandler(async (req, res) => {
  if (!req.body.title?.trim() || !req.body.startAt) throw new ApiError(400, "Title and start date are required");
  const event = await CalendarEvent.create({ ...req.body, title: req.body.title.trim(), user: userId(req) });
  created(res, event, "Calendar event created");
});
export const updateCalendarEvent = asyncHandler(async (req, res) => {
  const event = await CalendarEvent.findOneAndUpdate(
    { _id: req.params.eventId, user: userId(req) },
    req.body,
    { new: true, runValidators: true }
  );
  if (!event) throw new ApiError(404, "Calendar event not found");
  ok(res, event, "Calendar event updated");
});
export const deleteCalendarEvent = asyncHandler(async (req, res) => {
  const event = await CalendarEvent.findOneAndDelete({ _id: req.params.eventId, user: userId(req) });
  if (!event) throw new ApiError(404, "Calendar event not found");
  ok(res, event, "Calendar event deleted");
});
export const createReminder = asyncHandler(async (req, res) => created(res, await Reminder.create({ ...req.body, user: userId(req) })));
export const updateReminder = asyncHandler(async (req, res) => ok(res, await Reminder.findOneAndUpdate({ _id: req.params.reminderId, user: userId(req) }, req.body, { new: true })));

export const notifications = asyncHandler(async (req, res) => {
  await Notification.deleteMany({ createdAt: { $lt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) } });
  const query = { user: userId(req) };
  if (req.query.unread === "true") query.read = false;
  const limit = Math.min(Math.max(Number.parseInt(req.query.limit, 10) || 0, 0), 50);
  let notificationQuery = Notification.find(query).sort({ createdAt: -1 });
  if (limit) notificationQuery = notificationQuery.limit(limit);
  const items = await notificationQuery;
  if (req.query.summary === "true") {
    const unreadCount = await Notification.countDocuments({ user: userId(req), read: false });
    return ok(res, { items, unreadCount });
  }
  ok(res, items);
});
export const readNotification = asyncHandler(async (req, res) => {
  const notification = await Notification.findOneAndUpdate({ _id: req.params.notificationId, user: userId(req) }, { read: true }, { new: true });
  if (!notification) throw new ApiError(404, "Notification not found");
  ok(res, notification, "Notification marked as read");
});
export const readAllNotifications = asyncHandler(async (req, res) => ok(res, await Notification.updateMany({ user: userId(req), read: false }, { read: true }), "Notifications marked as read"));
export const deleteNotification = asyncHandler(async (req, res) => {
  const notification = await Notification.findOneAndDelete({ _id: req.params.notificationId, user: userId(req) });
  if (!notification) throw new ApiError(404, "Notification not found");
  ok(res, notification, "Notification deleted");
});

export const conversations = asyncHandler(async (req, res) => {
  const items = await Conversation.find({ participants: userId(req) })
    .populate("participants", "name email role avatar")
    .sort({ lastMessageAt: -1, updatedAt: -1 })
    .lean();
  const data = await Promise.all(items.map(async (conversation) => ({
    ...conversation,
    unreadCount: await Message.countDocuments({
      conversation: conversation._id,
      sender: { $ne: userId(req) },
      readBy: { $ne: userId(req) },
    }),
  })));
  ok(res, data);
});
export const messageContacts = asyncHandler(async (req, res) => {
  let contactIds = [];
  if (req.user.role === "student") {
    const courseIds = await Enrollment.find({ student: userId(req), status: { $in: ["active", "completed"] } }).distinct("course");
    contactIds = await Course.find({ _id: { $in: courseIds }, instructor: { $ne: null } }).distinct("instructor");
  } else if (req.user.role === "instructor") {
    const courseIds = await Course.find({ instructor: userId(req) }).distinct("_id");
    contactIds = await Enrollment.find({ course: { $in: courseIds }, status: { $in: ["active", "completed"] } }).distinct("student");
  } else {
    contactIds = await User.find({ _id: { $ne: userId(req) }, status: "active" }).distinct("_id");
  }
  ok(res, await User.find({ _id: { $in: contactIds }, status: "active" }).select("name email role avatar").sort({ name: 1 }));
});
export const startConversation = asyncHandler(async (req, res) => {
  const participantId = req.body.participantId;
  if (!participantId || String(participantId) === String(userId(req))) throw new ApiError(400, "Select a valid contact");
  const allowedContacts = req.user.role === "admin"
    ? await User.exists({ _id: participantId, status: "active" })
    : await allowedMessageContact(req.user, participantId);
  if (!allowedContacts) throw new ApiError(403, "You cannot message this user");

  let conversation = await Conversation.findOne({ participants: { $all: [userId(req), participantId] }, $expr: { $eq: [{ $size: "$participants" }, 2] } });
  if (!conversation) conversation = await Conversation.create({ participants: [userId(req), participantId] });
  ok(res, await conversation.populate("participants", "name email role avatar"), "Conversation ready");
});
export const conversationMessages = asyncHandler(async (req, res) => {
  const conversation = await Conversation.findOne({ _id: req.params.conversationId, participants: userId(req) });
  if (!conversation) throw new ApiError(404, "Conversation not found");
  await Message.updateMany({ conversation: conversation._id, sender: { $ne: userId(req) } }, { $addToSet: { readBy: userId(req) } });
  ok(res, await Message.find({ conversation: conversation._id }).populate("sender", "name role avatar").sort({ createdAt: 1 }));
});
export const sendMessage = asyncHandler(async (req, res) => {
  const conversation = await Conversation.findOne({ _id: req.body.conversation, participants: userId(req) });
  if (!conversation) throw new ApiError(404, "Conversation not found");
  if (!req.body.body?.trim() && !req.body.attachmentUrl) throw new ApiError(400, "Message or attachment is required");
  const message = await Message.create({
    conversation: conversation._id,
    sender: userId(req),
    body: req.body.body?.trim() || "",
    attachmentUrl: req.body.attachmentUrl,
    attachmentName: req.body.attachmentName,
    attachmentType: req.body.attachmentType,
    readBy: [userId(req)],
  });
  conversation.lastMessage = message.body || `Attachment: ${message.attachmentName || "file"}`;
  conversation.lastMessageAt = new Date();
  await conversation.save();
  const [populatedMessage, populatedConversation] = await Promise.all([
    message.populate("sender", "name role avatar"),
    conversation.populate("participants", "name email role avatar"),
  ]);
  emitMessageToConversation(populatedConversation, populatedMessage);
  created(res, populatedMessage);
});
export const uploadAttachment = asyncHandler(async (req, res) => created(res, await uploadBuffer(req.file, "messages")));

async function allowedMessageContact(user, contactId) {
  if (user.role === "student") {
    const courseIds = await Enrollment.find({ student: user._id, status: { $in: ["active", "completed"] } }).distinct("course");
    return Course.exists({ _id: { $in: courseIds }, instructor: contactId });
  }
  if (user.role === "instructor") {
    const courseIds = await Course.find({ instructor: user._id }).distinct("_id");
    return Enrollment.exists({ course: { $in: courseIds }, student: contactId, status: { $in: ["active", "completed"] } });
  }
  return false;
}

export const myOrders = asyncHandler(async (req, res) => ok(res, await Order.find({ user: userId(req) }).sort({ createdAt: -1 })));
export const orderDetails = asyncHandler(async (req, res) => ok(res, await Order.findOne({ _id: req.params.orderId, user: userId(req) })));
export const orderInvoice = asyncHandler(async (req, res) => {
  const order = await Order.findOne({ _id: req.params.orderId, user: userId(req) });
  if (!order) throw new ApiError(404, "Order not found");
  ok(res, { invoiceUrl: `/api/orders/${order._id}/invoice.pdf` });
});
export const orderRefundRequest = asyncHandler(async (req, res) => {
  const order = await Order.findOne({ _id: req.params.orderId, user: userId(req) });
  if (!order) throw new ApiError(404, "Order not found");
  created(res, await RefundRequest.create({ user: userId(req), order: order._id, reason: req.body.reason }));
});

const profileModelFor = (role) => role === "instructor" ? InstructorProfile : role === "student" ? StudentProfile : null;
export const profileMe = asyncHandler(async (req, res) => {
  const ProfileModel = profileModelFor(req.user.role);
  const profile = ProfileModel ? await ProfileModel.findOne({ user: userId(req) }) : null;
  ok(res, { user: req.user, profile });
});
export const updateProfile = asyncHandler(async (req, res) => {
  const commonFields = ["name", "email", "phone", "bio"];
  const userUpdate = Object.fromEntries(commonFields.filter((field) => req.body[field] !== undefined).map((field) => [field, req.body[field]]));
  const user = await User.findByIdAndUpdate(userId(req), userUpdate, { new: true, runValidators: true }).select("-passwordHash");

  const ProfileModel = profileModelFor(req.user.role);
  let profile = null;
  if (ProfileModel) {
    const roleFields = req.user.role === "instructor"
      ? ["headline", "expertise", "socialLinks"]
      : ["skills", "learningGoalMinutes"];
    const profileUpdate = Object.fromEntries(roleFields.filter((field) => req.body[field] !== undefined).map((field) => [field, req.body[field]]));
    profile = await ProfileModel.findOneAndUpdate(
      { user: userId(req) },
      { $set: profileUpdate, $setOnInsert: { user: userId(req) } },
      { new: true, upsert: true, runValidators: true },
    );
  }
  ok(res, { user, profile }, "Account updated");
});
export const updateAvatar = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(400, "Select an image to upload");
  const currentUser = await User.findById(userId(req)).select("avatar avatarPublicId");
  if (!currentUser) throw new ApiError(404, "User not found");

  const avatar = await uploadBuffer(req.file, "avatars");
  let user;
  try {
    user = await User.findByIdAndUpdate(
      userId(req),
      { avatar: avatar.url, avatarPublicId: avatar.publicId },
      { new: true, runValidators: true },
    ).select("-passwordHash");
  } catch (error) {
    await deleteUploadedAsset(avatar).catch(() => {});
    throw error;
  }

  if (currentUser.avatar && currentUser.avatar !== avatar.url) {
    await deleteUploadedAsset({
      url: currentUser.avatar,
      publicId: currentUser.avatarPublicId,
    }).catch(() => {});
  }

  ok(res, { user, avatar: avatar.url }, "Profile photo updated");
});
export const changePassword = asyncHandler(async (req, res) => {
  const user = await User.findById(userId(req));
  if (!(await user.matchPassword(req.body.currentPassword || ""))) throw new ApiError(400, "Current password is incorrect");
  if (String(req.body.newPassword || "").length < 8) throw new ApiError(400, "New password must be at least 8 characters");
  await user.setPassword(req.body.newPassword);
  await user.save();
  ok(res, null, "Password changed");
});

export const getSettings = asyncHandler(async (req, res) => {
  const user = await User.findById(userId(req)).select("preferences");
  ok(res, user?.preferences || {});
});
export const patchSettings = asyncHandler(async (req, res) => {
  const user = await User.findById(userId(req));
  user.preferences = { ...(user.preferences || {}), ...req.body };
  await user.save();
  ok(res, user.preferences, "Preferences updated");
});
export const deleteAccount = asyncHandler(async (req, res) => ok(res, await User.findByIdAndUpdate(userId(req), { status: "blocked" }), "Account scheduled for deletion"));

const defaultPlatformSettings = {
  platform: {
    name: "EduPath",
    supportEmail: "support@edupath.com",
    currency: "INR",
    timezone: "Asia/Kolkata",
    language: "English",
    maintenanceMode: false,
  },
  payment: {
    provider: "razorpay",
    mode: "test",
    currency: "INR",
    taxPercent: 18,
    minimumOrderAmount: 1,
    enableCoupons: true,
    enableRefunds: true,
  },
  email: {
    fromName: "EduPath",
    fromEmail: "support@edupath.com",
    smtpHost: "",
    smtpPort: 587,
    replyTo: "support@edupath.com",
    enableTransactionalEmail: true,
  },
  certificate: {
    issuerName: "EduPath Academy",
    signatureName: "EduPath Admin",
    verificationPrefix: "/api/certificates/verify",
    autoIssue: true,
    requireFullProgress: true,
    requireQuizPass: false,
    requireAssignmentCompletion: false,
  },
  notifications: {
    courseLaunchEmail: true,
    instructorPayoutEmail: true,
    failedPaymentAlert: true,
    refundRequestSms: false,
    adminDigestEmail: true,
    liveClassReminder: true,
  },
  roles: {
    allowInstructorSignup: false,
    requireInstructorApproval: true,
    defaultStudentStatus: "active",
    defaultInstructorStatus: "pending",
    studentCanDeleteAccount: true,
    instructorCanCreateLiveClasses: true,
  },
  security: {
    enforceAdmin2fa: false,
    requireStrongPasswords: true,
    auditLogRetentionDays: 90,
    sessionTimeoutMinutes: 15,
    maxLoginAttempts: 5,
    ipAllowlist: "",
  },
};

function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function toPlainObject(value) {
  if (isPlainObject(value)) return value;
  if (typeof value !== "string") return {};
  try {
    const parsed = JSON.parse(value);
    return isPlainObject(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

function deepMerge(base, updates) {
  const baseObject = toPlainObject(base);
  const updateObject = toPlainObject(updates);
  const output = { ...baseObject };
  for (const [key, value] of Object.entries(updateObject)) {
    if (isPlainObject(value)) {
      output[key] = deepMerge(baseObject[key], value);
    } else {
      output[key] = value;
    }
  }
  return output;
}

async function readPlatformSettings() {
  const settings = await PlatformSettings.findOne({ key: "admin-platform" }).lean();
  return deepMerge(defaultPlatformSettings, toPlainObject(settings?.data));
}

export const getPlatformSettings = asyncHandler(async (_req, res) => {
  ok(res, await readPlatformSettings());
});

export const patchPlatformSettings = asyncHandler(async (req, res) => {
  const current = await PlatformSettings.findOne({ key: "admin-platform" }).lean();
  const data = deepMerge(deepMerge(defaultPlatformSettings, toPlainObject(current?.data)), toPlainObject(req.body));
  const settings = await PlatformSettings.findOneAndUpdate(
    { key: "admin-platform" },
    { key: "admin-platform", data, updatedBy: userId(req) },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  ok(res, settings.data, "Platform settings updated");
});

export const askDoubt = asyncHandler(async (req, res) => {
  const answer = await askAI({ question: req.body.question, context: req.body.context });
  created(res, await AIChat.create({ user: userId(req), course: req.body.courseId, question: req.body.question, answer }));
});
export const aiHistory = asyncHandler(async (req, res) => ok(res, await AIChat.find({ user: userId(req) }).sort({ createdAt: -1 })));
export const saveAnswerToNotes = asyncHandler(async (req, res) => created(res, await Note.create({ student: userId(req), title: req.body.title || "AI Answer", content: req.body.answer })));
export const summarizeLecture = asyncHandler(async (req, res) => {
  const result = await summarizeText({ text: req.body.text });
  created(res, await AISummary.create({ user: userId(req), lecture: req.body.lectureId, ...result }));
});
export const summarizeResource = asyncHandler(async (req, res) => ok(res, await summarizeText({ text: req.body.text || req.body.resourceUrl })));
export const summaries = asyncHandler(async (req, res) => ok(res, await AISummary.find({ user: userId(req) }).sort({ createdAt: -1 })));
export const recommendAICourses = asyncHandler(async (req, res) => ok(res, await recommendCourses(req.body)));
export const getAIRecommendedCourses = asyncHandler(async (_req, res) => ok(res, await Course.find({ status: { $in: PUBLIC_COURSE_STATUSES } }).limit(6)));

export const ml = (field) => asyncHandler(async (req, res) => {
  const data = buildMLAnalytics(userId(req));
  ok(res, field ? data[field] : data);
});

export const communityQuestions = asyncHandler(async (_req, res) => {
  const questions = await DiscussionQuestion.find({})
    .populate("user", "name avatar role")
    .populate("course", "title")
    .sort({ createdAt: -1 })
    .lean();
  const counts = await DiscussionAnswer.aggregate([
    { $match: { question: { $in: questions.map((question) => question._id) } } },
    { $group: { _id: "$question", count: { $sum: 1 } } },
  ]);
  const answerCounts = new Map(counts.map((item) => [String(item._id), item.count]));
  ok(res, questions.map((question) => ({ ...question, answerCount: answerCounts.get(String(question._id)) || 0 })));
});
export const createQuestion = asyncHandler(async (req, res) => {
  if (!req.body.title?.trim() || !req.body.body?.trim()) throw new ApiError(400, "Title and description are required");
  const question = await DiscussionQuestion.create({
    user: userId(req),
    course: req.body.course || undefined,
    title: req.body.title.trim(),
    body: req.body.body.trim(),
    tags: (req.body.tags || []).map((tag) => String(tag).trim()).filter(Boolean).slice(0, 5),
  });
  created(res, await question.populate([
    { path: "user", select: "name avatar role" },
    { path: "course", select: "title" },
  ]));
});
export const questionDetails = asyncHandler(async (req, res) => ok(res, {
  question: await DiscussionQuestion.findById(req.params.questionId).populate("user", "name avatar role").populate("course", "title"),
  answers: await DiscussionAnswer.find({ question: req.params.questionId }).populate("user", "name avatar role").sort({ accepted: -1, createdAt: 1 }),
}));
export const createAnswer = asyncHandler(async (req, res) => {
  if (!req.body.body?.trim()) throw new ApiError(400, "Answer is required");
  const answer = await DiscussionAnswer.create({ question: req.params.questionId, user: userId(req), body: req.body.body.trim() });
  created(res, await answer.populate("user", "name avatar role"));
});
export const upvoteAnswer = asyncHandler(async (req, res) => ok(res, await DiscussionAnswer.findByIdAndUpdate(req.params.answerId, { $addToSet: { upvotes: userId(req) } }, { new: true })));
export const acceptAnswer = asyncHandler(async (req, res) => {
  const answer = await DiscussionAnswer.findById(req.params.answerId);
  if (!answer) throw new ApiError(404, "Answer not found");
  const question = await DiscussionQuestion.findOne({ _id: answer.question, user: userId(req) });
  if (!question && req.user.role !== "admin") throw new ApiError(403, "Only the question author can accept an answer");
  await DiscussionAnswer.updateMany({ question: answer.question }, { accepted: false });
  answer.accepted = true;
  await answer.save();
  ok(res, answer);
});

export const createPaymentOrder = asyncHandler(async (req, res) => {
  const requestedIds = (req.body.items || []).map((item) => item.courseId).filter(Boolean);
  const courseIds = requestedIds.map((id) => fallbackCourses.find((course) => course.legacyId === id)?._id || id);
  if (!courseIds.length) throw new ApiError(400, "Select at least one course");

  const invalidIds = courseIds.filter((id) => !/^[a-f\d]{24}$/i.test(String(id)));
  if (invalidIds.length) throw new ApiError(400, "Invalid course selected. Please remove it from cart and add again.");

  let courses = await Course.find({ _id: { $in: courseIds }, status: { $in: PUBLIC_COURSE_STATUSES } });
  const foundIds = new Set(courses.map((course) => String(course._id)));
  const missingFallbacks = fallbackCourses.filter((course) => courseIds.includes(course._id) && !foundIds.has(course._id));
  if (missingFallbacks.length) {
    await Promise.all(missingFallbacks.map((course) => Course.findOneAndUpdate(
      { _id: course._id },
      {
        title: course.title,
        slug: course.slug,
        category: course.category,
        thumbnail: course.thumbnail,
        description: course.description,
        price: course.price,
        status: "published",
        rating: course.rating,
      },
      { upsert: true, new: true }
    )));
    courses = await Course.find({ _id: { $in: courseIds }, status: { $in: PUBLIC_COURSE_STATUSES } });
  }
  if (courses.length !== courseIds.length) throw new ApiError(400, "One or more courses are unavailable");

  const alreadyEnrolled = await Enrollment.find({ student: userId(req), course: { $in: courseIds } }).select("course");
  const enrolledIds = new Set(alreadyEnrolled.map((item) => String(item.course)));
  const payableCourses = courses.filter((course) => !enrolledIds.has(String(course._id)));
  if (!payableCourses.length) throw new ApiError(409, "You are already enrolled in these courses");

  const platformSettings = await readPlatformSettings();
  const paymentSettings = platformSettings.payment || {};
  const amount = payableCourses.reduce((sum, course) => sum + Number(course.price || 0), 0);
  if (amount <= 0) {
    await Enrollment.insertMany(payableCourses.map((course) => ({ student: userId(req), course: course._id, status: "active" })), { ordered: false }).catch(() => {});
    return created(res, { free: true, amount: 0, courses: payableCourses }, "Free course enrollment completed");
  }
  if (amount < Number(paymentSettings.minimumOrderAmount || 0)) throw new ApiError(400, `Minimum order amount is ${paymentSettings.minimumOrderAmount}`);

  const order = await Order.create({
    user: userId(req),
    course: payableCourses[0]?._id,
    items: payableCourses.map((course) => ({ course: course._id, title: course.title, price: course.price })),
    amount,
    status: "pending",
    invoiceNumber: `EDU-${Date.now()}`,
  });
  const currency = paymentSettings.currency || platformSettings.platform?.currency || "INR";
  const razorpayOrder = await createRazorpayOrder({ amount, currency, receipt: String(order._id) });
  order.razorpayOrderId = razorpayOrder.id;
  await order.save();

  ok(res, {
    key: process.env.RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY,
    orderId: order._id,
    razorpayOrderId: razorpayOrder.id,
    amount,
    currency: razorpayOrder.currency || currency,
    courses: payableCourses.map((course) => ({ _id: course._id, title: course.title, price: course.price })),
  }, "Payment order created");
});
export const verifyPayment = asyncHandler(async (req, res) => {
  const verified = verifyRazorpaySignature(req.body);
  if (!verified) throw new ApiError(400, "Payment signature verification failed");

  const order = await Order.findOne({ _id: req.body.orderId, user: userId(req), razorpayOrderId: req.body.razorpayOrderId });
  if (!order) throw new ApiError(404, "Order not found");
  if (order.status === "paid") return ok(res, { order }, "Payment already verified");

  const payment = await Payment.create({
    user: userId(req),
    order: order._id,
    razorpayOrderId: req.body.razorpayOrderId,
    razorpayPaymentId: req.body.razorpayPaymentId,
    amount: order.amount,
    status: "paid",
    method: "razorpay",
  });

  order.status = "paid";
  await order.save();

  const courseIds = (order.items || []).map((item) => item.course).filter(Boolean);
  await Promise.all(courseIds.map((courseId) => Enrollment.findOneAndUpdate(
    { student: userId(req), course: courseId },
    { status: "active", enrolledAt: new Date() },
    { upsert: true, new: true }
  )));

  ok(res, { order, payment, enrolledCourses: courseIds }, "Payment verified and enrollment completed");
});
export const paymentHistory = asyncHandler(async (req, res) => ok(res, await Payment.find({ user: userId(req) }).sort({ createdAt: -1 })));
export const paymentRefundRequest = asyncHandler(async (req, res) => {
  const payment = await Payment.findOne({ _id: req.body.paymentId, user: userId(req) });
  if (!payment) throw new ApiError(404, "Payment not found");
  created(res, await RefundRequest.create({ user: userId(req), payment: payment._id, reason: req.body.reason }));
});

export const freeEnrollment = asyncHandler(async (req, res) => {
  const course = await Course.findOne({ _id: req.params.courseId, status: { $in: PUBLIC_COURSE_STATUSES }, pricingType: "free" });
  if (!course) throw new ApiError(404, "Published free course not found");
  const enrollment = await Enrollment.findOneAndUpdate({ student: userId(req), course: course._id }, { status: "active", enrolledAt: new Date() }, { upsert: true, new: true });
  await notifyCourseUsers([course.instructor], { title: "Student enrolled", message: `A student enrolled in ${course.title}.` });
  created(res, enrollment);
});
export const paidEnrollment = asyncHandler(async (req, res) => {
  const course = await Course.findOne({ _id: req.params.courseId, status: { $in: PUBLIC_COURSE_STATUSES }, pricingType: "paid" });
  if (!course) throw new ApiError(404, "Published paid course not found");
  created(res, await Enrollment.findOneAndUpdate({ student: userId(req), course: course._id }, { status: "active", enrolledAt: new Date() }, { upsert: true, new: true }));
});
export const checkEnrollment = asyncHandler(async (req, res) => ok(res, { enrolled: Boolean(await Enrollment.findOne({ student: userId(req), course: req.params.courseId })) }));
export const myEnrollments = asyncHandler(async (req, res) => ok(res, await Enrollment.find({ student: userId(req) }).populate("course")));

export const instructorDashboard = asyncHandler(async (req, res) => {
  const courseIds = await Course.find({ instructor: userId(req) }).distinct("_id");
  ok(res, {
    courses: courseIds.length,
    students: await Enrollment.distinct("student", { course: { $in: courseIds }, status: { $ne: "cancelled" } }).then((items) => items.length),
  });
});
export const instructorStats = asyncHandler(async (req, res) => {
  const courseIds = await Course.find({ instructor: userId(req) }).distinct("_id");
  const revenue = await Order.aggregate([{ $match: { course: { $in: courseIds }, status: "paid" } }, { $group: { _id: null, total: { $sum: "$amount" } } }]);
  ok(res, {
    courses: courseIds.length,
    publishedCourses: await Course.countDocuments({ instructor: userId(req), status: { $in: PUBLIC_COURSE_STATUSES } }),
    draftCourses: await Course.countDocuments({ instructor: userId(req), status: "draft" }),
    students: await Enrollment.distinct("student", { course: { $in: courseIds } }).then((items) => items.length),
    enrollments: await Enrollment.countDocuments({ course: { $in: courseIds } }),
    revenue: revenue[0]?.total || 0,
    pendingAssignmentReviews: await AssignmentSubmission.countDocuments({ assignment: { $in: await Assignment.find({ course: { $in: courseIds } }).distinct("_id") }, status: "submitted" }),
  });
});
export const instructorMyCourses = asyncHandler(async (req, res) => ok(res, await Course.find({ instructor: userId(req) }).sort({ updatedAt: -1 }).lean()));
export const instructorCoursePerformance = asyncHandler(async (req, res) => {
  const courses = await Course.find({ instructor: userId(req) }).lean();
  const data = await Promise.all(courses.map(async (course) => ({ ...course, enrollments: await Enrollment.countDocuments({ course: course._id }) })));
  ok(res, data);
});
export const instructorEarningsAnalytics = asyncHandler(async (req, res) => {
  const courseIds = await Course.find({ instructor: userId(req) }).distinct("_id");
  ok(res, await Order.aggregate([{ $match: { course: { $in: courseIds }, status: "paid" } }, { $group: { _id: { $month: "$createdAt" }, revenue: { $sum: "$amount" }, orders: { $sum: 1 } } }, { $sort: { _id: 1 } }]));
});
export const instructorStudentEngagement = asyncHandler(async (req, res) => {
  const courseIds = await Course.find({ instructor: userId(req) }).distinct("_id");
  ok(res, await LectureProgress.aggregate([{ $match: { course: { $in: courseIds } } }, { $group: { _id: "$course", watchTimeSeconds: { $sum: "$watchTimeSeconds" }, completedLectures: { $sum: { $cond: ["$completed", 1, 0] } } } }]));
});
export const instructorPendingTasks = asyncHandler(async (req, res) => {
  const courseIds = await Course.find({ instructor: userId(req) }).distinct("_id");
  const assignmentIds = await Assignment.find({ course: { $in: courseIds } }).distinct("_id");
  ok(res, { assignmentReviews: await AssignmentSubmission.countDocuments({ assignment: { $in: assignmentIds }, status: "submitted" }), draftCourses: await Course.countDocuments({ instructor: userId(req), status: "draft" }) });
});
export const instructorRecentActivity = asyncHandler(async (req, res) => {
  const courseIds = await Course.find({ instructor: userId(req) }).distinct("_id");
  ok(res, await Enrollment.find({ course: { $in: courseIds } }).populate("student", "name email").populate("course", "title").sort({ createdAt: -1 }).limit(10));
});
export const instructorUpcomingClasses = asyncHandler(async (req, res) => ok(res, await CalendarEvent.find({ user: userId(req), startAt: { $gte: new Date() } }).sort({ startAt: 1 }).limit(10)));
export const instructorCreateCourse = asyncHandler(async (req, res) => {
  const payload = normalizeCoursePayload(req.body);
  if (!payload.title?.trim()) throw new ApiError(400, "Course title is required");
  payload.slug = await uniqueCourseSlug(payload.slug || payload.title);
  await attachCourseThumbnailUpload(req, payload);
  payload.instructor = userId(req);
  payload.status = "assigned";
  const course = await Course.create(payload);
  created(res, course, "Course draft created");
});
export const instructorUpdateCourse = asyncHandler(async (req, res) => {
  const course = await Course.findOne({ _id: req.params.courseId, instructor: userId(req) }).select("_id status title slug thumbnail").lean();
  if (!course) throw new ApiError(404, "Course not found");
  if (!["assigned", "content_in_progress", "changes_requested"].includes(course.status)) {
    throw new ApiError(409, "This course cannot be edited in its current status");
  }
  const payload = normalizeCoursePayload(req.body);
  const allowed = [
    "title", "subtitle", "slug", "category", "subcategory", "language", "level", "thumbnail",
    "promoVideoUrl", "shortDescription", "description", "learningOutcomes", "requirements",
    "targetAudience", "tags", "pricingType", "price", "discountPrice", "currency",
    "couponEnabled", "sequentialLearning", "certificateEnabled", "disabled",
  ];
  const updates = Object.fromEntries(Object.entries(payload).filter(([key]) => allowed.includes(key)));
  await attachCourseThumbnailUpload(req, updates);
  if (updates.title && !updates.slug) updates.slug = await uniqueCourseSlug(updates.title, course._id);
  if (updates.slug) updates.slug = await uniqueCourseSlug(updates.slug, course._id);
  const updated = await Course.findByIdAndUpdate(course._id, updates, { new: true, runValidators: true }).lean();
  if (req.file && course.thumbnail) await deleteLocalAsset(course.thumbnail).catch(() => {});
  await markCourseContentInProgress(course._id);
  ok(res, updated, "Course updated");
});
export const instructorCourseDetails = asyncHandler(async (req, res) => {
  const course = await Course.findOne({ _id: req.params.courseId, instructor: userId(req) }).populate("instructor", "name email").lean();
  if (!course) throw new ApiError(404, "Course not found");
  ok(res, { course, completion: await courseCompletion(course._id) });
});
export const instructorCreateModule = asyncHandler(async (req, res) => {
  const course = await Course.findOne({ _id: req.params.courseId, instructor: userId(req) }).select("_id").lean();
  if (!course) throw new ApiError(404, "Course not found");
  const module = await Module.create({ ...req.body, course: course._id });
  await markCourseContentInProgress(course._id);
  created(res, module);
});
export const instructorModules = asyncHandler(async (req, res) => {
  const course = await Course.findOne({ _id: req.params.courseId, instructor: userId(req) }).select("_id").lean();
  if (!course) throw new ApiError(404, "Course not found");
  ok(res, await Module.find({ course: course._id }).sort({ order: 1 }));
});
export const instructorUpdateModule = asyncHandler(async (req, res) => {
  const module = await Module.findById(req.params.moduleId);
  if (!module || !(await Course.exists({ _id: module.course, instructor: userId(req) }))) throw new ApiError(404, "Module not found");
  const updated = await Module.findByIdAndUpdate(module._id, req.body, { new: true });
  await markCourseContentInProgress(module.course);
  ok(res, updated);
});
export const instructorReorderModules = asyncHandler(async (req, res) => {
  const course = await Course.findOne({ _id: req.params.courseId, instructor: userId(req) }).select("_id").lean();
  if (!course) throw new ApiError(404, "Course not found");
  await Promise.all((req.body.order || []).map((id, index) => Module.updateOne({ _id: id, course: course._id }, { order: index + 1 })));
  ok(res, await Module.find({ course: course._id }).sort({ order: 1 }), "Modules reordered");
});
export const instructorDeleteModule = asyncHandler(async (req, res) => {
  const module = await Module.findById(req.params.moduleId);
  if (!module || !(await Course.exists({ _id: module.course, instructor: userId(req) }))) throw new ApiError(404, "Module not found");
  await Lecture.deleteMany({ module: module._id });
  await markCourseContentInProgress(module.course);
  ok(res, await Module.deleteOne({ _id: module._id }), "Module deleted");
});
export const instructorCreateLecture = asyncHandler(async (req, res) => {
  const module = await Module.findById(req.params.moduleId);
  if (!module || !(await Course.exists({ _id: module.course, instructor: userId(req) }))) throw new ApiError(404, "Module not found");
  const lecture = await Lecture.create({ ...req.body, course: module.course, module: module._id });
  await markCourseContentInProgress(module.course);
  created(res, lecture);
});
export const instructorLectures = asyncHandler(async (req, res) => {
  const module = await Module.findById(req.params.moduleId);
  if (!module || !(await Course.exists({ _id: module.course, instructor: userId(req) }))) throw new ApiError(404, "Module not found");
  ok(res, await Lecture.find({ module: module._id }).sort({ order: 1 }));
});
export const instructorResources = asyncHandler(async (req, res) => {
  const courseIds = await Course.find({ instructor: userId(req) }).distinct("_id");
  const lectures = await Lecture.find({ course: { $in: courseIds } })
    .select("title course module notesPdfUrl resources externalLinks updatedAt createdAt")
    .populate("course", "title")
    .populate("module", "title")
    .sort({ updatedAt: -1 })
    .lean();

  const rows = lectures.flatMap((lecture) => {
    const base = {
      course: lecture.course?.title || "Course",
      courseId: lecture.course?._id || lecture.course,
      lecture: lecture.title || "Lecture",
      lectureId: lecture._id,
      module: lecture.module?.title || "Module",
      uploaded: lecture.updatedAt || lecture.createdAt,
    };
    const lectureResources = (lecture.resources || []).map((resource, index) => {
      const item = typeof resource === "string" ? { title: `Resource ${index + 1}`, url: resource, type: "resource" } : resource;
      return {
        ...base,
        id: `${lecture._id}-resource-${item._id || index}`,
        resourceIndex: index,
        editableResource: true,
        name: item.title || `Resource ${index + 1}`,
        url: item.url || item,
        type: item.type || "resource",
        source: "Lecture resource",
      };
    });
    const notes = lecture.notesPdfUrl
      ? [{
          ...base,
          id: `${lecture._id}-notes`,
          name: `${lecture.title || "Lecture"} notes`,
          url: lecture.notesPdfUrl,
          type: "pdf",
          source: "Notes PDF",
        }]
      : [];
    const links = (lecture.externalLinks || []).map((link, index) => ({
      ...base,
      id: `${lecture._id}-link-${link._id || index}`,
      name: link.title || `External link ${index + 1}`,
      url: link.url,
      type: "link",
      source: "External link",
    }));
    return [...lectureResources, ...notes, ...links];
  });

  ok(res, rows);
});
export const instructorUploadLectureResource = asyncHandler(async (req, res) => {
  const lecture = await Lecture.findById(req.params.lectureId);
  if (!lecture || !(await Course.exists({ _id: lecture.course, instructor: userId(req) }))) throw new ApiError(404, "Lecture not found");
  if (!req.file) throw new ApiError(400, "Resource file is required");

  const upload = await uploadBuffer(req.file, `courses/${lecture.course}/resources`);
  const title = String(req.body.title || req.file.originalname || "Resource").trim();
  const resource = {
    title: title || "Resource",
    url: upload.url,
    type: req.body.type || req.file.mimetype || "resource",
  };

  await Lecture.collection.updateOne(
    { _id: lecture._id },
    {
      $push: { resources: resource },
      $set: { updatedAt: new Date() },
    },
  );
  await markCourseContentInProgress(lecture.course);

  ok(res, resource, "Resource uploaded successfully");
});
export const instructorReplaceLectureResource = asyncHandler(async (req, res) => {
  const lecture = await Lecture.findById(req.params.lectureId).lean();
  if (!lecture || !(await Course.exists({ _id: lecture.course, instructor: userId(req) }))) throw new ApiError(404, "Lecture not found");
  if (!req.file) throw new ApiError(400, "Replacement file is required");

  const index = Number(req.params.resourceIndex);
  if (!Number.isInteger(index) || index < 0 || index >= (lecture.resources || []).length) {
    throw new ApiError(404, "Resource not found");
  }

  const current = lecture.resources[index];
  const currentTitle = typeof current === "string" ? "" : current?.title;
  const currentType = typeof current === "string" ? "" : current?.type;
  const upload = await uploadBuffer(req.file, `courses/${lecture.course}/resources`);
  const title = String(req.body.title || currentTitle || req.file.originalname || "Resource").trim();
  const resource = {
    title: title || "Resource",
    url: upload.url,
    type: req.body.type || currentType || req.file.mimetype || "resource",
  };

  await Lecture.collection.updateOne(
    { _id: lecture._id },
    {
      $set: {
        [`resources.${index}`]: resource,
        updatedAt: new Date(),
      },
    },
  );
  await markCourseContentInProgress(lecture.course);

  ok(res, resource, "Resource replaced successfully");
});
export const instructorDeleteLectureResource = asyncHandler(async (req, res) => {
  const lecture = await Lecture.findById(req.params.lectureId).lean();
  if (!lecture || !(await Course.exists({ _id: lecture.course, instructor: userId(req) }))) throw new ApiError(404, "Lecture not found");

  const index = Number(req.params.resourceIndex);
  if (!Number.isInteger(index) || index < 0 || index >= (lecture.resources || []).length) {
    throw new ApiError(404, "Resource not found");
  }

  await Lecture.collection.updateOne(
    { _id: lecture._id },
    {
      $unset: { [`resources.${index}`]: 1 },
      $set: { updatedAt: new Date() },
    },
  );
  await Lecture.collection.updateOne({ _id: lecture._id }, { $pull: { resources: null } });
  await markCourseContentInProgress(lecture.course);

  ok(res, { deleted: true }, "Resource deleted successfully");
});
export const instructorUpdateLecture = asyncHandler(async (req, res) => {
  const lecture = await Lecture.findById(req.params.lectureId);
  if (!lecture || !(await Course.exists({ _id: lecture.course, instructor: userId(req) }))) throw new ApiError(404, "Lecture not found");
  const updated = await Lecture.findByIdAndUpdate(lecture._id, req.body, { new: true });
  await markCourseContentInProgress(lecture.course);
  ok(res, updated);
});
export const instructorDuplicateLecture = asyncHandler(async (req, res) => {
  const lecture = await Lecture.findById(req.params.lectureId).lean();
  if (!lecture || !(await Course.exists({ _id: lecture.course, instructor: userId(req) }))) throw new ApiError(404, "Lecture not found");
  delete lecture._id;
  delete lecture.createdAt;
  delete lecture.updatedAt;
  created(res, await Lecture.create({ ...lecture, title: `${lecture.title} Copy`, order: Number(lecture.order || 0) + 1 }), "Lecture duplicated");
});
export const instructorReorderLectures = asyncHandler(async (req, res) => {
  const module = await Module.findById(req.params.moduleId);
  if (!module || !(await Course.exists({ _id: module.course, instructor: userId(req) }))) throw new ApiError(404, "Module not found");
  await Promise.all((req.body.order || []).map((id, index) => Lecture.updateOne({ _id: id, module: module._id }, { order: index + 1 })));
  ok(res, await Lecture.find({ module: module._id }).sort({ order: 1 }), "Lectures reordered");
});
export const instructorDeleteLecture = asyncHandler(async (req, res) => {
  const lecture = await Lecture.findById(req.params.lectureId);
  if (!lecture || !(await Course.exists({ _id: lecture.course, instructor: userId(req) }))) throw new ApiError(404, "Lecture not found");
  const result = await Lecture.deleteOne({ _id: lecture._id });
  await markCourseContentInProgress(lecture.course);
  ok(res, result, "Lecture deleted");
});
export const instructorSubmitCourseForReview = asyncHandler(async (req, res) => {
  const course = await Course.findOne({ _id: req.params.courseId, instructor: userId(req) }).select("_id title status").lean();
  if (!course) throw new ApiError(404, "Assigned course not found");
  if (!["assigned", "content_in_progress", "changes_requested"].includes(course.status)) {
    throw new ApiError(409, "This course cannot be submitted in its current status");
  }
  const completion = await courseCompletion(course._id);
  const required = ["basicInfo", "thumbnail", "modules", "lectures"];
  const missing = required.filter((key) => !completion.checks[key]);
  if (missing.length) throw new ApiError(400, `Complete before review: ${missing.join(", ")}`);

  const updatedCourse = await Course.findByIdAndUpdate(
    course._id,
    { status: "review_pending", submittedForReviewAt: new Date(), reviewFeedback: "" },
    { new: true, runValidators: true }
  ).lean();
  const admins = await User.find({ role: "admin", status: "active" }).distinct("_id");
  await notifyCourseUsers(admins, {
    title: "Course review requested",
    message: `${course.title} was submitted for review.`,
  });
  ok(res, { course: updatedCourse, completion }, "Course submitted for review");
});
export const instructorCourseAnalytics = asyncHandler(async (req, res) => {
  const course = await Course.findOne({ _id: req.params.courseId, instructor: userId(req) });
  if (!course) throw new ApiError(404, "Course not found");
  const enrollments = await Enrollment.find({ course: course._id });
  const progress = await LectureProgress.find({ course: course._id });
  const revenue = await Order.aggregate([{ $match: { course: course._id, status: "paid" } }, { $group: { _id: null, total: { $sum: "$amount" } } }]);
  ok(res, {
    totalStudents: enrollments.length,
    activeStudents: enrollments.filter((item) => item.status === "active").length,
    completionRate: enrollments.length ? Math.round(enrollments.reduce((sum, item) => sum + Number(item.progress || 0), 0) / enrollments.length) : 0,
    averageWatchTimeSeconds: progress.length ? Math.round(progress.reduce((sum, item) => sum + Number(item.watchTimeSeconds || 0), 0) / progress.length) : 0,
    revenue: revenue[0]?.total || 0,
    rating: course.rating || 0,
  });
});
export const instructorCreateQuiz = asyncHandler(async (req, res) => {
  const course = await Course.findOne({ _id: req.params.courseId, instructor: userId(req) });
  if (!course) throw new ApiError(404, "Assigned course not found");
  const quiz = await Quiz.create({ ...req.body, course: course._id });
  await markCourseContentInProgress(course._id);
  created(res, quiz);
});
export const instructorCreateAssignment = asyncHandler(async (req, res) => {
  const course = await Course.findOne({ _id: req.params.courseId, instructor: userId(req) });
  if (!course) throw new ApiError(404, "Course not found");
  const assignment = await Assignment.create({ ...req.body, course: course._id });
  await markCourseContentInProgress(course._id);
  created(res, assignment);
});
export const instructorAssignments = asyncHandler(async (req, res) => {
  const courseIds = await Course.find({ instructor: userId(req) }).distinct("_id");
  ok(res, await Assignment.find({ course: { $in: courseIds } }).populate("course", "title").sort({ dueDate: 1 }));
});
export const instructorDeleteAssignment = asyncHandler(async (req, res) => {
  const assignment = await Assignment.findById(req.params.assignmentId);
  if (!assignment || !(await Course.exists({ _id: assignment.course, instructor: userId(req) }))) throw new ApiError(404, "Assignment not found");
  await AssignmentSubmission.deleteMany({ assignment: assignment._id });
  ok(res, await Assignment.deleteOne({ _id: assignment._id }), "Assignment deleted");
});
export const instructorSubmissions = asyncHandler(async (req, res) => {
  const assignment = await Assignment.findById(req.params.assignmentId);
  if (!assignment || !(await Course.exists({ _id: assignment.course, instructor: userId(req) }))) throw new ApiError(404, "Assignment not found");
  ok(res, await AssignmentSubmission.find({ assignment: assignment._id }).populate("student", "name email"));
});
export const instructorStudentsProgress = asyncHandler(async (req, res) => {
  const courseIds = await Course.find({ instructor: userId(req) }).distinct("_id");
  ok(res, await Enrollment.find({ course: { $in: courseIds } }).populate("student", "name email").populate("course", "title"));
});
export const instructorGradeAssignment = asyncHandler(async (req, res) => {
  const submission = await AssignmentSubmission.findById(req.params.submissionId).populate("assignment");
  if (!submission?.assignment) throw new ApiError(404, "Submission not found");
  const ownsCourse = await Course.exists({ _id: submission.assignment.course, instructor: userId(req) });
  if (!ownsCourse) throw new ApiError(404, "Submission not found");
  submission.grade = req.body.grade;
  submission.feedback = req.body.feedback;
  submission.status = "graded";
  await submission.save();
  ok(res, await AssignmentSubmission.findById(submission._id).populate("student", "name email"));
});
export const instructorDoubts = asyncHandler(async (req, res) => {
  const courseIds = await Course.find({ instructor: userId(req) }).distinct("_id");
  const questions = await DiscussionQuestion.find({ course: { $in: courseIds } })
    .populate("user", "name email avatar")
    .populate("course", "title")
    .sort({ createdAt: -1 })
    .lean();
  const counts = await DiscussionAnswer.aggregate([
    { $match: { question: { $in: questions.map((question) => question._id) } } },
    { $group: { _id: "$question", count: { $sum: 1 } } },
  ]);
  const answerCounts = new Map(counts.map((item) => [String(item._id), item.count]));
  ok(res, questions.map((question) => ({ ...question, answerCount: answerCounts.get(String(question._id)) || 0 })));
});
export const instructorReviews = asyncHandler(async (req, res) => {
  const courseIds = await Course.find({ instructor: userId(req) }).distinct("_id");
  ok(res, await Review.find({ course: { $in: courseIds } }).populate("user", "name email").populate("course", "title").sort({ createdAt: -1 }));
});
export const instructorPayouts = asyncHandler(async (req, res) => ok(res, await Payout.find({ instructor: userId(req) }).sort({ createdAt: -1 })));
export const instructorEarnings = asyncHandler(async (req, res) => {
  const courseIds = await Course.find({ instructor: userId(req) }).distinct("_id");
  ok(res, await Order.aggregate([{ $match: { course: { $in: courseIds }, status: "paid" } }, { $group: { _id: "$course", sales: { $sum: 1 }, gross: { $sum: "$amount" } } }, { $lookup: { from: "courses", localField: "_id", foreignField: "_id", as: "course" } }, { $unwind: "$course" }]));
});

export const adminDashboard = asyncHandler(async (_req, res) => ok(res, { users: await User.countDocuments(), students: await User.countDocuments({ role: "student" }), instructors: await User.countDocuments({ role: "instructor" }), courses: await Course.countDocuments(), orders: await Order.countDocuments(), payments: await Payment.countDocuments() }));
export const adminStats = asyncHandler(async (_req, res) => {
  const revenue = await Payment.aggregate([{ $match: { status: { $in: ["paid", "success", "captured"] } } }, { $group: { _id: null, total: { $sum: "$amount" } } }]);
  ok(res, {
    students: await User.countDocuments({ role: "student" }),
    instructors: await User.countDocuments({ role: "instructor" }),
    courses: await Course.countDocuments(),
    publishedCourses: await Course.countDocuments({ status: { $in: PUBLIC_COURSE_STATUSES } }),
    pendingApprovals: await Course.countDocuments({ status: "review_pending" }),
    orders: await Order.countDocuments(),
    refunds: await RefundRequest.countDocuments({ status: "pending" }),
    revenue: revenue[0]?.total || 0,
  });
});
export const adminRevenueAnalytics = asyncHandler(async (_req, res) => ok(res, await Payment.aggregate([{ $match: { status: { $in: ["paid", "success", "captured"] } } }, { $group: { _id: { month: { $month: "$createdAt" }, year: { $year: "$createdAt" } }, revenue: { $sum: "$amount" }, payments: { $sum: 1 } } }, { $sort: { "_id.year": 1, "_id.month": 1 } }])));
export const adminUserGrowth = asyncHandler(async (_req, res) => ok(res, await User.aggregate([{ $group: { _id: { month: { $month: "$createdAt" }, role: "$role" }, users: { $sum: 1 } } }, { $sort: { "_id.month": 1 } }])));
export const adminCourseAnalytics = asyncHandler(async (_req, res) => ok(res, await Course.aggregate([{ $group: { _id: "$status", courses: { $sum: 1 } } }])));
export const adminTopCourses = asyncHandler(async (_req, res) => ok(res, await Enrollment.aggregate([{ $group: { _id: "$course", enrollments: { $sum: 1 } } }, { $sort: { enrollments: -1 } }, { $limit: 10 }, { $lookup: { from: "courses", localField: "_id", foreignField: "_id", as: "course" } }, { $unwind: "$course" }])));
export const adminRecentOrders = asyncHandler(async (_req, res) => ok(res, await Order.find({}).populate("user", "name email").populate("course", "title").sort({ createdAt: -1 }).limit(10)));
export const adminPendingApprovals = asyncHandler(async (_req, res) => ok(res, await Course.find({ status: "review_pending" }).populate("instructor", "name email").sort({ submittedForReviewAt: 1 }).limit(20).lean()));
export const adminRecentActivity = asyncHandler(async (_req, res) => ok(res, await Notification.find({}).sort({ createdAt: -1 }).limit(15)));
export const adminUsers = asyncHandler(async (_req, res) => ok(res, await User.find({}).select("-passwordHash")));
export const adminStudents = asyncHandler(async (_req, res) => ok(res, await User.find({ role: "student" }).select("-passwordHash").sort({ createdAt: -1 })));
export const adminInstructors = asyncHandler(async (_req, res) => ok(res, await User.find({ role: "instructor" }).select("-passwordHash").sort({ createdAt: -1 })));
export const adminUserStatus = asyncHandler(async (req, res) => ok(res, await User.findByIdAndUpdate(req.params.userId, { status: req.body.status }, { new: true }).select("-passwordHash")));
export const adminDeleteUser = asyncHandler(async (req, res) => ok(res, await User.findByIdAndDelete(req.params.userId)));
export const adminCourses = asyncHandler(async (_req, res) => {
  const courses = await Course.find({}).populate("instructor", "name email").sort({ updatedAt: -1 }).lean();
  const data = await Promise.all(courses.map(async (course) => ({
    ...course,
    enrollments: await Enrollment.countDocuments({ course: course._id, status: { $ne: "cancelled" } }),
  })));
  ok(res, data);
});
export const adminCreateCourse = asyncHandler(async (req, res) => {
  const payload = normalizeCoursePayload(req.body);
  if (!payload.title?.trim()) throw new ApiError(400, "Course title is required");
  payload.slug = await uniqueCourseSlug(payload.slug || payload.title);
  await attachCourseThumbnailUpload(req, payload);
  if (payload.instructor && !(await User.exists({ _id: payload.instructor, role: "instructor" }))) {
    throw new ApiError(400, "Select a valid instructor");
  }
  const course = await Course.create({ ...payload, status: payload.instructor ? "assigned" : "draft" });
  if (course.instructor) {
    await notifyCourseUsers([course.instructor], {
      title: "New assigned course",
      message: `${course.title} has been assigned to you. You can now build its curriculum.`,
      email: true,
    });
  }
  created(res, course, course.instructor ? "Course created and assigned" : "Course draft created");
});
export const adminCourseDetails = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.courseId).populate("instructor", "name email").lean();
  if (!course) throw new ApiError(404, "Course not found");
  const modules = await Module.find({ course: course._id }).sort({ order: 1 }).lean();
  const lectures = await Lecture.find({ course: course._id }).sort({ order: 1 }).lean();
  ok(res, {
    course,
    completion: await courseCompletion(course._id),
    modules: modules.map((module) => ({ ...module, lectures: lectures.filter((lecture) => String(lecture.module) === String(module._id)) })),
  });
});
export const adminUpdateCourse = asyncHandler(async (req, res) => {
  const payload = normalizeCoursePayload(req.body);
  if (payload.instructor && !(await User.exists({ _id: payload.instructor, role: "instructor" }))) {
    throw new ApiError(400, "Select a valid instructor");
  }
  const existing = await Course.findById(req.params.courseId).select("_id status instructor thumbnail").lean();
  if (!existing) throw new ApiError(404, "Course not found");
  await attachCourseThumbnailUpload(req, payload);
  if (payload.title && !payload.slug) payload.slug = await uniqueCourseSlug(payload.title, existing._id);
  if (payload.slug) payload.slug = await uniqueCourseSlug(payload.slug, existing._id);
  const previousInstructor = String(existing.instructor || "");
  if (payload.instructor && payload.instructor !== previousInstructor && existing.status === "draft") payload.status = "assigned";
  if (payload.instructor === null && ["assigned", "content_in_progress", "changes_requested"].includes(existing.status)) payload.status = "draft";
  const course = await Course.findByIdAndUpdate(req.params.courseId, payload, { new: true, runValidators: true }).lean();
  if (!course) throw new ApiError(404, "Course not found");
  if (req.file && existing.thumbnail) await deleteLocalAsset(existing.thumbnail).catch(() => {});
  if (payload.instructor && String(payload.instructor) !== previousInstructor) {
    await notifyCourseUsers([payload.instructor], {
      title: "New assigned course",
      message: `${course.title} has been assigned to you.`,
      email: true,
    });
  }
  ok(res, course, "Course updated");
});
export const adminDeleteCourse = asyncHandler(async (req, res) => {
  const course = await Course.findByIdAndDelete(req.params.courseId).lean();
  if (course?.thumbnail) await deleteLocalAsset(course.thumbnail).catch(() => {});
  ok(res, course, "Course deleted");
});
export const adminApproveCourse = asyncHandler(async (req, res) => {
  const course = await Course.findOneAndUpdate(
    { _id: req.params.courseId, status: "review_pending" },
    { status: "ready_to_publish", reviewFeedback: "", reviewedAt: new Date(), reviewedBy: userId(req) },
    { new: true }
  );
  if (!course) throw new ApiError(409, "Only review-pending courses can be approved");
  await notifyCourseUsers([course.instructor], { title: "Course content approved", message: `${course.title} is ready for publishing.` });
  ok(res, course, "Course content approved");
});
export const adminRejectCourse = asyncHandler(async (req, res) => {
  if (!req.body.reason?.trim()) throw new ApiError(400, "Feedback is required");
  const course = await Course.findOneAndUpdate(
    { _id: req.params.courseId, status: "review_pending" },
    { status: "changes_requested", reviewFeedback: req.body.reason.trim(), rejectionReason: req.body.reason.trim(), reviewedAt: new Date(), reviewedBy: userId(req) },
    { new: true }
  );
  if (!course) throw new ApiError(409, "Only review-pending courses can receive change requests");
  await notifyCourseUsers([course.instructor], { title: "Course changes requested", message: `${course.title}: ${course.reviewFeedback}` });
  ok(res, course, "Changes requested");
});
export const adminPublishCourse = asyncHandler(async (req, res) => {
  const course = await Course.findOneAndUpdate(
    { _id: req.params.courseId, status: { $in: ["ready_to_publish", "unpublished"] } },
    { status: "published", disabled: false, publishedAt: new Date() },
    { new: true }
  );
  if (!course) throw new ApiError(409, "Course must be ready to publish");
  await notifyCourseUsers([course.instructor], { title: "Course published", message: `${course.title} is now live for students.` });
  ok(res, course, "Course published");
});
export const adminUnpublishCourse = asyncHandler(async (req, res) => {
  const course = await Course.findOneAndUpdate({ _id: req.params.courseId, status: { $in: PUBLIC_COURSE_STATUSES } }, { status: "unpublished" }, { new: true });
  if (!course) throw new ApiError(409, "Only published courses can be unpublished");
  ok(res, course, "Course unpublished");
});
export const adminArchiveCourse = asyncHandler(async (req, res) => {
  const course = await Course.findByIdAndUpdate(req.params.courseId, { status: "archived", disabled: true, archivedAt: new Date() }, { new: true });
  if (!course) throw new ApiError(404, "Course not found");
  ok(res, course, "Course archived");
});
export const adminCourseControl = asyncHandler(async (req, res) => {
  const allowed = ["featured", "disabled", "price", "discountPrice", "status"];
  const payload = Object.fromEntries(Object.entries(req.body).filter(([key]) => allowed.includes(key)));
  ok(res, await Course.findByIdAndUpdate(req.params.courseId, payload, { new: true, runValidators: true }), "Course control updated");
});
export const adminOrders = asyncHandler(async (_req, res) => ok(res, await Order.find({}).sort({ createdAt: -1 })));
export const adminPayments = asyncHandler(async (_req, res) => ok(res, await Payment.find({}).sort({ createdAt: -1 })));
export const adminRefunds = asyncHandler(async (_req, res) => ok(res, await RefundRequest.find({}).populate("user", "name email").sort({ createdAt: -1 })));
export const adminRefundStatus = asyncHandler(async (req, res) => {
  const refund = await RefundRequest.findByIdAndUpdate(req.params.refundId, { status: req.body.status }, { new: true });
  if (!refund) throw new ApiError(404, "Refund request not found");
  if (refund.status === "approved") {
    const payment = refund.payment ? await Payment.findByIdAndUpdate(refund.payment, { status: "refunded" }, { new: true }) : null;
    const orderId = refund.order || payment?.order;
    const order = orderId ? await Order.findByIdAndUpdate(orderId, { status: "refunded" }, { new: true }) : null;
    if (order?.course) await Enrollment.findOneAndUpdate({ student: refund.user, course: order.course }, { status: "cancelled" });
  }
  ok(res, refund, `Refund ${refund.status}`);
});
export const adminCoupons = asyncHandler(async (_req, res) => ok(res, await Coupon.find({}).sort({ createdAt: -1 })));
export const adminCategories = asyncHandler(async (_req, res) => ok(res, await Category.find({}).sort({ name: 1 })));
export const adminCreateCategory = asyncHandler(async (req, res) => created(res, await Category.create(req.body)));
export const adminUpdateCategory = asyncHandler(async (req, res) => ok(res, await Category.findByIdAndUpdate(req.params.categoryId, req.body, { new: true })));
export const adminDeleteCategory = asyncHandler(async (req, res) => ok(res, await Category.findByIdAndDelete(req.params.categoryId), "Category deleted"));
export const adminAssignments = asyncHandler(async (_req, res) => ok(res, await Assignment.find({}).populate("course", "title").sort({ dueDate: 1 })));
export const adminDeleteAssignment = asyncHandler(async (req, res) => ok(res, await Assignment.findByIdAndDelete(req.params.assignmentId), "Assignment deleted"));
export const adminCertificates = asyncHandler(async (_req, res) => ok(res, await Certificate.find({}).populate("student", "name email").populate("course", "title").sort({ createdAt: -1 })));
export const adminDeleteCertificate = asyncHandler(async (req, res) => ok(res, await Certificate.findByIdAndDelete(req.params.certificateId), "Certificate deleted"));
export const adminReviews = asyncHandler(async (_req, res) => ok(res, await Review.find({}).populate("user", "name email").populate("course", "title").sort({ createdAt: -1 })));
export const adminDeleteReview = asyncHandler(async (req, res) => ok(res, await Review.findByIdAndDelete(req.params.reviewId), "Review deleted"));
export const adminCommunity = asyncHandler(async (_req, res) => ok(res, await DiscussionQuestion.find({}).populate("user", "name email").populate("course", "title").sort({ createdAt: -1 })));
export const adminDeleteDiscussion = asyncHandler(async (req, res) => {
  await DiscussionAnswer.deleteMany({ question: req.params.questionId });
  ok(res, await DiscussionQuestion.findByIdAndDelete(req.params.questionId), "Discussion deleted");
});
export const adminReports = asyncHandler(async (_req, res) => {
  const revenue = await Payment.aggregate([{ $match: { status: { $in: ["paid", "success", "captured"] } } }, { $group: { _id: null, total: { $sum: "$amount" } } }]);
  const totalEnrollments = await Enrollment.countDocuments();
  const completedEnrollments = await Enrollment.countDocuments({ status: "completed" });
  ok(res, {
    revenue: revenue[0]?.total || 0,
    activeStudents: await User.countDocuments({ role: "student", status: "active" }),
    activeInstructors: await User.countDocuments({ role: "instructor", status: "active" }),
    publishedCourses: await Course.countDocuments({ status: { $in: PUBLIC_COURSE_STATUSES } }),
    totalOrders: await Order.countDocuments(),
    completionRate: totalEnrollments ? Math.round((completedEnrollments / totalEnrollments) * 100) : 0,
  });
});
export const adminCreateCoupon = asyncHandler(async (req, res) => created(res, await Coupon.create(req.body)));
export const adminUpdateCoupon = asyncHandler(async (req, res) => ok(res, await Coupon.findByIdAndUpdate(req.params.couponId, req.body, { new: true })));
export const adminDeleteCoupon = asyncHandler(async (req, res) => ok(res, await Coupon.findByIdAndDelete(req.params.couponId), "Coupon deleted"));
