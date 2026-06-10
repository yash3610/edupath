import express from "express";
import { adminApproveQuiz, adminDeleteQuiz, adminQuizzes, adminRejectQuiz } from "../controllers/quizController.js";
import {
  adminAnnouncement,
  adminApproveLiveClass,
  adminAttendance,
  adminCancelLiveClass,
  adminDeleteLiveClass,
  adminLiveClassDetails,
  adminLiveClasses,
  adminRejectLiveClass,
  adminRescheduleLiveClass,
} from "../controllers/liveClassController.js";
import {
  adminApproveCourse, adminAssignments, adminCategories, adminCertificates, adminCommunity, adminCoupons,
  adminCourseControl, adminCourseDetails, adminCreateCourse,
  adminCourseAnalytics, adminCourses, adminCreateCategory, adminCreateCoupon, adminDashboard,
  adminDeleteAssignment, adminDeleteCategory, adminDeleteCertificate, adminDeleteCoupon, adminDeleteCourse,
  adminDeleteDiscussion, adminDeleteReview, adminDeleteUser, adminInstructors, adminOrders, adminPayments,
  adminPendingApprovals, adminRecentActivity, adminRecentOrders, adminRefunds, adminRefundStatus,
  adminRejectCourse, adminReports, adminRevenueAnalytics, adminReviews, adminStats, adminStudents,
  adminTopCourses, adminUpdateCategory, adminUpdateCoupon, adminUpdateCourse, adminUserGrowth, adminUsers, adminUserStatus,
  adminArchiveCourse, adminPublishCourse, adminUnpublishCourse,
} from "../controllers/lmsController.js";
import { authorize, protect } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/uploadMiddleware.js";
import validate from "../middleware/validate.js";
import { liveClassIdParam } from "../validators/liveClassValidators.js";
import { quizIdParam } from "../validators/quizValidators.js";

const router = express.Router();
router.use(protect, authorize("admin"));

router.get("/dashboard", adminDashboard);
router.get("/stats", adminStats);
router.get("/revenue-analytics", adminRevenueAnalytics);
router.get("/user-growth", adminUserGrowth);
router.get("/course-analytics", adminCourseAnalytics);
router.get("/top-courses", adminTopCourses);
router.get("/recent-orders", adminRecentOrders);
router.get("/pending-approvals", adminPendingApprovals);
router.get("/recent-activity", adminRecentActivity);
router.get("/users", adminUsers);
router.get("/students", adminStudents);
router.get("/instructors", adminInstructors);
router.patch("/users/:userId/status", adminUserStatus);
router.delete("/users/:userId", adminDeleteUser);
router.get("/courses", adminCourses);
router.post("/courses", upload.single("thumbnailFile"), adminCreateCourse);
router.get("/courses/:courseId", adminCourseDetails);
router.patch("/courses/:courseId", upload.single("thumbnailFile"), adminUpdateCourse);
router.patch("/courses/:courseId/control", adminCourseControl);
router.delete("/courses/:courseId", adminDeleteCourse);
router.patch("/courses/:courseId/approve", adminApproveCourse);
router.patch("/courses/:courseId/reject", adminRejectCourse);
router.patch("/courses/:courseId/publish", adminPublishCourse);
router.patch("/courses/:courseId/unpublish", adminUnpublishCourse);
router.patch("/courses/:courseId/archive", adminArchiveCourse);
router.get("/live-classes", adminLiveClasses);
router.get("/live-classes/:id", liveClassIdParam, validate, adminLiveClassDetails);
router.patch("/live-classes/:id/approve", liveClassIdParam, validate, adminApproveLiveClass);
router.patch("/live-classes/:id/reject", liveClassIdParam, validate, adminRejectLiveClass);
router.patch("/live-classes/:id/cancel", liveClassIdParam, validate, adminCancelLiveClass);
router.patch("/live-classes/:id/reschedule", liveClassIdParam, validate, adminRescheduleLiveClass);
router.get("/live-classes/:id/attendance", liveClassIdParam, validate, adminAttendance);
router.post("/live-classes/:id/announcement", liveClassIdParam, validate, adminAnnouncement);
router.delete("/live-classes/:id", liveClassIdParam, validate, adminDeleteLiveClass);
router.get("/quizzes", adminQuizzes);
router.patch("/quizzes/:quizId/approve", quizIdParam, validate, adminApproveQuiz);
router.patch("/quizzes/:quizId/reject", quizIdParam, validate, adminRejectQuiz);
router.delete("/quizzes/:quizId", quizIdParam, validate, adminDeleteQuiz);
router.get("/orders", adminOrders);
router.get("/payments", adminPayments);
router.get("/refunds", adminRefunds);
router.patch("/refunds/:refundId", adminRefundStatus);
router.get("/reports", adminReports);
router.get("/categories", adminCategories);
router.post("/categories", adminCreateCategory);
router.patch("/categories/:categoryId", adminUpdateCategory);
router.delete("/categories/:categoryId", adminDeleteCategory);
router.get("/coupons", adminCoupons);
router.post("/coupons", adminCreateCoupon);
router.patch("/coupons/:couponId", adminUpdateCoupon);
router.delete("/coupons/:couponId", adminDeleteCoupon);
router.get("/assignments", adminAssignments);
router.delete("/assignments/:assignmentId", adminDeleteAssignment);
router.get("/certificates", adminCertificates);
router.delete("/certificates/:certificateId", adminDeleteCertificate);
router.get("/reviews", adminReviews);
router.delete("/reviews/:reviewId", adminDeleteReview);
router.get("/community", adminCommunity);
router.delete("/community/:questionId", adminDeleteDiscussion);

export default router;
