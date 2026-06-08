import React from "react";

export default function ShopPage() {
  return (
    <>
      <div className="ep-breadcrumbs breadcrumbs-bg background-image" style={{backgroundImage: 'url("/assets/images/breadcrumbs-bg.png")'}}>
                      <div className="container">
                        <div className="row justify-content-center">
                          <div className="col-lg-6 col-md-6 col-12">
                            <div className="ep-breadcrumbs__content">
                              <h3 className="ep-breadcrumbs__title">All Products</h3>
                              <ul className="ep-breadcrumbs__menu">
                                <li>
                                  <a href="/">Home</a>
                                </li>
                                <li>
                                  <i className="fi-bs-angle-right" />
                                </li>
                                <li className="active">
                                  <a href="/shop">Products</a>
                                </li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <section className="ep-product section-gap position-relative section-bg-1">
                      <div className="container ep-container">
                        <div className="row">
                          <div className="col-12">
                            <div className="ep-product__filter">
                              <p className="ep-product__filter-result">
                                Showing <strong>9 <span>of</span> 50 </strong> Products
                              </p>
                              <div className="ep-product__filter-select">
                                <select>
                                  <option>Sort By</option>
                                  <option value={1}>Latest Product</option>
                                  <option value={2}>Trending Product</option>
                                  <option value={3}>Price Low to High</option>
                                  <option value={4}>Price High to Low</option>
                                </select>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="row">
                          <div className="col-lg-4 col-md-6 col-12">
                            <div className="ep-product__card wow fadeInUp" data-wow-delay=".3s">
                              <div className="ep-product__img">
                                <img src="/assets/images/product/1.png" alt="product-img" />
                              </div>
                              <div className="ep-product__label">
                                <span className="discount">50% Discount</span>
                              </div>
                              <div className="ep-product__info">
                                <ul className="ep-product__rattings">
                                  <li>
                                    <i className="icofont-star" />
                                  </li>
                                  <li>
                                    <i className="icofont-star" />
                                  </li>
                                  <li>
                                    <i className="icofont-star" />
                                  </li>
                                  <li>
                                    <i className="icofont-star" />
                                  </li>
                                  <li>
                                    <i className="icofont-star off-color" />
                                  </li>
                                  <li>
                                    <span>(5.0/ 2 Ratings)</span>
                                  </li>
                                </ul>
                                <a href="/shop-single" className="ep-product__title">
                                  <h5>World History: Ancient to Modern Times</h5>
                                </a>
                                <div className="ep-product__info-bottom">
                                  <a href="/cart" className="ep-product__btn">Add to cart
                                    <i className="fi fi-rs-arrow-small-right" />
                                  </a>
                                  <div className="ep-product__price">
                                    <del>$100.00</del>
                                    <span>$50.00</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="col-lg-4 col-md-6 col-12">
                            <div className="ep-product__card wow fadeInUp" data-wow-delay=".5s">
                              <div className="ep-product__img">
                                <img src="/assets/images/product/2.png" alt="product-img" />
                              </div>
                              <div className="ep-product__info">
                                <ul className="ep-product__rattings">
                                  <li>
                                    <i className="icofont-star" />
                                  </li>
                                  <li>
                                    <i className="icofont-star" />
                                  </li>
                                  <li>
                                    <i className="icofont-star" />
                                  </li>
                                  <li>
                                    <i className="icofont-star" />
                                  </li>
                                  <li>
                                    <i className="icofont-star off-color" />
                                  </li>
                                  <li>
                                    <span>(5.0/ 2 Ratings)</span>
                                  </li>
                                </ul>
                                <a href="/shop-single" className="ep-product__title">
                                  <h5>Environmental Science and Sustainability</h5>
                                </a>
                                <div className="ep-product__info-bottom">
                                  <a href="/cart" className="ep-product__btn">Add to cart
                                    <i className="fi fi-rs-arrow-small-right" />
                                  </a>
                                  <div className="ep-product__price regular">
                                    <span>$150.00</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="col-lg-4 col-md-6 col-12">
                            <div className="ep-product__card wow fadeInUp" data-wow-delay=".7s">
                              <div className="ep-product__img">
                                <img src="/assets/images/product/3.png" alt="product-img" />
                              </div>
                              <div className="ep-product__info">
                                <ul className="ep-product__rattings">
                                  <li>
                                    <i className="icofont-star" />
                                  </li>
                                  <li>
                                    <i className="icofont-star" />
                                  </li>
                                  <li>
                                    <i className="icofont-star" />
                                  </li>
                                  <li>
                                    <i className="icofont-star" />
                                  </li>
                                  <li>
                                    <i className="icofont-star off-color" />
                                  </li>
                                  <li>
                                    <span>(5.0/ 2 Ratings)</span>
                                  </li>
                                </ul>
                                <a href="/shop-single" className="ep-product__title">
                                  <h5>Modern Physics: Concepts and Applications</h5>
                                </a>
                                <div className="ep-product__info-bottom">
                                  <a href="/cart" className="ep-product__btn">Add to cart
                                    <i className="fi fi-rs-arrow-small-right" />
                                  </a>
                                  <div className="ep-product__price regular">
                                    <span>$239.00</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="col-lg-4 col-md-6 col-12">
                            <div className="ep-product__card wow fadeInUp" data-wow-delay=".3s">
                              <div className="ep-product__img">
                                <img src="/assets/images/product/4.png" alt="product-img" />
                              </div>
                              <div className="ep-product__info">
                                <ul className="ep-product__rattings">
                                  <li>
                                    <i className="icofont-star" />
                                  </li>
                                  <li>
                                    <i className="icofont-star" />
                                  </li>
                                  <li>
                                    <i className="icofont-star" />
                                  </li>
                                  <li>
                                    <i className="icofont-star" />
                                  </li>
                                  <li>
                                    <i className="icofont-star off-color" />
                                  </li>
                                  <li>
                                    <span>(5.0/ 2 Ratings)</span>
                                  </li>
                                </ul>
                                <a href="/shop-single" className="ep-product__title">
                                  <h5>Embrace the power of better tomorrow education</h5>
                                </a>
                                <div className="ep-product__info-bottom">
                                  <a href="/cart" className="ep-product__btn">Add to cart
                                    <i className="fi fi-rs-arrow-small-right" />
                                  </a>
                                  <div className="ep-product__price regular">
                                    <span>$290.00</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="col-lg-4 col-md-6 col-12">
                            <div className="ep-product__card wow fadeInUp" data-wow-delay=".5s">
                              <div className="ep-product__img">
                                <img src="/assets/images/product/5.png" alt="product-img" />
                              </div>
                              <div className="ep-product__label">
                                <span className="hot">HOT</span>
                              </div>
                              <div className="ep-product__info">
                                <ul className="ep-product__rattings">
                                  <li>
                                    <i className="icofont-star" />
                                  </li>
                                  <li>
                                    <i className="icofont-star" />
                                  </li>
                                  <li>
                                    <i className="icofont-star" />
                                  </li>
                                  <li>
                                    <i className="icofont-star" />
                                  </li>
                                  <li>
                                    <i className="icofont-star off-color" />
                                  </li>
                                  <li>
                                    <span>(5.0/ 2 Ratings)</span>
                                  </li>
                                </ul>
                                <a href="/shop-single" className="ep-product__title">
                                  <h5>Early Childhood Education Practices</h5>
                                </a>
                                <div className="ep-product__info-bottom">
                                  <a href="/cart" className="ep-product__btn">Add to cart
                                    <i className="fi fi-rs-arrow-small-right" />
                                  </a>
                                  <div className="ep-product__price regular">
                                    <span>$580.00</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="col-lg-4 col-md-6 col-12">
                            <div className="ep-product__card wow fadeInUp" data-wow-delay=".7s">
                              <div className="ep-product__img">
                                <img src="/assets/images/product/6.png" alt="product-img" />
                              </div>
                              <div className="ep-product__label">
                                <span className="discount">50% Discount</span>
                              </div>
                              <div className="ep-product__info">
                                <ul className="ep-product__rattings">
                                  <li>
                                    <i className="icofont-star" />
                                  </li>
                                  <li>
                                    <i className="icofont-star" />
                                  </li>
                                  <li>
                                    <i className="icofont-star" />
                                  </li>
                                  <li>
                                    <i className="icofont-star" />
                                  </li>
                                  <li>
                                    <i className="icofont-star off-color" />
                                  </li>
                                  <li>
                                    <span>(5.0/ 2 Ratings)</span>
                                  </li>
                                </ul>
                                <a href="/shop-single" className="ep-product__title">
                                  <h5>Basic Programming with Python</h5>
                                </a>
                                <div className="ep-product__info-bottom">
                                  <a href="/cart" className="ep-product__btn">Add to cart
                                    <i className="fi fi-rs-arrow-small-right" />
                                  </a>
                                  <div className="ep-product__price">
                                    <del>$100.00</del>
                                    <span>$50.00</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="row">
                          <div className="col-12">
                            <div className="ep-pagination">
                              <ul className="ep-pagination__list">
                                <li>
                                  <a href="#">01</a>
                                </li>
                                <li className="active">
                                  <a href="#">02</a>
                                </li>
                                <li>
                                  <a href="#">03</a>
                                </li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    </section>
    </>
  );
}
