import crypto from "node:crypto";
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
    },
    passwordHash: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["student", "admin"],
      default: "student",
    },
  },
  { timestamps: true }
);

userSchema.methods.setPassword = function setPassword(password) {
  this.passwordHash = crypto.createHash("sha256").update(password).digest("hex");
};

userSchema.methods.matchPassword = function matchPassword(password) {
  return this.passwordHash === crypto.createHash("sha256").update(password).digest("hex");
};

userSchema.methods.toJSON = function toJSON() {
  const user = this.toObject();
  delete user.passwordHash;
  return user;
};

export default mongoose.model("User", userSchema);
