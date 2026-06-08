import React from "react";

export default function CourseDetailsPage() {
  return (
    <>
      <div className="ep-breadcrumbs breadcrumbs-bg background-image" style={{backgroundImage: 'url("/assets/images/breadcrumbs-bg.png")'}}>
                      <div className="container">
                        <div className="row justify-content-center">
                          <div className="col-lg-6 col-md-6 col-12">
                            <div className="ep-breadcrumbs__content">
                              <h3 className="ep-breadcrumbs__title">Course details</h3>
                              <ul className="ep-breadcrumbs__menu">
                                <li>
                                  <a href="/">Home</a>
                                </li>
                                <li>
                                  <i className="fi-bs-angle-right" />
                                </li>
                                <li className="active">
                                  <a href="/course-details">Course details</a>
                                </li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <section className="ep-course__details section-gap position-relative">
                      <div className="container ep-container">
                        <div className="row">
                          <div className="col-lg-12 col-xl-8 col-12">
                            <div className="ep-course__details-tab">
                              <div className="row">
                                <div className="col-12">
                                  <div className="ep-course__tab-menu tab-menu">
                                    <div className="list-group" id="list-tab" role="tablist">
                                      <a className="list-group-item active" href="#overview" role="tab">
                                        Overview
                                      </a>
                                      <a className="list-group-item" href="#curriculum" role="tab">
                                        Curriculum
                                      </a>
                                      <a className="list-group-item" href="#instructor" role="tab">
                                        Instructor
                                      </a>
                                      <a className="list-group-item" href="#reviews" role="tab">
                                        Reviews
                                      </a>
                                    </div>
                                  </div>
                                </div>
                                <div className="col-12">
                                  <div className="ep-course__tab-details tab-details">
                                    <div className="tab-content" id="nav-tabContent">
                                      <div className="tab-pane fade show active" id="overview" role="tabpanel">
                                        <div className="ep-course__overview">
                                          <div className="ep-course__overview-widget">
                                            <h3 className="ep-course__overview-title">
                                              Course Description
                                            </h3>
                                            <p className="ep-course__overview-text">
                                              Aliquam eros justo, posuere loborti vive rra
                                              laoreet matti ullamc orper posu ere viverra
                                              .Aliquam eros justo, posuer lobortis non,
                                              vive rra laoreet augue mattis fermentum
                                              ullamcorper viverra laoreet Aliquam es an
                                              justo, posuere loborti viverra laoreet mat
                                              ullamcorper posue viverra .Aliquam eros
                                            </p>
                                            <br />
                                            <p className="ep-course__overview-text m-0">
                                              Aliquam eros justo, posuere loborti vive rra
                                              laoreet matti ullamc orper posu ere viverra
                                              .Aliquam eros justo, posuer lobortis non,
                                              vive rra laoreet augue mattis fermentum
                                              ullamcorper viverra
                                            </p>
                                          </div>
                                          <div className="ep-course__overview-widget">
                                            <h3 className="ep-course__overview-title">
                                              What You’ll Learn?
                                            </h3>
                                            <ul>
                                              <li>
                                                <i className="fi-ss-check-circle" />Nurturing Young Minds
                                              </li>
                                              <li>
                                                <i className="fi-ss-check-circle" />Building
                                                a Bright Future Together
                                              </li>
                                              <li>
                                                <i className="fi-ss-check-circle" />Unlocking Potential Through Education
                                              </li>
                                              <li>
                                                <i className="fi-ss-check-circle" />Empowering Children Through Education
                                              </li>
                                              <li>
                                                <i className="fi-ss-check-circle" />Igniting
                                                Curiosity and Imagination
                                              </li>
                                              <li>
                                                <i className="fi-ss-check-circle" />Growing
                                                Genius Elementary School
                                              </li>
                                            </ul>
                                            <br />
                                            <br />
                                            <p className="ep-course__overview-text">
                                              Aliquam eros justo, posuere loborti viverra
                                              laoreet matti ullam corper posuere viverra
                                              .Aliquam eros justo, posuere lobortis
                                              viverra laoreet augue mattis fermentum
                                              ullamcorper viverra
                                            </p>
                                            <br />
                                            <p className="ep-course__overview-text m-0">
                                              Aliquam eros justo, posuere loborti viverra
                                              laoreet matti ullam corper posuere viverra
                                              .Aliquam eros justo, posuere lobortis
                                              viverra laoreet augue mattis fermentum
                                              ullamcorper viverra Growing Genius
                                              Elementary School Growing Genius Elementary
                                              School Growing Genius Elementary School
                                            </p>
                                          </div>
                                          <div className="ep-course__overview-widget">
                                            <h3 className="ep-course__overview-title">
                                              More Details
                                            </h3>
                                            <p className="ep-course__overview-text">
                                              Aliquam eros justo, posuere loborti vive rra
                                              laoreet matti ullamc orper posu ere viverra
                                              .Aliquam eros justo, posuer lobortis non,
                                              vive rra laoreet augue mattis fermentum
                                              ullamcorper viverra laoreet Aliquam es an
                                              justo, posuere loborti viverra laoreet mat
                                              ullamcorper posue viverra .Aliquam eros
                                            </p>
                                            <br />
                                            <p className="ep-course__overview-text m-0">
                                              Aliquam eros justo, posuere loborti vive rra
                                              laoreet matti ullamc orper posu ere viverra
                                              .Aliquam eros justo, posuer lobortis non,
                                              vive rra laoreet augue mattis fermentum
                                              ullamcorper viverra
                                            </p>
                                          </div>
                                        </div>
                                      </div>
                                      <div className="tab-pane fade" id="curriculum" role="tabpanel">
                                        <div className="ep-course__curriculum">
                                          <div className="ep-course__accordion accordion" id="accordionExample">
                                            <div className="ep-course__accordion-item">
                                              <h2 className="accordion-header" id="headingOne">
                                                <button className="accordion-button" type="button" aria-expanded="true" aria-controls="collapseOne">
                                                  The First Steps
                                                </button>
                                              </h2>
                                              <div id="collapseOne" className="accordion-collapse collapse show" aria-labelledby="headingOne" data-bs-parent="#accordionExample">
                                                <div className="ep-course__accordion-body">
                                                  <ul>
                                                    <li>
                                                      <div className="text">
                                                        <i className="fi fi-rr-edit" />
                                                        Introduction
                                                      </div>
                                                      <div className="icon">
                                                        <i className="fi fi-rr-lock" />
                                                      </div>
                                                    </li>
                                                    <li>
                                                      <div className="text">
                                                        <i className="fi fi-rr-edit" />
                                                        Course Overview
                                                      </div>
                                                      <div className="icon">
                                                        <i className="fi fi-rr-lock" />
                                                      </div>
                                                    </li>
                                                    <li>
                                                      <div className="text">
                                                        <i className="fi fi-rr-edit" />
                                                        Local Development Environment
                                                        Tools
                                                      </div>
                                                      <div className="icon">
                                                        <i className="fi fi-rr-lock" />
                                                      </div>
                                                    </li>
                                                    <li>
                                                      <div className="text">
                                                        <i className="fi fi-rr-edit" />
                                                        Course Excercise
                                                      </div>
                                                      <div className="icon">
                                                        <i className="fi fi-rr-lock" />
                                                      </div>
                                                    </li>
                                                    <li>
                                                      <div className="text">
                                                        <i className="fi fi-rr-edit" />
                                                        Embedding PHP in HTML
                                                      </div>
                                                      <div className="icon">
                                                        <i className="fi fi-rr-lock" />
                                                      </div>
                                                    </li>
                                                    <li>
                                                      <div className="text">
                                                        <i className="fi fi-rr-edit" />
                                                        Using Dynamic Data
                                                      </div>
                                                      <div className="icon">
                                                        <i className="fi fi-rr-lock" />
                                                      </div>
                                                    </li>
                                                  </ul>
                                                </div>
                                              </div>
                                            </div>
                                            <div className="ep-course__accordion-item">
                                              <h2 className="accordion-header" id="headingTwo">
                                                <button className="accordion-button collapsed" type="button" aria-expanded="false" aria-controls="collapseTwo">
                                                  Data Types and More
                                                </button>
                                              </h2>
                                              <div id="collapseTwo" className="accordion-collapse collapse" aria-labelledby="headingTwo" data-bs-parent="#accordionExample">
                                                <div className="ep-course__accordion-body">
                                                  <ul>
                                                    <li>
                                                      <div className="text">
                                                        <i className="fi fi-rr-edit" />
                                                        Introduction
                                                      </div>
                                                      <div className="icon">
                                                        <i className="fi fi-rr-lock" />
                                                      </div>
                                                    </li>
                                                    <li>
                                                      <div className="text">
                                                        <i className="fi fi-rr-edit" />
                                                        Course Overview
                                                      </div>
                                                      <div className="icon">
                                                        <i className="fi fi-rr-lock" />
                                                      </div>
                                                    </li>
                                                    <li>
                                                      <div className="text">
                                                        <i className="fi fi-rr-edit" />
                                                        Local Development Environment
                                                        Tools
                                                      </div>
                                                      <div className="icon">
                                                        <i className="fi fi-rr-lock" />
                                                      </div>
                                                    </li>
                                                    <li>
                                                      <div className="text">
                                                        <i className="fi fi-rr-edit" />
                                                        Course Excercise
                                                      </div>
                                                      <div className="icon">
                                                        <i className="fi fi-rr-lock" />
                                                      </div>
                                                    </li>
                                                    <li>
                                                      <div className="text">
                                                        <i className="fi fi-rr-edit" />
                                                        Embedding PHP in HTML
                                                      </div>
                                                      <div className="icon">
                                                        <i className="fi fi-rr-lock" />
                                                      </div>
                                                    </li>
                                                    <li>
                                                      <div className="text">
                                                        <i className="fi fi-rr-edit" />
                                                        Using Dynamic Data
                                                      </div>
                                                      <div className="icon">
                                                        <i className="fi fi-rr-lock" />
                                                      </div>
                                                    </li>
                                                  </ul>
                                                </div>
                                              </div>
                                            </div>
                                            <div className="ep-course__accordion-item">
                                              <h2 className="accordion-header" id="headingThree">
                                                <button className="accordion-button collapsed" type="button" aria-expanded="false" aria-controls="collapseThree">
                                                  Control Structure
                                                </button>
                                              </h2>
                                              <div id="collapseThree" className="accordion-collapse collapse" aria-labelledby="headingThree" data-bs-parent="#accordionExample">
                                                <div className="ep-course__accordion-body">
                                                  <ul>
                                                    <li>
                                                      <div className="text">
                                                        <i className="fi fi-rr-edit" />
                                                        Introduction
                                                      </div>
                                                      <div className="icon">
                                                        <i className="fi fi-rr-lock" />
                                                      </div>
                                                    </li>
                                                    <li>
                                                      <div className="text">
                                                        <i className="fi fi-rr-edit" />
                                                        Course Overview
                                                      </div>
                                                      <div className="icon">
                                                        <i className="fi fi-rr-lock" />
                                                      </div>
                                                    </li>
                                                    <li>
                                                      <div className="text">
                                                        <i className="fi fi-rr-edit" />
                                                        Local Development Environment
                                                        Tools
                                                      </div>
                                                      <div className="icon">
                                                        <i className="fi fi-rr-lock" />
                                                      </div>
                                                    </li>
                                                    <li>
                                                      <div className="text">
                                                        <i className="fi fi-rr-edit" />
                                                        Course Excercise
                                                      </div>
                                                      <div className="icon">
                                                        <i className="fi fi-rr-lock" />
                                                      </div>
                                                    </li>
                                                    <li>
                                                      <div className="text">
                                                        <i className="fi fi-rr-edit" />
                                                        Embedding PHP in HTML
                                                      </div>
                                                      <div className="icon">
                                                        <i className="fi fi-rr-lock" />
                                                      </div>
                                                    </li>
                                                    <li>
                                                      <div className="text">
                                                        <i className="fi fi-rr-edit" />
                                                        Using Dynamic Data
                                                      </div>
                                                      <div className="icon">
                                                        <i className="fi fi-rr-lock" />
                                                      </div>
                                                    </li>
                                                  </ul>
                                                </div>
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                      <div className="tab-pane fade" id="instructor" role="tabpanel">
                                        <div className="ep-course__instructor">
                                          <div className="ep-course__instructor-thumb">
                                            <img src="/assets/images/team/team-1/1.png" alt="instructor" />
                                          </div>
                                          <div className="ep-course__instructor-info">
                                            <h6>Bessie Cooper</h6>
                                            <span>Assistant Teacher</span>
                                            <p>
                                              Lorem Ipsum is simply dummy text of the
                                              printing and typesetting industry. Lorem
                                              Ipsum has been the industry's standard dummy
                                              text ever since the 1500s, when an unknown
                                              printer took a galley...
                                            </p>
                                            <ul>
                                              <li>
                                                <a href="#">
                                                  <i className="icofont-twitter" />
                                                </a>
                                              </li>
                                              <li>
                                                <a href="#">
                                                  <i className="icofont-facebook" />
                                                </a>
                                              </li>
                                              <li>
                                                <a href="#">
                                                  <i className="icofont-instagram" />
                                                </a>
                                              </li>
                                              <li>
                                                <a href="#">
                                                  <i className="icofont-linkedin" />
                                                </a>
                                              </li>
                                            </ul>
                                          </div>
                                        </div>
                                      </div>
                                      <div className="tab-pane fade" id="reviews" role="tabpanel">
                                        <div className="ep-course__review">
                                          <div className="row">
                                            <div className="col-lg-4">
                                              <div className="ep-course__rating-box">
                                                <div className="ep-course__rating-number">
                                                  5.0
                                                </div>
                                                <div className="rating">
                                                  <i className="icofont-star" />
                                                  <i className="icofont-star" />
                                                  <i className="icofont-star" />
                                                  <i className="icofont-star" />
                                                  <i className="icofont-star" />
                                                </div>
                                                <span>(25 Review)</span>
                                              </div>
                                            </div>
                                            <div className="col-lg-8">
                                              <div className="ep-course__review-wrapper">
                                                <div className="single-progress-bar">
                                                  <div className="rating-text">
                                                    5 <i className="icofont-star" />
                                                  </div>
                                                  <div className="progress">
                                                    <div className="progress-bar" role="progressbar" style={{width: '100%'}} aria-valuenow={100} aria-valuemin={0} aria-valuemax={100} />
                                                  </div>
                                                  <span className="rating-value">1</span>
                                                </div>
                                                <div className="single-progress-bar">
                                                  <div className="rating-text">
                                                    4 <i className="icofont-star" />
                                                  </div>
                                                  <div className="progress">
                                                    <div className="progress-bar" role="progressbar" style={{width: '0%'}} aria-valuenow={0} aria-valuemin={0} aria-valuemax={100} />
                                                  </div>
                                                  <span className="rating-value">0</span>
                                                </div>
                                                <div className="single-progress-bar">
                                                  <div className="rating-text">
                                                    3 <i className="icofont-star" />
                                                  </div>
                                                  <div className="progress">
                                                    <div className="progress-bar" role="progressbar" style={{width: '0%'}} aria-valuenow={0} aria-valuemin={0} aria-valuemax={100} />
                                                  </div>
                                                  <span className="rating-value">0</span>
                                                </div>
                                                <div className="single-progress-bar">
                                                  <div className="rating-text">
                                                    2 <i className="icofont-star" />
                                                  </div>
                                                  <div className="progress">
                                                    <div className="progress-bar" role="progressbar" style={{width: '0%'}} aria-valuenow={0} aria-valuemin={0} aria-valuemax={100} />
                                                  </div>
                                                  <span className="rating-value">0</span>
                                                </div>
                                                <div className="single-progress-bar">
                                                  <div className="rating-text">
                                                    1 <i className="icofont-star" />
                                                  </div>
                                                  <div className="progress">
                                                    <div className="progress-bar" role="progressbar" style={{width: '0%'}} aria-valuenow={0} aria-valuemin={0} aria-valuemax={100} />
                                                  </div>
                                                  <span className="rating-value">0</span>
                                                </div>
                                              </div>
                                            </div>
                                          </div>
                                          <div className="ep-course__comment-wrapper">
                                            <h5 className="ep-course__comment-title">
                                              Reviews
                                            </h5>
                                            <div className="ep-course__comment">
                                              <div className="ep-course__comment-thumb">
                                                <img src="/assets/images/course/details/student-1.png" alt="comment-thumb-img" />
                                              </div>
                                              <div className="ep-course__comment-content">
                                                <div className="ep-course__comment-top">
                                                  <h6 className="title">Elen Saspita</h6>
                                                  <div className="rating">
                                                    <i className="icofont-star" />
                                                    <i className="icofont-star" />
                                                    <i className="icofont-star" />
                                                    <i className="icofont-star" />
                                                    <i className="icofont-star" />
                                                  </div>
                                                </div>
                                                <span className="subtitle">“ Outstanding Course ”</span>
                                                <p>
                                                  As Thomas pointed out, Chegg’s survey
                                                  appears more like a scorecard that
                                                  details obstacles and challenges that
                                                  the current university undergraduate
                                                  student population is going through in
                                                  their universities and countries.
                                                </p>
                                              </div>
                                            </div>
                                            <div className="ep-course__comment">
                                              <div className="ep-course__comment-thumb">
                                                <img src="/assets/images/course/details/student-2.jpg" alt="comment-thumb-img" />
                                              </div>
                                              <div className="ep-course__comment-content">
                                                <div className="ep-course__comment-top">
                                                  <h6 className="title">David Gea</h6>
                                                  <div className="rating">
                                                    <i className="icofont-star" />
                                                    <i className="icofont-star" />
                                                    <i className="icofont-star" />
                                                    <i className="icofont-star off-color" />
                                                    <i className="icofont-star off-color" />
                                                  </div>
                                                </div>
                                                <span className="subtitle">“ Very Helpful Course ”</span>
                                                <p>
                                                  As Thomas pointed out, Chegg’s survey
                                                  appears more like a scorecard that
                                                  details obstacles and challenges that
                                                  the current university undergraduate
                                                  student population is going through in
                                                  their universities and countries.
                                                </p>
                                              </div>
                                            </div>
                                            <div className="ep-course__comment">
                                              <div className="ep-course__comment-thumb">
                                                <img src="/assets/images/course/details/student-3.jpg" alt="comment-thumb-img" />
                                              </div>
                                              <div className="ep-course__comment-content">
                                                <div className="ep-course__comment-top">
                                                  <h6 className="title">Alena Hedge</h6>
                                                  <div className="rating">
                                                    <i className="icofont-star" />
                                                    <i className="icofont-star" />
                                                    <i className="icofont-star" />
                                                    <i className="icofont-star" />
                                                    <i className="icofont-star off-color" />
                                                  </div>
                                                </div>
                                                <span className="subtitle">“ Wonderful Course ”</span>
                                                <p>
                                                  As Thomas pointed out, Chegg’s survey
                                                  appears more like a scorecard that
                                                  details obstacles and challenges that
                                                  the current university undergraduate
                                                  student population is going through in
                                                  their universities and countries.
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
                            </div>
                          </div>
                          <div className="col-lg-8 col-xl-4 col-md-8 col-12">
                            <div className="ep-course__sidebar">
                              <div className="ep-video__bg background-image position-relative" style={{backgroundImage: 'url("/assets/images/course/details/sidebar-img.png")'}}>
                                <a href="https://www.youtube.com/watch?v=gyGsPlt06bo" className="ep-video__btn popup-video">
                                  <i className="fi fi-sr-play" />
                                </a>
                              </div>
                              <div className="ep-course__sidebar-data">
                                <h4 className="ep-course__sidebar-title">Course Includes</h4>
                                <ul className="ep-course__sidebar-data-list">
                                  <li>
                                    <span>Price :</span>
                                    <strong className="price">$20</strong>
                                  </li>
                                  <li>
                                    <span>Instructor :</span>
                                    <strong>Devon Lane</strong>
                                  </li>
                                  <li>
                                    <span>Duration :</span>
                                    <strong>15 Weeks</strong>
                                  </li>
                                  <li>
                                    <span>Lessons :</span>
                                    <strong>321</strong>
                                  </li>
                                  <li>
                                    <span>Students :</span>
                                    <strong>English</strong>
                                  </li>
                                  <li>
                                    <span>Language :</span>
                                    <strong>$20</strong>
                                  </li>
                                  <li>
                                    <span>Certification :</span>
                                    <strong>Yes</strong>
                                  </li>
                                </ul>
                                <div className="ep-course__buy-btn">
                                  <a href="/checkout" className="ep-btn">Buy Now <i className="fi-rs-arrow-small-right" />
                                  </a>
                                </div>
                                <div className="ep-course__sidebar-social">
                                  <h4 className="ep-course__sidebar-title">
                                    Follow On Social Media
                                  </h4>
                                  <ul>
                                    <li>
                                      <a href="#">
                                        <i className="icofont-facebook" />
                                      </a>
                                    </li>
                                    <li>
                                      <a href="#">
                                        <i className="icofont-twitter" />
                                      </a>
                                    </li>
                                    <li>
                                      <a href="#">
                                        <i className="icofont-linkedin" />
                                      </a>
                                    </li>
                                    <li>
                                      <a href="#">
                                        <i className="icofont-pinterest" />
                                      </a>
                                    </li>
                                  </ul>
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
