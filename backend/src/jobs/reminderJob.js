import { Reminder, Notification } from "../models/index.js";

const DEFAULT_INTERVAL_MS = 60 * 1000;

export const runReminderSweep = async () => {
  const now = new Date();
  const reminders = await Reminder.find({
    remindAt: { $lte: now },
    sent: { $ne: true },
  }).limit(50);

  if (!reminders.length) return 0;

  await Notification.insertMany(
    reminders.map((reminder) => ({
      user: reminder.user,
      title: reminder.title || "Learning reminder",
      body: reminder.description || "You have a scheduled learning reminder.",
      type: "reminder",
    }))
  );

  await Reminder.updateMany(
    { _id: { $in: reminders.map((reminder) => reminder._id) } },
    { $set: { sent: true } }
  );

  return reminders.length;
};

export const startReminderJob = ({ intervalMs = DEFAULT_INTERVAL_MS } = {}) => {
  if (process.env.ENABLE_JOBS !== "true") return null;

  const timer = setInterval(() => {
    runReminderSweep().catch((error) => {
      console.error("Reminder job failed:", error.message);
    });
  }, intervalMs);

  return timer;
};
