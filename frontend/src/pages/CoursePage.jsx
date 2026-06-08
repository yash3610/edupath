import React from "react";

export default function CoursePage() {
  return (
    <>
      <div className="ep-breadcrumbs breadcrumbs-bg background-image" style={{backgroundImage: 'url("/assets/images/breadcrumbs-bg.png")'}}>
                      <div className="container">
                        <div className="row justify-content-center">
                          <div className="col-lg-6 col-md-6 col-12">
                            <div className="ep-breadcrumbs__content">
                              <h3 className="ep-breadcrumbs__title">Course</h3>
                              <ul className="ep-breadcrumbs__menu">
                                <li>
                                  <a href="/">Home</a>
                                </li>
                                <li>
                                  <i className="fi-bs-angle-right" />
                                </li>
                                <li className="active">
                                  <a href="/course">Course</a>
                                </li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <section className="ep-course section-gap position-relative">
                      <div className="container ep-container">
                        <div className="ep-course__filter">
                          <div className="row">
                            <div className="col-lg-6 col-12">
                              <div className="ep-course__result">
                                <h3 className="ep-course__result-title">Showing</h3>
                                <span className="ep-course__result-data">1-6/100</span>
                              </div>
                            </div>
                            <div className="col-lg-6 col-12">
                              <div className="ep-course__search">
                                <div className="ep-course__select">
                                  <select>
                                    <option value={1}>100 courses</option>
                                    <option value={2}>200 courses</option>
                                    <option value={3}>300 courses</option>
                                  </select>
                                </div>
                                <form action="#" method="post" className="ep-course__search-form">
                                  <input type="search" name="search" placeholder="Search" required />
                                  <button type="submit">
                                    <i className="fi-rr-search" />
                                  </button>
                                </form>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="row">
                          <div className="col-lg-6 col-xl-4 col-md-6 col-12">
                            <div className="ep-course__card wow fadeInUp" data-wow-delay=".3s" data-wow-duration="1s">
                              <a href="/course-details" className="ep-course__img">
                                <img src="/assets/images/course/course-1/1.png" alt="course-img" />
                              </a>
                              <a href="/course" className="ep-course__tag ep1-bg">Math</a>
                              <div className="ep-course__body">
                                <div className="ep-course__lesson">
                                  <div className="ep-course__student">
                                    <i className="fi-rr-user" />
                                    <p>250 Student</p>
                                  </div>
                                  <div className="ep-course__teacher">
                                    <p>Steve Smith</p>
                                  </div>
                                </div>
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
                                      <span>(5.0/ 2 Ratings)</span>
                                    </li>
                                  </ul>
                                </div>
                                <a href="/course-details" className="ep-course__title">
                                  <h5>World History: Ancient to Modern Times</h5>
                                </a>
                                <div className="ep-course__bottom">
                                  <a href="/course-details" className="ep-course__btn">Enroll Now <i className="fi fi-rs-arrow-small-right" />
                                  </a>
                                  <span className="ep-course__price">$50.00</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="col-lg-6 col-xl-4 col-md-6 col-12">
                            <div className="ep-course__card wow fadeInUp" data-wow-delay=".5s" data-wow-duration="1s">
                              <a href="/course-details" className="ep-course__img">
                                <img src="/assets/images/course/course-1/2.png" alt="course-img" />
                              </a>
                              <a href="/course" className="ep-course__tag ep2-bg">Math</a>
                              <div className="ep-course__body">
                                <div className="ep-course__lesson">
                                  <div className="ep-course__student">
                                    <i className="fi-rr-user" />
                                    <p>250 Student</p>
                                  </div>
                                  <div className="ep-course__teacher">
                                    <p>Steve Smith</p>
                                  </div>
                                </div>
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
                                      <span>(5.0/ 2 Ratings)</span>
                                    </li>
                                  </ul>
                                </div>
                                <a href="/course-details" className="ep-course__title">
                                  <h5>Environmental Science and Sustainability</h5>
                                </a>
                                <div className="ep-course__bottom">
                                  <a href="/course-details" className="ep-course__btn">Enroll Now <i className="fi fi-rs-arrow-small-right" />
                                  </a>
                                  <span className="ep-course__price">$50.00</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="col-lg-6 col-xl-4 col-md-6 col-12">
                            <div className="ep-course__card wow fadeInUp" data-wow-delay=".7s" data-wow-duration="1s">
                              <a href="/course-details" className="ep-course__img">
                                <img src="/assets/images/course/course-1/3.png" alt="course-img" />
                              </a>
                              <a href="/course" className="ep-course__tag ep4-bg">Math</a>
                              <div className="ep-course__body">
                                <div className="ep-course__lesson">
                                  <div className="ep-course__student">
                                    <i className="fi-rr-user" />
                                    <p>250 Student</p>
                                  </div>
                                  <div className="ep-course__teacher">
                                    <p>Steve Smith</p>
                                  </div>
                                </div>
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
                                      <span>(5.0/ 2 Ratings)</span>
                                    </li>
                                  </ul>
                                </div>
                                <a href="/course-details" className="ep-course__title">
                                  <h5>Modern Physics: Concepts and Applications</h5>
                                </a>
                                <div className="ep-course__bottom">
                                  <a href="/course-details" className="ep-course__btn">Enroll Now <i className="fi fi-rs-arrow-small-right" />
                                  </a>
                                  <span className="ep-course__price">$50.00</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="col-lg-6 col-xl-4 col-md-6 col-12">
                            <div className="ep-course__card wow fadeInUp" data-wow-delay=".3s" data-wow-duration="1s">
                              <a href="/course-details" className="ep-course__img">
                                <img src="/assets/images/course/course-1/4.png" alt="course-img" />
                              </a>
                              <a href="/course" className="ep-course__tag ep7-bg">Math</a>
                              <div className="ep-course__body">
                                <div className="ep-course__lesson">
                                  <div className="ep-course__student">
                                    <i className="fi-rr-user" />
                                    <p>250 Student</p>
                                  </div>
                                  <div className="ep-course__teacher">
                                    <p>Steve Smith</p>
                                  </div>
                                </div>
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
                                      <span>(5.0/ 2 Ratings)</span>
                                    </li>
                                  </ul>
                                </div>
                                <a href="/course-details" className="ep-course__title">
                                  <h5>Early Childhood Education Practices</h5>
                                </a>
                                <div className="ep-course__bottom">
                                  <a href="/course-details" className="ep-course__btn">Enroll Now <i className="fi fi-rs-arrow-small-right" />
                                  </a>
                                  <span className="ep-course__price">$50.00</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="col-lg-6 col-xl-4 col-md-6 col-12">
                            <div className="ep-course__card wow fadeInUp" data-wow-delay=".5s" data-wow-duration="1s">
                              <a href="/course-details" className="ep-course__img">
                                <img src="/assets/images/course/course-1/5.png" alt="course-img" />
                              </a>
                              <a href="/course" className="ep-course__tag ep4-bg">Math</a>
                              <div className="ep-course__body">
                                <div className="ep-course__lesson">
                                  <div className="ep-course__student">
                                    <i className="fi-rr-user" />
                                    <p>250 Student</p>
                                  </div>
                                  <div className="ep-course__teacher">
                                    <p>Steve Smith</p>
                                  </div>
                                </div>
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
                                      <span>(5.0/ 2 Ratings)</span>
                                    </li>
                                  </ul>
                                </div>
                                <a href="/course-details" className="ep-course__title">
                                  <h5>Embrace the power of better tomorrow education</h5>
                                </a>
                                <div className="ep-course__bottom">
                                  <a href="/course-details" className="ep-course__btn">Enroll Now <i className="fi fi-rs-arrow-small-right" />
                                  </a>
                                  <span className="ep-course__price">$50.00</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="col-lg-6 col-xl-4 col-md-6 col-12">
                            <div className="ep-course__card wow fadeInUp" data-wow-delay=".7s" data-wow-duration="1s">
                              <a href="/course-details" className="ep-course__img">
                                <img src="/assets/images/course/course-1/6.png" alt="course-img" />
                              </a>
                              <a href="/course" className="ep-course__tag ep3-bg">Math</a>
                              <div className="ep-course__body">
                                <div className="ep-course__lesson">
                                  <div className="ep-course__student">
                                    <i className="fi-rr-user" />
                                    <p>250 Student</p>
                                  </div>
                                  <div className="ep-course__teacher">
                                    <p>Steve Smith</p>
                                  </div>
                                </div>
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
                                      <span>(5.0/ 2 Ratings)</span>
                                    </li>
                                  </ul>
                                </div>
                                <a href="/course-details" className="ep-course__title">
                                  <h5>Basic Programming with Python</h5>
                                </a>
                                <div className="ep-course__bottom">
                                  <a href="/course-details" className="ep-course__btn">Enroll Now <i className="fi fi-rs-arrow-small-right" />
                                  </a>
                                  <span className="ep-course__price">$50.00</span>
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
