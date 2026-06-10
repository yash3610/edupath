import { Enrollment, Notification, User } from "../models/index.js";
import { sendEmail } from "./emailService.js";

export const slugifyLiveClass = (value) =>
  String(value || "live-class").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

export function attendanceResult(joinTime, leaveTime, duration) {
  const minutes = Math.max(0, Math.round((new Date(leaveTime) - new Date(joinTime)) / 60000));
  const percentage = Math.min(100, Math.round((minutes / Math.max(1, Number(duration))) * 100));
  const status = percentage >= 60 ? "present" : percentage >= 20 ? "partial" : "absent";
  return { attendedMinutes: minutes, attendancePercentage: percentage, status };
}

export async function enrolledStudentIds(courseId) {
  return Enrollment.find({ course: courseId, status: { $in: ["active", "completed"] } }).distinct("student");
}

export async function notifyUsers(userIds, { type = "live-class", title, message, email = false }) {
  const ids = [...new Set(userIds.filter(Boolean).map(String))];
  if (!ids.length) return;
  await Notification.insertMany(ids.map((user) => ({ user, type, title, message })));
  if (!email) return;
  const users = await User.find({ _id: { $in: ids } }).select("email name").lean();
  await Promise.allSettled(users.filter((user) => user.email).map((user) => sendEmail({
    to: user.email,
    subject: title,
    html: `<div style="font-family:Arial,sans-serif"><h2>${escapeHtml(title)}</h2><p>Hello ${escapeHtml(user.name || "Learner")},</p><p>${escapeHtml(message)}</p></div>`,
  })));
}

function escapeHtml(value) {
  return String(value || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
