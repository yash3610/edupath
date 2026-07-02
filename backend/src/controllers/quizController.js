import { Course, Enrollment, Quiz, QuizAttempt } from "../models/index.js";
import { generateQuizResultPdf } from "../services/pdfService.js";
import {
  calculateAttempt,
  ensureAttemptOpen,
  ensureCanAttemptQuiz,
  publicQuestion,
  sanitizeQuizForAttempt,
  upsertAttemptAnswer,
} from "../services/quizService.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { PUBLIC_COURSE_STATUSES } from "../services/courseLifecycleService.js";

const ok = (res, data, message = "OK") => res.json({ success: true, message, data });
const created = (res, data, message = "Created") => res.status(201).json({ success: true, message, data });
const userId = (req) => req.user?._id;
const slugify = (value) => String(value || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

const attemptMeta = async (quiz, studentId) => {
  const attempts = await QuizAttempt.find({ quiz: quiz._id, student: studentId }).sort({ createdAt: -1 });
  const latest = attempts[0];
  const used = attempts.filter((attempt) => attempt.status !== "in-progress").length;
  let status = "Not Started";
  if (latest?.status === "in-progress") status = "In Progress";
  else if (latest?.isPassed) status = "Passed";
  else if (latest && !latest.isPassed) status = "Failed";
  if (used >= quiz.attemptsAllowed && !latest?.isPassed) status = "Locked";
  return { attemptsUsed: used, latestAttemptId: latest?._id, status };
};

export const getStudentQuizzes = asyncHandler(async (req, res) => {
  const enrollments = await Enrollment.find({ student: userId(req), status: { $in: ["active", "completed"] } }).select("course");
  const courseIds = enrollments.map((item) => item.course);
  const query = { course: { $in: courseIds }, status: "published" };
  if (req.query.courseId) query.course = req.query.courseId;
  if (req.query.difficulty) query.difficulty = req.query.difficulty;
  if (req.query.search) query.title = { $regex: req.query.search, $options: "i" };

  const quizzes = await Quiz.find(query).populate("course", "title thumbnail").sort({ createdAt: -1 });
  const data = await Promise.all(quizzes.map(async (quiz) => ({ ...quiz.toObject(), ...(await attemptMeta(quiz, userId(req))) })));
  ok(res, data);
});

export const getStudentCourseQuizzes = asyncHandler(async (req, res) => {
  req.query.courseId = req.params.courseId;
  return getStudentQuizzes(req, res);
});

export const getQuizInstructions = asyncHandler(async (req, res) => {
  const quiz = await Quiz.findById(req.params.quizId).populate("course", "title thumbnail");
  if (!quiz) throw new ApiError(404, "Quiz not found");
  ok(res, {
    _id: quiz._id,
    title: quiz.title,
    description: quiz.description,
    course: quiz.course,
    duration: quiz.duration || quiz.durationMinutes,
    totalQuestions: quiz.questions.length,
    totalMarks: quiz.totalMarks,
    passingMarks: quiz.passingMarks,
    negativeMarking: quiz.negativeMarking,
    negativeMarksPerQuestion: quiz.negativeMarksPerQuestion,
    attemptsAllowed: quiz.attemptsAllowed,
    difficulty: quiz.difficulty,
    rules: [
      "Do not refresh or close the page during the attempt.",
      "Timer expiry will auto-submit your quiz.",
      "Submitted answers cannot be edited.",
      "Some questions may have multiple correct answers.",
    ],
  });
});

export const startQuizAttempt = asyncHandler(async (req, res) => {
  const quiz = await Quiz.findById(req.params.quizId).populate("course", "title thumbnail");
  const attemptNumber = await ensureCanAttemptQuiz({ quiz, studentId: userId(req) });
  const existing = await QuizAttempt.findOne({ quiz: quiz._id, student: userId(req), status: "in-progress" });
  if (existing) return ok(res, { attempt: existing, quiz: sanitizeQuizForAttempt(quiz) }, "Existing attempt resumed");

  const attempt = await QuizAttempt.create({
    quiz: quiz._id,
    course: quiz.course?._id || quiz.course,
    student: userId(req),
    attemptNumber,
    totalMarks: quiz.totalMarks,
    passingMarks: quiz.passingMarks,
    browserInfo: req.headers["user-agent"],
    ipAddress: req.ip,
  });
  created(res, { attempt, quiz: sanitizeQuizForAttempt(quiz) }, "Quiz started");
});

export const getCurrentAttempt = asyncHandler(async (req, res) => {
  const attempt = await QuizAttempt.findOne({ _id: req.params.attemptId, student: userId(req) }).populate("quiz");
  if (!attempt) throw new ApiError(404, "Attempt not found");
  ok(res, { attempt, quiz: attempt.status === "in-progress" ? sanitizeQuizForAttempt(attempt.quiz) : attempt.quiz });
});

export const saveAnswer = asyncHandler(async (req, res) => {
  const attempt = await ensureAttemptOpen(req.params.attemptId, userId(req));
  upsertAttemptAnswer(attempt, req.body);
  await attempt.save();
  ok(res, attempt, "Answer saved");
});

export const markAnswerReview = asyncHandler(async (req, res) => {
  const attempt = await ensureAttemptOpen(req.params.attemptId, userId(req));
  upsertAttemptAnswer(attempt, { ...req.body, markedForReview: true });
  if (!attempt.markedForReview.map(String).includes(String(req.body.questionId))) attempt.markedForReview.push(req.body.questionId);
  await attempt.save();
  ok(res, attempt, "Question marked for review");
});

export const clearAnswer = asyncHandler(async (req, res) => {
  const attempt = await ensureAttemptOpen(req.params.attemptId, userId(req));
  attempt.answers = attempt.answers.filter((answer) => String(answer.questionId) !== String(req.body.questionId || req.params.questionId));
  attempt.markedForReview = attempt.markedForReview.filter((id) => String(id) !== String(req.body.questionId || req.params.questionId));
  await attempt.save();
  ok(res, attempt, "Answer cleared");
});

export const submitAttempt = (autoSubmitted = false) => asyncHandler(async (req, res) => {
  const attempt = await QuizAttempt.findOne({ _id: req.params.attemptId, student: userId(req) }).populate("quiz");
  if (!attempt) throw new ApiError(404, "Attempt not found");
  if (attempt.status !== "in-progress") throw new ApiError(409, "This attempt is already submitted");
  calculateAttempt({ quiz: attempt.quiz, attempt, autoSubmitted });
  await attempt.save();
  ok(res, attempt, autoSubmitted ? "Quiz auto-submitted" : "Quiz submitted");
});

export const getAttemptResult = asyncHandler(async (req, res) => {
  const attempt = await QuizAttempt.findOne({ _id: req.params.attemptId, student: userId(req) }).populate({ path: "quiz", populate: { path: "course", select: "title thumbnail" } });
  if (!attempt) throw new ApiError(404, "Result not found");
  if (attempt.status === "in-progress") throw new ApiError(403, "Result is not available before submission");
  const includeCorrect = attempt.quiz.showCorrectAnswers;
  ok(res, {
    attempt,
    questions: attempt.quiz.questions.map((question) => publicQuestion(question, includeCorrect)),
    rank: "Top 8%",
    accuracy: attempt.answers.length ? Math.round((attempt.correctCount / attempt.answers.length) * 100) : 0,
  });
});

export const getQuizHistory = asyncHandler(async (req, res) => ok(res, await QuizAttempt.find({ quiz: req.params.quizId, student: userId(req), status: { $ne: "in-progress" } }).populate("quiz", "title").sort({ createdAt: -1 })));

export const downloadResultPdf = asyncHandler(async (req, res) => {
  const attempt = await QuizAttempt.findOne({ _id: req.params.attemptId, student: userId(req) }).populate("quiz").populate("student", "name");
  if (!attempt || attempt.status === "in-progress") throw new ApiError(404, "Submitted result not found");
  const pdf = await generateQuizResultPdf({ studentName: attempt.student?.name, quizTitle: attempt.quiz?.title, score: attempt.score, percentage: attempt.percentage, status: attempt.status, attemptNumber: attempt.attemptNumber });
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="quiz-result-${attempt._id}.pdf"`);
  res.send(pdf);
});

export const instructorCreateQuiz = asyncHandler(async (req, res) => {
  const course = await Course.findOne({ _id: req.body.course, instructor: userId(req) }).select("_id").lean();
  if (!course) throw new ApiError(404, "Course not found");
  const totalMarks = req.body.totalMarks || req.body.questions?.reduce((sum, question) => sum + Number(question.marks || 1), 0) || 0;
  const status = req.body.status === "published" ? "published" : "draft";
  const quiz = await Quiz.create({ ...req.body, status, isApproved: status === "published", slug: req.body.slug || `${slugify(req.body.title)}-${Date.now()}`, instructor: userId(req), totalMarks });
  created(res, quiz);
});

export const instructorQuizzes = asyncHandler(async (req, res) => ok(res, await Quiz.find({ instructor: userId(req) }).populate("course", "title thumbnail").sort({ createdAt: -1 }).lean()));
export const instructorQuizDetails = asyncHandler(async (req, res) => {
  const quiz = await Quiz.findOne({ _id: req.params.quizId, instructor: userId(req) }).populate("course module lecture");
  if (!quiz) throw new ApiError(404, "Quiz not found");
  ok(res, quiz);
});
export const instructorUpdateQuiz = asyncHandler(async (req, res) => {
  if (req.body.course) {
    const course = await Course.findOne({ _id: req.body.course, instructor: userId(req) }).select("_id").lean();
    if (!course) throw new ApiError(404, "Course not found");
  }
  const update = { ...req.body };
  if (Array.isArray(update.questions)) {
    update.totalMarks = update.questions.reduce((sum, question) => sum + Number(question.marks || 1), 0);
  }
  const quiz = await Quiz.findOneAndUpdate({ _id: req.params.quizId, instructor: userId(req) }, update, { new: true, runValidators: true });
  if (!quiz) throw new ApiError(404, "Quiz not found");
  ok(res, quiz, "Quiz updated");
});
export const instructorDeleteQuiz = asyncHandler(async (req, res) => ok(res, await Quiz.deleteOne({ _id: req.params.quizId, instructor: userId(req) }), "Quiz deleted"));

export const addQuestion = asyncHandler(async (req, res) => ok(res, await Quiz.findOneAndUpdate({ _id: req.params.quizId, instructor: userId(req) }, { $push: { questions: req.body }, $inc: { totalMarks: Number(req.body.marks || 1) } }, { new: true }), "Question added"));
export const updateQuestion = asyncHandler(async (req, res) => {
  const quiz = await Quiz.findOne({ _id: req.params.quizId, instructor: userId(req) });
  const question = quiz?.questions.id(req.params.questionId);
  if (!quiz || !question) throw new ApiError(404, "Question not found");
  question.set(req.body);
  quiz.totalMarks = quiz.questions.reduce((sum, item) => sum + Number(item.marks || 1), 0);
  await quiz.save();
  ok(res, quiz, "Question updated");
});
export const deleteQuestion = asyncHandler(async (req, res) => {
  const quiz = await Quiz.findOne({ _id: req.params.quizId, instructor: userId(req) });
  if (!quiz) throw new ApiError(404, "Quiz not found");
  quiz.questions.pull(req.params.questionId);
  quiz.totalMarks = quiz.questions.reduce((sum, item) => sum + Number(item.marks || 1), 0);
  await quiz.save();
  ok(res, quiz, "Question deleted");
});
export const reorderQuestions = asyncHandler(async (req, res) => {
  const quiz = await Quiz.findOne({ _id: req.params.quizId, instructor: userId(req) });
  if (!quiz) throw new ApiError(404, "Quiz not found");
  const orderMap = new Map((req.body.order || []).map((id, index) => [String(id), index + 1]));
  quiz.questions.forEach((question) => { question.order = orderMap.get(String(question._id)) || question.order; });
  quiz.questions.sort((a, b) => a.order - b.order);
  await quiz.save();
  ok(res, quiz, "Questions reordered");
});
export const publishQuiz = asyncHandler(async (req, res) => ok(res, await Quiz.findOneAndUpdate({ _id: req.params.quizId, instructor: userId(req) }, { status: "published", isApproved: true }, { new: true }), "Quiz published"));

export const quizAnalytics = asyncHandler(async (req, res) => {
  const quiz = await Quiz.findOne({ _id: req.params.quizId, instructor: userId(req) });
  if (!quiz) throw new ApiError(404, "Quiz not found");
  const attempts = await QuizAttempt.find({ quiz: req.params.quizId, status: { $ne: "in-progress" } }).populate("student", "name email");
  const totalAttempts = attempts.length;
  const passed = attempts.filter((attempt) => attempt.isPassed).length;
  const averageScore = totalAttempts ? Math.round(attempts.reduce((sum, attempt) => sum + attempt.percentage, 0) / totalAttempts) : 0;
  ok(res, {
    totalAttempts,
    averageScore,
    passRate: totalAttempts ? Math.round((passed / totalAttempts) * 100) : 0,
    failRate: totalAttempts ? Math.round(((totalAttempts - passed) / totalAttempts) * 100) : 0,
    averageTimeTaken: totalAttempts ? Math.round(attempts.reduce((sum, attempt) => sum + attempt.timeTaken, 0) / totalAttempts) : 0,
    hardestQuestions: [],
    easiestQuestions: [],
    topicWeakAreas: ["React Hooks", "State management"],
    studentResults: attempts,
  });
});
export const quizAttempts = asyncHandler(async (req, res) => {
  const quiz = await Quiz.findOne({ _id: req.params.quizId, instructor: userId(req) });
  if (!quiz) throw new ApiError(404, "Quiz not found");
  ok(res, await QuizAttempt.find({ quiz: req.params.quizId }).populate("student", "name email"));
});

export const adminQuizzes = asyncHandler(async (req, res) => {
  const query = {};
  if (req.query.status) query.status = req.query.status;
  if (req.query.courseId) query.course = req.query.courseId;
  const quizzes = await Quiz.find(query).populate("course instructor", "title name email").sort({ createdAt: -1 });
  const data = await Promise.all(quizzes.map(async (quiz) => {
    const attempts = await QuizAttempt.find({ quiz: quiz._id, status: { $ne: "in-progress" } });
    const passed = attempts.filter((attempt) => attempt.isPassed).length;
    return {
      ...quiz.toObject(),
      attemptsCount: attempts.length,
      studentsSolvedCount: new Set(attempts.map((attempt) => String(attempt.student))).size,
      averageScore: attempts.length ? Math.round(attempts.reduce((sum, attempt) => sum + Number(attempt.percentage || 0), 0) / attempts.length) : 0,
      passRate: attempts.length ? Math.round((passed / attempts.length) * 100) : 0,
    };
  }));
  ok(res, data);
});
export const adminQuizAnalytics = asyncHandler(async (req, res) => {
  const quiz = await Quiz.findById(req.params.quizId).populate("course instructor", "title name email");
  if (!quiz) throw new ApiError(404, "Quiz not found");
  const attempts = await QuizAttempt.find({ quiz: req.params.quizId, status: { $ne: "in-progress" } }).populate("student", "name email");
  const passed = attempts.filter((attempt) => attempt.isPassed).length;
  ok(res, {
    quiz,
    totalAttempts: attempts.length,
    studentsSolved: new Set(attempts.map((attempt) => String(attempt.student?._id || attempt.student))).size,
    averageScore: attempts.length ? Math.round(attempts.reduce((sum, attempt) => sum + Number(attempt.percentage || 0), 0) / attempts.length) : 0,
    passRate: attempts.length ? Math.round((passed / attempts.length) * 100) : 0,
    studentResults: attempts,
  });
});
export const adminApproveQuiz = asyncHandler(async (req, res) => ok(res, await Quiz.findByIdAndUpdate(req.params.quizId, { isApproved: true, status: "published" }, { new: true }), "Quiz approved"));
export const adminRejectQuiz = asyncHandler(async (req, res) => ok(res, await Quiz.findByIdAndUpdate(req.params.quizId, { isApproved: false, status: "draft" }, { new: true }), "Quiz rejected"));
export const adminDeleteQuiz = asyncHandler(async (req, res) => ok(res, await Quiz.findByIdAndDelete(req.params.quizId), "Quiz deleted"));

export const quizCourses = asyncHandler(async (_req, res) => ok(res, await Course.find({ status: { $in: PUBLIC_COURSE_STATUSES } }).select("title thumbnail").lean()));
