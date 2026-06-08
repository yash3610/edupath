import Order from "../models/Order.js";
import asyncHandler from "../utils/asyncHandler.js";

export const createOrder = asyncHandler(async (req, res) => {
  const { customerName, email, phone, address, items = [] } = req.body;

  if (!customerName || !email || !address) {
    res.status(400);
    throw new Error("Customer name, email and address are required");
  }

  const total = items.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 1), 0);
  const order = await Order.create({ customerName, email, phone, address, items, total });

  res.status(201).json({
    message: "Order submitted successfully.",
    data: order,
  });
});

export const listOrders = asyncHandler(async (_req, res) => {
  const orders = await Order.find({}).sort({ createdAt: -1 });
  res.json({ data: orders });
});
