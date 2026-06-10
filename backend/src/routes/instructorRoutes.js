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
  instructorAssignments, instructorCoursePerformance, instructorCreateAssignment,
  instructorCreateLecture, instructorCreateModule, instructorCreateQuiz,
  instructorCourseAnalytics, instructorCourseDetails, instructorDashboard, instructorDeleteAssignment, instructorDeleteLecture,
  instructorDeleteModule, instructorDoubts, instructorEarnings,
  instructorEarningsAnalytics, instructorGradeAssignment, instructorLectures,
  instructorModules, instructorMyCourses, instructorPayouts, instructorPendingTasks, instructorRecentActivity,
  instructorDuplicateLecture, instructorReorderLectures, instructorReorderModules, instructorReviews, instructorStats, instructorStudentEngagement, instructorStudentsProgress,
  instructorSubmissions, instructorUpcomingClasses, instructorUpdateLecture,
  instructorUpdateModule,
} from "../controllers/lmsController.js";
import {
  instructorAttendance,
  instructorCancelLiveClass,
  instructorCompleteLiveClass,
  instructorCreateLiveClass,
  instructorDeleteLiveClass,
  instructorExportAttendance,
  instructorLiveClassDetails,
  instructorLiveClasses,
  instructorStartLiveClass,
  instructorAnswerQuestion,
  instructorUpdateAttendance,
  instructorUpdateLiveClass,
  instructorUploadRecording,
  instructorUploadResources,
} from "../controllers/liveClassController.js";
import { authorize, protect } from "../middleware/authMiddleware.js";
import { courseUpload } from "../middleware/uploadMiddleware.js";
import validate from "../middleware/validate.js";
import { createLiveClassValidators, liveClassIdParam, updateLiveClassValidators } from "../validators/liveClassValidators.js";
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
router.get("/courses/:courseId", instructorCourseDetails);
router.get("/courses/:courseId/analytics", instructorCourseAnalytics);
router.post("/courses/:courseId/modules", instructorCreateModule);
router.get("/courses/:courseId/modules", instructorModules);
router.patch("/courses/:courseId/modules/reorder", instructorReorderModules);
router.patch("/modules/:moduleId", instructorUpdateModule);
router.delete("/modules/:moduleId", instructorDeleteModule);
router.post("/modules/:moduleId/lectures", instructorCreateLecture);
router.get("/modules/:moduleId/lectures", instructorLectures);
router.patch("/modules/:moduleId/lectures/reorder", instructorReorderLectures);
router.patch("/lectures/:lectureId", instructorUpdateLecture);
router.post("/lectures/:lectureId/duplicate", instructorDuplicateLecture);
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
router.post("/live-classes", createLiveClassValidators, validate, instructorCreateLiveClass);
router.get("/live-classes/:id", liveClassIdParam, validate, instructorLiveClassDetails);
router.patch("/live-classes/:id", updateLiveClassValidators, validate, instructorUpdateLiveClass);
router.delete("/live-classes/:id", liveClassIdParam, validate, instructorDeleteLiveClass);
router.patch("/live-classes/:id/start", liveClassIdParam, validate, instructorStartLiveClass);
router.patch("/live-classes/:id/complete", liveClassIdParam, validate, instructorCompleteLiveClass);
router.patch("/live-classes/:id/cancel", liveClassIdParam, validate, instructorCancelLiveClass);
router.post("/live-classes/:id/recording", liveClassIdParam, validate, courseUpload.single("file"), instructorUploadRecording);
router.post("/live-classes/:id/resources", liveClassIdParam, validate, courseUpload.single("file"), instructorUploadResources);
router.get("/live-classes/:id/attendance", liveClassIdParam, validate, instructorAttendance);
router.patch("/live-classes/:id/attendance/:attendanceId", liveClassIdParam, validate, instructorUpdateAttendance);
router.get("/live-classes/:id/export-attendance", liveClassIdParam, validate, instructorExportAttendance);
router.patch("/live-classes/:id/questions/:questionId/answer", liveClassIdParam, validate, instructorAnswerQuestion);
router.get("/earnings", instructorEarnings);
router.get("/payouts", instructorPayouts);

export default router;
