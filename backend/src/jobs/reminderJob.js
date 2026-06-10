import { LiveClass, Reminder, Notification } from "../models/index.js";
import { enrolledStudentIds, notifyUsers } from "../services/liveClassService.js";

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
      message: reminder.description || "You have a scheduled learning reminder.",
      type: "reminder",
    }))
  );

  await Reminder.updateMany(
    { _id: { $in: reminders.map((reminder) => reminder._id) } },
    { $set: { sent: true } }
  );

  return reminders.length;
};

export const runLiveClassReminderSweep = async () => {
  const now = new Date();
  const horizon = new Date(now.getTime() + 24 * 60 * 60000 + 60000);
  const classes = await LiveClass.find({
    status: { $in: ["scheduled", "starting-soon"] },
    startAt: { $gte: new Date(now.getTime() - 15 * 60000), $lte: horizon },
  });

  let sent = 0;
  for (const liveClass of classes) {
    const minutes = Math.round((new Date(liveClass.startAt) - now) / 60000);
    const students = await enrolledStudentIds(liveClass.course);
    const reminders = [
      ["before24Hours", 24 * 60, 30, liveClass.reminderSettings?.before24Hours, "Live class tomorrow"],
      ["before1Hour", 60, 5, liveClass.reminderSettings?.before1Hour, "Live class in 1 hour"],
      ["before10Minutes", 10, 2, liveClass.reminderSettings?.before10Minutes, "Live class starts soon"],
    ];

    for (const [key, target, tolerance, enabled, title] of reminders) {
      if (!enabled || liveClass.remindersSent?.[key] || minutes > target || minutes < target - tolerance) continue;
      await notifyUsers(students, { title, message: `${liveClass.title} starts at ${liveClass.startAt.toLocaleString()}.`, email: key !== "before10Minutes" });
      liveClass.remindersSent = { ...(liveClass.remindersSent?.toObject?.() || liveClass.remindersSent || {}), [key]: true };
      sent += 1;
    }

    if (minutes <= 10 && minutes > 0 && liveClass.status === "scheduled") liveClass.status = "starting-soon";
    if (minutes <= 0 && minutes >= -15 && !liveClass.remindersSent?.started) {
      await notifyUsers(students, { title: "Live class is starting", message: `${liveClass.title} is ready to join.` });
      liveClass.remindersSent = { ...(liveClass.remindersSent?.toObject?.() || liveClass.remindersSent || {}), started: true };
      sent += 1;
    }
    await liveClass.save();
  }
  return sent;
};

export const startReminderJob = ({ intervalMs = DEFAULT_INTERVAL_MS } = {}) => {
  if (process.env.ENABLE_JOBS !== "true") return null;

  const timer = setInterval(() => {
    Promise.all([runReminderSweep(), runLiveClassReminderSweep()]).catch((error) => {
      console.error("Reminder job failed:", error.message);
    });
  }, intervalMs);

  return timer;
};
