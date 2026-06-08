import mongoose from "mongoose";

mongoose.set("bufferCommands", false);

export default async function connectDB() {
  if (!process.env.MONGODB_URI) {
    console.warn("MONGODB_URI missing. Database connection skipped.");
    return false;
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB connected");
    return true;
  } catch (error) {
    console.error(`MongoDB connection failed: ${error.message}`);
    return false;
  }
}
