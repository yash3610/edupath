import React from "react";
import { Link } from "react-router-dom";
import Breadcrumb from "../components/common/Breadcrumb.jsx";
import { useCart } from "../context/CartContext.jsx";

export default function CartPage() {
  const { items, removeCourse, total } = useCart();

  return (
    <>
      <Breadcrumb title="Course Cart" />
      <section className="ep-cart section-gap">
        <div className="container ep-container">
          {items.length === 0 ? (
            <div className="empty-state text-center">
              <h3>Your course cart is empty</h3>
              <p>Browse our courses and add one to continue.</p>
              <Link to="/course" className="ep-btn mg-top-20">Browse Courses</Link>
            </div>
          ) : (
            <div className="row">
              <div className="col-lg-8 col-12">
                <div className="ep-cart__table">
                  {items.map((course) => (
                    <div className="cart-course-row" key={course._id}>
                      <img src={course.image} alt={course.title} />
                      <div className="cart-course-info">
                        <Link to={`/course/${course.slug}`}><h5>{course.title}</h5></Link>
                        <span>{course.instructor}</span>
                      </div>
                      <strong>₹{Number(course.price || 0).toFixed(2)}</strong>
                      <button type="button" className="cart-remove-button" onClick={() => removeCourse(course._id)} aria-label={`Remove ${course.title}`}>Remove</button>
                    </div>
                  ))}
                </div>
              </div>
              <div className="col-lg-4 col-12">
                <div className="ep-cart__summary">
                  <div className="ep-cart__heading"><h4 className="ep-cart__heading-title">Cart Totals</h4></div>
                  <div className="ep-cart__totals">
                    <div className="ep-cart__totals-row"><span>Courses</span><span>{items.length}</span></div>
                    <div className="ep-cart__totals-row"><span>Total</span><strong>₹{total.toFixed(2)}</strong></div>
                  </div>
                  <Link to="/checkout" className="ep-cart__checkout-button cart-checkout-link">Proceed to checkout</Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
