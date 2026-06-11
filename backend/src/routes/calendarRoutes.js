import express from "express";
import { calendarEvents, createCalendarEvent, deleteCalendarEvent, updateCalendarEvent, createReminder, updateReminder } from "../controllers/lmsController.js";
import { authorize, protect } from "../middleware/authMiddleware.js";

const router = express.Router();
router.use(protect, authorize("student"));

router.get("/events", calendarEvents);
router.post("/events", createCalendarEvent);
router.patch("/events/:eventId", updateCalendarEvent);
router.delete("/events/:eventId", deleteCalendarEvent);
router.post("/reminder", createReminder);
router.patch("/reminder/:reminderId", updateReminder);

export default router;
