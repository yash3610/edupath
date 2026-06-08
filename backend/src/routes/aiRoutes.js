import express from "express";
import { aiHistory, askDoubt, getAIRecommendedCourses, recommendAICourses, saveAnswerToNotes, summaries, summarizeLecture, summarizeResource } from "../controllers/lmsController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();
router.use(protect);

router.post("/ask-doubt", askDoubt);
router.get("/chat-history", aiHistory);
router.post("/save-answer-to-notes", saveAnswerToNotes);
router.post("/summarize-lecture", summarizeLecture);
router.post("/summarize-resource", summarizeResource);
router.get("/summaries", summaries);
router.post("/recommend-courses", recommendAICourses);
router.get("/recommended-courses", getAIRecommendedCourses);

export default router;
