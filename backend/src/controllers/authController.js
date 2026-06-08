import crypto from "node:crypto";
import { User, StudentProfile, InstructorProfile } from "../models/index.js";
import { sendEmail } from "../services/emailService.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { signAccessToken, signRefreshToken } from "../utils/tokens.js";

function session(user) {
  return {
    user,
    accessToken: signAccessToken(user),
    refreshToken: signRefreshToken(user),
  };
}

export const register = asyncHandler(async (req, res) => {
  const { name, email, password, role = "student" } = req.body;
  if (!name || !email || !password) throw new ApiError(400, "Name, email and password are required");
  if (!["student", "instructor", "admin"].includes(role)) throw new ApiError(400, "Invalid role");

  const exists = await User.findOne({ email: email.toLowerCase() });
  if (exists) throw new ApiError(409, "User already exists");

  const user = new User({ name, email, role });
  await user.setPassword(password);
  await user.save();

  if (role === "student") await StudentProfile.create({ user: user._id });
  if (role === "instructor") await InstructorProfile.create({ user: user._id });

  res.status(201).json({ success: true, data: session(user) });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email: String(email || "").toLowerCase() });
  if (!user || !(await user.matchPassword(password || ""))) throw new ApiError(401, "Invalid email or password");

  res.json({ success: true, data: session(user) });
});

export const logout = asyncHandler(async (_req, res) => {
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");
  res.json({ success: true, message: "Logged out" });
});

export const refreshToken = asyncHandler(async (req, res) => {
  if (!req.user) throw new ApiError(401, "Authentication required");
  res.json({ success: true, data: session(req.user) });
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: String(req.body.email || "").toLowerCase() });
  if (user) {
    user.resetPasswordToken = crypto.randomBytes(24).toString("hex");
    user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000);
    await user.save();
    await sendEmail({ to: user.email, subject: "Reset your EduPath password", html: `<p>Token: ${user.resetPasswordToken}</p>` });
  }
  res.json({ success: true, message: "If the email exists, reset instructions were sent" });
});

export const resetPassword = asyncHandler(async (req, res) => {
  const user = await User.findOne({ resetPasswordToken: req.body.token, resetPasswordExpires: { $gt: new Date() } });
  if (!user) throw new ApiError(400, "Invalid or expired reset token");
  await user.setPassword(req.body.password);
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();
  res.json({ success: true, message: "Password reset successful" });
});

export const verifyEmail = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  user.emailVerified = true;
  await user.save();
  res.json({ success: true, message: "Email verified" });
});
