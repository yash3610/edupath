import express from "express";
import { deleteNotification, notifications, readAllNotifications, readNotification } from "../controllers/lmsController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();
router.use(protect);

router.get("/", notifications);
router.patch("/read-all", readAllNotifications);
router.patch("/:notificationId/read", readNotification);
router.delete("/:notificationId", deleteNotification);

export default router;
