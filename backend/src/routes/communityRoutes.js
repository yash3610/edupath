import express from "express";
import { acceptAnswer, communityQuestions, createAnswer, createQuestion, questionDetails, upvoteAnswer } from "../controllers/lmsController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();
router.use(protect);

router.get("/questions", communityQuestions);
router.post("/questions", createQuestion);
router.get("/questions/:questionId", questionDetails);
router.post("/questions/:questionId/answers", createAnswer);
router.patch("/answers/:answerId/upvote", upvoteAnswer);
router.patch("/answers/:answerId/accept", acceptAnswer);

export default router;
