import express from "express";
import { ml } from "../controllers/lmsController.js";
import { authorize, protect } from "../middleware/authMiddleware.js";

const router = express.Router();
router.use(protect, authorize("student"));

router.get("/learning-pattern", ml("learningPattern"));
router.get("/engagement-score", ml("engagementScore"));
router.get("/completion-probability", ml("completionProbability"));
router.get("/weak-topics", ml("weakTopics"));
router.get("/skill-growth", ml("skillGrowth"));
router.get("/success-prediction", ml("successPrediction"));

export default router;
