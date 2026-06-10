import { Readable } from "node:stream";
import { mkdir, writeFile } from "node:fs/promises";
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
    const baseUrl = process.env.API_PUBLIC_URL || `http://localhost:${process.env.PORT || 5000}`;
    return { url: `${baseUrl}${publicPath}`, publicId: `${safeFolder}/${filename}` };
  }

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({ folder, resource_type: "auto" }, (error, result) => {
      if (error) reject(error);
      else resolve({ url: result.secure_url, publicId: result.public_id });
    });
    Readable.from(file.buffer).pipe(stream);
  });
}
