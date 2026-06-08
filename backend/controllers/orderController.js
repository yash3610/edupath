import Order from "../models/Order.js";
import Course from "../models/Course.js";
import asyncHandler from "../utils/asyncHandler.js";

export const createOrder = asyncHandler(async (req, res) => {
  const { customerName, phone, address, paymentMethod, items = [] } = req.body;

  if (!customerName || !address || !Array.isArray(items) || items.length === 0) {
    res.status(400);
    throw new Error("Customer name, address and at least one course are required");
  }

  const courseIds = [...new Set(items.map((item) => String(item.courseId || "")))];
  const courses = await Course.find({ _id: { $in: courseIds } });

  if (courses.length !== courseIds.length) {
    res.status(400);
    throw new Error("One or more selected courses are invalid");
  }

  const requestedQuantities = new Map(
    items.map((item) => [String(item.courseId), Math.max(1, Math.min(10, Number(item.quantity) || 1))])
  );
  const verifiedItems = courses.map((course) => ({
    course: course._id,
    title: course.title,
    price: course.price,
    quantity: requestedQuantities.get(course._id.toString()) || 1,
  }));
  const total = verifiedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const order = await Order.create({
    user: req.user._id,
    customerName: String(customerName).trim(),
    email: req.user.email,
    phone: String(phone || "").trim(),
    address: String(address).trim(),
    items: verifiedItems,
    total,
    paymentMethod,
  });

  res.status(201).json({
    message: "Enrollment order submitted successfully.",
    data: order,
  });
});

export const listMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json({ data: orders });
});

export const listOrders = asyncHandler(async (_req, res) => {
  const orders = await Order.find({}).populate("user", "name email").sort({ createdAt: -1 });
  res.json({ data: orders });
});
