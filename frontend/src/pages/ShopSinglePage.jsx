import React from "react";

export default function ShopSinglePage() {
  return (
    <>
      <div className="ep-breadcrumbs breadcrumbs-bg background-image" style={{backgroundImage: 'url("/assets/images/breadcrumbs-bg.png")'}}>
                      <div className="container">
                        <div className="row justify-content-center">
                          <div className="col-lg-6 col-md-6 col-12">
                            <div className="ep-breadcrumbs__content">
                              <h3 className="ep-breadcrumbs__title">Shop Single</h3>
                              <ul className="ep-breadcrumbs__menu">
                                <li>
                                  <a href="/">Home</a>
                                </li>
                                <li>
                                  <i className="fi-bs-angle-right" />
                                </li>
                                <li className="active">
                                  <a href="/shop-single">shop</a>
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
                          <div className="col-lg-6 col-md-6 col-12">
                            <div className="ep-shop-thumb">
                              <img src="/assets/images/product/shop-single.jpg" />
                            </div>
                          </div>
                          <div className="col-lg-6 col-md-6 col-12">
                            <div className="ep-shop-detail">
                              <h3>Miracle Morning</h3>
                              <div className="ep-course__rattings">
                                <ul>
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
                                    <span>(5 customer reviews)</span>
                                  </li>
                                </ul>
                              </div>
                              <div className="ep-product__price ep-product__price--v2">
                                <span> <b>Price:</b>$50.00 </span>
                                <del>$100.00</del>
                              </div>
                              <div className="ep-product-short">
                                <p>
                                  Lorem ipsum dolor sit amet, consetetur sadipscing elitr,
                                  sed diam nonumy eirmod tempor invidunt. ut labore et
                                  dolore magna aliquyam erat, sed diam voluptua. At vero
                                  eos et accusam. et justo duo dolores et ea rebum. Stet
                                  clita kasd gubergren, no sea takimata sanctus est Lorem
                                  ipsum dolor sit amet. Lorem ipsum dolor sit amet,
                                  consetetur sadipscing elitr, sed diam nonumy eirmod
                                  tempor invidunt ut labore.
                                </p>
                              </div>
                              <div className="ep-shop-single__purchase">
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
                                <button className="ep-btn ep5-bg">Purchase Now</button>
                                <button className="ep-shop-single__wishlist-button">
                                  <i className="fi-rr-heart" />
                                </button>
                              </div>
                              <div className="ep-shop-single__meta">
                                <span className="ep-shop-single__sku">SKU: book-1</span>
                                <span className="ep-shop-single__categories">Categories: <a href="#">Motivation</a>
                                </span>
                                <span className="ep-shop-single__tags">Tags: <a href="#">Book,</a>
                                  <a href="#">Self Development</a>
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="row">
                          <div className="col-lg-8 offset-lg-2">
                            <ul className="nav nav-tabs mt-5 ep-product-tab-list" id="productTabs" role="tablist">
                              <li className="nav-item">
                                <button className="nav-link active" id="description-tab" role="tab">
                                  Description
                                </button>
                              </li>
                              <li className="nav-item">
                                <button className="nav-link" id="additional-info-tab" role="tab">
                                  Additional Information
                                </button>
                              </li>
                              <li className="nav-item">
                                <button className="nav-link" id="reviews-tab" role="tab">
                                  Reviews
                                </button>
                              </li>
                            </ul>
                            <div className="tab-content mt-4" id="productTabsContent">
                              <div className="tab-pane fade show active" id="description" role="tabpanel" aria-labelledby="description-tab">
                                <div className="ep-product-tab-inside">
                                  <div className="ep-product-tab-inside__content">
                                    <h2 className="ep-product-single__tab-title">
                                      Book Story
                                    </h2>
                                    <p className="ep-product-single__tab-text">
                                      Lorem Ipsum is simply dummy text of the printing and
                                      typesetting industry. Lorem Ipsum has been the
                                      industry's standard dummy text ever since the 1500s,
                                      when an unknown printer took a galley of type and
                                      scrambled it to make a type specimen book.
                                    </p>
                                    <p className="ep-product-single__tab-text mg-top-20">
                                      Lorem Ipsum is simply dummy text of the printing and
                                      typesetting industry. Lorem Ipsum has been the
                                      industry's standard dummy text ever since the 1500s,
                                      when an unknown printer took a galley of type and
                                      scrambled it to make a type specimen book. Lorem
                                      Ipsum is simply dummy text of the printing
                                    </p>
                                  </div>
                                  <div className="ep-product-tab-inside__img">
                                    <img src="/assets/images/product/book-cover.jpg" />
                                  </div>
                                </div>
                              </div>
                              <div className="tab-pane fade" id="additional-info" role="tabpanel" aria-labelledby="additional-info">
                                <div className="ep-product-tab-inside">
                                  <div className="ep-product-tab-inside__content">
                                    <h2 className="ep-product-single__tab-title">
                                      Additional Info
                                    </h2>
                                    <table className="additional-table">
                                      <thead>
                                        <tr>
                                          <th>Field</th>
                                          <th>Information</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        <tr>
                                          <td>Title</td>
                                          <td>The Great Adventure</td>
                                        </tr>
                                        <tr>
                                          <td>Author</td>
                                          <td>John Doe</td>
                                        </tr>
                                        <tr>
                                          <td>Genre</td>
                                          <td>Adventure, Fiction</td>
                                        </tr>
                                        <tr>
                                          <td>Publisher</td>
                                          <td>Adventure House</td>
                                        </tr>
                                        <tr>
                                          <td>Publication Date</td>
                                          <td>March 15, 2023</td>
                                        </tr>
                                        <tr>
                                          <td>ISBN</td>
                                          <td>978-1-23456-789-0</td>
                                        </tr>
                                        <tr>
                                          <td>Language</td>
                                          <td>English</td>
                                        </tr>
                                        <tr>
                                          <td>Edition</td>
                                          <td>1st Edition</td>
                                        </tr>
                                        <tr>
                                          <td>Number of Pages</td>
                                          <td>320</td>
                                        </tr>
                                        <tr>
                                          <td>Book Format</td>
                                          <td>Hardcover</td>
                                        </tr>
                                        <tr>
                                          <td>Dimensions</td>
                                          <td>8.5 x 5.5 x 1 inches</td>
                                        </tr>
                                        <tr>
                                          <td>Weight</td>
                                          <td>1.2 lbs</td>
                                        </tr>
                                      </tbody>
                                    </table>
                                  </div>
                                </div>
                              </div>
                              <div className="tab-pane fade" id="reviews" role="tabpanel" aria-labelledby="reviews-tab">
                                <div className="ep-product-tab-insides">
                                  <div className="ep-blog__details-form m-0">
                                    <h3 className="ep-product-single__tab-title">
                                      Leave a Review
                                    </h3>
                                    <p className="ep-blog__details-form-text">
                                      By using form u agree with the message sorage, you
                                      can contact us directly now
                                    </p>
                                    <form action="#" method="post" className="mg-top-20">
                                      <div className="row">
                                        <div className="col-lg-6 col-md-6 col-12">
                                          <div className="form-group">
                                            <input type="text" name="your-name" placeholder="Your Name*" required />
                                          </div>
                                        </div>
                                        <div className="col-lg-6 col-md-6 col-12">
                                          <div className="form-group">
                                            <input type="email" name="your-email" placeholder="Your E-mail*" required />
                                          </div>
                                        </div>
                                        <div className="col-12">
                                          <div className="form-group">
                                            <textarea name="message" placeholder="Write your Message here*" required defaultValue={""} />
                                          </div>
                                        </div>
                                        <div className="col-12">
                                          <div className="form-check">
                                            <label className="form-check-label" htmlFor="flexCheckDefault">
                                              <input className="form-check-input" type="checkbox" defaultValue id="flexCheckDefault" />
                                              Save my name email and name and when i next
                                              time comment on this website
                                            </label>
                                          </div>
                                          <button type="submit" className="ep-btn">
                                            Publish Review
                                          </button>
                                        </div>
                                      </div>
                                    </form>
                                  </div>
                                  <div className="ep-blog__details-comment mg-top-40">
                                    <h3 className="ep-product-single__tab-title">
                                      2 Reviews
                                    </h3>
                                    <div className="ep-blog__comment-item">
                                      <div className="ep-blog__comment-img">
                                        <img src="/assets/images/blog/details/comment-1.png" alt="comment-img" />
                                      </div>
                                      <div className="ep-blog__comment-info">
                                        <div className="ep-blog__comment-info-head">
                                          <h6 className="ep-blog__comment-name">
                                            Stanio lainto
                                          </h6>
                                          <p className="ep-blog__comment-date">
                                            January 16, 2024
                                          </p>
                                        </div>
                                        <p className="ep-blog__comment-text">
                                          Ished fact that a reader will be distrol acted
                                          bioii the.ished fact that a reader will be
                                          distrol acted laoreet Aliquam fact that a reader
                                          will be distrol acted Aliquam eros justo.
                                        </p>
                                      </div>
                                    </div>
                                    <div className="ep-blog__comment-item">
                                      <div className="ep-blog__comment-img">
                                        <img src="/assets/images/blog/details/comment-2.png" alt="comment-img" />
                                      </div>
                                      <div className="ep-blog__comment-info">
                                        <div className="ep-blog__comment-info-head">
                                          <h6 className="ep-blog__comment-name">
                                            Court Henry
                                          </h6>
                                          <p className="ep-blog__comment-date">
                                            January 16, 2024
                                          </p>
                                        </div>
                                        <p className="ep-blog__comment-text">
                                          Ished fact that a reader will be distrol acted
                                          bioii the.ished fact that a reader will be
                                          distrol acted laoreet Aliquam fact that a reader
                                          will be distrol acted Aliquam eros justo.
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </section>
    </>
  );
}
