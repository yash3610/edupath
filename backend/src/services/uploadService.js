import { Readable } from "node:stream";
import cloudinary from "../config/cloudinary.js";

export async function uploadBuffer(file, folder = "edupath") {
  if (!file) return null;
  if (!process.env.CLOUDINARY_CLOUD_NAME) {
    return { url: `local://${folder}/${file.originalname}`, publicId: file.originalname };
  }

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({ folder, resource_type: "auto" }, (error, result) => {
      if (error) reject(error);
      else resolve({ url: result.secure_url, publicId: result.public_id });
    });
    Readable.from(file.buffer).pipe(stream);
  });
}
