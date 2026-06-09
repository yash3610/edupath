import { Course, InstructorProfile, User } from "../models/index.js";
import { seedCourses } from "./seedData.js";

async function seedStaffAccount({ name, email, password, role }) {
  if (!email || !password) return null;

  const normalizedEmail = email.toLowerCase();
  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) return existingUser;

  const user = new User({
    name,
    email: normalizedEmail,
    role,
    status: "active",
    emailVerified: true,
  });
  await user.setPassword(password);
  await user.save();

  if (role === "instructor") {
    await InstructorProfile.create({
      user: user._id,
      headline: "EduPath Instructor",
      expertise: ["Online Teaching"],
    });
  }

  console.log(`Seeded ${role} account: ${normalizedEmail}`);
  return user;
}

export default async function seedDatabase() {
  await seedStaffAccount({
    name: process.env.SEED_ADMIN_NAME || "EduPath Admin",
    email: process.env.SEED_ADMIN_EMAIL,
    password: process.env.SEED_ADMIN_PASSWORD,
    role: "admin",
  });

  await seedStaffAccount({
    name: process.env.SEED_INSTRUCTOR_NAME || "EduPath Instructor",
    email: process.env.SEED_INSTRUCTOR_EMAIL,
    password: process.env.SEED_INSTRUCTOR_PASSWORD,
    role: "instructor",
  });

  const count = await Course.countDocuments();
  if (count === 0) await Course.insertMany(seedCourses);
}
