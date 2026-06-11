import { Readable } from "node:stream";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { fileURLToPath } from "node:url";
import cloudinary from "../config/cloudinary.js";

const uploadsRoot = fileURLToPath(new URL("../../uploads/", import.meta.url));

export async function uploadBuffer(file, folder = "edupath") {
  if (!file) return null;
  if (!process.env.CLOUDINARY_CLOUD_NAME) {
    const safeFolder = folder.replace(/[^a-zA-Z0-9/_-]/g, "");
    const extension = path.extname(file.originalname).toLowerCase().replace(/[^a-z0-9.]/g, "");
    const filename = `${randomUUID()}${extension}`;
    const uploadDirectory = path.join(uploadsRoot, safeFolder);
    await mkdir(uploadDirectory, { recursive: true });
    await writeFile(path.join(uploadDirectory, filename), file.buffer);

    const publicPath = `/uploads/${safeFolder}/${filename}`.replace(/\\/g, "/");
    return { url: publicPath, publicId: `${safeFolder}/${filename}` };
  }

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({ folder, resource_type: "auto" }, (error, result) => {
      if (error) reject(error);
      else resolve({ url: result.secure_url, publicId: result.public_id });
    });
    Readable.from(file.buffer).pipe(stream);
  });
}

export async function deleteUploadedAsset({ url, publicId } = {}) {
  if (publicId && process.env.CLOUDINARY_CLOUD_NAME && !isLocalUploadUrl(url)) {
    await cloudinary.uploader.destroy(publicId, { resource_type: "image", invalidate: true });
    return true;
  }

  const uploadPath = localUploadPath(url || publicId);
  if (!uploadPath) return false;

  try {
    await unlink(uploadPath);
    return true;
  } catch (error) {
    if (error.code === "ENOENT") return false;
    throw error;
  }
}

function isLocalUploadUrl(value) {
  if (!value) return false;
  try {
    return new URL(value, "http://localhost").pathname.startsWith("/uploads/");
  } catch {
    return false;
  }
}

function localUploadPath(value) {
  if (!value) return null;

  let pathname;
  try {
    pathname = new URL(value, "http://localhost").pathname;
  } catch {
    return null;
  }

  const marker = "/uploads/";
  const markerIndex = pathname.indexOf(marker);
  if (markerIndex === -1) {
    const publicId = String(value).replace(/\\/g, "/").replace(/^\/+/, "");
    if (!publicId.startsWith("avatars/")) return null;
    pathname = `${marker}${publicId}`;
  }

  const relativePath = decodeURIComponent(pathname.slice(pathname.indexOf(marker) + marker.length));
  const resolvedPath = path.resolve(uploadsRoot, relativePath);
  const rootWithSeparator = `${path.resolve(uploadsRoot)}${path.sep}`;
  return resolvedPath.startsWith(rootWithSeparator) ? resolvedPath : null;
}
