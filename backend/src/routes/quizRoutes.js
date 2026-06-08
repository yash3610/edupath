import express from "express";
import {
  clearAnswer,
  downloadResultPdf,
  getAttemptResult,
  getCurrentAttempt,
  getQuizHistory,
  getQuizInstructions,
  getStudentCourseQuizzes,
  getStudentQuizzes,
  markAnswerReview,
  quizCourses,
  saveAnswer,
  startQuizAttempt,
  submitAttempt,
} from "../controllers/quizController.js";
import { protect } from "../middleware/authMiddleware.js";
import validate from "../middleware/validate.js";
import { attemptIdParam, quizIdParam, saveAnswerValidators } from "../validators/quizValidators.js";

const router = express.Router();
router.use(protect);

router.get("/student", getStudentQuizzes);
router.get("/student/courses", quizCourses);
router.get("/student/course/:courseId", getStudentCourseQuizzes);
router.get("/attempt/:attemptId", attemptIdParam, validate, getCurrentAttempt);
router.patch("/attempt/:attemptId/save-answer", [...attemptIdParam, ...saveAnswerValidators], validate, saveAnswer);
router.patch("/attempt/:attemptId/mark-review", [...attemptIdParam, ...saveAnswerValidators], validate, markAnswerReview);
router.patch("/attempt/:attemptId/clear-answer", attemptIdParam, validate, clearAnswer);
router.post("/attempt/:attemptId/submit", attemptIdParam, validate, submitAttempt(false));
router.post("/attempt/:attemptId/auto-submit", attemptIdParam, validate, submitAttempt(true));
router.get("/attempt/:attemptId/result", attemptIdParam, validate, getAttemptResult);
router.get("/attempt/:attemptId/download-result", attemptIdParam, validate, downloadResultPdf);
router.get("/:quizId/instructions", quizIdParam, validate, getQuizInstructions);
router.post("/:quizId/start", quizIdParam, validate, startQuizAttempt);
router.get("/:quizId/history", quizIdParam, validate, getQuizHistory);

export default router;
