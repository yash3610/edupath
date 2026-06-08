import express from "express";
import { deleteAccount, getSettings, patchSettings } from "../controllers/lmsController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();
router.use(protect);

router.get("/", getSettings);
router.patch("/", patchSettings);
router.patch("/notifications", patchSettings);
router.patch("/privacy", patchSettings);
router.delete("/delete-account", deleteAccount);

export default router;
