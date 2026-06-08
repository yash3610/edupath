import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
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

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  throw new Error("JWT_SECRET must be set to a random value of at least 32 characters");
}

const dbConnected = await connectDB();
if (dbConnected) {
  await seedDatabase();
}

app.use(
  cors({
    origin: (process.env.CLIENT_URL || "http://localhost:5173").split(","),
    credentials: false,
  })
);
app.use(helmet());
app.use(express.json({ limit: "100kb" }));
app.use(
  "/api",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 200,
    standardHeaders: "draft-7",
    legacyHeaders: false,
  })
);
app.use(
  "/api/auth",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 20,
    standardHeaders: "draft-7",
    legacyHeaders: false,
  })
);

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
