import express from "express";
import { adminApproveCourse, adminCourses, adminCreateCoupon, adminDashboard, adminDeleteUser, adminOrders, adminPayments, adminReports, adminUpdateCoupon, adminUsers, adminUserStatus } from "../controllers/lmsController.js";
import { authorize, protect } from "../middleware/authMiddleware.js";

const router = express.Router();
router.use(protect, authorize("admin"));

router.get("/dashboard", adminDashboard);
router.get("/users", adminUsers);
router.patch("/users/:userId/status", adminUserStatus);
router.delete("/users/:userId", adminDeleteUser);
router.get("/courses", adminCourses);
router.patch("/courses/:courseId/approve", adminApproveCourse);
router.get("/orders", adminOrders);
router.get("/payments", adminPayments);
router.get("/reports", adminReports);
router.post("/coupons", adminCreateCoupon);
router.patch("/coupons/:couponId", adminUpdateCoupon);

export default router;
