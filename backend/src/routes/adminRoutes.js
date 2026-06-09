import express from "express";
import { adminApproveQuiz, adminDeleteQuiz, adminQuizzes, adminRejectQuiz } from "../controllers/quizController.js";
import {
  adminApproveCourse, adminAssignments, adminCategories, adminCertificates, adminCommunity, adminCoupons,
  adminCourseControl, adminCourseDetails,
  adminCourseAnalytics, adminCourses, adminCreateCategory, adminCreateCoupon, adminDashboard,
  adminDeleteAssignment, adminDeleteCategory, adminDeleteCertificate, adminDeleteCoupon, adminDeleteCourse,
  adminDeleteDiscussion, adminDeleteReview, adminDeleteUser, adminInstructors, adminOrders, adminPayments,
  adminPendingApprovals, adminRecentActivity, adminRecentOrders, adminRefunds, adminRefundStatus,
  adminRejectCourse, adminReports, adminRevenueAnalytics, adminReviews, adminStats, adminStudents,
  adminTopCourses, adminUpdateCategory, adminUpdateCoupon, adminUpdateCourse, adminUserGrowth, adminUsers, adminUserStatus,
} from "../controllers/lmsController.js";
import { authorize, protect } from "../middleware/authMiddleware.js";
import validate from "../middleware/validate.js";
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
router.get("/courses/:courseId", adminCourseDetails);
router.patch("/courses/:courseId", adminUpdateCourse);
router.patch("/courses/:courseId/control", adminCourseControl);
router.delete("/courses/:courseId", adminDeleteCourse);
router.patch("/courses/:courseId/approve", adminApproveCourse);
router.patch("/courses/:courseId/reject", adminRejectCourse);
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
