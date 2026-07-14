import express from "express";
import { bookmarkLecture, completeLecture, courseModules, courseResources, learningCourse, lectureDetails, patchLectureProgress, studentDownloads, watchTime } from "../controllers/lmsController.js";
import { authorize, protect } from "../middleware/authMiddleware.js";

const router = express.Router();
router.use(protect, authorize("student"));

router.get("/course/:courseId", learningCourse);
router.get("/course/:courseId/modules", courseModules);
router.get("/lecture/:lectureId", lectureDetails);
router.patch("/lecture/:lectureId/progress", patchLectureProgress);
router.patch("/lecture/:lectureId/complete", completeLecture);
router.post("/lecture/:lectureId/bookmark", bookmarkLecture);
router.post("/lecture/:lectureId/watch-time", watchTime);
router.get("/course/:courseId/resources", courseResources);
router.get("/downloads", studentDownloads);

export default router;
