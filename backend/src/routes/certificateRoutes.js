import express from "express";
import { certificateDetails, downloadCertificate, myCertificates, verifyCertificate } from "../controllers/lmsController.js";
import { authorize, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/verify/:certificateCode", verifyCertificate);
router.use(protect, authorize("student"));
router.get("/my", myCertificates);
router.get("/:certificateId", certificateDetails);
router.get("/:certificateId/download", downloadCertificate);

export default router;
