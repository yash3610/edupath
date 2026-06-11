import express from "express";
import { assignmentDetails, assignmentSubmission, studentAssignments, submitAssignment } from "../controllers/lmsController.js";
import { authorize, protect } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/uploadMiddleware.js";

const router = express.Router();
router.use(protect, authorize("student"));

router.get("/student", studentAssignments);
router.get("/:assignmentId", assignmentDetails);
router.post("/:assignmentId/submit", upload.single("file"), submitAssignment);
router.get("/:assignmentId/submission", assignmentSubmission);

export default router;
