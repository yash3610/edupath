import { Course } from "../models/index.js";
import { fallbackBlogs, fallbackCourses, fallbackEvents, fallbackProducts, fallbackTeam } from "../data/fallbackContent.js";
import { sendEmail } from "../services/emailService.js";
import asyncHandler from "../utils/asyncHandler.js";

const ok = (res, data, message = "OK") => res.json({ success: true, message, data });
const created = (res, data, message = "Created") => res.status(201).json({ success: true, message, data });
const recentContactKeys = new Map();
const CONTACT_DEDUPE_MS = 30 * 1000;

const normalizeCourse = (course) => ({
  ...course,
  _id: course._id,
  title: course.title,
  slug: course.slug,
  category: course.category,
  instructor: course.instructor?.name || course.instructor || "EduPath Instructor",
  price: course.price || 0,
  image: course.image || course.thumbnail || "/assets/images/course/course-1/1.png",
  thumbnail: course.thumbnail || course.image || "/assets/images/course/course-1/1.png",
  description: course.description,
  rating: course.rating || 5,
  status: course.status,
});

export const publicCourses = asyncHandler(async (_req, res) => {
  const courses = await Course.find({ status: "approved", disabled: { $ne: true } }).populate("instructor", "name").sort({ featured: -1, createdAt: -1 }).lean();
  ok(res, courses.length ? courses.map(normalizeCourse) : fallbackCourses);
});

export const publicCourseDetails = asyncHandler(async (req, res) => {
  const course = await Course.findOne({ slug: req.params.slug, status: "approved", disabled: { $ne: true } }).populate("instructor", "name").lean();
  const fallback = fallbackCourses.find((item) => item.slug === req.params.slug || item._id === req.params.slug || item.legacyId === req.params.slug);
  if (!course && !fallback) return res.status(404).json({ success: false, message: "Course not found" });
  ok(res, course ? normalizeCourse(course) : fallback);
});

export const publicBlogs = asyncHandler(async (_req, res) => ok(res, fallbackBlogs));
export const publicEvents = asyncHandler(async (_req, res) => ok(res, fallbackEvents));
export const publicProducts = asyncHandler(async (_req, res) => ok(res, fallbackProducts));
export const publicTeam = asyncHandler(async (_req, res) => ok(res, fallbackTeam));

export const contactSubmission = asyncHandler(async (req, res) => {
  const { name, email, phone, subject = "Website enquiry", message } = req.body;
  if (!name || !email || !message) return res.status(400).json({ success: false, message: "Name, email and message are required" });

  const to = process.env.CONTACT_TO_EMAIL || process.env.EMAIL_USER || process.env.SMTP_USER;
  if (!to) return res.status(500).json({ success: false, message: "Contact email is not configured" });

  const dedupeKey = `${String(email).toLowerCase()}::${String(message).trim().toLowerCase()}`;
  const lastSentAt = recentContactKeys.get(dedupeKey);
  if (lastSentAt && Date.now() - lastSentAt < CONTACT_DEDUPE_MS) {
    return created(res, { name, email, phone, subject, deduped: true, receivedAt: new Date() }, "Thanks! Your message has already been sent.");
  }
  recentContactKeys.set(dedupeKey, Date.now());
  setTimeout(() => recentContactKeys.delete(dedupeKey), CONTACT_DEDUPE_MS).unref?.();

  await sendEmail({
    to,
    subject: `EduPath Contact: ${subject}`,
    html: contactEmailTemplate({ name, email, phone, subject, message }),
  });

  created(res, { name, email, phone, subject, receivedAt: new Date() }, "Thanks! Your message has been sent.");
});

export const newsletterSubscription = asyncHandler(async (req, res) => {
  created(res, { email: req.body.email, subscribedAt: new Date() }, "Newsletter subscription saved.");
});

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function contactEmailTemplate({ name, email, phone, subject, message }) {
  const safeName = escapeHtml(name);
  const safeEmail = escapeHtml(email);
  const safePhone = escapeHtml(phone || "Not provided");
  const safeSubject = escapeHtml(subject);
  const safeMessage = escapeHtml(message).replace(/\n/g, "<br />");

  return `
    <div style="margin:0;background:#f4f7fb;padding:32px 16px;font-family:Inter,Arial,sans-serif;color:#111827">
      <div style="max-width:680px;margin:0 auto;background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 18px 50px rgba(15,23,42,.12);border:1px solid #e5e7eb">
        <div style="background:linear-gradient(135deg,#111827 0%,#201849 58%,#ff6b35 100%);padding:30px;color:#ffffff">
          <div style="display:inline-block;background:rgba(255,255,255,.14);border:1px solid rgba(255,255,255,.25);border-radius:999px;padding:8px 14px;font-size:12px;font-weight:800;letter-spacing:.12em;text-transform:uppercase">EduPath Contact</div>
          <h1 style="margin:18px 0 6px;font-size:28px;line-height:1.2">New message from ${safeName}</h1>
          <p style="margin:0;color:rgba(255,255,255,.78);font-size:15px">A learner submitted the contact form from your website.</p>
        </div>

        <div style="padding:28px">
          <div style="display:grid;gap:14px">
            ${infoRow("Name", safeName)}
            ${infoRow("Email", `<a href="mailto:${safeEmail}" style="color:#ff6b35;text-decoration:none;font-weight:800">${safeEmail}</a>`)}
            ${infoRow("Phone", safePhone)}
            ${infoRow("Subject", safeSubject)}
          </div>

          <div style="margin-top:24px;border-radius:18px;background:#fff7ed;border:1px solid #fed7aa;padding:22px">
            <p style="margin:0 0 10px;color:#9a3412;font-size:12px;font-weight:900;letter-spacing:.14em;text-transform:uppercase">Message</p>
            <div style="font-size:16px;line-height:1.75;color:#1f2937">${safeMessage}</div>
          </div>

          <div style="margin-top:24px;text-align:center">
            <a href="mailto:${safeEmail}" style="display:inline-block;background:#ff6b35;color:#ffffff;text-decoration:none;border-radius:14px;padding:13px 20px;font-weight:900">Reply to ${safeName}</a>
          </div>
        </div>

        <div style="padding:18px 28px;background:#f8fafc;border-top:1px solid #e5e7eb;color:#64748b;font-size:12px;text-align:center">
          Sent from EduPath contact form • Mumbai, Maharashtra
        </div>
      </div>
    </div>
  `;
}

function infoRow(label, value) {
  return `
    <div style="border:1px solid #e5e7eb;border-radius:16px;padding:14px 16px;background:#f8fafc">
      <p style="margin:0 0 4px;color:#64748b;font-size:11px;font-weight:900;letter-spacing:.12em;text-transform:uppercase">${label}</p>
      <div style="font-size:15px;font-weight:800;color:#111827">${value}</div>
    </div>
  `;
}
