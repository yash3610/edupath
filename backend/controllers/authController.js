import User from "../models/User.js";
import asyncHandler from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";

function createSession(user) {
  return {
    user,
    token: jwt.sign(
      { sub: user._id.toString(), role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    ),
  };
}

export const registerUser = asyncHandler(async (req, res) => {
  const name = String(req.body.name || "").trim();
  const email = String(req.body.email || "").trim().toLowerCase();
  const password = String(req.body.password || "");

  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Name, email and password are required");
  }

  if (password.length < 8) {
    res.status(400);
    throw new Error("Password must be at least 8 characters");
  }

  const exists = await User.findOne({ email });
  if (exists) {
    res.status(409);
    throw new Error("User already exists");
  }

  const user = new User({ name, email });
  await user.setPassword(password);
  await user.save();

  res.status(201).json({
    message: "Account created successfully.",
    data: createSession(user),
  });
});

export const loginUser = asyncHandler(async (req, res) => {
  const email = String(req.body.email || "").trim().toLowerCase();
  const password = String(req.body.password || "");

  if (!email || !password) {
    res.status(400);
    throw new Error("Email and password are required");
  }

  const user = await User.findOne({ email });
  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error("Invalid email or password");
  }

  res.json({
    message: "Logged in successfully.",
    data: createSession(user),
  });
});

export const getCurrentUser = asyncHandler(async (req, res) => {
  res.json({ data: { user: req.user } });
});
