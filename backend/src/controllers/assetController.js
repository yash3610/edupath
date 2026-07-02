import mongoose from "mongoose";
import { UploadAsset } from "../models/index.js";
import { localAssetPath } from "../services/uploadService.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";

export const uploadedAsset = asyncHandler(async (req, res) => {
  if (!mongoose.isObjectIdOrHexString(req.params.assetId)) throw new ApiError(404, "Asset not found");
  const asset = await UploadAsset.findById(req.params.assetId).lean();
  if (!asset) throw new ApiError(404, "Asset not found");
  if (!["image/jpeg", "image/png", "image/webp"].includes(asset.mimeType)) throw new ApiError(403, "Asset type is not viewable");

  const filePath = localAssetPath(asset);
  if (!filePath) throw new ApiError(404, "Asset file not found");

  res.setHeader("Content-Type", asset.mimeType);
  res.setHeader("Content-Length", asset.size);
  res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.sendFile(filePath);
});
