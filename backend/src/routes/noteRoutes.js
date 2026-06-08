import express from "express";
import { createNote, deleteNote, getCourseNotes, getNotes, pinNote, updateNote } from "../controllers/lmsController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();
router.use(protect);

router.get("/", getNotes);
router.get("/course/:courseId", getCourseNotes);
router.post("/", createNote);
router.patch("/:noteId", updateNote);
router.delete("/:noteId", deleteNote);
router.patch("/:noteId/pin", pinNote);

export default router;
