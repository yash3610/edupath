import dotenv from "dotenv";
import app from "./app.js";
import connectDB from "./config/db.js";
import { startReminderJob } from "./jobs/reminderJob.js";
import seedDatabase from "./seed/seed.js";

dotenv.config();

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  throw new Error("JWT_SECRET must be set to a random value of at least 32 characters");
}
if (!process.env.JWT_REFRESH_SECRET || process.env.JWT_REFRESH_SECRET.length < 32) {
  throw new Error("JWT_REFRESH_SECRET must be set to a different random value of at least 32 characters");
}
if (process.env.JWT_REFRESH_SECRET === process.env.JWT_SECRET) {
  throw new Error("JWT_REFRESH_SECRET must be different from JWT_SECRET");
}

const port = process.env.PORT || 5000;
const connected = await connectDB();
if (connected && process.env.SEED_DATABASE !== "false") {
  await seedDatabase();
}
if (connected) {
  startReminderJob();
}

app.listen(port, () => {
  console.log(`EduPath LMS API running on port ${port}`);
});
