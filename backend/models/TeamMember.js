import mongoose from "mongoose";

const teamMemberSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true },
    role: { type: String, trim: true, default: "Instructor" },
    image: { type: String, trim: true, default: "" },
    bio: { type: String, trim: true, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model("TeamMember", teamMemberSchema);
