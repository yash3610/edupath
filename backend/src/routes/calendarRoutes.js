import express from "express";
import { calendarEvents, createReminder, updateReminder } from "../controllers/lmsController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();
router.use(protect);

router.get("/events", calendarEvents);
router.post("/reminder", createReminder);
router.patch("/reminder/:reminderId", updateReminder);

export default router;
