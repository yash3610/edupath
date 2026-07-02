import express from "express";
import {
  uploadedAsset,
} from "../controllers/assetController.js";
import {
  contactSubmission,
  newsletterSubscription,
  publicBlogs,
  publicCourseDetails,
  publicCourses,
  publicEvents,
  publicProducts,
  publicTeam,
} from "../controllers/publicController.js";

const router = express.Router();

router.get("/assets/:assetId", uploadedAsset);
router.get("/courses", publicCourses);
router.get("/courses/:slug", publicCourseDetails);
router.get("/blogs", publicBlogs);
router.get("/events", publicEvents);
router.get("/products", publicProducts);
router.get("/team", publicTeam);
router.post("/contact", contactSubmission);
router.post("/newsletter", newsletterSubscription);

export default router;
