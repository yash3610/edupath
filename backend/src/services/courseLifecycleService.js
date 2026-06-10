import {
  Assignment,
  Course,
  Lecture,
  Module,
  Notification,
  Quiz,
  User,
} from "../models/index.js";
import { sendEmail } from "./emailService.js";

export const COURSE_STATUSES = [
  "draft",
  "assigned",
  "content_in_progress",
  "review_pending",
  "changes_requested",
  "ready_to_publish",
  "published",
  "unpublished",
  "archived",
];

export const PUBLIC_COURSE_STATUSES = ["published", "approved"];

export function normalizeCourseStatus(status) {
  return ({ approved: "published", pending: "review_pending", rejected: "changes_requested" })[status] || status;
}

export async function courseCompletion(courseId) {
  const [course, modules, lectures, quizzes, assignments] = await Promise.all([
    Course.findById(courseId).lean(),
    Module.countDocuments({ course: courseId }),
    Lecture.find({ course: courseId }).select("resources videoUrl notesPdfUrl").lean(),
    Quiz.countDocuments({ course: courseId }),
    Assignment.countDocuments({ course: courseId }),
  ]);

  if (!course) return null;
  const checks = {
    basicInfo: Boolean(course.title && course.slug && course.category && course.description),
    thumbnail: Boolean(course.thumbnail),
    promoVideo: Boolean(course.promoVideoUrl),
    modules: modules > 0,
    lectures: lectures.length > 0,
    resources: lectures.some((lecture) => lecture.resources?.length || lecture.notesPdfUrl),
    quiz: quizzes > 0,
    assignment: assignments > 0,
    certificateRules: !course.certificateEnabled || Boolean(course.certificateRules),
  };
  const completed = Object.values(checks).filter(Boolean).length;
  return {
    checks,
    percentage: Math.round((completed / Object.keys(checks).length) * 100),
    counts: { modules, lectures: lectures.length, quizzes, assignments },
  };
}

export async function markCourseContentInProgress(courseId) {
  await Course.updateOne(
    { _id: courseId, status: { $in: ["assigned", "changes_requested"] } },
    { status: "content_in_progress" }
  );
}

export async function notifyCourseUsers(userIds, { title, message, type = "course", email = false }) {
  const ids = [...new Set(userIds.filter(Boolean).map(String))];
  if (!ids.length) return;
  await Notification.insertMany(ids.map((user) => ({ user, type, title, message })));
  if (!email) return;
  const users = await User.find({ _id: { $in: ids } }).select("email name").lean();
  await Promise.allSettled(users.filter((user) => user.email).map((user) => sendEmail({
    to: user.email,
    subject: title,
    html: `<div style="font-family:Arial,sans-serif"><h2>${escapeHtml(title)}</h2><p>Hello ${escapeHtml(user.name || "there")},</p><p>${escapeHtml(message)}</p></div>`,
  })));
}

function escapeHtml(value) {
  return String(value || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
