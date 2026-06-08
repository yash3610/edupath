import { apiRequest } from "./api.js";

export const paymentApi = {
  createOrder: (items) => apiRequest("/api/payments/create-order", {
    method: "POST",
    body: JSON.stringify({ items }),
  }),
  verifyPayment: (payload) => apiRequest("/api/payments/verify", {
    method: "POST",
    body: JSON.stringify(payload),
  }),
};

export function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}
