import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true },
    location: { type: String, trim: true, default: "" },
    image: { type: String, trim: true, default: "" },
    eventDate: { type: Date, default: Date.now },
    description: { type: String, trim: true, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model("Event", eventSchema);
