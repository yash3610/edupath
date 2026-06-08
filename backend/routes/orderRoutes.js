import express from "express";
import { createOrder, listMyOrders, listOrders } from "../controllers/orderController.js";
import { adminOnly, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);
router.get("/my", listMyOrders);
router.get("/", adminOnly, listOrders);
router.post("/", createOrder);

export default router;
