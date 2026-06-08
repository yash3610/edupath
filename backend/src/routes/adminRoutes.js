import express from "express";
import { adminApproveQuiz, adminDeleteQuiz, adminQuizzes, adminRejectQuiz } from "../controllers/quizController.js";
import { adminApproveCourse, adminCourses, adminCreateCoupon, adminDashboard, adminDeleteUser, adminOrders, adminPayments, adminReports, adminUpdateCoupon, adminUsers, adminUserStatus } from "../controllers/lmsController.js";
import { authorize, protect } from "../middleware/authMiddleware.js";
import validate from "../middleware/validate.js";
import { quizIdParam } from "../validators/quizValidators.js";

const router = express.Router();
router.use(protect, authorize("admin"));

router.get("/dashboard", adminDashboard);
router.get("/users", adminUsers);
router.patch("/users/:userId/status", adminUserStatus);
router.delete("/users/:userId", adminDeleteUser);
router.get("/courses", adminCourses);
router.patch("/courses/:courseId/approve", adminApproveCourse);
router.get("/quizzes", adminQuizzes);
router.patch("/quizzes/:quizId/approve", quizIdParam, validate, adminApproveQuiz);
router.patch("/quizzes/:quizId/reject", quizIdParam, validate, adminRejectQuiz);
router.delete("/quizzes/:quizId", quizIdParam, validate, adminDeleteQuiz);
router.get("/orders", adminOrders);
router.get("/payments", adminPayments);
router.get("/reports", adminReports);
router.post("/coupons", adminCreateCoupon);
router.patch("/coupons/:couponId", adminUpdateCoupon);

export default router;
