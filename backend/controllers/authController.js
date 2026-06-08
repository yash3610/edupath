import User from "../models/User.js";
import asyncHandler from "../utils/asyncHandler.js";

function createSession(user) {
  return {
    user,
    token: Buffer.from(`${user._id}:${user.email}`).toString("base64"),
  };
}

export const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Name, email and password are required");
  }

  if (password.length < 6) {
    res.status(400);
    throw new Error("Password must be at least 6 characters");
  }

  const exists = await User.findOne({ email });
  if (exists) {
    res.status(409);
    throw new Error("User already exists");
  }

  const user = new User({ name, email });
  user.setPassword(password);
  await user.save();

  res.status(201).json({
    message: "Account created successfully.",
    data: createSession(user),
  });
});

export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error("Email and password are required");
  }

  const user = await User.findOne({ email });
  if (!user || !user.matchPassword(password)) {
    res.status(401);
    throw new Error("Invalid email or password");
  }

  res.json({
    message: "Logged in successfully.",
    data: createSession(user),
  });
});
