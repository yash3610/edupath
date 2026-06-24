import express from "express";
import { deleteAccount, getPlatformSettings, getSettings, patchPlatformSettings, patchSettings } from "../controllers/lmsController.js";
import { authorize, protect } from "../middleware/authMiddleware.js";

const router = express.Router();
router.use(protect);

router.get("/", getSettings);
router.patch("/", patchSettings);
router.get("/admin/platform", authorize("admin"), getPlatformSettings);
router.patch("/admin/platform", authorize("admin"), patchPlatformSettings);
router.patch("/notifications", patchSettings);
router.patch("/privacy", patchSettings);
router.delete("/delete-account", deleteAccount);

export default router;
