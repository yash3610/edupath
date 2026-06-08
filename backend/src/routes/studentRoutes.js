import express from "express";
import { achievements, continueLearning, courseProgress, dashboardStats, myCourses, recentNotifications, recommendedCourses, upcomingClasses } from "../controllers/lmsController.js";
import { authorize, protect } from "../middleware/authMiddleware.js";

const router = express.Router();
router.use(protect, authorize("student", "admin"));

router.get("/dashboard-stats", dashboardStats);
router.get("/continue-learning", continueLearning);
router.get("/recommended-courses", recommendedCourses);
router.get("/upcoming-classes", upcomingClasses);
router.get("/recent-notifications", recentNotifications);
router.get("/achievements", achievements);
router.get("/my-courses", myCourses);
router.get("/course-progress/:courseId", courseProgress);

export default router;
