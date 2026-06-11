import express from "express";
import { addWishlist, getWishlist, removeWishlist } from "../controllers/lmsController.js";
import { authorize, protect } from "../middleware/authMiddleware.js";

const router = express.Router();
router.use(protect, authorize("student"));

router.get("/", getWishlist);
router.post("/:courseId", addWishlist);
router.delete("/:courseId", removeWishlist);

export default router;
