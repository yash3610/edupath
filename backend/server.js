import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import seedDatabase from "./config/seed.js";
import authRoutes from "./routes/authRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";
import newsletterRoutes from "./routes/newsletterRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import resourceRoutes from "./routes/resourceRoutes.js";
import { errorHandler, notFound } from "./middleware/errorMiddleware.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

const dbConnected = await connectDB();
if (dbConnected) {
  await seedDatabase();
}

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
  })
);
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", message: "Edupath API is running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/newsletter", newsletterRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/courses", resourceRoutes("courses"));
app.use("/api/blogs", resourceRoutes("blogs"));
app.use("/api/events", resourceRoutes("events"));
app.use("/api/products", resourceRoutes("products"));
app.use("/api/team", resourceRoutes("team"));
app.use(notFound);
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
