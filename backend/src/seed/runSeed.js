import dotenv from "dotenv";
import mongoose from "mongoose";
import connectDB from "../config/db.js";
import { User } from "../models/index.js";
import seedDatabase from "./seed.js";

dotenv.config();

const connected = await connectDB();
if (!connected) {
  process.exitCode = 1;
} else {
  await seedDatabase();
  const staffEmails = [process.env.SEED_ADMIN_EMAIL, process.env.SEED_INSTRUCTOR_EMAIL].filter(Boolean);
  const staff = await User.find({ email: { $in: staffEmails } }).select("email role status");
  staff.forEach((user) => console.log(`Verified ${user.role}: ${user.email} (${user.status})`));
  console.log("EduPath database seed completed");
  await mongoose.disconnect();
}
