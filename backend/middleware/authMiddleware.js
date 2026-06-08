import jwt from "jsonwebtoken";
import User from "../models/User.js";
import asyncHandler from "../utils/asyncHandler.js";

export const protect = asyncHandler(async (req, res, next) => {
  const authorization = req.headers.authorization || "";
  const token = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";

  if (!token) {
    res.status(401);
    throw new Error("Authentication required");
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.sub);

    if (!user) {
      res.status(401);
      throw new Error("User account no longer exists");
    }

    req.user = user;
    next();
  } catch (error) {
    if (res.statusCode !== 401) res.status(401);
    throw new Error(error.message === "jwt expired" ? "Session expired" : "Invalid authentication token");
  }
});

export function adminOnly(req, res, next) {
  if (req.user?.role !== "admin") {
    res.status(403);
    next(new Error("Admin access required"));
    return;
  }

  next();
}
