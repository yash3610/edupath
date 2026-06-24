import crypto from "node:crypto";
import jwt from "jsonwebtoken";
import { User, StudentProfile, InstructorProfile } from "../models/index.js";
import { sendEmail } from "../services/emailService.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { signAccessToken, signRefreshToken } from "../utils/tokens.js";

const refreshCookieName = "edupath_refresh";

function refreshCookieOptions() {
  const secure = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure,
    sameSite: secure ? "none" : "lax",
    path: "/api/auth",
    maxAge: 30 * 24 * 60 * 60 * 1000,
  };
}

function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

async function createSession(user, res) {
  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);
  user.refreshTokenHash = hashToken(refreshToken);
  await user.save();
  res.cookie(refreshCookieName, refreshToken, refreshCookieOptions());
  return { user, accessToken };
}

function createAccessSession(user) {
  return { user, accessToken: signAccessToken(user) };
}

function clearRefreshCookie(res) {
  const { maxAge: _maxAge, ...options } = refreshCookieOptions();
  res.clearCookie(refreshCookieName, options);
}

export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  const role = "student";
  if (!name || !email || !password) throw new ApiError(400, "Name, email and password are required");
  if (req.body.role && req.body.role !== "student") throw new ApiError(403, "Instructor and admin accounts require administrator approval");

  const exists = await User.findOne({ email: email.toLowerCase() });
  if (exists) throw new ApiError(409, "User already exists");

  const user = new User({ name, email, role });
  await user.setPassword(password);
  await user.save();

  if (role === "student") await StudentProfile.create({ user: user._id });
  if (role === "instructor") await InstructorProfile.create({ user: user._id });

  res.status(201).json({ success: true, data: await createSession(user, res) });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password, role } = req.body;
  const user = await User.findOne({ email: String(email || "").toLowerCase() });
  if (!user || !(await user.matchPassword(password || ""))) throw new ApiError(401, "Invalid email or password");
  if (user.status !== "active") throw new ApiError(403, "This account is not active. Contact support.");
  if (user.role !== role) {
    const portal = role === "student" ? "student login" : `${role} login`;
    throw new ApiError(403, `This account cannot use the ${portal} portal.`);
  }

  res.json({ success: true, data: await createSession(user, res) });
});

export const me = asyncHandler(async (req, res) => {
  res.json({ success: true, data: { user: req.user } });
});

export const logout = asyncHandler(async (req, res) => {
  const token = req.cookies?.[refreshCookieName];
  if (token) {
    try {
      const payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
      await User.findByIdAndUpdate(payload.sub, { $unset: { refreshTokenHash: 1 } });
    } catch {
      // An invalid or expired cookie should still be cleared.
    }
  }
  clearRefreshCookie(res);
  res.json({ success: true, message: "Logged out" });
});

export const refreshToken = asyncHandler(async (req, res) => {
  const token = req.cookies?.[refreshCookieName];
  if (!token) throw new ApiError(401, "Session expired");

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  } catch {
    clearRefreshCookie(res);
    throw new ApiError(401, "Session expired");
  }
  if (payload.type !== "refresh") throw new ApiError(401, "Invalid refresh token");

  const user = await User.findById(payload.sub);
  if (!user || user.status !== "active" || !user.refreshTokenHash || user.refreshTokenHash !== hashToken(token)) {
    clearRefreshCookie(res);
    throw new ApiError(401, "Invalid or inactive session");
  }

  res.json({ success: true, data: createAccessSession(user) });
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
  user.refreshTokenHash = undefined;
  await user.save();
  clearRefreshCookie(res);
  res.json({ success: true, message: "Password reset successful" });
});

export const verifyEmail = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  user.emailVerified = true;
  await user.save();
  res.json({ success: true, message: "Email verified" });
});
