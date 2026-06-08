import mongoose from "mongoose";

const courseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true },
    category: { type: String, trim: true, default: "Education" },
    instructor: { type: String, trim: true, default: "" },
    price: { type: Number, default: 0 },
    rating: { type: Number, default: 5 },
    image: { type: String, trim: true, default: "" },
    description: { type: String, trim: true, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model("Course", courseSchema);
