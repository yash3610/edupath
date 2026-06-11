import express from "express";
import { changePassword, profileMe, updateAvatar, updateProfile } from "../controllers/lmsController.js";
import { protect } from "../middleware/authMiddleware.js";
import { avatarUpload } from "../middleware/uploadMiddleware.js";

const router = express.Router();
router.use(protect);

router.get("/me", profileMe);
router.patch("/me", updateProfile);
router.patch("/avatar", avatarUpload.single("avatar"), updateAvatar);
router.patch("/change-password", changePassword);

export default router;
