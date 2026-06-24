import React from "react";
import { Link } from "react-router-dom";
import Breadcrumb from "../components/common/Breadcrumb.jsx";
import { useCart } from "../context/CartContext.jsx";

function itemPath(item) {
  if ((item.type || "course") === "course") return `/course/${item.slug}`;
  return "/shop-single";
}

function itemTypeLabel(item) {
  return (item.type || "course") === "course" ? "Course" : "Book";
}

export default function CartPage() {
  const { items, courseItems, productItems, removeItem, total, courseTotal } = useCart();

  return (
    <>
      <Breadcrumb title="Cart" />
      <section className="ep-cart section-gap">
        <div className="container ep-container">
          {items.length === 0 ? (
            <div className="cart-empty-state text-center">
              <div className="cart-empty-icon"><i className="fi fi-rr-shopping-cart" /></div>
              <h3>Your cart is empty</h3>
              <p>Add a course or learning book and it will appear here.</p>
              <div className="cart-empty-actions">
                <Link to="/course" className="ep-btn">Browse Courses</Link>
                <Link to="/shop" className="ep-btn ep-btn--secondary">Browse Books</Link>
              </div>
            </div>
          ) : (
            <div className="row g-4">
              <div className="col-lg-8 col-12">
                <div className="cart-items-panel">
                  <div className="cart-panel-header">
                    <div>
                      <span className="cart-eyebrow">Learning cart</span>
                      <h3>{items.length} item{items.length > 1 ? "s" : ""} selected</h3>
                    </div>
                    <Link to="/course" className="cart-text-link">Add more</Link>
                  </div>

                  <div className="cart-items-list">
                    {items.map((item) => (
                      <article className="cart-item-card" key={item._id}>
                        <Link to={itemPath(item)} className="cart-item-image">
                          <img src={item.image || item.thumbnail || "/assets/images/product/book-cover.jpg"} alt={item.title} />
                        </Link>
                        <div className="cart-item-body">
                          <div className="cart-item-main">
                            <span className="cart-item-type">{itemTypeLabel(item)}</span>
                            <Link to={itemPath(item)} className="cart-item-title">{item.title}</Link>
                            <p>{item.instructor || item.author || item.category || "EduPath"}</p>
                            {(item.type || "course") !== "course" && <small>Books are saved in cart. Online checkout for books is coming soon.</small>}
                          </div>
                          <div className="cart-item-actions">
                            <strong>Rs. {Number(item.price || 0).toFixed(2)}</strong>
                            <button type="button" className="cart-remove-button" onClick={() => removeItem(item._id)} aria-label={`Remove ${item.title}`}>
                              <i className="fi fi-rr-trash" /> Remove
                            </button>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              </div>
              <div className="col-lg-4 col-12">
                <aside className="cart-summary-card">
                  <span className="cart-eyebrow">Summary</span>
                  <h4>Cart Totals</h4>
                  <div className="cart-summary-row"><span>Courses</span><strong>{courseItems.length}</strong></div>
                  <div className="cart-summary-row"><span>Books</span><strong>{productItems.length}</strong></div>
                  <div className="cart-summary-row"><span>Cart total</span><strong>Rs. {total.toFixed(2)}</strong></div>
                  <div className="cart-summary-total"><span>Checkout total</span><strong>Rs. {courseTotal.toFixed(2)}</strong></div>
                  {productItems.length > 0 && <p className="cart-summary-note">Book checkout is not enabled yet, so checkout will include courses only.</p>}
                  {courseItems.length > 0 ? (
                    <Link to="/checkout" className="cart-checkout-link">Proceed to checkout</Link>
                  ) : (
                    <Link to="/course" className="cart-checkout-link">Add a course to checkout</Link>
                  )}
                  <Link to="/shop" className="cart-secondary-link">Continue shopping books</Link>
                </aside>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
