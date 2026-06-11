import express from "express";
import { achievements, continueLearning, courseProgress, dashboardStats, myCourses, recentNotifications, recommendedCourses, upcomingClasses } from "../controllers/lmsController.js";
import {
  studentAskQuestion,
  studentJoinLiveClass,
  studentLeaveLiveClass,
  studentLiveClassDetails,
  studentLiveClasses,
  studentRecording,
  studentRecordings,
  studentResources,
  studentTodayLiveClasses,
  studentUpcomingLiveClasses,
} from "../controllers/liveClassController.js";
import { authorize, protect } from "../middleware/authMiddleware.js";
import validate from "../middleware/validate.js";
import { liveClassIdParam } from "../validators/liveClassValidators.js";

const router = express.Router();
router.use(protect, authorize("student"));

router.get("/dashboard-stats", dashboardStats);
router.get("/continue-learning", continueLearning);
router.get("/recommended-courses", recommendedCourses);
router.get("/upcoming-classes", upcomingClasses);
router.get("/recent-notifications", recentNotifications);
router.get("/achievements", achievements);
router.get("/my-courses", myCourses);
router.get("/course-progress/:courseId", courseProgress);
router.get("/live-classes", studentLiveClasses);
router.get("/live-classes/today", studentTodayLiveClasses);
router.get("/live-classes/upcoming", studentUpcomingLiveClasses);
router.get("/live-classes/recordings", studentRecordings);
router.get("/live-classes/:id", liveClassIdParam, validate, studentLiveClassDetails);
router.post("/live-classes/:id/join", liveClassIdParam, validate, studentJoinLiveClass);
router.post("/live-classes/:id/leave", liveClassIdParam, validate, studentLeaveLiveClass);
router.get("/live-classes/:id/recording", liveClassIdParam, validate, studentRecording);
router.get("/live-classes/:id/resources", liveClassIdParam, validate, studentResources);
router.post("/live-classes/:id/questions", liveClassIdParam, validate, studentAskQuestion);

export default router;
