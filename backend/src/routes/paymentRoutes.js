import express from "express";
import { createPaymentOrder, paymentHistory, paymentRefundRequest, verifyPayment } from "../controllers/lmsController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();
router.use(protect);

router.post("/create-order", createPaymentOrder);
router.post("/verify", verifyPayment);
router.get("/history", paymentHistory);
router.post("/refund-request", paymentRefundRequest);

export default router;
