import dotenv from "dotenv";
import mongoose from "mongoose";
import connectDB from "../config/db.js";
import "../models/index.js";
import seedDatabase from "./seed.js";

dotenv.config();

const connected = await connectDB();
if (!connected) {
  process.exitCode = 1;
} else {
  const databaseName = mongoose.connection.db.databaseName;
  await mongoose.connection.db.dropDatabase();
  await Promise.all(Object.values(mongoose.models).map((model) => model.syncIndexes()));
  const result = await seedDatabase();
  console.log(`Reset MongoDB database: ${databaseName}`);
  console.log(`Seeded roles: ${result.admin.email}, ${result.instructor.email}, ${result.student.email}`);
  await mongoose.disconnect();
}
