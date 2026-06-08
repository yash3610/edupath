import express from "express";
import { myOrders, orderDetails, orderInvoice, orderRefundRequest } from "../controllers/lmsController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();
router.use(protect);

router.get("/my", myOrders);
router.get("/:orderId", orderDetails);
router.get("/:orderId/invoice", orderInvoice);
router.post("/:orderId/refund-request", orderRefundRequest);

export default router;
