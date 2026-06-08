import crypto from "node:crypto";
import razorpay from "../config/razorpay.js";

export async function createRazorpayOrder({ amount, currency = "INR", receipt }) {
  if (!process.env.RAZORPAY_KEY_ID) {
    return { id: `order_mock_${Date.now()}`, amount, currency, receipt, mock: true };
  }

  return razorpay.orders.create({ amount: Math.round(amount * 100), currency, receipt });
}

export function verifyRazorpaySignature({ razorpayOrderId, razorpayPaymentId, razorpaySignature }) {
  const secret = process.env.RAZORPAY_KEY_SECRET || "rzp_test_secret";
  const body = `${razorpayOrderId}|${razorpayPaymentId}`;
  const expected = crypto.createHmac("sha256", secret).update(body).digest("hex");
  return expected === razorpaySignature;
}
