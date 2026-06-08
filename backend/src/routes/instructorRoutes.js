import express from "express";
import { instructorCreateAssignment, instructorCreateCourse, instructorCreateLecture, instructorCreateModule, instructorCreateQuiz, instructorDashboard, instructorDeleteCourse, instructorGradeAssignment, instructorStudentsProgress, instructorUpdateCourse } from "../controllers/lmsController.js";
import { authorize, protect } from "../middleware/authMiddleware.js";

const router = express.Router();
router.use(protect, authorize("instructor", "admin"));

router.get("/dashboard", instructorDashboard);
router.post("/courses", instructorCreateCourse);
router.patch("/courses/:courseId", instructorUpdateCourse);
router.delete("/courses/:courseId", instructorDeleteCourse);
router.post("/courses/:courseId/modules", instructorCreateModule);
router.post("/modules/:moduleId/lectures", instructorCreateLecture);
router.post("/courses/:courseId/quizzes", instructorCreateQuiz);
router.post("/courses/:courseId/assignments", instructorCreateAssignment);
router.get("/students-progress", instructorStudentsProgress);
router.patch("/assignments/:submissionId/grade", instructorGradeAssignment);

export default router;
