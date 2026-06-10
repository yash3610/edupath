import { body, param } from "express-validator";

export const liveClassIdParam = [
  param("id").isMongoId().withMessage("Valid live class id is required"),
];

export const createLiveClassValidators = [
  body("title").trim().isLength({ min: 3, max: 160 }),
  body("course").isMongoId().withMessage("Valid course is required"),
  body("startAt").isISO8601().withMessage("Valid start date/time is required"),
  body("duration").isInt({ min: 10, max: 720 }).withMessage("Duration must be between 10 and 720 minutes"),
  body("meetingPlatform").optional().isIn(["zoom", "google-meet", "built-in", "other"]),
  body("accessType").optional().isIn(["enrolled", "free-preview", "paid-only"]),
  body("maxStudents").optional().isInt({ min: 0 }),
];

export const updateLiveClassValidators = [
  ...liveClassIdParam,
  body("title").optional().trim().isLength({ min: 3, max: 160 }),
  body("course").optional().isMongoId(),
  body("startAt").optional().isISO8601(),
  body("duration").optional().isInt({ min: 10, max: 720 }),
];
