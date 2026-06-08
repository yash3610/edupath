import express from "express";
import {
  addQuestion,
  deleteQuestion,
  instructorCreateQuiz as createPremiumQuiz,
  instructorDeleteQuiz,
  instructorQuizDetails,
  instructorQuizzes,
  instructorUpdateQuiz,
  publishQuiz,
  quizAnalytics,
  quizAttempts,
  reorderQuestions,
  updateQuestion,
} from "../controllers/quizController.js";
import { instructorCreateAssignment, instructorCreateCourse, instructorCreateLecture, instructorCreateModule, instructorCreateQuiz, instructorDashboard, instructorDeleteCourse, instructorGradeAssignment, instructorStudentsProgress, instructorUpdateCourse } from "../controllers/lmsController.js";
import { authorize, protect } from "../middleware/authMiddleware.js";
import validate from "../middleware/validate.js";
import { createQuizValidators, quizIdParam } from "../validators/quizValidators.js";

const router = express.Router();
router.use(protect, authorize("instructor", "admin"));

router.get("/dashboard", instructorDashboard);
router.post("/courses", instructorCreateCourse);
router.patch("/courses/:courseId", instructorUpdateCourse);
router.delete("/courses/:courseId", instructorDeleteCourse);
router.post("/courses/:courseId/modules", instructorCreateModule);
router.post("/modules/:moduleId/lectures", instructorCreateLecture);
router.post("/courses/:courseId/quizzes", instructorCreateQuiz);
router.post("/quizzes", createQuizValidators, validate, createPremiumQuiz);
router.get("/quizzes", instructorQuizzes);
router.get("/quizzes/:quizId", quizIdParam, validate, instructorQuizDetails);
router.patch("/quizzes/:quizId", quizIdParam, validate, instructorUpdateQuiz);
router.delete("/quizzes/:quizId", quizIdParam, validate, instructorDeleteQuiz);
router.post("/quizzes/:quizId/questions", quizIdParam, validate, addQuestion);
router.patch("/quizzes/:quizId/questions/:questionId", quizIdParam, validate, updateQuestion);
router.delete("/quizzes/:quizId/questions/:questionId", quizIdParam, validate, deleteQuestion);
router.patch("/quizzes/:quizId/reorder-questions", quizIdParam, validate, reorderQuestions);
router.patch("/quizzes/:quizId/publish", quizIdParam, validate, publishQuiz);
router.get("/quizzes/:quizId/analytics", quizIdParam, validate, quizAnalytics);
router.get("/quizzes/:quizId/attempts", quizIdParam, validate, quizAttempts);
router.post("/courses/:courseId/assignments", instructorCreateAssignment);
router.get("/students-progress", instructorStudentsProgress);
router.patch("/assignments/:submissionId/grade", instructorGradeAssignment);

export default router;
