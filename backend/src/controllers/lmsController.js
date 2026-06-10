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
import { uploadBuffer } from "../services/uploadService.js";
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
const normalizeCoursePayload = (body) => {
  const payload = { ...body };
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
  return payload;
};

async function issueCertificateIfEligible(student, courseId, progress) {
  if (progress < 100) return null;
  const course = await Course.findById(courseId);
  if (!course?.certificateEnabled) return null;
  const existing = await Certificate.findOne({ student, course: courseId });
  if (existing) return existing;

  if (course.certificateRules?.requireQuizzes) {
    const quizIds = await Quiz.find({ course: courseId }).distinct("_id");
    const passed = await QuizAttempt.distinct("quiz", { student, quiz: { $in: quizIds }, status: "passed" });
    if (passed.length < quizIds.length) return null;
  }
  if (course.certificateRules?.requireAssignments) {
    const assignmentIds = await Assignment.find({ course: courseId }).distinct("_id");
    const completed = await AssignmentSubmission.distinct("assignment", { student, assignment: { $in: assignmentIds }, status: { $in: ["submitted", "graded"] } });
    if (completed.length < assignmentIds.length) return null;
  }

  const certificateCode = `EDU-${randomUUID().slice(0, 8).toUpperCase()}`;
  const baseUrl = process.env.API_PUBLIC_URL || `http://localhost:${process.env.PORT || 5000}`;
  const verificationUrl = `${baseUrl}/api/certificates/verify/${certificateCode}`;
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

export const dashboardStats = asyncHandler(async (req, res) => ok(res, {
  enrolledCourses: await Enrollment.countDocuments({ student: userId(req) }),
  completedCourses: await Enrollment.countDocuments({ student: userId(req), status: "completed" }),
  learningHours: 146,
  certificates: await Certificate.countDocuments({ student: userId(req) }),
  quizAverage: 88,
}));
export const continueLearning = asyncHandler(async (req, res) => ok(res, await Enrollment.findOne({ student: userId(req) }).populate("course")));
export const recommendedCourses = asyncHandler(async (_req, res) => ok(res, await Course.find({ status: { $in: PUBLIC_COURSE_STATUSES }, disabled: { $ne: true } }).sort({ featured: -1, rating: -1 }).limit(6)));
export const upcomingClasses = asyncHandler(async (req, res) => ok(res, await CalendarEvent.find({ user: userId(req), startAt: { $gte: new Date() } }).sort({ startAt: 1 }).limit(8)));
export const recentNotifications = asyncHandler(async (req, res) => ok(res, await Notification.find({ user: userId(req) }).sort({ createdAt: -1 }).limit(10)));
export const achievements = asyncHandler(async (req, res) => ok(res, { streak: 18, badges: ["Quiz Champion", "Fast Finisher"], student: userId(req) }));

export const myCourses = asyncHandler(async (req, res) => {
  const query = { student: userId(req) };
  const enrollments = await Enrollment.find(query).populate("course");
  const filtered = enrollments.filter((item) => {
    const statusMatch = !req.query.status || item.status === req.query.status;
    const searchMatch = !req.query.search || item.course?.title?.toLowerCase().includes(String(req.query.search).toLowerCase());
    return statusMatch && searchMatch;
  });
  ok(res, filtered);
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
  const progress = await LectureProgress.findOneAndUpdate({ student: userId(req), lecture: req.params.lectureId }, { $set: { ...req.body, course: lecture.course } }, { new: true, upsert: true });
  const totalLectures = await Lecture.countDocuments({ course: lecture.course, published: { $ne: false } });
  const completedLectures = await LectureProgress.countDocuments({ student: userId(req), course: lecture.course, completed: true });
  await Enrollment.findOneAndUpdate({ student: userId(req), course: lecture.course }, { progress: totalLectures ? Math.round((completedLectures / totalLectures) * 100) : 0 });
  ok(res, progress, "Progress updated");
});
export const completeLecture = asyncHandler(async (req, res) => {
  const lecture = await Lecture.findById(req.params.lectureId).select("course");
  if (!lecture) throw new ApiError(404, "Lecture not found");
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
  ok(res, await LectureProgress.findOneAndUpdate({ student: userId(req), lecture: req.params.lectureId }, { $set: { bookmarked: true, course: lecture.course } }, { new: true, upsert: true }), "Bookmarked");
});
export const watchTime = asyncHandler(async (req, res) => {
  const lecture = await Lecture.findById(req.params.lectureId).select("course");
  if (!lecture) throw new ApiError(404, "Lecture not found");
  ok(res, await LectureProgress.findOneAndUpdate({ student: userId(req), lecture: req.params.lectureId }, { $inc: { watchTimeSeconds: Number(req.body.seconds || 0) }, $set: { course: lecture.course } }, { new: true, upsert: true }), "Watch time saved");
});
export const courseResources = asyncHandler(async (req, res) => ok(res, await Lecture.find({ course: req.params.courseId }).select("resources title")));

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

export const studentAssignments = asyncHandler(async (_req, res) => ok(res, await Assignment.find({}).sort({ dueDate: 1 })));
export const assignmentDetails = asyncHandler(async (req, res) => ok(res, await Assignment.findById(req.params.assignmentId)));
export const submitAssignment = asyncHandler(async (req, res) => {
  const upload = await uploadBuffer(req.file, "assignments");
  const submission = await AssignmentSubmission.create({ assignment: req.params.assignmentId, student: userId(req), fileUrl: upload?.url, status: "submitted" });
  created(res, submission, "Assignment submitted");
});
export const assignmentSubmission = asyncHandler(async (req, res) => ok(res, await AssignmentSubmission.findOne({ assignment: req.params.assignmentId, student: userId(req) })));

export const myCertificates = asyncHandler(async (req, res) => ok(res, await Certificate.find({ student: userId(req) }).populate("course")));
export const certificateDetails = asyncHandler(async (req, res) => ok(res, await Certificate.findById(req.params.certificateId).populate("course student")));
export const downloadCertificate = asyncHandler(async (req, res) => {
  const cert = await Certificate.findById(req.params.certificateId).populate("course student");
  if (!cert) throw new ApiError(404, "Certificate not found");
  const pdf = await generateCertificatePdf({ studentName: cert.student?.name, courseTitle: cert.course?.title, certificateCode: cert.certificateCode });
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
export const createReminder = asyncHandler(async (req, res) => created(res, await Reminder.create({ ...req.body, user: userId(req) })));
export const updateReminder = asyncHandler(async (req, res) => ok(res, await Reminder.findOneAndUpdate({ _id: req.params.reminderId, user: userId(req) }, req.body, { new: true })));

export const notifications = asyncHandler(async (req, res) => {
  const query = { user: userId(req) };
  if (req.query.unread === "true") query.read = false;
  const limit = Math.min(Math.max(Number.parseInt(req.query.limit, 10) || 0, 0), 50);
  let notificationQuery = Notification.find(query).sort({ createdAt: -1 });
  if (limit) notificationQuery = notificationQuery.limit(limit);
  ok(res, await notificationQuery);
});
export const readNotification = asyncHandler(async (req, res) => ok(res, await Notification.findOneAndUpdate({ _id: req.params.notificationId, user: userId(req) }, { read: true }, { new: true })));
export const readAllNotifications = asyncHandler(async (req, res) => ok(res, await Notification.updateMany({ user: userId(req) }, { read: true })));
export const deleteNotification = asyncHandler(async (req, res) => ok(res, await Notification.deleteOne({ _id: req.params.notificationId, user: userId(req) })));

export const conversations = asyncHandler(async (req, res) => ok(res, await Conversation.find({ participants: userId(req) }).sort({ updatedAt: -1 })));
export const conversationMessages = asyncHandler(async (req, res) => ok(res, await Message.find({ conversation: req.params.conversationId }).sort({ createdAt: 1 })));
export const sendMessage = asyncHandler(async (req, res) => created(res, await Message.create({ ...req.body, sender: userId(req) })));
export const uploadAttachment = asyncHandler(async (req, res) => created(res, await uploadBuffer(req.file, "messages")));

export const myOrders = asyncHandler(async (req, res) => ok(res, await Order.find({ user: userId(req) }).sort({ createdAt: -1 })));
export const orderDetails = asyncHandler(async (req, res) => ok(res, await Order.findOne({ _id: req.params.orderId, user: userId(req) })));
export const orderInvoice = asyncHandler(async (req, res) => ok(res, { invoiceUrl: `/api/orders/${req.params.orderId}/invoice.pdf` }));
export const orderRefundRequest = asyncHandler(async (req, res) => created(res, await RefundRequest.create({ user: userId(req), order: req.params.orderId, reason: req.body.reason })));

const profileModelFor = (role) => role === "instructor" ? InstructorProfile : StudentProfile;
export const profileMe = asyncHandler(async (req, res) => ok(res, { user: req.user, profile: await profileModelFor(req.user?.role).findOne({ user: userId(req) }) }));
export const updateProfile = asyncHandler(async (req, res) => ok(res, await profileModelFor(req.user?.role).findOneAndUpdate({ user: userId(req) }, req.body, { new: true, upsert: true })));
export const updateAvatar = asyncHandler(async (req, res) => {
  const avatar = await uploadBuffer(req.file, "avatars");
  ok(res, await StudentProfile.findOneAndUpdate({ user: userId(req) }, { avatar: avatar?.url }, { new: true, upsert: true }));
});
export const changePassword = asyncHandler(async (req, res) => {
  const user = await User.findById(userId(req));
  if (!(await user.matchPassword(req.body.currentPassword || ""))) throw new ApiError(400, "Current password is incorrect");
  await user.setPassword(req.body.newPassword);
  await user.save();
  ok(res, null, "Password changed");
});

export const getSettings = asyncHandler(async (req, res) => ok(res, (await StudentProfile.findOne({ user: userId(req) }))?.preferences || {}));
export const patchSettings = asyncHandler(async (req, res) => ok(res, await StudentProfile.findOneAndUpdate({ user: userId(req) }, { $set: { preferences: req.body } }, { new: true, upsert: true })));
export const deleteAccount = asyncHandler(async (req, res) => ok(res, await User.findByIdAndUpdate(userId(req), { status: "blocked" }), "Account scheduled for deletion"));

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

export const communityQuestions = asyncHandler(async (_req, res) => ok(res, await DiscussionQuestion.find({}).sort({ createdAt: -1 })));
export const createQuestion = asyncHandler(async (req, res) => created(res, await DiscussionQuestion.create({ ...req.body, user: userId(req) })));
export const questionDetails = asyncHandler(async (req, res) => ok(res, { question: await DiscussionQuestion.findById(req.params.questionId), answers: await DiscussionAnswer.find({ question: req.params.questionId }) }));
export const createAnswer = asyncHandler(async (req, res) => created(res, await DiscussionAnswer.create({ question: req.params.questionId, user: userId(req), body: req.body.body })));
export const upvoteAnswer = asyncHandler(async (req, res) => ok(res, await DiscussionAnswer.findByIdAndUpdate(req.params.answerId, { $addToSet: { upvotes: userId(req) } }, { new: true })));
export const acceptAnswer = asyncHandler(async (req, res) => ok(res, await DiscussionAnswer.findByIdAndUpdate(req.params.answerId, { accepted: true }, { new: true })));

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

  const amount = payableCourses.reduce((sum, course) => sum + Number(course.price || 0), 0);
  if (amount <= 0) {
    await Enrollment.insertMany(payableCourses.map((course) => ({ student: userId(req), course: course._id, status: "active" })), { ordered: false }).catch(() => {});
    return created(res, { free: true, amount: 0, courses: payableCourses }, "Free course enrollment completed");
  }

  const order = await Order.create({
    user: userId(req),
    course: payableCourses[0]?._id,
    items: payableCourses.map((course) => ({ course: course._id, title: course.title, price: course.price })),
    amount,
    status: "pending",
    invoiceNumber: `EDU-${Date.now()}`,
  });
  const razorpayOrder = await createRazorpayOrder({ amount, receipt: String(order._id) });
  order.razorpayOrderId = razorpayOrder.id;
  await order.save();

  ok(res, {
    key: process.env.RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY,
    orderId: order._id,
    razorpayOrderId: razorpayOrder.id,
    amount,
    currency: razorpayOrder.currency || "INR",
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
export const paymentRefundRequest = asyncHandler(async (req, res) => created(res, await RefundRequest.create({ user: userId(req), payment: req.body.paymentId, reason: req.body.reason })));

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

export const instructorDashboard = asyncHandler(async (req, res) => ok(res, { courses: await Course.countDocuments({ instructor: userId(req) }), students: await Enrollment.countDocuments({}) }));
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
export const instructorMyCourses = asyncHandler(async (req, res) => ok(res, await Course.find({ instructor: userId(req) }).sort({ updatedAt: -1 })));
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
export const instructorCourseDetails = asyncHandler(async (req, res) => {
  const course = await Course.findOne({ _id: req.params.courseId, instructor: userId(req) }).populate("instructor", "name email");
  if (!course) throw new ApiError(404, "Course not found");
  ok(res, { course, completion: await courseCompletion(course._id) });
});
export const instructorCreateModule = asyncHandler(async (req, res) => {
  const course = await Course.findOne({ _id: req.params.courseId, instructor: userId(req) });
  if (!course) throw new ApiError(404, "Course not found");
  const module = await Module.create({ ...req.body, course: course._id });
  await markCourseContentInProgress(course._id);
  created(res, module);
});
export const instructorModules = asyncHandler(async (req, res) => {
  const course = await Course.findOne({ _id: req.params.courseId, instructor: userId(req) });
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
  const course = await Course.findOne({ _id: req.params.courseId, instructor: userId(req) });
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
  const course = await Course.findOne({ _id: req.params.courseId, instructor: userId(req) });
  if (!course) throw new ApiError(404, "Assigned course not found");
  if (!["assigned", "content_in_progress", "changes_requested"].includes(course.status)) {
    throw new ApiError(409, "This course cannot be submitted in its current status");
  }
  const completion = await courseCompletion(course._id);
  const required = ["basicInfo", "thumbnail", "modules", "lectures"];
  const missing = required.filter((key) => !completion.checks[key]);
  if (missing.length) throw new ApiError(400, `Complete before review: ${missing.join(", ")}`);

  course.status = "review_pending";
  course.submittedForReviewAt = new Date();
  course.reviewFeedback = "";
  await course.save();
  const admins = await User.find({ role: "admin", status: "active" }).distinct("_id");
  await notifyCourseUsers(admins, {
    title: "Course review requested",
    message: `${course.title} was submitted for review.`,
  });
  ok(res, { course, completion }, "Course submitted for review");
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
export const instructorGradeAssignment = asyncHandler(async (req, res) => ok(res, await AssignmentSubmission.findByIdAndUpdate(req.params.submissionId, { grade: req.body.grade, feedback: req.body.feedback, status: "graded" }, { new: true })));
export const instructorDoubts = asyncHandler(async (req, res) => {
  const courseIds = await Course.find({ instructor: userId(req) }).distinct("_id");
  ok(res, await DiscussionQuestion.find({ course: { $in: courseIds } }).populate("user", "name email").populate("course", "title").sort({ createdAt: -1 }));
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
export const adminPendingApprovals = asyncHandler(async (_req, res) => ok(res, await Course.find({ status: "review_pending" }).populate("instructor", "name email").sort({ submittedForReviewAt: 1 }).limit(20)));
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
  if (req.file) {
    const thumbnail = await uploadBuffer(req.file, "courses/thumbnails");
    payload.thumbnail = thumbnail.url;
  }
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
  const course = await Course.findById(req.params.courseId).populate("instructor", "name email");
  if (!course) throw new ApiError(404, "Course not found");
  const modules = await Module.find({ course: course._id }).sort({ order: 1 }).lean();
  const lectures = await Lecture.find({ course: course._id }).sort({ order: 1 }).lean();
  ok(res, { course, modules: modules.map((module) => ({ ...module, lectures: lectures.filter((lecture) => String(lecture.module) === String(module._id)) })) });
});
export const adminUpdateCourse = asyncHandler(async (req, res) => {
  const payload = normalizeCoursePayload(req.body);
  if (req.file) {
    const thumbnail = await uploadBuffer(req.file, "courses/thumbnails");
    payload.thumbnail = thumbnail.url;
  }
  if (payload.instructor && !(await User.exists({ _id: payload.instructor, role: "instructor" }))) {
    throw new ApiError(400, "Select a valid instructor");
  }
  const existing = await Course.findById(req.params.courseId);
  if (!existing) throw new ApiError(404, "Course not found");
  const previousInstructor = String(existing.instructor || "");
  if (payload.instructor && payload.instructor !== previousInstructor && existing.status === "draft") payload.status = "assigned";
  if (payload.instructor === null && ["assigned", "content_in_progress", "changes_requested"].includes(existing.status)) payload.status = "draft";
  const course = await Course.findByIdAndUpdate(req.params.courseId, payload, { new: true, runValidators: true });
  if (!course) throw new ApiError(404, "Course not found");
  if (payload.instructor && String(payload.instructor) !== previousInstructor) {
    await notifyCourseUsers([payload.instructor], {
      title: "New assigned course",
      message: `${course.title} has been assigned to you.`,
      email: true,
    });
  }
  ok(res, course, "Course updated");
});
export const adminDeleteCourse = asyncHandler(async (req, res) => ok(res, await Course.findByIdAndDelete(req.params.courseId), "Course deleted"));
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
