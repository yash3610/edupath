import React from "react";

export default function NotFoundPage() {
  return (
    <>
      <div className="ep-breadcrumbs breadcrumbs-bg background-image" style={{backgroundImage: 'url("/assets/images/breadcrumbs-bg.png")'}}>
                      <div className="container">
                        <div className="row justify-content-center">
                          <div className="col-lg-6 col-md-6 col-12">
                            <div className="ep-breadcrumbs__content">
                              <h3 className="ep-breadcrumbs__title">Error</h3>
                              <ul className="ep-breadcrumbs__menu">
                                <li>
                                  <a href="/">Home</a>
                                </li>
                                <li>
                                  <i className="fi-bs-angle-right" />
                                </li>
                                <li className="active">
                                  <a href="/404">Error</a>
                                </li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <section className="ep-error section-gap position-relative">
                      <div className="container ep-container">
                        <div className="row justify-content-center">
                          <div className="col-lg-6 col-xl-5 col-md-8 col-12">
                            <div className="ep-error__inner text-center">
                              <div className="ep-error__img">
                                <img src="/assets/images/error-img.svg" alt="error-img" />
                              </div>
                              <div className="ep-error__content">
                                <h3>OPPS! Page Not Found</h3>
                                <p>
                                  We are sorry, But the page you requested was not found
                                </p>
                                <div className="ep-error__btn">
                                  <a href="/" className="ep-btn ep5-bg">
                                    <i className="fi fi-rs-arrow-small-left" />Back to Home
                                  </a>
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
