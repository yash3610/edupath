import express from "express";
import { checkEnrollment, freeEnrollment, myEnrollments, paidEnrollment } from "../controllers/lmsController.js";
import { authorize, protect } from "../middleware/authMiddleware.js";

const router = express.Router();
router.use(protect, authorize("student"));

router.post("/free/:courseId", freeEnrollment);
router.post("/paid/:courseId", paidEnrollment);
router.get("/check/:courseId", checkEnrollment);
router.get("/my", myEnrollments);

export default router;
