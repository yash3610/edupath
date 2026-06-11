import jwt from "jsonwebtoken";
import { User } from "../models/index.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";

export const protect = asyncHandler(async (req, _res, next) => {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : req.cookies?.accessToken;

  if (!token) throw new ApiError(401, "Authentication required");

  const payload = jwt.verify(token, process.env.JWT_SECRET);
  if (payload.type === "refresh") throw new ApiError(401, "Invalid access token");
  const user = await User.findById(payload.sub).select("-passwordHash");
  if (!user || user.status !== "active") throw new ApiError(401, "Invalid or inactive account");

  req.user = user;
  next();
});

export function authorize(...roles) {
  return (req, _res, next) => {
    if (!roles.includes(req.user?.role)) return next(new ApiError(403, "Access denied"));
    next();
  };
}
