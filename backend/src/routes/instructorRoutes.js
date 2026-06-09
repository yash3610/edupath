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
import {
  instructorAssignments, instructorCoursePerformance, instructorCreateAssignment, instructorCreateCourse,
  instructorCreateLecture, instructorCreateLiveClass, instructorCreateModule, instructorCreateQuiz,
  instructorDashboard, instructorDeleteAssignment, instructorDeleteCourse, instructorDeleteLecture,
  instructorDeleteLiveClass, instructorDeleteModule, instructorDoubts, instructorEarnings,
  instructorEarningsAnalytics, instructorGradeAssignment, instructorLectures, instructorLiveClasses,
  instructorModules, instructorMyCourses, instructorPayouts, instructorPendingTasks, instructorRecentActivity,
  instructorReviews, instructorStats, instructorStudentEngagement, instructorStudentsProgress,
  instructorSubmissions, instructorUpcomingClasses, instructorUpdateCourse, instructorUpdateLecture,
  instructorUpdateLiveClass, instructorUpdateModule,
} from "../controllers/lmsController.js";
import { authorize, protect } from "../middleware/authMiddleware.js";
import validate from "../middleware/validate.js";
import { createQuizValidators, quizIdParam } from "../validators/quizValidators.js";

const router = express.Router();
router.use(protect, authorize("instructor", "admin"));

router.get("/dashboard", instructorDashboard);
router.get("/stats", instructorStats);
router.get("/my-courses", instructorMyCourses);
router.get("/course-performance", instructorCoursePerformance);
router.get("/earnings-analytics", instructorEarningsAnalytics);
router.get("/student-engagement", instructorStudentEngagement);
router.get("/pending-tasks", instructorPendingTasks);
router.get("/recent-activity", instructorRecentActivity);
router.get("/upcoming-classes", instructorUpcomingClasses);
router.post("/courses", instructorCreateCourse);
router.patch("/courses/:courseId", instructorUpdateCourse);
router.delete("/courses/:courseId", instructorDeleteCourse);
router.post("/courses/:courseId/modules", instructorCreateModule);
router.get("/courses/:courseId/modules", instructorModules);
router.patch("/modules/:moduleId", instructorUpdateModule);
router.delete("/modules/:moduleId", instructorDeleteModule);
router.post("/modules/:moduleId/lectures", instructorCreateLecture);
router.get("/modules/:moduleId/lectures", instructorLectures);
router.patch("/lectures/:lectureId", instructorUpdateLecture);
router.delete("/lectures/:lectureId", instructorDeleteLecture);
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
router.get("/assignments", instructorAssignments);
router.delete("/assignments/:assignmentId", instructorDeleteAssignment);
router.get("/assignments/:assignmentId/submissions", instructorSubmissions);
router.get("/students-progress", instructorStudentsProgress);
router.patch("/assignments/:submissionId/grade", instructorGradeAssignment);
router.get("/doubts", instructorDoubts);
router.get("/reviews", instructorReviews);
router.get("/live-classes", instructorLiveClasses);
router.post("/live-classes", instructorCreateLiveClass);
router.patch("/live-classes/:liveClassId", instructorUpdateLiveClass);
router.delete("/live-classes/:liveClassId", instructorDeleteLiveClass);
router.get("/earnings", instructorEarnings);
router.get("/payouts", instructorPayouts);

export default router;
