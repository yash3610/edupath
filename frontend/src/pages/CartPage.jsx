import React from "react";

export default function CartPage() {
  return (
    <>
      <div className="ep-breadcrumbs breadcrumbs-bg background-image" style={{backgroundImage: 'url("/assets/images/breadcrumbs-bg.png")'}}>
                      <div className="container">
                        <div className="row justify-content-center">
                          <div className="col-lg-6 col-md-6 col-12">
                            <div className="ep-breadcrumbs__content">
                              <h3 className="ep-breadcrumbs__title">Shop Cart</h3>
                              <ul className="ep-breadcrumbs__menu">
                                <li>
                                  <a href="/">Home</a>
                                </li>
                                <li>
                                  <i className="fi-bs-angle-right" />
                                </li>
                                <li className="active">
                                  <a href="/cart">Cart</a>
                                </li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <section className="ep-cart section-gap">
                      <div className="container ep-container">
                        <div className="row">
                          <div className="col-12">
                            <div className="ep-cart__table-wrapper">
                              <table className="ep-cart__table">
                                <thead className="ep-cart__header">
                                  <tr className="ep-cart__header-row">
                                    <th className="ep-cart__header-item">Product</th>
                                    <th className="ep-cart__header-item">Price</th>
                                    <th className="ep-cart__header-item">Quantity</th>
                                    <th className="ep-cart__header-item">Subtotal</th>
                                    <th className="ep-cart__header-item">Remove</th>
                                  </tr>
                                </thead>
                                <tbody className="ep-cart__body">
                                  <tr className="ep-cart__item">
                                    <td className="ep-cart__product">
                                      <img className="ep-cart__product-image" src="/assets/images/product/cart-1.png" alt="Product Name" />
                                      <a href="#" className="ep-cart__product-name">Cosy Chair - Beige, Leather</a>
                                    </td>
                                    <td className="ep-cart__price">$298</td>
                                    <td className="ep-cart__quantity">
                                      <div className="ep-cart__quantity-selector">
                                        <button className="ep-cart__quantity-decrease">
                                          <svg width={16} height={17} viewBox="0 0 16 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M3.3291 8.5H12.6624" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round" />
                                          </svg>
                                        </button>
                                        <input type="number" className="ep-cart__quantity-input" defaultValue={1} min={1} />
                                        <button className="ep-cart__quantity-increase">
                                          <svg width={16} height={17} viewBox="0 0 16 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M7.99609 3.83203V13.1654" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round" />
                                            <path d="M3.3291 8.5H12.6624" strokeLinecap="round" strokeLinejoin="round" />
                                          </svg>
                                        </button>
                                      </div>
                                    </td>
                                    <td className="ep-cart__subtotal">$298</td>
                                    <td className="ep-cart__remove">
                                      <button className="ep-cart__remove-button">
                                        <svg width={25} height={25} viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                                          <path d="M18.4658 6.5L6.46582 18.5" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                                          <path d="M6.46582 6.5L18.4658 18.5" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                      </button>
                                    </td>
                                  </tr>
                                  <tr className="ep-cart__item">
                                    <td className="ep-cart__product">
                                      <img className="ep-cart__product-image" src="/assets/images/product/cart-2.png" alt="Product Name" />
                                      <a href="#" className="ep-cart__product-name">Cosy Chair - Beige, Leather</a>
                                    </td>
                                    <td className="ep-cart__price">$140</td>
                                    <td className="ep-cart__quantity">
                                      <div className="ep-cart__quantity-selector">
                                        <button className="ep-cart__quantity-decrease">
                                          <svg width={16} height={17} viewBox="0 0 16 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M3.3291 8.5H12.6624" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round" />
                                          </svg>
                                        </button>
                                        <input type="number" className="ep-cart__quantity-input" defaultValue={1} min={1} />
                                        <button className="ep-cart__quantity-increase">
                                          <svg width={16} height={17} viewBox="0 0 16 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M7.99609 3.83203V13.1654" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round" />
                                            <path d="M3.3291 8.5H12.6624" strokeLinecap="round" strokeLinejoin="round" />
                                          </svg>
                                        </button>
                                      </div>
                                    </td>
                                    <td className="ep-cart__subtotal">$140</td>
                                    <td className="ep-cart__remove">
                                      <button className="ep-cart__remove-button">
                                        <svg width={25} height={25} viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                                          <path d="M18.4658 6.5L6.46582 18.5" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                                          <path d="M6.46582 6.5L18.4658 18.5" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                      </button>
                                    </td>
                                  </tr>
                                  <tr className="ep-cart__item">
                                    <td className="ep-cart__product">
                                      <img className="ep-cart__product-image" src="/assets/images/product/cart-3.png" alt="Product Name" />
                                      <a href="#" className="ep-cart__product-name">Cosy Chair - Beige, Leather</a>
                                    </td>
                                    <td className="ep-cart__price">$58</td>
                                    <td className="ep-cart__quantity">
                                      <div className="ep-cart__quantity-selector">
                                        <button className="ep-cart__quantity-decrease">
                                          <svg width={16} height={17} viewBox="0 0 16 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M3.3291 8.5H12.6624" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round" />
                                          </svg>
                                        </button>
                                        <input type="number" className="ep-cart__quantity-input" defaultValue={1} min={1} />
                                        <button className="ep-cart__quantity-increase">
                                          <svg width={16} height={17} viewBox="0 0 16 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M7.99609 3.83203V13.1654" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round" />
                                            <path d="M3.3291 8.5H12.6624" strokeLinecap="round" strokeLinejoin="round" />
                                          </svg>
                                        </button>
                                      </div>
                                    </td>
                                    <td className="ep-cart__subtotal">$58</td>
                                    <td className="ep-cart__remove">
                                      <button className="ep-cart__remove-button">
                                        <svg width={25} height={25} viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                                          <path d="M18.4658 6.5L6.46582 18.5" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                                          <path d="M6.46582 6.5L18.4658 18.5" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                      </button>
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                            <div className="ep-cart__bottom">
                              <div className="ep-cart__coupon">
                                <input type="text" className="ep-cart__coupon-input" id="coupon_code" placeholder="Enter coupon code" />
                                <button className="ep-cart__coupon-button">
                                  Apply coupon
                                </button>
                              </div>
                              <div className="ep-cart__actions">
                                <button className="ep-cart__update-button">
                                  Update cart
                                </button>
                              </div>
                            </div>
                            <div className="ep-cart__summary">
                              <div className="ep-cart__summary-inside">
                                <div className="ep-cart__summary-body">
                                  <div className="ep-cart__heading">
                                    <h4 className="ep-cart__heading-title">Cart Totals</h4>
                                  </div>
                                  <div className="ep-cart__totals">
                                    <div className="ep-cart__totals-row">
                                      <span className="ep-cart__totals-label">Subtotal</span>
                                      <span className="ep-cart__totals-value">$1,298</span>
                                    </div>
                                    <div className="ep-cart__totals-row">
                                      <span className="ep-cart__totals-label">Total</span>
                                      <span className="ep-cart__totals-value">$3,298</span>
                                    </div>
                                  </div>
                                </div>
                                <button className="ep-cart__checkout-button">
                                  Proceed to checkout
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </section>
    </>
  );
}
