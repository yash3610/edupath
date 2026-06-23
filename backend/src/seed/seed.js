import {
  Assignment, CalendarEvent, Category, Certificate, Course, Enrollment,
  DashboardDataset, InstructorProfile, Lecture, LectureProgress, LiveClass, Module, Notification,
  Order, Payment, Quiz, QuizAttempt, StudentProfile, User,
} from "../models/index.js";
import { seedCategories, seedCourses } from "./seedData.js";
import { inferDashboardFormat } from "../services/dashboardDataService.js";
import * as adminDashboardMock from "../../../frontend/src/features/admin/data/admin.js";
import * as instructorDashboardMock from "../../../frontend/src/features/instructor/data/instructor.js";
import * as studentDashboardMock from "../../../frontend/src/features/student/data/mock.js";

async function ensureUser({ name, email, password, role }) {
  const normalizedEmail = email.toLowerCase();
  let user = await User.findOne({ email: normalizedEmail });
  if (!user) {
    user = new User({
      name, email: normalizedEmail, role, status: "active", emailVerified: true,
      preferences: role === "student" ? { weeklyGoal: 70, rank: "Rising learner" } : {},
    });
    await user.setPassword(password);
    await user.save();
  }
  return user;
}

async function seedDashboardMocks() {
  const roleDatasets = {
    admin: adminDashboardMock,
    instructor: instructorDashboardMock,
    student: studentDashboardMock,
  };

  for (const [role, datasets] of Object.entries(roleDatasets)) {
    for (const [key, rawData] of Object.entries(datasets)) {
      const data = JSON.parse(JSON.stringify(rawData));
      await DashboardDataset.findOneAndUpdate(
        { role, key },
        {
          $setOnInsert: {
            role,
            key,
            valueType: Array.isArray(data) ? "array" : "object",
            data,
            format: inferDashboardFormat(data),
            source: "frontend-mock",
            version: 1,
          },
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    }
  }
}

export default async function seedDatabase() {
  const admin = await ensureUser({
    name: process.env.SEED_ADMIN_NAME || "EduPath Admin",
    email: process.env.SEED_ADMIN_EMAIL || "admin@edupath.local",
    password: process.env.SEED_ADMIN_PASSWORD || "Admin@12345",
    role: "admin",
  });
  const instructor = await ensureUser({
    name: process.env.SEED_INSTRUCTOR_NAME || "EduPath Instructor",
    email: process.env.SEED_INSTRUCTOR_EMAIL || "instructor@edupath.local",
    password: process.env.SEED_INSTRUCTOR_PASSWORD || "Instructor@12345",
    role: "instructor",
  });
  const student = await ensureUser({
    name: process.env.SEED_STUDENT_NAME || "EduPath Student",
    email: process.env.SEED_STUDENT_EMAIL || "student@edupath.local",
    password: process.env.SEED_STUDENT_PASSWORD || "Student@12345",
    role: "student",
  });

  await InstructorProfile.findOneAndUpdate(
    { user: instructor._id },
    { headline: "Senior EduPath Instructor", bio: "Teaching modern product development.", expertise: ["React", "AI Products", "Design Systems"], rating: 4.8 },
    { upsert: true, new: true }
  );
  await StudentProfile.findOneAndUpdate(
    { user: student._id },
    { bio: "Learning modern web development and AI.", skills: ["JavaScript", "React"], learningGoalMinutes: 60, streak: 7 },
    { upsert: true, new: true }
  );
  await Promise.all(seedCategories.map((category) => Category.findOneAndUpdate(
    { slug: category.slug }, category, { upsert: true, new: true }
  )));

  const courses = [];
  for (const courseData of seedCourses) {
    courses.push(await Course.findOneAndUpdate(
      { slug: courseData.slug },
      {
        ...courseData,
        instructor: instructor._id,
        submittedForReviewAt: courseData.status === "review_pending" ? new Date() : undefined,
        publishedAt: courseData.status === "published" ? new Date() : undefined,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ));
  }

  const primaryCourse = courses[0];
  const module = await Module.findOneAndUpdate(
    { course: primaryCourse._id, order: 1 },
    { course: primaryCourse._id, title: "React Foundations", description: "Core product-building foundations", order: 1, published: true },
    { upsert: true, new: true }
  );
  const lectureOne = await Lecture.findOneAndUpdate(
    { course: primaryCourse._id, module: module._id, order: 1 },
    { course: primaryCourse._id, module: module._id, title: "Component Architecture", type: "video", durationSeconds: 1800, order: 1, published: true },
    { upsert: true, new: true }
  );
  await Lecture.findOneAndUpdate(
    { course: primaryCourse._id, module: module._id, order: 2 },
    { course: primaryCourse._id, module: module._id, title: "State and Data Flow", type: "article", estimatedDurationMinutes: 25, order: 2, published: true },
    { upsert: true, new: true }
  );

  const enrollment = await Enrollment.findOneAndUpdate(
    { student: student._id, course: primaryCourse._id },
    { student: student._id, course: primaryCourse._id, status: "active", progress: 45, enrolledAt: new Date() },
    { upsert: true, new: true }
  );
  await Enrollment.findOneAndUpdate(
    { student: student._id, course: courses[2]._id },
    { student: student._id, course: courses[2]._id, status: "completed", progress: 100, enrolledAt: new Date(Date.now() - 30 * 86400000) },
    { upsert: true, new: true }
  );
  await LectureProgress.findOneAndUpdate(
    { student: student._id, course: primaryCourse._id, lecture: lectureOne._id },
    { completed: true, watchedPercentage: 100, lastPositionSeconds: 1800, watchTimeSeconds: 1800 },
    { upsert: true, new: true }
  );

  const quiz = await Quiz.findOneAndUpdate(
    { slug: "react-foundations-checkpoint" },
    {
      title: "React Foundations Checkpoint", slug: "react-foundations-checkpoint",
      course: primaryCourse._id, module: module._id, instructor: instructor._id,
      duration: 15, totalMarks: 2, passingMarks: 1, status: "published", isApproved: true,
      questions: [
        { questionText: "What is a React component?", options: [{ label: "A", text: "Reusable UI unit", isCorrect: true }, { label: "B", text: "A database", isCorrect: false }], marks: 1 },
        { questionText: "Props are used to pass data.", questionType: "true-false", correctAnswer: "true", marks: 1 },
      ],
    },
    { upsert: true, new: true }
  );
  await QuizAttempt.findOneAndUpdate(
    { quiz: quiz._id, student: student._id, attemptNumber: 1 },
    { course: primaryCourse._id, score: 2, percentage: 100, totalMarks: 2, passingMarks: 1, status: "passed", isPassed: true, submittedAt: new Date() },
    { upsert: true, new: true }
  );
  await Assignment.findOneAndUpdate(
    { course: primaryCourse._id, title: "Build a Dashboard Module" },
    { course: primaryCourse._id, title: "Build a Dashboard Module", description: "Create one responsive dashboard feature.", dueDate: new Date(Date.now() + 7 * 86400000), maxMarks: 100 },
    { upsert: true, new: true }
  );
  await Certificate.findOneAndUpdate(
    { certificateCode: "EDU-DEMO-001" },
    { student: student._id, course: courses[2]._id, instructor: instructor._id, certificateCode: "EDU-DEMO-001", issuedAt: new Date(), completionDate: new Date(), verificationUrl: "/api/certificates/verify/EDU-DEMO-001" },
    { upsert: true, new: true }
  );

  const order = await Order.findOneAndUpdate(
    { invoiceNumber: "EDU-ORDER-001" },
    { user: student._id, course: primaryCourse._id, items: [{ course: primaryCourse._id, title: primaryCourse.title }], amount: 2499, status: "paid", invoiceNumber: "EDU-ORDER-001" },
    { upsert: true, new: true }
  );
  await Payment.findOneAndUpdate(
    { razorpayPaymentId: "demo_payment_001" },
    { user: student._id, order: order._id, amount: 2499, status: "paid", method: "demo", razorpayPaymentId: "demo_payment_001" },
    { upsert: true, new: true }
  );

  const startAt = new Date(Date.now() + 2 * 86400000);
  const endAt = new Date(startAt.getTime() + 60 * 60000);
  const liveClass = await LiveClass.findOneAndUpdate(
    { slug: "react-live-code-review" },
    {
      title: "React Live Code Review", slug: "react-live-code-review",
      course: primaryCourse._id, module: module._id, instructor: instructor._id,
      startAt, endAt, duration: 60, meetingPlatform: "google-meet",
      meetingUrl: "https://meet.google.com/demo-edupath", status: "scheduled",
      approvalStatus: "approved", createdBy: instructor._id, approvedBy: admin._id, approvedAt: new Date(),
    },
    { upsert: true, new: true }
  );
  await CalendarEvent.findOneAndUpdate(
    { user: student._id, title: liveClass.title },
    { user: student._id, course: primaryCourse._id, title: liveClass.title, type: "live-class", startAt, endAt, location: liveClass.meetingUrl },
    { upsert: true, new: true }
  );
  await Notification.findOneAndUpdate(
    { user: student._id, title: "Welcome to EduPath" },
    { user: student._id, type: "welcome", title: "Welcome to EduPath", message: "Your new learning dashboard is ready.", read: false },
    { upsert: true, new: true }
  );

  await seedDashboardMocks();
  return { admin, instructor, student, courses, enrollment };
}
