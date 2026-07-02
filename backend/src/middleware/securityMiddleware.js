import cookieParser from "cookie-parser";
import cors from "cors";
import rateLimit from "express-rate-limit";
import helmet from "helmet";

function isPlainObject(value) {
  return Boolean(value) && Object.prototype.toString.call(value) === "[object Object]";
}

function stripMongoOperators(value, seen = new WeakSet()) {
  if (!value || typeof value !== "object") return;
  if (seen.has(value)) return;
  seen.add(value);

  if (Array.isArray(value)) {
    value.forEach((item) => stripMongoOperators(item, seen));
    return;
  }

  if (!isPlainObject(value)) return;

  Object.keys(value).forEach((key) => {
    if (key.startsWith("$") || key.includes(".")) {
      delete value[key];
      return;
    }
    stripMongoOperators(value[key], seen);
  });
}

function safeMongoSanitize(req, _res, next) {
  ["body", "query", "params"].forEach((key) => stripMongoOperators(req[key]));
  next();
}

export function applySecurity(app) {
  app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }));
  app.use(cors({ origin: (process.env.CLIENT_URL || "http://localhost:5173").split(","), credentials: true }));
  app.use(cookieParser());
  app.use(safeMongoSanitize);
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
