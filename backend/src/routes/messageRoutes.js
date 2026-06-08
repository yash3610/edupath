import express from "express";
import { conversationMessages, conversations, sendMessage, uploadAttachment } from "../controllers/lmsController.js";
import { protect } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/uploadMiddleware.js";

const router = express.Router();
router.use(protect);

router.get("/conversations", conversations);
router.get("/conversation/:conversationId", conversationMessages);
router.post("/send", sendMessage);
router.post("/upload-attachment", upload.single("file"), uploadAttachment);

export default router;
