import express from "express";
import morgan from "morgan";
import { fileURLToPath } from "node:url";
import adminRoutes from "./routes/adminRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import assignmentRoutes from "./routes/assignmentRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import calendarRoutes from "./routes/calendarRoutes.js";
import certificateRoutes from "./routes/certificateRoutes.js";
import communityRoutes from "./routes/communityRoutes.js";
import enrollmentRoutes from "./routes/enrollmentRoutes.js";
import instructorRoutes from "./routes/instructorRoutes.js";
import learningRoutes from "./routes/learningRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import mlRoutes from "./routes/mlRoutes.js";
import noteRoutes from "./routes/noteRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import publicRoutes from "./routes/publicRoutes.js";
import quizRoutes from "./routes/quizRoutes.js";
import settingsRoutes from "./routes/settingsRoutes.js";
import studentRoutes from "./routes/studentRoutes.js";
import wishlistRoutes from "./routes/wishlistRoutes.js";
import dashboardDataRoutes from "./routes/dashboardDataRoutes.js";
import { errorHandler, notFound } from "./middleware/errorMiddleware.js";
import { applySecurity } from "./middleware/securityMiddleware.js";

const app = express();

applySecurity(app);
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use("/uploads", express.static(fileURLToPath(new URL("../uploads/", import.meta.url))));
if (process.env.NODE_ENV !== "production") app.use(morgan("dev"));

app.get("/api/health", (_req, res) => {
  res.json({ success: true, status: "ok", message: "EduPath LMS API is running" });
});

app.use("/api", publicRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/learning", learningRoutes);
app.use("/api/notes", noteRoutes);
app.use("/api/quizzes", quizRoutes);
app.use("/api/assignments", assignmentRoutes);
app.use("/api/certificates", certificateRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/calendar", calendarRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/ml", mlRoutes);
app.use("/api/community", communityRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/enrollments", enrollmentRoutes);
app.use("/api/instructor", instructorRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/dashboard-data", dashboardDataRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
