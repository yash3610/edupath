import React, { useState } from "react";
import { Link } from "react-router-dom";
import Breadcrumb from "../components/common/Breadcrumb.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useCart } from "../context/CartContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import { loadRazorpayScript, paymentApi } from "../services/paymentApi.js";
import { assetUrl } from "../services/api.js";

export default function CheckoutPage() {
  const { user } = useAuth();
  const { courseItems, productItems, courseTotal, clearCart } = useCart();
  const toast = useToast();
  const [form, setForm] = useState({ customerName: user?.name || "", phone: "", address: "" });
  const [status, setStatus] = useState({ loading: false, error: "", success: "", orderId: "" });

  function updateField(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!courseItems.length) return;
    setStatus({ loading: true, error: "", success: "", orderId: "" });

    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) throw new Error("Razorpay checkout could not be loaded. Check your internet connection.");

      const result = await paymentApi.createOrder(courseItems.map((item) => ({ courseId: item._id })));
      const order = result.data;

      if (order.free) {
        clearCart();
        setStatus({ loading: false, error: "", success: result.message, orderId: "FREE" });
        toast.success(result.message, "Enrollment complete");
        return;
      }

      if (!order.key) throw new Error("Razorpay key is missing on server. Add RAZORPAY_KEY_ID in backend .env.");

      const options = {
        key: order.key,
        amount: Math.round(Number(order.amount) * 100),
        currency: order.currency || "INR",
        name: "EduPath",
        description: `Enrollment for ${order.courses?.length || courseItems.length} course(s)`,
        order_id: order.razorpayOrderId,
        prefill: {
          name: form.customerName || user?.name,
          email: user?.email,
          contact: form.phone,
        },
        notes: {
          orderId: order.orderId,
          address: form.address,
        },
        theme: { color: "#ff6b35" },
        handler: async (response) => {
          try {
            const verifyResult = await paymentApi.verifyPayment({
              orderId: order.orderId,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });
            clearCart();
            setStatus({ loading: false, error: "", success: verifyResult.message, orderId: order.orderId });
            toast.success("Payment verified. Courses added to My Courses.", "Enrollment complete");
          } catch (error) {
            setStatus({ loading: false, error: error.message, success: "", orderId: "" });
            toast.error(error.message, "Payment verification failed");
          }
        },
        modal: {
          ondismiss: () => {
            setStatus({ loading: false, error: "Payment was cancelled.", success: "", orderId: "" });
            toast.warning("Payment was cancelled.");
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.on("payment.failed", (response) => {
        const message = response.error?.description || "Payment failed. Please try again.";
        setStatus({ loading: false, error: message, success: "", orderId: "" });
        toast.error(message, "Payment failed");
      });
      razorpay.open();
    } catch (error) {
      setStatus({ loading: false, error: error.message, success: "", orderId: "" });
      toast.error(error.message, "Checkout failed");
    }
  }

  if (status.success) {
    return (
      <>
        <Breadcrumb title="Enrollment complete" />
        <section className="section-gap text-center">
          <div className="container">
            <h2>{status.success}</h2>
            <p>Order reference: {status.orderId}</p>
            <div className="mg-top-20 d-flex justify-content-center gap-3 flex-wrap">
              <Link to="/dashboard/courses" className="ep-btn">Go to My Courses</Link>
              <Link to="/course" className="ep-btn ep-btn--secondary">Explore More Courses</Link>
            </div>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <Breadcrumb title="Checkout" />
      <section className="ep-checkout section-gap">
        <div className="container ep-container">
          {courseItems.length === 0 ? (
            <div className="text-center"><h3>No courses selected</h3><Link to="/course" className="ep-btn mg-top-20">Browse Courses</Link></div>
          ) : (
            <form className="ep-checkout__form" onSubmit={handleSubmit}>
              <div className="row gx-5">
                <div className="col-lg-8 col-12">
                  <div className="ep-checkout__section">
                    <h2 className="ep-checkout__section-title">Billing Information</h2>
                    <div className="ep-checkout__form-group"><label htmlFor="customerName">Full Name</label><input className="ep-checkout__input" id="customerName" name="customerName" value={form.customerName} onChange={updateField} required /></div>
                    <div className="ep-checkout__form-group"><label htmlFor="checkoutEmail">Email</label><input className="ep-checkout__input" id="checkoutEmail" value={user?.email || ""} disabled /></div>
                    <div className="ep-checkout__form-group"><label htmlFor="phone">Phone Number</label><input className="ep-checkout__input" id="phone" name="phone" value={form.phone} onChange={updateField} required /></div>
                    <div className="ep-checkout__form-group"><label htmlFor="address">Billing Address</label><textarea className="ep-checkout__input" id="address" name="address" value={form.address} onChange={updateField} required /></div>
                    <div className="rounded-3 border border-warning-subtle bg-warning-subtle p-3">
                      <strong>Secure payment:</strong> You will pay using Razorpay. Course enrollment is completed only after backend signature verification.
                    </div>
                  </div>
                </div>
                <div className="col-lg-4 col-12">
                  <div className="ep-checkout__section ep-checkout__section--order">
                    <h2 className="ep-checkout__section-title">Order Summary</h2>
                    <div className="ep-checkout__summary">
                      {courseItems.map((course) => <div className="ep-checkout__summary-item" key={course._id}><div className="ep-checkout__summary-item-name"><img src={assetUrl(course.image || course.thumbnail || course.cover) || "/assets/images/course/course-1/1.png"} alt="" /><span>{course.title}</span></div><span>Rs. {Number(course.price || 0).toFixed(2)}</span></div>)}
                    </div>
                    {productItems.length > 0 && <p className="cart-summary-note">Books stay in your cart. This checkout will process courses only.</p>}
                    <div className="ep-cart__totals-row"><strong>Total</strong><strong>Rs. {courseTotal.toFixed(2)}</strong></div>
                    {status.error && <p className="form-message form-message--error" role="alert">{status.error}</p>}
                    <button className="ep-cart__checkout-button" type="submit" disabled={status.loading}>{status.loading ? "Opening Razorpay..." : "Pay Securely with Razorpay"}</button>
                  </div>
                </div>
              </div>
            </form>
          )}
        </div>
      </section>
    </>
  );
}
