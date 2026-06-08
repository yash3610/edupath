import express from "express";
import { courseQuizzes, quizResult, retakeQuiz, startQuiz, submitQuiz } from "../controllers/lmsController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();
router.use(protect);

router.get("/course/:courseId", courseQuizzes);
router.get("/:quizId/start", startQuiz);
router.post("/:quizId/submit", submitQuiz);
router.get("/:quizId/result", quizResult);
router.post("/:quizId/retake", retakeQuiz);

export default router;
