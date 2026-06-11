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
    avatar: String,
    avatarPublicId: String,
    phone: String,
    bio: String,
    preferences: { type: Schema.Types.Mixed, default: {} },
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
  delete user.avatarPublicId;
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

export const Category = makeModel(
  "Category",
  new Schema({ name: { type: String, required: true, unique: true, trim: true }, slug: { type: String, required: true, unique: true, trim: true }, description: String, active: { type: Boolean, default: true } }, baseOptions)
);

export const Course = makeModel(
  "Course",
  new Schema(
    {
      title: { type: String, required: true, trim: true },
      subtitle: String,
      slug: { type: String, required: true, unique: true, trim: true },
      instructor: { type: objectId, ref: "User" },
      category: String,
      subcategory: String,
      language: { type: String, default: "English" },
      level: { type: String, enum: ["beginner", "intermediate", "advanced"], default: "beginner" },
      thumbnail: String,
      promoVideoUrl: String,
      shortDescription: String,
      description: String,
      learningOutcomes: [String],
      objectives: [String],
      skills: [String],
      requirements: [String],
      prerequisites: [String],
      targetAudience: [String],
      pricingType: { type: String, enum: ["free", "paid"], default: "paid" },
      price: { type: Number, default: 0 },
      discountPrice: { type: Number, default: 0 },
      currency: { type: String, default: "USD" },
      couponEnabled: { type: Boolean, default: true },
      subscriptionAccess: { type: Boolean, default: false },
      sequentialLearning: { type: Boolean, default: false },
      certificateEnabled: { type: Boolean, default: true },
      certificateRules: {
        requireFullProgress: { type: Boolean, default: true },
        requireQuizzes: { type: Boolean, default: false },
        requireAssignments: { type: Boolean, default: false },
      },
      landingPage: {
        heroBanner: String,
        faqs: [{ question: String, answer: String }],
        instructorBio: String,
      },
      status: {
        type: String,
        enum: ["draft", "assigned", "content_in_progress", "review_pending", "changes_requested", "ready_to_publish", "published", "unpublished", "archived", "pending", "approved", "rejected"],
        default: "draft",
      },
      featured: { type: Boolean, default: false },
      disabled: { type: Boolean, default: false },
      rejectionReason: String,
      reviewFeedback: String,
      submittedForReviewAt: Date,
      reviewedAt: Date,
      reviewedBy: { type: objectId, ref: "User" },
      publishedAt: Date,
      archivedAt: Date,
      rating: { type: Number, default: 0 },
      tags: [String],
    },
    baseOptions
  )
);

export const Module = makeModel("Module", new Schema({ course: { type: objectId, ref: "Course", required: true }, title: String, description: String, order: Number, published: { type: Boolean, default: true } }, baseOptions));
export const Lecture = makeModel(
  "Lecture",
  new Schema(
    {
      course: { type: objectId, ref: "Course", required: true },
      module: { type: objectId, ref: "Module", required: true },
      title: String,
      description: String,
      type: { type: String, enum: ["video", "pdf", "article", "resource", "assignment", "quiz", "live"], default: "video" },
      videoUrl: String,
      articleContent: String,
      transcript: String,
      captionsUrl: String,
      notesPdfUrl: String,
      durationSeconds: Number,
      estimatedDurationMinutes: Number,
      order: Number,
      isPreview: { type: Boolean, default: false },
      isLocked: { type: Boolean, default: false },
      published: { type: Boolean, default: true },
      downloadable: { type: Boolean, default: true },
      dripEnabled: { type: Boolean, default: false },
      unlockType: { type: String, enum: ["immediate", "days", "date"], default: "immediate" },
      daysAfterEnrollment: { type: Number, default: 0 },
      unlockAt: Date,
      resources: [{ title: String, url: String, type: String }],
      externalLinks: [{ title: String, url: String }],
    },
    baseOptions
  )
);

export const Enrollment = makeModel("Enrollment", new Schema({ student: { type: objectId, ref: "User", required: true }, course: { type: objectId, ref: "Course", required: true }, status: { type: String, enum: ["active", "completed", "cancelled"], default: "active" }, progress: { type: Number, default: 0 }, enrolledAt: { type: Date, default: Date.now } }, baseOptions));
export const LectureProgress = makeModel("LectureProgress", new Schema({ student: { type: objectId, ref: "User", required: true }, course: { type: objectId, ref: "Course", required: true }, lecture: { type: objectId, ref: "Lecture", required: true }, completed: { type: Boolean, default: false }, watchedPercentage: { type: Number, default: 0 }, lastPositionSeconds: { type: Number, default: 0 }, watchTimeSeconds: { type: Number, default: 0 }, bookmarked: { type: Boolean, default: false }, bookmarkTimestamps: [{ seconds: Number, label: String }] }, baseOptions));
export const CourseAnalytics = makeModel("CourseAnalytics", new Schema({ course: { type: objectId, ref: "Course", required: true, unique: true }, totalViews: { type: Number, default: 0 }, totalWatchTimeSeconds: { type: Number, default: 0 }, activeStudents: { type: Number, default: 0 }, completionRate: { type: Number, default: 0 }, quizPassRate: { type: Number, default: 0 }, assignmentSubmissionRate: { type: Number, default: 0 }, revenue: { type: Number, default: 0 } }, baseOptions));
export const Note = makeModel("Note", new Schema({ student: { type: objectId, ref: "User", required: true }, course: { type: objectId, ref: "Course" }, lecture: { type: objectId, ref: "Lecture" }, title: String, content: String, pinned: { type: Boolean, default: false } }, baseOptions));

const quizOptionSchema = new Schema(
  {
    label: String,
    text: String,
    isCorrect: { type: Boolean, default: false },
  },
  { _id: false }
);

const questionSchema = new Schema(
  {
    questionText: String,
    question: String,
    questionType: {
      type: String,
      enum: ["single-choice", "multiple-choice", "true-false", "fill-blank", "short-answer", "code"],
      default: "single-choice",
    },
    options: [quizOptionSchema],
    correctAnswer: String,
    correctAnswers: [String],
    correctIndex: Number,
    explanation: String,
    marks: { type: Number, default: 1 },
    negativeMarks: { type: Number, default: 0 },
    difficulty: { type: String, enum: ["easy", "medium", "hard"], default: "medium" },
    topicTag: String,
    image: String,
    order: { type: Number, default: 0 },
  },
  baseOptions
);

const answerSchema = new Schema(
  {
    questionId: { type: objectId },
    selectedOption: String,
    selectedOptions: [String],
    textAnswer: String,
    codeAnswer: String,
    isCorrect: { type: Boolean, default: false },
    marksEarned: { type: Number, default: 0 },
    timeSpent: { type: Number, default: 0 },
    markedForReview: { type: Boolean, default: false },
  },
  { _id: false }
);

export const Quiz = makeModel(
  "Quiz",
  new Schema(
    {
      title: { type: String, required: true, trim: true },
      slug: { type: String, trim: true, index: true },
      description: String,
      course: { type: objectId, ref: "Course", required: true },
      module: { type: objectId, ref: "Module" },
      lecture: { type: objectId, ref: "Lecture" },
      instructor: { type: objectId, ref: "User" },
      questions: [questionSchema],
      duration: { type: Number, default: 15 },
      durationMinutes: Number,
      totalMarks: { type: Number, default: 0 },
      passingMarks: { type: Number, default: 0 },
      difficulty: { type: String, enum: ["easy", "medium", "hard"], default: "medium" },
      attemptsAllowed: { type: Number, default: 1 },
      negativeMarking: { type: Boolean, default: false },
      negativeMarksPerQuestion: { type: Number, default: 0 },
      shuffleQuestions: { type: Boolean, default: false },
      shuffleOptions: { type: Boolean, default: false },
      showResultImmediately: { type: Boolean, default: true },
      showCorrectAnswers: { type: Boolean, default: true },
      lockUntilLectureComplete: { type: Boolean, default: false },
      status: { type: String, enum: ["draft", "published", "archived"], default: "draft", index: true },
      isApproved: { type: Boolean, default: false, index: true },
      startDate: Date,
      endDate: Date,
    },
    baseOptions
  )
);

export const QuizAttempt = makeModel(
  "QuizAttempt",
  new Schema(
    {
      quiz: { type: objectId, ref: "Quiz", required: true },
      course: { type: objectId, ref: "Course" },
      student: { type: objectId, ref: "User", required: true },
      attemptNumber: { type: Number, default: 1 },
      answers: [answerSchema],
      score: { type: Number, default: 0 },
      percentage: { type: Number, default: 0 },
      totalMarks: { type: Number, default: 0 },
      passingMarks: { type: Number, default: 0 },
      status: {
        type: String,
        enum: ["in-progress", "submitted", "auto-submitted", "passed", "failed"],
        default: "in-progress",
        index: true,
      },
      startedAt: { type: Date, default: Date.now },
      submittedAt: Date,
      timeTaken: { type: Number, default: 0 },
      isPassed: { type: Boolean, default: false },
      correctCount: { type: Number, default: 0 },
      wrongCount: { type: Number, default: 0 },
      unansweredCount: { type: Number, default: 0 },
      markedForReview: [{ type: objectId }],
      browserInfo: Schema.Types.Mixed,
      ipAddress: String,
      correct: Number,
      wrong: Number,
    },
    baseOptions
  )
);
export const Assignment = makeModel("Assignment", new Schema({ course: { type: objectId, ref: "Course" }, title: String, description: String, dueDate: Date, allowedFileTypes: [String], maxMarks: Number }, baseOptions));
export const AssignmentSubmission = makeModel("AssignmentSubmission", new Schema({ assignment: { type: objectId, ref: "Assignment" }, student: { type: objectId, ref: "User" }, fileUrl: String, status: { type: String, enum: ["pending", "submitted", "graded", "overdue"], default: "submitted" }, grade: String, feedback: String }, baseOptions));
export const Certificate = makeModel("Certificate", new Schema({ student: { type: objectId, ref: "User" }, course: { type: objectId, ref: "Course" }, instructor: { type: objectId, ref: "User" }, certificateCode: { type: String, unique: true }, issuedAt: Date, completionDate: Date, verificationUrl: String, qrCodeUrl: String, pdfUrl: String }, baseOptions));
export const Wishlist = makeModel("Wishlist", new Schema({ student: { type: objectId, ref: "User", required: true }, course: { type: objectId, ref: "Course", required: true } }, baseOptions));
export const Notification = makeModel("Notification", new Schema({ user: { type: objectId, ref: "User" }, type: String, title: String, message: String, read: { type: Boolean, default: false } }, baseOptions));
export const Conversation = makeModel("Conversation", new Schema({ participants: [{ type: objectId, ref: "User" }], lastMessage: String, lastMessageAt: Date }, baseOptions));
export const Message = makeModel("Message", new Schema({ conversation: { type: objectId, ref: "Conversation" }, sender: { type: objectId, ref: "User" }, body: String, attachmentUrl: String, attachmentName: String, attachmentType: String, readBy: [{ type: objectId, ref: "User" }] }, baseOptions));

export const Order = makeModel("Order", new Schema({ user: { type: objectId, ref: "User" }, course: { type: objectId, ref: "Course" }, items: [Schema.Types.Mixed], amount: Number, status: { type: String, enum: ["pending", "paid", "failed", "refunded"], default: "pending" }, invoiceNumber: String, razorpayOrderId: String }, baseOptions));
export const Payment = makeModel("Payment", new Schema({ user: { type: objectId, ref: "User" }, order: { type: objectId, ref: "Order" }, razorpayOrderId: String, razorpayPaymentId: String, amount: Number, status: String, method: String }, baseOptions));
export const RefundRequest = makeModel("RefundRequest", new Schema({ user: { type: objectId, ref: "User" }, order: { type: objectId, ref: "Order" }, payment: { type: objectId, ref: "Payment" }, reason: String, status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" } }, baseOptions));
export const Review = makeModel("Review", new Schema({ user: { type: objectId, ref: "User" }, course: { type: objectId, ref: "Course" }, rating: Number, comment: String }, baseOptions));
export const DiscussionQuestion = makeModel("DiscussionQuestion", new Schema({ user: { type: objectId, ref: "User" }, course: { type: objectId, ref: "Course" }, title: String, body: String, tags: [String] }, baseOptions));
export const DiscussionAnswer = makeModel("DiscussionAnswer", new Schema({ question: { type: objectId, ref: "DiscussionQuestion" }, user: { type: objectId, ref: "User" }, body: String, upvotes: [{ type: objectId, ref: "User" }], accepted: { type: Boolean, default: false } }, baseOptions));
export const CalendarEvent = makeModel("CalendarEvent", new Schema({
  user: { type: objectId, ref: "User", required: true },
  course: { type: objectId, ref: "Course" },
  title: { type: String, required: true, trim: true },
  description: String,
  location: String,
  type: { type: String, enum: ["study", "live-class", "quiz", "assignment", "workshop", "deadline", "personal"], default: "study" },
  startAt: { type: Date, required: true },
  endAt: Date,
}, baseOptions));
const liveClassSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, trim: true, unique: true, index: true },
    description: String,
    course: { type: objectId, ref: "Course", required: true, index: true },
    module: { type: objectId, ref: "Module" },
    instructor: { type: objectId, ref: "User", required: true, index: true },
    scheduledDate: Date,
    startTime: String,
    startAt: { type: Date, required: true, index: true },
    endTime: String,
    endAt: { type: Date, required: true },
    duration: { type: Number, required: true, min: 1 },
    meetingPlatform: { type: String, enum: ["zoom", "google-meet", "built-in", "other"], default: "google-meet" },
    meetingLink: String,
    meetingUrl: String,
    maxStudents: { type: Number, default: 0, min: 0 },
    accessType: { type: String, enum: ["enrolled", "free-preview", "paid-only"], default: "enrolled" },
    status: {
      type: String,
      enum: ["draft", "pending-approval", "scheduled", "starting-soon", "live", "completed", "recording-available", "cancelled", "rejected"],
      default: "pending-approval",
      index: true,
    },
    approvalStatus: { type: String, enum: ["draft", "pending", "approved", "rejected"], default: "pending" },
    rejectionReason: String,
    cancellationReason: String,
    enableRecording: { type: Boolean, default: true },
    enableChat: { type: Boolean, default: true },
    enableQA: { type: Boolean, default: true },
    enableAttendanceTracking: { type: Boolean, default: true },
    reminderSettings: {
      before24Hours: { type: Boolean, default: true },
      before1Hour: { type: Boolean, default: true },
      before10Minutes: { type: Boolean, default: true },
    },
    remindersSent: { before24Hours: Boolean, before1Hour: Boolean, before10Minutes: Boolean, started: Boolean },
    recordingUrl: String,
    recordingPublicId: String,
    resources: [{ title: String, url: String, publicId: String, type: String }],
    notes: String,
    totalJoined: { type: Number, default: 0 },
    averageAttendance: { type: Number, default: 0 },
    registrations: { type: Number, default: 0 },
    createdBy: { type: objectId, ref: "User" },
    approvedBy: { type: objectId, ref: "User" },
    approvedAt: Date,
    startedAt: Date,
    completedAt: Date,
    cancelledAt: Date,
  },
  baseOptions
);
liveClassSchema.index({ instructor: 1, startAt: 1 });
liveClassSchema.index({ course: 1, status: 1, startAt: 1 });
export const LiveClass = makeModel("LiveClass", liveClassSchema);

const liveClassAttendanceSchema = new Schema(
  {
    liveClass: { type: objectId, ref: "LiveClass", required: true, index: true },
    student: { type: objectId, ref: "User", required: true, index: true },
    course: { type: objectId, ref: "Course", required: true },
    instructor: { type: objectId, ref: "User", required: true },
    joinTime: Date,
    leaveTime: Date,
    attendedMinutes: { type: Number, default: 0 },
    attendancePercentage: { type: Number, default: 0 },
    status: { type: String, enum: ["joined", "present", "partial", "absent"], default: "joined" },
    manualOverride: { type: Boolean, default: false },
    markedBy: { type: objectId, ref: "User" },
  },
  baseOptions
);
liveClassAttendanceSchema.index({ liveClass: 1, student: 1 }, { unique: true });
export const LiveClassAttendance = makeModel("LiveClassAttendance", liveClassAttendanceSchema);

export const LiveClassQuestion = makeModel(
  "LiveClassQuestion",
  new Schema(
    {
      liveClass: { type: objectId, ref: "LiveClass", required: true, index: true },
      student: { type: objectId, ref: "User", required: true },
      question: { type: String, required: true, trim: true },
      answer: String,
      answeredBy: { type: objectId, ref: "User" },
      isAnswered: { type: Boolean, default: false },
      upvotes: [{ type: objectId, ref: "User" }],
    },
    baseOptions
  )
);
export const Payout = makeModel("Payout", new Schema({ instructor: { type: objectId, ref: "User", required: true }, amount: { type: Number, default: 0 }, period: String, status: { type: String, enum: ["pending", "processing", "paid", "failed"], default: "pending" }, paidAt: Date, reference: String }, baseOptions));
export const Reminder = makeModel("Reminder", new Schema({ user: { type: objectId, ref: "User" }, event: { type: objectId, ref: "CalendarEvent" }, liveClass: { type: objectId, ref: "LiveClass" }, title: String, description: String, remindAt: Date, enabled: { type: Boolean, default: true }, sent: { type: Boolean, default: false } }, baseOptions));
export const Coupon = makeModel("Coupon", new Schema({ code: { type: String, unique: true }, discountType: { type: String, enum: ["flat", "percent"], default: "percent" }, value: Number, active: { type: Boolean, default: true }, expiresAt: Date }, baseOptions));
export const AIChat = makeModel("AIChat", new Schema({ user: { type: objectId, ref: "User" }, course: { type: objectId, ref: "Course" }, question: String, answer: String }, baseOptions));
export const AISummary = makeModel("AISummary", new Schema({ user: { type: objectId, ref: "User" }, course: { type: objectId, ref: "Course" }, lecture: { type: objectId, ref: "Lecture" }, summary: String, keyPoints: [String], actionItems: [String] }, baseOptions));
export const MLAnalytics = makeModel("MLAnalytics", new Schema({ user: { type: objectId, ref: "User" }, learningPattern: Schema.Types.Mixed, engagementScore: Number, completionProbability: Number, weakTopics: [String], strongTopics: [String], skillGrowth: [Schema.Types.Mixed], successPrediction: String }, baseOptions));
