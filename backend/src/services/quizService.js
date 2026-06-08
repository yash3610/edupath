import { Enrollment, LectureProgress, Quiz, QuizAttempt } from "../models/index.js";
import ApiError from "../utils/ApiError.js";

const normalize = (value) => String(value || "").trim().toLowerCase();

export const publicQuestion = (question, includeCorrect = false) => {
  const data = {
    _id: question._id,
    questionText: question.questionText || question.question,
    questionType: question.questionType,
    options: question.options?.map((option, index) => ({
      label: option.label || String.fromCharCode(65 + index),
      text: option.text || option,
    })),
    marks: question.marks,
    difficulty: question.difficulty,
    topicTag: question.topicTag,
    image: question.image,
    order: question.order,
    explanation: includeCorrect ? question.explanation : undefined,
  };
  if (includeCorrect) {
    data.correctAnswer = question.correctAnswer;
    data.correctAnswers = question.correctAnswers;
    data.correctIndex = question.correctIndex;
  }
  return data;
};

export const sanitizeQuizForAttempt = (quiz) => ({
  _id: quiz._id,
  title: quiz.title,
  course: quiz.course,
  duration: quiz.duration || quiz.durationMinutes,
  totalMarks: quiz.totalMarks,
  passingMarks: quiz.passingMarks,
  difficulty: quiz.difficulty,
  questions: quiz.questions.map((question) => publicQuestion(question, false)),
});

export const ensureCanAttemptQuiz = async ({ quiz, studentId }) => {
  if (!quiz) throw new ApiError(404, "Quiz not found");
  if (quiz.status !== "published" || !quiz.isApproved) throw new ApiError(403, "Quiz is not available yet");

  const now = new Date();
  if (quiz.startDate && now < quiz.startDate) throw new ApiError(403, "Quiz has not started");
  if (quiz.endDate && now > quiz.endDate) throw new ApiError(403, "Quiz has expired");

  const enrollment = await Enrollment.findOne({ student: studentId, course: quiz.course, status: { $in: ["active", "completed"] } });
  if (!enrollment) throw new ApiError(403, "Enroll in this course before attempting the quiz");

  if (quiz.lockUntilLectureComplete && quiz.lecture) {
    const progress = await LectureProgress.findOne({ student: studentId, lecture: quiz.lecture, completed: true });
    if (!progress) throw new ApiError(423, "Complete the required lecture to unlock this quiz");
  }

  const submittedAttempts = await QuizAttempt.countDocuments({ quiz: quiz._id, student: studentId, status: { $ne: "in-progress" } });
  if (submittedAttempts >= quiz.attemptsAllowed) throw new ApiError(403, "Attempt limit reached");

  return submittedAttempts + 1;
};

export const upsertAttemptAnswer = (attempt, payload) => {
  const questionId = String(payload.questionId);
  const existingIndex = attempt.answers.findIndex((answer) => String(answer.questionId) === questionId);
  const answer = {
    questionId: payload.questionId,
    selectedOption: payload.selectedOption,
    selectedOptions: payload.selectedOptions || [],
    textAnswer: payload.textAnswer,
    codeAnswer: payload.codeAnswer,
    timeSpent: Number(payload.timeSpent || 0),
    markedForReview: Boolean(payload.markedForReview),
  };
  if (existingIndex >= 0) attempt.answers[existingIndex] = { ...attempt.answers[existingIndex].toObject?.() || attempt.answers[existingIndex], ...answer };
  else attempt.answers.push(answer);
};

export const calculateAttempt = ({ quiz, attempt, autoSubmitted = false }) => {
  let score = 0;
  let correctCount = 0;
  let wrongCount = 0;
  let unansweredCount = 0;
  const answerMap = new Map(attempt.answers.map((answer) => [String(answer.questionId), answer]));

  const answers = quiz.questions.map((question) => {
    const answer = answerMap.get(String(question._id));
    if (!answer || (!answer.selectedOption && !answer.selectedOptions?.length && !answer.textAnswer && !answer.codeAnswer)) {
      unansweredCount += 1;
      return { questionId: question._id, isCorrect: false, marksEarned: 0, markedForReview: Boolean(answer?.markedForReview) };
    }

    const correctLabels = question.correctAnswers?.length
      ? question.correctAnswers.map(normalize)
      : question.correctAnswer
        ? [normalize(question.correctAnswer)]
        : Number.isInteger(question.correctIndex)
          ? [normalize(question.options?.[question.correctIndex]?.label || question.options?.[question.correctIndex]?.text)]
          : [];

    let isCorrect = false;
    if (question.questionType === "multiple-choice") {
      const selected = (answer.selectedOptions || []).map(normalize).sort();
      isCorrect = selected.length === correctLabels.length && selected.every((item, index) => item === correctLabels.sort()[index]);
    } else if (["fill-blank", "short-answer"].includes(question.questionType)) {
      isCorrect = correctLabels.includes(normalize(answer.textAnswer));
    } else if (question.questionType === "code") {
      isCorrect = false;
    } else {
      isCorrect = correctLabels.includes(normalize(answer.selectedOption));
    }

    const marksEarned = isCorrect ? question.marks || 1 : quiz.negativeMarking ? -(question.negativeMarks || quiz.negativeMarksPerQuestion || 0) : 0;
    score += marksEarned;
    if (isCorrect) correctCount += 1;
    else wrongCount += 1;
    return { ...answer.toObject?.() || answer, isCorrect, marksEarned };
  });

  const totalMarks = quiz.totalMarks || quiz.questions.reduce((sum, question) => sum + (question.marks || 1), 0);
  const percentage = totalMarks ? Math.max(0, Math.round((score / totalMarks) * 100)) : 0;
  const isPassed = score >= (quiz.passingMarks || 0);

  attempt.answers = answers;
  attempt.score = Math.max(0, score);
  attempt.totalMarks = totalMarks;
  attempt.passingMarks = quiz.passingMarks || 0;
  attempt.percentage = percentage;
  attempt.correctCount = correctCount;
  attempt.wrongCount = wrongCount;
  attempt.unansweredCount = unansweredCount;
  attempt.correct = correctCount;
  attempt.wrong = wrongCount;
  attempt.isPassed = isPassed;
  attempt.status = isPassed ? "passed" : autoSubmitted ? "auto-submitted" : "failed";
  attempt.submittedAt = new Date();
  attempt.timeTaken = Math.round((attempt.submittedAt - attempt.startedAt) / 1000);
  return attempt;
};

export const ensureAttemptOpen = async (attemptId, studentId) => {
  const attempt = await QuizAttempt.findOne({ _id: attemptId, student: studentId }).populate("quiz");
  if (!attempt) throw new ApiError(404, "Attempt not found");
  if (attempt.status !== "in-progress") throw new ApiError(409, "This attempt is already submitted");
  const durationMs = ((attempt.quiz.duration || attempt.quiz.durationMinutes || 0) * 60 * 1000);
  if (durationMs && Date.now() - attempt.startedAt.getTime() > durationMs + 10000) {
    calculateAttempt({ quiz: attempt.quiz, attempt, autoSubmitted: true });
    await attempt.save();
    throw new ApiError(408, "Quiz time expired and attempt was auto-submitted");
  }
  return attempt;
};
