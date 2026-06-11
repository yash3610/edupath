import multer from "multer";
import ApiError from "../utils/ApiError.js";

const allowedTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
  "application/zip",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

const imageTypes = ["image/jpeg", "image/png", "image/webp"];

export const avatarUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!imageTypes.includes(file.mimetype)) return cb(new ApiError(400, "Profile photo must be a JPG, PNG or WebP image"));
    cb(null, true);
  },
});

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!allowedTypes.includes(file.mimetype)) return cb(new ApiError(400, "Invalid file type"));
    cb(null, true);
  },
});

const courseAssetTypes = [
  ...allowedTypes,
  "video/mp4",
  "video/quicktime",
  "video/x-matroska",
  "text/vtt",
  "application/x-zip-compressed",
];

export const courseUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 250 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!courseAssetTypes.includes(file.mimetype)) return cb(new ApiError(400, "Unsupported course asset type"));
    cb(null, true);
  },
});
