import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true },
    image: { type: String, trim: true, default: "" },
    price: { type: Number, default: 0 },
    oldPrice: { type: Number, default: 0 },
    category: { type: String, trim: true, default: "Book" },
    stock: { type: Number, default: 10 },
    description: { type: String, trim: true, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model("Product", productSchema);
