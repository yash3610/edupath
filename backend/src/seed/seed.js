import { Course } from "../models/index.js";
import { seedCourses } from "./seedData.js";

export default async function seedDatabase() {
  const count = await Course.countDocuments();
  if (count === 0) await Course.insertMany(seedCourses);
}
