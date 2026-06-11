import cookieParser from "cookie-parser";
import cors from "cors";
import mongoSanitize from "express-mongo-sanitize";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import xss from "xss-clean";

export function applySecurity(app) {
  app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }));
  app.use(cors({ origin: (process.env.CLIENT_URL || "http://localhost:5173").split(","), credentials: true }));
  app.use(cookieParser());
  app.use(mongoSanitize());
  app.use(xss());
  app.use(
    "/api",
    rateLimit({
      windowMs: 15 * 60 * 1000,
      limit: 250,
      standardHeaders: "draft-7",
      legacyHeaders: false,
    })
  );
  app.use(
    "/api/auth",
    rateLimit({
      windowMs: 15 * 60 * 1000,
      limit: 30,
      standardHeaders: "draft-7",
      legacyHeaders: false,
    })
  );
}
