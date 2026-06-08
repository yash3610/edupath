import mongoose from "mongoose";

mongoose.set("bufferCommands", false);

export default async function connectDB() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.warn("MONGODB_URI is not set. Database connection skipped.");
    return false;
  }

  try {
    await mongoose.connect(uri);
    console.log("MongoDB connected");
    return true;
  } catch (error) {
    console.error(`MongoDB connection failed: ${error.message}`);
    console.warn("Server will continue running. Start MongoDB to enable database-backed APIs.");
    return false;
  }
}
