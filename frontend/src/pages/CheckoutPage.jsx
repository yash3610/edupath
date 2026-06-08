import React, { useState } from "react";
import { Link } from "react-router-dom";
import Breadcrumb from "../components/common/Breadcrumb.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useCart } from "../context/CartContext.jsx";
import { api } from "../services/api.js";

export default function CheckoutPage() {
  const { user } = useAuth();
  const { items, total, clearCart } = useCart();
  const [form, setForm] = useState({ customerName: user?.name || "", phone: "", address: "", paymentMethod: "bank-transfer" });
  const [status, setStatus] = useState({ loading: false, error: "", success: "", orderId: "" });

  function updateField(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setStatus({ loading: true, error: "", success: "", orderId: "" });
    try {
      const result = await api.order({
        ...form,
        items: items.map((item) => ({ courseId: item._id, quantity: 1 })),
      });
      clearCart();
      setStatus({ loading: false, error: "", success: result.message, orderId: result.data._id });
    } catch (error) {
      setStatus({ loading: false, error: error.message, success: "", orderId: "" });
    }
  }

  if (status.success) {
    return <><Breadcrumb title="Enrollment complete" /><section className="section-gap text-center"><div className="container"><h2>{status.success}</h2><p>Order reference: {status.orderId}</p><Link to="/course" className="ep-btn mg-top-20">Explore More Courses</Link></div></section></>;
  }

  return (
    <>
      <Breadcrumb title="Checkout" />
      <section className="ep-checkout section-gap">
        <div className="container ep-container">
          {items.length === 0 ? (
            <div className="text-center"><h3>No courses selected</h3><Link to="/course" className="ep-btn mg-top-20">Browse Courses</Link></div>
          ) : (
            <form className="ep-checkout__form" onSubmit={handleSubmit}>
              <div className="row gx-5">
                <div className="col-lg-8 col-12">
                  <div className="ep-checkout__section">
                    <h2 className="ep-checkout__section-title">Billing Information</h2>
                    <div className="ep-checkout__form-group"><label htmlFor="customerName">Full Name</label><input className="ep-checkout__input" id="customerName" name="customerName" value={form.customerName} onChange={updateField} required /></div>
                    <div className="ep-checkout__form-group"><label htmlFor="checkoutEmail">Email</label><input className="ep-checkout__input" id="checkoutEmail" value={user.email} disabled /></div>
                    <div className="ep-checkout__form-group"><label htmlFor="phone">Phone Number</label><input className="ep-checkout__input" id="phone" name="phone" value={form.phone} onChange={updateField} /></div>
                    <div className="ep-checkout__form-group"><label htmlFor="address">Billing Address</label><textarea className="ep-checkout__input" id="address" name="address" value={form.address} onChange={updateField} required /></div>
                    <div className="ep-checkout__form-group">
                      <label htmlFor="paymentMethod">Payment Method</label>
                      <select id="paymentMethod" name="paymentMethod" value={form.paymentMethod} onChange={updateField}>
                        <option value="bank-transfer">Direct Bank Transfer</option>
                        <option value="pay-later">Pay Later</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="col-lg-4 col-12">
                  <div className="ep-checkout__section ep-checkout__section--order">
                    <h2 className="ep-checkout__section-title">Order Summary</h2>
                    <div className="ep-checkout__summary">
                      {items.map((course) => <div className="ep-checkout__summary-item" key={course._id}><div className="ep-checkout__summary-item-name"><img src={course.image} alt="" /><span>{course.title}</span></div><span>${course.price}</span></div>)}
                    </div>
                    <div className="ep-cart__totals-row"><strong>Total</strong><strong>${total.toFixed(2)}</strong></div>
                    {status.error && <p className="form-message form-message--error" role="alert">{status.error}</p>}
                    <button className="ep-cart__checkout-button" type="submit" disabled={status.loading}>{status.loading ? "Submitting..." : "Place Enrollment Order"}</button>
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
