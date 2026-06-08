import { Course } from "../models/index.js";
import { fallbackBlogs, fallbackCourses, fallbackEvents, fallbackProducts, fallbackTeam } from "../data/fallbackContent.js";
import asyncHandler from "../utils/asyncHandler.js";

const ok = (res, data, message = "OK") => res.json({ success: true, message, data });
const created = (res, data, message = "Created") => res.status(201).json({ success: true, message, data });

const normalizeCourse = (course) => ({
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
  const courses = await Course.find({ status: "approved" }).populate("instructor", "name").sort({ createdAt: -1 }).lean();
  ok(res, courses.length ? courses.map(normalizeCourse) : fallbackCourses);
});

export const publicCourseDetails = asyncHandler(async (req, res) => {
  const course = await Course.findOne({ slug: req.params.slug, status: "approved" }).populate("instructor", "name").lean();
  const fallback = fallbackCourses.find((item) => item.slug === req.params.slug || item._id === req.params.slug || item.legacyId === req.params.slug);
  if (!course && !fallback) return res.status(404).json({ success: false, message: "Course not found" });
  ok(res, course ? normalizeCourse(course) : fallback);
});

export const publicBlogs = asyncHandler(async (_req, res) => ok(res, fallbackBlogs));
export const publicEvents = asyncHandler(async (_req, res) => ok(res, fallbackEvents));
export const publicProducts = asyncHandler(async (_req, res) => ok(res, fallbackProducts));
export const publicTeam = asyncHandler(async (_req, res) => ok(res, fallbackTeam));

export const contactSubmission = asyncHandler(async (req, res) => {
  created(res, { ...req.body, receivedAt: new Date() }, "Thanks! We received your message.");
});

export const newsletterSubscription = asyncHandler(async (req, res) => {
  created(res, { email: req.body.email, subscribedAt: new Date() }, "Newsletter subscription saved.");
});
