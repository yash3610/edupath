import mongoose from "mongoose";

const blogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true },
    author: { type: String, trim: true, default: "Edupath" },
    image: { type: String, trim: true, default: "" },
    excerpt: { type: String, trim: true, default: "" },
    content: { type: String, trim: true, default: "" },
    publishedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model("Blog", blogSchema);
