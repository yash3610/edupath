import bcrypt from "bcryptjs";
import mongoose from "mongoose";

const { Schema, model, models } = mongoose;
const objectId = Schema.Types.ObjectId;

const baseOptions = { timestamps: true };

function makeModel(name, schema) {
  return models[name] || model(name, schema);
}

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["student", "instructor", "admin"], default: "student", index: true },
    status: { type: String, enum: ["active", "blocked", "pending"], default: "active" },
    emailVerified: { type: Boolean, default: false },
    refreshTokenHash: String,
    resetPasswordToken: String,
    resetPasswordExpires: Date,
  },
  baseOptions
);
userSchema.methods.setPassword = async function setPassword(password) {
  this.passwordHash = await bcrypt.hash(password, 12);
};
userSchema.methods.matchPassword = function matchPassword(password) {
  return bcrypt.compare(password, this.passwordHash);
};
userSchema.methods.toJSON = function toJSON() {
  const user = this.toObject();
  delete user.passwordHash;
  delete user.refreshTokenHash;
  return user;
};

export const User = makeModel("User", userSchema);

export const StudentProfile = makeModel(
  "StudentProfile",
  new Schema(
    {
      user: { type: objectId, ref: "User", required: true, unique: true },
      avatar: String,
      phone: String,
      bio: String,
      skills: [String],
      socialLinks: { type: Map, of: String },
      learningGoalMinutes: { type: Number, default: 60 },
      streak: { type: Number, default: 0 },
      preferences: { type: Schema.Types.Mixed, default: {} },
    },
    baseOptions
  )
);

export const InstructorProfile = makeModel(
  "InstructorProfile",
  new Schema(
    {
      user: { type: objectId, ref: "User", required: true, unique: true },
      avatar: String,
      headline: String,
      bio: String,
      expertise: [String],
      payoutAccount: Schema.Types.Mixed,
      rating: { type: Number, default: 0 },
    },
    baseOptions
  )
);

export const Course = makeModel(
  "Course",
  new Schema(
    {
      title: { type: String, required: true, trim: true },
      slug: { type: String, required: true, unique: true, trim: true },
      instructor: { type: objectId, ref: "User" },
      category: String,
      level: { type: String, enum: ["beginner", "intermediate", "advanced"], default: "beginner" },
      thumbnail: String,
      description: String,
      price: { type: Number, default: 0 },
      status: { type: String, enum: ["draft", "pending", "approved", "rejected"], default: "pending" },
      rating: { type: Number, default: 0 },
      tags: [String],
    },
    baseOptions
  )
);

export const Module = makeModel("Module", new Schema({ course: { type: objectId, ref: "Course", required: true }, title: String, order: Number }, baseOptions));
export const Lecture = makeModel(
  "Lecture",
  new Schema(
    {
      course: { type: objectId, ref: "Course", required: true },
      module: { type: objectId, ref: "Module", required: true },
      title: String,
      description: String,
      videoUrl: String,
      durationSeconds: Number,
      order: Number,
      isPreview: { type: Boolean, default: false },
      resources: [{ title: String, url: String, type: String }],
    },
    baseOptions
  )
);

export const Enrollment = makeModel("Enrollment", new Schema({ student: { type: objectId, ref: "User", required: true }, course: { type: objectId, ref: "Course", required: true }, status: { type: String, enum: ["active", "completed", "cancelled"], default: "active" }, progress: { type: Number, default: 0 }, enrolledAt: { type: Date, default: Date.now } }, baseOptions));
export const LectureProgress = makeModel("LectureProgress", new Schema({ student: { type: objectId, ref: "User", required: true }, course: { type: objectId, ref: "Course", required: true }, lecture: { type: objectId, ref: "Lecture", required: true }, completed: { type: Boolean, default: false }, watchTimeSeconds: { type: Number, default: 0 }, bookmarked: { type: Boolean, default: false } }, baseOptions));
export const Note = makeModel("Note", new Schema({ student: { type: objectId, ref: "User", required: true }, course: { type: objectId, ref: "Course" }, lecture: { type: objectId, ref: "Lecture" }, title: String, content: String, pinned: { type: Boolean, default: false } }, baseOptions));

export const Quiz = makeModel("Quiz", new Schema({ course: { type: objectId, ref: "Course" }, title: String, durationMinutes: Number, questions: [{ question: String, options: [String], correctIndex: Number, explanation: String }] }, baseOptions));
export const QuizAttempt = makeModel("QuizAttempt", new Schema({ quiz: { type: objectId, ref: "Quiz" }, student: { type: objectId, ref: "User" }, answers: [Number], score: Number, correct: Number, wrong: Number, submittedAt: Date }, baseOptions));
export const Assignment = makeModel("Assignment", new Schema({ course: { type: objectId, ref: "Course" }, title: String, description: String, dueDate: Date, allowedFileTypes: [String], maxMarks: Number }, baseOptions));
export const AssignmentSubmission = makeModel("AssignmentSubmission", new Schema({ assignment: { type: objectId, ref: "Assignment" }, student: { type: objectId, ref: "User" }, fileUrl: String, status: { type: String, enum: ["pending", "submitted", "graded", "overdue"], default: "submitted" }, grade: String, feedback: String }, baseOptions));
export const Certificate = makeModel("Certificate", new Schema({ student: { type: objectId, ref: "User" }, course: { type: objectId, ref: "Course" }, certificateCode: { type: String, unique: true }, issuedAt: Date, pdfUrl: String }, baseOptions));
export const Wishlist = makeModel("Wishlist", new Schema({ student: { type: objectId, ref: "User", required: true }, course: { type: objectId, ref: "Course", required: true } }, baseOptions));
export const Notification = makeModel("Notification", new Schema({ user: { type: objectId, ref: "User" }, type: String, title: String, message: String, read: { type: Boolean, default: false } }, baseOptions));
export const Conversation = makeModel("Conversation", new Schema({ participants: [{ type: objectId, ref: "User" }], lastMessage: String }, baseOptions));
export const Message = makeModel("Message", new Schema({ conversation: { type: objectId, ref: "Conversation" }, sender: { type: objectId, ref: "User" }, body: String, attachmentUrl: String, readBy: [{ type: objectId, ref: "User" }] }, baseOptions));

export const Order = makeModel("Order", new Schema({ user: { type: objectId, ref: "User" }, course: { type: objectId, ref: "Course" }, items: [Schema.Types.Mixed], amount: Number, status: { type: String, enum: ["pending", "paid", "failed", "refunded"], default: "pending" }, invoiceNumber: String }, baseOptions));
export const Payment = makeModel("Payment", new Schema({ user: { type: objectId, ref: "User" }, order: { type: objectId, ref: "Order" }, razorpayOrderId: String, razorpayPaymentId: String, amount: Number, status: String, method: String }, baseOptions));
export const RefundRequest = makeModel("RefundRequest", new Schema({ user: { type: objectId, ref: "User" }, order: { type: objectId, ref: "Order" }, payment: { type: objectId, ref: "Payment" }, reason: String, status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" } }, baseOptions));
export const Review = makeModel("Review", new Schema({ user: { type: objectId, ref: "User" }, course: { type: objectId, ref: "Course" }, rating: Number, comment: String }, baseOptions));
export const DiscussionQuestion = makeModel("DiscussionQuestion", new Schema({ user: { type: objectId, ref: "User" }, course: { type: objectId, ref: "Course" }, title: String, body: String, tags: [String] }, baseOptions));
export const DiscussionAnswer = makeModel("DiscussionAnswer", new Schema({ question: { type: objectId, ref: "DiscussionQuestion" }, user: { type: objectId, ref: "User" }, body: String, upvotes: [{ type: objectId, ref: "User" }], accepted: { type: Boolean, default: false } }, baseOptions));
export const CalendarEvent = makeModel("CalendarEvent", new Schema({ user: { type: objectId, ref: "User" }, course: { type: objectId, ref: "Course" }, title: String, type: String, startAt: Date, endAt: Date }, baseOptions));
export const Reminder = makeModel("Reminder", new Schema({ user: { type: objectId, ref: "User" }, event: { type: objectId, ref: "CalendarEvent" }, remindAt: Date, enabled: { type: Boolean, default: true } }, baseOptions));
export const Coupon = makeModel("Coupon", new Schema({ code: { type: String, unique: true }, discountType: { type: String, enum: ["flat", "percent"], default: "percent" }, value: Number, active: { type: Boolean, default: true }, expiresAt: Date }, baseOptions));
export const AIChat = makeModel("AIChat", new Schema({ user: { type: objectId, ref: "User" }, course: { type: objectId, ref: "Course" }, question: String, answer: String }, baseOptions));
export const AISummary = makeModel("AISummary", new Schema({ user: { type: objectId, ref: "User" }, course: { type: objectId, ref: "Course" }, lecture: { type: objectId, ref: "Lecture" }, summary: String, keyPoints: [String], actionItems: [String] }, baseOptions));
export const MLAnalytics = makeModel("MLAnalytics", new Schema({ user: { type: objectId, ref: "User" }, learningPattern: Schema.Types.Mixed, engagementScore: Number, completionProbability: Number, weakTopics: [String], strongTopics: [String], skillGrowth: [Schema.Types.Mixed], successPrediction: String }, baseOptions));
