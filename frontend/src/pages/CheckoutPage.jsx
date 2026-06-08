import React from "react";

export default function CheckoutPage() {
  return (
    <>
      <div className="ep-breadcrumbs breadcrumbs-bg background-image" style={{backgroundImage: 'url("/assets/images/breadcrumbs-bg.png")'}}>
                      <div className="container">
                        <div className="row justify-content-center">
                          <div className="col-lg-6 col-md-6 col-12">
                            <div className="ep-breadcrumbs__content">
                              <h3 className="ep-breadcrumbs__title">Checkout</h3>
                              <ul className="ep-breadcrumbs__menu">
                                <li>
                                  <a href="/">Home</a>
                                </li>
                                <li>
                                  <i className="fi-bs-angle-right" />
                                </li>
                                <li className="active">
                                  <a href="/checkout">Checkout</a>
                                </li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <section className="ep-checkout section-gap">
                      <div className="container ep-container">
                        <div className="row">
                          <div className="col-lg-10 offset-lg-1 col-12">
                            <div className="ep-checkout__form-wrapper">
                              <form className="ep-checkout__form">
                                <div className="row gx-5">
                                  <div className="col-lg-8 col-md-8 col-12 mg-top-40">
                                    <div className="ep-checkout__section">
                                      <h2 className="ep-checkout__section-title">
                                        Billing Information
                                      </h2>
                                      <div className="row">
                                        <div className="col-lg-6 col-md-6 col-12">
                                          <div className="ep-checkout__form-group">
                                            <label className="ep-checkout__label" htmlFor="name">First ame</label>
                                            <input className="ep-checkout__input" type="text" id="name" name="name" placeholder="First name" required />
                                          </div>
                                        </div>
                                        <div className="col-lg-6 col-md-6 col-12">
                                          <div className="ep-checkout__form-group">
                                            <label className="ep-checkout__label" htmlFor="name">Last name</label>
                                            <input className="ep-checkout__input" type="text" id="name" name="name" placeholder="Last name" required />
                                          </div>
                                        </div>
                                        <div className="col-12">
                                          <div className="ep-checkout__form-group">
                                            <label className="ep-checkout__label" htmlFor="name">Company name (optional)</label>
                                            <input className="ep-checkout__input" type="text" id="name" name="name" placeholder="Company name" />
                                          </div>
                                        </div>
                                        <div className="col-12">
                                          <div className="ep-checkout__form-group">
                                            <label className="ep-checkout__label" htmlFor="name">Country</label>
                                            <select>
                                              <option>
                                                Select Country
                                              </option>
                                              <option value="af">Afghanistan</option>
                                              <option value="au">Australia</option>
                                              <option value="ca">Canada</option>
                                              <option value="cn">China</option>
                                              <option value="fr">France</option>
                                              <option value="de">Germany</option>
                                              <option value="in">India</option>
                                              <option value="jp">Japan</option>
                                              <option value="ng">Nigeria</option>
                                              <option value="us">United States</option>
                                            </select>
                                          </div>
                                        </div>
                                        <div className="col-12">
                                          <div className="ep-checkout__form-group">
                                            <label className="ep-checkout__label" htmlFor="address">Address</label>
                                            <input className="ep-checkout__input" type="text" id="address" name="address" placeholder="Address" required />
                                          </div>
                                        </div>
                                        <div className="col-12">
                                          <div className="ep-checkout__form-group">
                                            <label className="ep-checkout__label" htmlFor="address">Town / City</label>
                                            <input className="ep-checkout__input" type="text" id="address" name="address" placeholder="Twon / City" required />
                                          </div>
                                        </div>
                                        <div className="col-12">
                                          <div className="ep-checkout__form-group">
                                            <label className="ep-checkout__label" htmlFor="address">State</label>
                                            <input className="ep-checkout__input" type="text" id="address" name="address" placeholder="State" required />
                                          </div>
                                        </div>
                                        <div className="col-12">
                                          <div className="ep-checkout__form-group">
                                            <label className="ep-checkout__label" htmlFor="address">Zip code</label>
                                            <input className="ep-checkout__input" type="text" id="address" name="address" placeholder="Zip code" required />
                                          </div>
                                        </div>
                                        <div className="col-12">
                                          <div className="ep-checkout__form-group">
                                            <label className="ep-checkout__label" htmlFor="address">Phone Number</label>
                                            <input className="ep-checkout__input" type="text" id="address" name="address" placeholder="Phone" required />
                                          </div>
                                        </div>
                                        <div className="col-12">
                                          <div className="ep-checkout__form-group">
                                            <label className="ep-checkout__label" htmlFor="address">Zip code</label>
                                            <input className="ep-checkout__input" type="text" id="address" name="address" placeholder="Zip code" required />
                                          </div>
                                        </div>
                                        <div className="col-12">
                                          <div className="ep-checkout__form-group">
                                            <label className="ep-checkout__label" htmlFor="address">Email Address</label>
                                            <input className="ep-checkout__input" type="text" id="address" name="email" placeholder="Email Address" required />
                                          </div>
                                        </div>
                                        <div className="col-12">
                                          <div className="ep-checkout__form-group">
                                            <label className="ep-checkout__label" htmlFor="address">Order Notes</label>
                                            <textarea className="ep-checkout__input" type="text" id="address" name="email" placeholder="Notes about your order, e.g. special notes for delivery." required defaultValue={""} />
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="col-lg-4 col-md-4 col-12 mg-top-40">
                                    <div className="ep-checkout__section ep-checkout__section--order">
                                      <h2 className="ep-checkout__section-title">
                                        Order Summary
                                      </h2>
                                      <div className="ep-checkout__summary">
                                        <div className="ep-checkout__summary-item">
                                          <div className="ep-checkout__summary-item-name">
                                            <img src="/assets/images/product/1.png" />
                                            <a href="#">World History: Ancient to Modern Times</a>
                                          </div>
                                          <span className="ep-checkout__summary-item-price">$20.00</span>
                                        </div>
                                        <div className="ep-checkout__summary-item">
                                          <div className="ep-checkout__summary-item-name">
                                            <img src="/assets/images/product/2.png" />
                                            <a href="#">Environmental Science and Sustainability</a>
                                          </div>
                                          <span className="ep-checkout__summary-item-price">$20.00</span>
                                        </div>
                                        <div className="ep-checkout__summary-item">
                                          <div className="ep-checkout__summary-item-name">
                                            <img src="/assets/images/product/3.png" />
                                            <a href="#">Modern Physics: Concepts and
                                              Applications</a>
                                          </div>
                                          <span className="ep-checkout__summary-item-price">$20.00</span>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="ep-payment-infos mg-top-40">
                                      <div className="ep-cart__summary-body">
                                        <div className="ep-cart__heading">
                                          <h4 className="ep-cart__heading-title">
                                            Cart Totals
                                          </h4>
                                        </div>
                                        <div className="ep-cart__totals">
                                          <div className="ep-cart__totals-row">
                                            <span className="ep-cart__totals-label">Subtotal</span>
                                            <span className="ep-cart__totals-value">$1,298</span>
                                          </div>
                                          <div className="ep-cart__totals-row">
                                            <span className="ep-cart__totals-label">Shipping</span>
                                            <span className="ep-cart__totals-value">Free</span>
                                          </div>
                                          <div className="ep-cart__totals-row">
                                            <span className="ep-cart__totals-label">Total</span>
                                            <span className="ep-cart__totals-value">$3,298</span>
                                          </div>
                                        </div>
                                        <div className="ep-cart__heading">
                                          <h4 className="ep-cart__heading-title">
                                            Choose a Payment Method
                                          </h4>
                                        </div>
                                        <div className="accordion ep-payment-accordion" id="paymentAccordion">
                                          <div className="accordion-item">
                                            <h2 className="accordion-header" id="headingOne">
                                              <button className="accordion-button d-flex justify-content-between" type="button" aria-expanded="true" aria-controls="collapseOne">
                                                <input type="radio" className="form-check-input payment-checkbox" name="paymentMethod" defaultChecked />
                                                <span>
                                                  <span className="pm-check" />Direct
                                                  Bank Transfer
                                                </span>
                                              </button>
                                            </h2>
                                            <div id="collapseOne" className="accordion-collapse collapse show" aria-labelledby="headingOne" data-bs-parent="#paymentAccordion">
                                              <div className="accordion-body">
                                                Make your payment directly into our bank
                                                account. Please use your Order ID as the
                                                payment reference. Your order will not be
                                                shipped until the funds have cleared in
                                                our account.
                                              </div>
                                            </div>
                                          </div>
                                          <div className="accordion-item">
                                            <h2 className="accordion-header" id="headingTwo">
                                              <button className="accordion-button collapsed d-flex justify-content-between" type="button" aria-expanded="false" aria-controls="collapseTwo">
                                                <input type="radio" className="form-check-input payment-checkbox" name="paymentMethod" />
                                                <span>
                                                  <span className="pm-check" />Check
                                                  Payments
                                                </span>
                                              </button>
                                            </h2>
                                            <div id="collapseTwo" className="accordion-collapse collapse" aria-labelledby="headingTwo" data-bs-parent="#paymentAccordion">
                                              <div className="accordion-body">
                                                Please send a check to Store Name, Store
                                                Street, Store Town, Store State / County,
                                                Store Postcode.
                                              </div>
                                            </div>
                                          </div>
                                          <div className="accordion-item">
                                            <h2 className="accordion-header" id="headingThree">
                                              <button className="accordion-button collapsed d-flex justify-content-between" type="button" aria-expanded="false" aria-controls="collapseThree">
                                                <input type="radio" className="form-check-input payment-checkbox" name="paymentMethod" />
                                                <span>
                                                  <span className="pm-check" />Cash on
                                                  Delivery
                                                </span>
                                              </button>
                                            </h2>
                                            <div id="collapseThree" className="accordion-collapse collapse" aria-labelledby="headingThree" data-bs-parent="#paymentAccordion">
                                              <div className="accordion-body">
                                                Pay with cash upon delivery.
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                      <button className="ep-cart__checkout-button">
                                        Order Now
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </form>
                            </div>
                          </div>
                        </div>
                      </div>
                    </section>
    </>
  );
}
