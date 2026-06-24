import {
  CalendarEvent,
  Course,
  Enrollment,
  LiveClass,
  LiveClassAttendance,
  LiveClassQuestion,
  Module,
  User,
} from "../models/index.js";
import { uploadBuffer } from "../services/uploadService.js";
import { attendanceResult, enrolledStudentIds, notifyUsers, slugifyLiveClass } from "../services/liveClassService.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";

const ok = (res, data, message = "OK") => res.json({ success: true, message, data });
const created = (res, data, message = "Created") => res.status(201).json({ success: true, message, data });
const userId = (req) => req.user?._id;
const populated = [
  { path: "course", select: "title slug thumbnail price pricingType" },
  { path: "module", select: "title" },
  { path: "instructor", select: "name email" },
];

function normalizePayload(body, current = {}) {
  const startAt = body.startAt ? new Date(body.startAt) : current.startAt;
  const duration = Number(body.duration ?? current.duration ?? 60);
  if (!startAt || Number.isNaN(startAt.getTime())) throw new ApiError(400, "Valid class date and time are required");
  if (startAt <= new Date() && !current._id) throw new ApiError(400, "Live class must be scheduled in the future");
  const endAt = new Date(startAt.getTime() + duration * 60000);
  return {
    ...body,
    title: String(body.title ?? current.title ?? "").trim(),
    slug: body.slug || current.slug,
    startAt,
    endAt,
    scheduledDate: startAt,
    startTime: startAt.toISOString().slice(11, 16),
    endTime: endAt.toISOString().slice(11, 16),
    duration,
    maxStudents: Number(body.maxStudents ?? current.maxStudents ?? 0),
    reminderSettings: {
      before24Hours: body.reminderSettings?.before24Hours ?? current.reminderSettings?.before24Hours ?? true,
      before1Hour: body.reminderSettings?.before1Hour ?? current.reminderSettings?.before1Hour ?? true,
      before10Minutes: body.reminderSettings?.before10Minutes ?? current.reminderSettings?.before10Minutes ?? true,
    },
  };
}

async function uniqueSlug(title, currentId) {
  const base = slugifyLiveClass(title);
  let slug = base;
  let suffix = 1;
  while (await LiveClass.exists({ slug, ...(currentId ? { _id: { $ne: currentId } } : {}) })) slug = `${base}-${suffix++}`;
  return slug;
}

async function ownedLiveClass(req, options = {}) {
  const query = { _id: req.params.id, instructor: userId(req) };
  const liveClass = options.populate ? await LiveClass.findOne(query).populate(populated) : await LiveClass.findOne(query);
  if (!liveClass) throw new ApiError(404, "Live class not found");
  return liveClass;
}

async function ensureAssignedCourse(courseId, instructorId) {
  const course = await Course.findOne({ _id: courseId, instructor: instructorId });
  if (!course) throw new ApiError(403, "You can schedule classes only for assigned courses");
  return course;
}

async function attendanceSummary(liveClassId) {
  const rows = await LiveClassAttendance.find({ liveClass: liveClassId }).populate("student", "name email").sort({ joinTime: -1 });
  const average = rows.length ? Math.round(rows.reduce((sum, row) => sum + Number(row.attendancePercentage || 0), 0) / rows.length) : 0;
  return { rows, totalJoined: rows.length, averageAttendance: average };
}

function withDynamicStatus(doc) {
  const item = doc.toObject ? doc.toObject() : { ...doc };
  const now = Date.now();
  const start = new Date(item.startAt).getTime();
  if (item.status === "scheduled" && start - now <= 10 * 60000 && start > now) item.status = "starting-soon";
  return item;
}

function hideMeetingLink(item, role) {
  const value = withDynamicStatus(item);
  if (role !== "student") return value;
  const joinAt = new Date(value.startAt).getTime() - 10 * 60000;
  if (Date.now() < joinAt || !["starting-soon", "live"].includes(value.status)) {
    delete value.meetingLink;
    delete value.meetingUrl;
  }
  return value;
}

async function liveClassAudience(liveClass) {
  const studentIds = await enrolledStudentIds(liveClass.course);
  return [...new Set([liveClass.instructor, ...studentIds].filter(Boolean).map(String))];
}

async function syncLiveClassCalendar(liveClass, userIds) {
  const users = [...new Set((userIds || []).filter(Boolean).map(String))];
  if (!users.length) return;
  await CalendarEvent.bulkWrite(users.map((user) => ({
    updateOne: {
      filter: { user, liveClass: liveClass._id },
      update: {
        $set: {
          user,
          liveClass: liveClass._id,
          course: liveClass.course,
          title: liveClass.title,
          description: liveClass.description || "Live class",
          location: liveClass.meetingLink || liveClass.meetingUrl || liveClass.meetingPlatform || "",
          type: "live-class",
          startAt: liveClass.startAt,
          endAt: liveClass.endAt,
        },
      },
      upsert: true,
    },
  })));
}

async function removeLiveClassCalendar(liveClassId) {
  await CalendarEvent.deleteMany({ liveClass: liveClassId });
}

export const instructorCreateLiveClass = asyncHandler(async (req, res) => {
  await ensureAssignedCourse(req.body.course, userId(req));
  if (req.body.module && !(await Module.exists({ _id: req.body.module, course: req.body.course }))) throw new ApiError(400, "Module does not belong to the selected course");
  const payload = normalizePayload(req.body);
  payload.slug = await uniqueSlug(payload.title);
  payload.instructor = userId(req);
  payload.createdBy = userId(req);
  payload.status = process.env.LIVE_CLASS_AUTO_APPROVE === "true" ? "scheduled" : "pending-approval";
  payload.approvalStatus = process.env.LIVE_CLASS_AUTO_APPROVE === "true" ? "approved" : "pending";
  const liveClass = await LiveClass.create(payload);
  await notifyUsers(await User.find({ role: "admin", status: "active" }).distinct("_id"), {
    title: "New live class approval",
    message: `${liveClass.title} is waiting for approval.`,
  });
  if (liveClass.status === "scheduled") {
    const audience = await liveClassAudience(liveClass);
    await Promise.all([
      syncLiveClassCalendar(liveClass, audience),
      notifyUsers(audience, { title: "Live class scheduled", message: `${liveClass.title} has been scheduled for ${liveClass.startAt.toLocaleString()}.`, email: true }),
    ]);
  }
  created(res, await liveClass.populate(populated), "Live class scheduled");
});

export const instructorLiveClasses = asyncHandler(async (req, res) => {
  const query = { instructor: userId(req) };
  if (req.query.status) query.status = req.query.status;
  const rows = await LiveClass.find(query).populate(populated).sort({ startAt: 1 });
  ok(res, rows.map(withDynamicStatus));
});

export const instructorLiveClassDetails = asyncHandler(async (req, res) => {
  const liveClass = await ownedLiveClass(req, { populate: true });
  ok(res, { liveClass: withDynamicStatus(liveClass), attendance: await attendanceSummary(liveClass._id), questions: await LiveClassQuestion.find({ liveClass: liveClass._id }).populate("student", "name").sort({ createdAt: -1 }) });
});

export const instructorUpdateLiveClass = asyncHandler(async (req, res) => {
  const liveClass = await ownedLiveClass(req);
  if (!["draft", "pending-approval", "scheduled", "rejected"].includes(liveClass.status)) throw new ApiError(409, "This live class can no longer be edited");
  if (req.body.course) await ensureAssignedCourse(req.body.course, userId(req));
  const payload = normalizePayload(req.body, liveClass);
  if (req.body.title) payload.slug = await uniqueSlug(req.body.title, liveClass._id);
  Object.assign(liveClass, payload);
  if (liveClass.status === "rejected") {
    liveClass.status = "pending-approval";
    liveClass.approvalStatus = "pending";
    liveClass.rejectionReason = undefined;
  }
  await liveClass.save();
  if (liveClass.status === "scheduled") {
    const audience = await liveClassAudience(liveClass);
    await removeLiveClassCalendar(liveClass._id);
    await syncLiveClassCalendar(liveClass, audience);
    await notifyUsers(audience, { title: "Live class updated", message: `${liveClass.title} is now scheduled for ${liveClass.startAt.toLocaleString()}.`, email: true });
  }
  ok(res, await liveClass.populate(populated), "Live class updated");
});

export const instructorDeleteLiveClass = asyncHandler(async (req, res) => {
  const liveClass = await ownedLiveClass(req);
  if (!["draft", "pending-approval", "rejected", "cancelled"].includes(liveClass.status)) throw new ApiError(409, "Only draft, pending, rejected or cancelled classes can be deleted");
  await Promise.all([liveClass.deleteOne(), LiveClassAttendance.deleteMany({ liveClass: liveClass._id }), LiveClassQuestion.deleteMany({ liveClass: liveClass._id }), removeLiveClassCalendar(liveClass._id)]);
  ok(res, null, "Live class deleted");
});

export const instructorStartLiveClass = asyncHandler(async (req, res) => {
  const liveClass = await ownedLiveClass(req);
  if (!["scheduled", "starting-soon"].includes(liveClass.status)) throw new ApiError(409, "Only scheduled classes can be started");
  if (Date.now() < new Date(liveClass.startAt).getTime() - 15 * 60000) throw new ApiError(409, "Class can be started only 15 minutes before schedule");
  liveClass.status = "live";
  liveClass.startedAt = new Date();
  await liveClass.save();
  await notifyUsers(await enrolledStudentIds(liveClass.course), { title: "Live class started", message: `${liveClass.title} is live now.`, email: true });
  ok(res, liveClass, "Live class started");
});

export const instructorCompleteLiveClass = asyncHandler(async (req, res) => {
  const liveClass = await ownedLiveClass(req);
  if (liveClass.status !== "live") throw new ApiError(409, "Only a live class can be completed");
  liveClass.status = liveClass.recordingUrl ? "recording-available" : "completed";
  liveClass.completedAt = new Date();
  const openAttendance = await LiveClassAttendance.find({ liveClass: liveClass._id, leaveTime: { $exists: false } });
  await Promise.all(openAttendance.map(async (row) => {
    Object.assign(row, attendanceResult(row.joinTime, liveClass.completedAt, liveClass.duration));
    row.leaveTime = liveClass.completedAt;
    await row.save();
  }));
  const summary = await attendanceSummary(liveClass._id);
  liveClass.totalJoined = summary.totalJoined;
  liveClass.averageAttendance = summary.averageAttendance;
  await liveClass.save();
  ok(res, liveClass, "Live class completed");
});

export const instructorCancelLiveClass = asyncHandler(async (req, res) => {
  const liveClass = await ownedLiveClass(req);
  if (["completed", "recording-available", "cancelled"].includes(liveClass.status)) throw new ApiError(409, "Class cannot be cancelled");
  liveClass.status = "cancelled";
  liveClass.cancellationReason = req.body.reason || "Cancelled by instructor";
  liveClass.cancelledAt = new Date();
  await liveClass.save();
  await Promise.all([
    removeLiveClassCalendar(liveClass._id),
    notifyUsers(await enrolledStudentIds(liveClass.course), { title: "Live class cancelled", message: `${liveClass.title}: ${liveClass.cancellationReason}`, email: true }),
  ]);
  ok(res, liveClass, "Live class cancelled");
});

export const instructorUploadRecording = asyncHandler(async (req, res) => {
  const liveClass = await ownedLiveClass(req);
  if (!["completed", "recording-available"].includes(liveClass.status)) throw new ApiError(409, "Complete the class before adding a recording");
  const asset = req.file ? await uploadBuffer(req.file, `live-classes/${liveClass._id}/recordings`) : { url: req.body.url, publicId: req.body.publicId };
  if (!asset?.url) throw new ApiError(400, "Recording file or URL is required");
  liveClass.recordingUrl = asset.url;
  liveClass.recordingPublicId = asset.publicId;
  liveClass.status = "recording-available";
  await liveClass.save();
  await notifyUsers(await enrolledStudentIds(liveClass.course), { title: "Recording available", message: `${liveClass.title} recording is now available.` });
  ok(res, liveClass, "Recording uploaded");
});

export const instructorUploadResources = asyncHandler(async (req, res) => {
  const liveClass = await ownedLiveClass(req);
  const asset = req.file ? await uploadBuffer(req.file, `live-classes/${liveClass._id}/resources`) : { url: req.body.url, publicId: req.body.publicId };
  if (!asset?.url) throw new ApiError(400, "Resource file or URL is required");
  liveClass.resources.push({ title: req.body.title || req.file?.originalname || "Class resource", url: asset.url, publicId: asset.publicId, type: req.body.type || req.file?.mimetype || "resource" });
  await liveClass.save();
  ok(res, liveClass.resources, "Resource added");
});

export const instructorAttendance = asyncHandler(async (req, res) => {
  const liveClass = await ownedLiveClass(req);
  ok(res, await attendanceSummary(liveClass._id));
});

export const instructorUpdateAttendance = asyncHandler(async (req, res) => {
  const liveClass = await ownedLiveClass(req);
  const attendance = await LiveClassAttendance.findOne({ _id: req.params.attendanceId, liveClass: liveClass._id });
  if (!attendance) throw new ApiError(404, "Attendance record not found");
  const percentage = Math.max(0, Math.min(100, Number(req.body.attendancePercentage || 0)));
  attendance.attendancePercentage = percentage;
  attendance.attendedMinutes = Math.round((percentage / 100) * liveClass.duration);
  attendance.status = percentage >= 60 ? "present" : percentage >= 20 ? "partial" : "absent";
  attendance.manualOverride = true;
  attendance.markedBy = userId(req);
  await attendance.save();
  ok(res, attendance, "Attendance updated");
});

export const instructorAnswerQuestion = asyncHandler(async (req, res) => {
  const liveClass = await ownedLiveClass(req);
  const question = await LiveClassQuestion.findOne({ _id: req.params.questionId, liveClass: liveClass._id });
  if (!question) throw new ApiError(404, "Question not found");
  if (!req.body.answer?.trim()) throw new ApiError(400, "Answer is required");
  question.answer = req.body.answer.trim();
  question.answeredBy = userId(req);
  question.isAnswered = true;
  await question.save();
  ok(res, question, "Question answered");
});

export const instructorExportAttendance = asyncHandler(async (req, res) => {
  const liveClass = await ownedLiveClass(req);
  const { rows } = await attendanceSummary(liveClass._id);
  const csv = ["Student,Email,Join Time,Leave Time,Minutes,Percentage,Status", ...rows.map((row) => [
    csvCell(row.student?.name), csvCell(row.student?.email), csvCell(row.joinTime?.toISOString()), csvCell(row.leaveTime?.toISOString()),
    row.attendedMinutes || 0, row.attendancePercentage || 0, row.status,
  ].join(","))].join("\n");
  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", `attachment; filename="${liveClass.slug}-attendance.csv"`);
  res.send(csv);
});

export const adminLiveClasses = asyncHandler(async (req, res) => {
  const query = {};
  if (req.query.status) query.status = req.query.status;
  const classes = await LiveClass.find(query).populate(populated).sort({ startAt: -1 });
  const stats = await LiveClass.aggregate([{ $group: { _id: "$status", count: { $sum: 1 }, attendance: { $avg: "$averageAttendance" } } }]);
  ok(res, { classes: classes.map(withDynamicStatus), stats });
});

export const adminLiveClassDetails = asyncHandler(async (req, res) => {
  const liveClass = await LiveClass.findById(req.params.id).populate(populated);
  if (!liveClass) throw new ApiError(404, "Live class not found");
  ok(res, { liveClass: withDynamicStatus(liveClass), attendance: await attendanceSummary(liveClass._id) });
});

export const adminApproveLiveClass = asyncHandler(async (req, res) => {
  const liveClass = await LiveClass.findById(req.params.id);
  if (!liveClass) throw new ApiError(404, "Live class not found");
  if (!["pending-approval", "rejected"].includes(liveClass.status)) throw new ApiError(409, "Live class is not waiting for approval");
  liveClass.status = "scheduled";
  liveClass.approvalStatus = "approved";
  liveClass.approvedBy = userId(req);
  liveClass.approvedAt = new Date();
  liveClass.rejectionReason = undefined;
  await liveClass.save();
  const audience = await liveClassAudience(liveClass);
  await Promise.all([
    syncLiveClassCalendar(liveClass, audience),
    notifyUsers(audience, { title: "Live class scheduled", message: `${liveClass.title} has been approved for ${liveClass.startAt.toLocaleString()}.`, email: true }),
  ]);
  ok(res, liveClass, "Live class approved");
});

export const adminRejectLiveClass = asyncHandler(async (req, res) => {
  const liveClass = await LiveClass.findById(req.params.id);
  if (!liveClass) throw new ApiError(404, "Live class not found");
  liveClass.status = "rejected";
  liveClass.approvalStatus = "rejected";
  liveClass.rejectionReason = req.body.reason || "Changes required";
  await liveClass.save();
  await notifyUsers([liveClass.instructor], { title: "Live class rejected", message: `${liveClass.title}: ${liveClass.rejectionReason}` });
  ok(res, liveClass, "Live class rejected");
});

export const adminCancelLiveClass = asyncHandler(async (req, res) => {
  const liveClass = await LiveClass.findById(req.params.id);
  if (!liveClass) throw new ApiError(404, "Live class not found");
  liveClass.status = "cancelled";
  liveClass.cancellationReason = req.body.reason || "Cancelled by admin";
  liveClass.cancelledAt = new Date();
  await liveClass.save();
  const audience = await liveClassAudience(liveClass);
  await Promise.all([
    removeLiveClassCalendar(liveClass._id),
    notifyUsers(audience, { title: "Live class cancelled", message: `${liveClass.title}: ${liveClass.cancellationReason}`, email: true }),
  ]);
  ok(res, liveClass, "Live class cancelled");
});

export const adminRescheduleLiveClass = asyncHandler(async (req, res) => {
  const liveClass = await LiveClass.findById(req.params.id);
  if (!liveClass) throw new ApiError(404, "Live class not found");
  Object.assign(liveClass, normalizePayload(req.body, liveClass), { status: "scheduled", approvalStatus: "approved" });
  await liveClass.save();
  const audience = await liveClassAudience(liveClass);
  await removeLiveClassCalendar(liveClass._id);
  await Promise.all([
    syncLiveClassCalendar(liveClass, audience),
    notifyUsers(audience, { title: "Live class rescheduled", message: `${liveClass.title} is now scheduled for ${liveClass.startAt.toLocaleString()}.`, email: true }),
  ]);
  ok(res, liveClass, "Live class rescheduled");
});

export const adminAttendance = asyncHandler(async (req, res) => {
  if (!(await LiveClass.exists({ _id: req.params.id }))) throw new ApiError(404, "Live class not found");
  ok(res, await attendanceSummary(req.params.id));
});

export const adminAnnouncement = asyncHandler(async (req, res) => {
  const liveClass = await LiveClass.findById(req.params.id);
  if (!liveClass) throw new ApiError(404, "Live class not found");
  if (!req.body.message) throw new ApiError(400, "Announcement message is required");
  await notifyUsers([liveClass.instructor, ...(await enrolledStudentIds(liveClass.course))], { title: req.body.title || `Update: ${liveClass.title}`, message: req.body.message, email: Boolean(req.body.email) });
  ok(res, null, "Announcement sent");
});

export const adminDeleteLiveClass = asyncHandler(async (req, res) => {
  const liveClass = await LiveClass.findByIdAndDelete(req.params.id);
  if (!liveClass) throw new ApiError(404, "Live class not found");
  await Promise.all([LiveClassAttendance.deleteMany({ liveClass: liveClass._id }), LiveClassQuestion.deleteMany({ liveClass: liveClass._id }), removeLiveClassCalendar(liveClass._id)]);
  ok(res, null, "Live class deleted");
});

async function studentClassQuery(req, extra = {}) {
  const enrolledCourses = await Enrollment.find({ student: userId(req), status: { $in: ["active", "completed"] } }).distinct("course");
  return { ...extra, $or: [{ course: { $in: enrolledCourses } }, { accessType: "free-preview" }] };
}

export const studentLiveClasses = asyncHandler(async (req, res) => {
  const query = await studentClassQuery(req, { status: { $in: ["scheduled", "live", "completed", "recording-available", "cancelled"] } });
  const rows = await LiveClass.find(query).populate(populated).sort({ startAt: 1 });
  ok(res, rows.map((item) => hideMeetingLink(item, "student")));
});

export const studentTodayLiveClasses = asyncHandler(async (req, res) => {
  const start = new Date(); start.setHours(0, 0, 0, 0);
  const end = new Date(start); end.setDate(end.getDate() + 1);
  const query = await studentClassQuery(req, { startAt: { $gte: start, $lt: end }, status: { $in: ["scheduled", "live"] } });
  ok(res, (await LiveClass.find(query).populate(populated).sort({ startAt: 1 })).map((item) => hideMeetingLink(item, "student")));
});

export const studentUpcomingLiveClasses = asyncHandler(async (req, res) => {
  const query = await studentClassQuery(req, { startAt: { $gte: new Date() }, status: { $in: ["scheduled", "live"] } });
  ok(res, (await LiveClass.find(query).populate(populated).sort({ startAt: 1 })).map((item) => hideMeetingLink(item, "student")));
});

export const studentRecordings = asyncHandler(async (req, res) => {
  const query = await studentClassQuery(req, { status: "recording-available", recordingUrl: { $exists: true, $ne: "" } });
  ok(res, await LiveClass.find(query).populate(populated).sort({ completedAt: -1 }));
});

export const studentLiveClassDetails = asyncHandler(async (req, res) => {
  const query = await studentClassQuery(req, { _id: req.params.id });
  const liveClass = await LiveClass.findOne(query).populate(populated);
  if (!liveClass) throw new ApiError(404, "Live class not found");
  const attendance = await LiveClassAttendance.findOne({ liveClass: liveClass._id, student: userId(req) });
  ok(res, { liveClass: hideMeetingLink(liveClass, "student"), attendance, questions: await LiveClassQuestion.find({ liveClass: liveClass._id }).populate("student", "name").sort({ createdAt: -1 }) });
});

export const studentJoinLiveClass = asyncHandler(async (req, res) => {
  const query = await studentClassQuery(req, { _id: req.params.id });
  const liveClass = await LiveClass.findOne(query);
  if (!liveClass) throw new ApiError(404, "Live class not found or access denied");
  const joinAt = new Date(liveClass.startAt).getTime() - 10 * 60000;
  const closeAt = new Date(liveClass.endAt).getTime() + 30 * 60000;
  if (Date.now() < joinAt) throw new ApiError(409, "Join opens 10 minutes before the class");
  if (Date.now() > closeAt || ["completed", "recording-available", "cancelled", "rejected"].includes(liveClass.status)) throw new ApiError(409, "This live class is no longer joinable");
  if (liveClass.maxStudents > 0 && await LiveClassAttendance.countDocuments({ liveClass: liveClass._id }) >= liveClass.maxStudents) throw new ApiError(409, "Live class is full");
  const attendance = await LiveClassAttendance.findOneAndUpdate(
    { liveClass: liveClass._id, student: userId(req) },
    { $setOnInsert: { course: liveClass.course, instructor: liveClass.instructor, joinTime: new Date(), status: "joined" } },
    { upsert: true, new: true }
  );
  liveClass.totalJoined = await LiveClassAttendance.countDocuments({ liveClass: liveClass._id });
  await liveClass.save();
  ok(res, { attendance, meetingLink: liveClass.meetingLink || liveClass.meetingUrl }, "Attendance marked");
});

export const studentLeaveLiveClass = asyncHandler(async (req, res) => {
  const liveClass = await LiveClass.findById(req.params.id);
  if (!liveClass) throw new ApiError(404, "Live class not found");
  const attendance = await LiveClassAttendance.findOne({ liveClass: liveClass._id, student: userId(req) });
  if (!attendance?.joinTime) throw new ApiError(404, "Join attendance not found");
  if (!attendance.manualOverride) Object.assign(attendance, attendanceResult(attendance.joinTime, new Date(), liveClass.duration));
  attendance.leaveTime = new Date();
  await attendance.save();
  ok(res, attendance, "Attendance updated");
});

export const studentRecording = asyncHandler(async (req, res) => {
  const query = await studentClassQuery(req, { _id: req.params.id, status: "recording-available" });
  const liveClass = await LiveClass.findOne(query).select("recordingUrl title");
  if (!liveClass?.recordingUrl) throw new ApiError(404, "Recording is unavailable");
  ok(res, { title: liveClass.title, recordingUrl: liveClass.recordingUrl });
});

export const studentResources = asyncHandler(async (req, res) => {
  const query = await studentClassQuery(req, { _id: req.params.id });
  const liveClass = await LiveClass.findOne(query).select("resources notes");
  if (!liveClass) throw new ApiError(404, "Live class not found");
  ok(res, { resources: liveClass.resources, notes: liveClass.notes });
});

export const studentAskQuestion = asyncHandler(async (req, res) => {
  const query = await studentClassQuery(req, { _id: req.params.id, enableQA: true });
  if (!(await LiveClass.exists(query))) throw new ApiError(404, "Q&A is unavailable");
  if (!req.body.question?.trim()) throw new ApiError(400, "Question is required");
  created(res, await LiveClassQuestion.create({ liveClass: req.params.id, student: userId(req), question: req.body.question.trim() }), "Question submitted");
});

function csvCell(value) {
  return `"${String(value || "").replace(/"/g, '""')}"`;
}
