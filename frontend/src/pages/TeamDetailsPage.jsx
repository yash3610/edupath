import React from "react";

export default function TeamDetailsPage() {
  return (
    <>
      <div className="ep-breadcrumbs breadcrumbs-bg background-image" style={{backgroundImage: 'url("/assets/images/breadcrumbs-bg.png")'}}>
                      <div className="container">
                        <div className="row justify-content-center">
                          <div className="col-lg-6 col-md-6 col-12">
                            <div className="ep-breadcrumbs__content">
                              <h3 className="ep-breadcrumbs__title">Team Details</h3>
                              <ul className="ep-breadcrumbs__menu">
                                <li>
                                  <a href="/">Home</a>
                                </li>
                                <li>
                                  <i className="fi-bs-angle-right" />
                                </li>
                                <li className="active">
                                  <a href="/team-details">Team Details</a>
                                </li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <section className="ep-team__details section-gap position-relative">
                      <div className="container ep-container">
                        <div className="row">
                          <div className="col-12">
                            <div className="ep-team__details-inner">
                              <div className="ep-team__details-thumb">
                                <img src="/assets/images/team/team-1/3.png" alt="thumb-img" />
                              </div>
                              <div className="ep-team__details-info">
                                <div className="ep-team__details-author">
                                  <h3>Shahriar Nafiz</h3>
                                  <p>Development And Teacher</p>
                                </div>
                                <div className="ep-team__details-meta">
                                  <div className="ep-team__details-rattings">
                                    <span>Rating:</span>
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
                                        <i className="icofont-star" />
                                      </li>
                                    </ul>
                                  </div>
                                  <div className="ep-team__details-student">
                                    Student: <span>120</span>
                                  </div>
                                </div>
                                <div className="ep-team__details-desc">
                                  <h4>About Me</h4>
                                  <p>
                                    Education is a vital aspect of a child's development.
                                    Preschools, elementary schools, and middle schools
                                    play a significant role in providing quality education
                                    an fostering the a Education is a vital aspect of a
                                    child's development. Preschools, elementary the
                                    schools, and middle schools play a significant role in
                                    providing
                                  </p>
                                  <br />
                                  <p>
                                    Education is a vital aspect of a child's development.
                                    Preschools, elementary schools, and middle schools
                                    play a significant role in providing quality
                                  </p>
                                </div>
                                <div className="ep-team__details-social">
                                  <h4 className="ep-team__details-social-title">
                                    Contact Me
                                  </h4>
                                  <div className="ep-team__details-contact">
                                    <i className="fi-rr-phone-call" />
                                    <span>012 345 678 9101</span>
                                  </div>
                                  <ul className="ep-team__details-social-list">
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
                    <section className="ep-team__related section-gap position-relative pt-0">
                      <div className="container ep-container">
                        <div className="row justify-content-center">
                          <div className="col-lg-12 col-xl-6 col-md-8 col-12">
                            <div className="ep-section-head text-center">
                              <span className="ep-section-head__sm-title ep2-color">Meet Our Expert Team</span>
                              <h3 className="ep-section-head__big-title ep-split-text left">
                                Dedicated Professionals <span>Committed</span> to Your
                                Success
                              </h3>
                            </div>
                          </div>
                        </div>
                        <div className="row">
                          <div className="owl-carousel ep-team__related-slider">
                            <div className="ep-team__card ep-team__card--style3">
                              <a href="/team-details" className="ep-team__img">
                                <img src="/assets/images/team/team-1/1.png" alt="team-img" />
                              </a>
                              <div className="ep-team__content">
                                <div className="ep-team__author">
                                  <a href="/team-details">
                                    <h5>Bessie Cooper</h5>
                                  </a>
                                  <p>Mentor</p>
                                </div>
                                <div className="ep-team__social">
                                  <span className="ep-team__social-btn">
                                    <i className="fi-rr-share" />
                                  </span>
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
                            <div className="ep-team__card ep-team__card--style3">
                              <a href="/team-details" className="ep-team__img">
                                <img src="/assets/images/team/team-1/2.png" alt="team-img" />
                              </a>
                              <div className="ep-team__content">
                                <div className="ep-team__author">
                                  <a href="/team-details">
                                    <h5>Arlene McCoy</h5>
                                  </a>
                                  <p>Senior Mentor</p>
                                </div>
                                <div className="ep-team__social">
                                  <span className="ep-team__social-btn">
                                    <i className="fi-rr-share" />
                                  </span>
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
                            <div className="ep-team__card ep-team__card--style3">
                              <a href="/team-details" className="ep-team__img">
                                <img src="/assets/images/team/team-1/3.png" alt="team-img" />
                              </a>
                              <div className="ep-team__content">
                                <div className="ep-team__author">
                                  <a href="/team-details">
                                    <h5>Brooklyn Simmons</h5>
                                  </a>
                                  <p>Assistant Teacher</p>
                                </div>
                                <div className="ep-team__social">
                                  <span className="ep-team__social-btn">
                                    <i className="fi-rr-share" />
                                  </span>
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
                            <div className="ep-team__card ep-team__card--style3">
                              <a href="/team-details" className="ep-team__img">
                                <img src="/assets/images/team/team-1/4.png" alt="team-img" />
                              </a>
                              <div className="ep-team__content">
                                <div className="ep-team__author">
                                  <a href="/team-details">
                                    <h5>Wade Warren</h5>
                                  </a>
                                  <p>Mentor</p>
                                </div>
                                <div className="ep-team__social">
                                  <span className="ep-team__social-btn">
                                    <i className="fi-rr-share" />
                                  </span>
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
                            <div className="ep-team__card ep-team__card--style3">
                              <a href="/team-details" className="ep-team__img">
                                <img src="/assets/images/team/team-1/5.png" alt="team-img" />
                              </a>
                              <div className="ep-team__content">
                                <div className="ep-team__author">
                                  <a href="/team-details">
                                    <h5>Brooklyn Simmons</h5>
                                  </a>
                                  <p>Senior Mentor</p>
                                </div>
                                <div className="ep-team__social">
                                  <span className="ep-team__social-btn">
                                    <i className="fi-rr-share" />
                                  </span>
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
                            <div className="ep-team__card ep-team__card--style3">
                              <a href="/team-details" className="ep-team__img">
                                <img src="/assets/images/team/team-1/6.png" alt="team-img" />
                              </a>
                              <div className="ep-team__content">
                                <div className="ep-team__author">
                                  <a href="/team-details">
                                    <h5>Darlene Robertson</h5>
                                  </a>
                                  <p>Assistant Teacher</p>
                                </div>
                                <div className="ep-team__social">
                                  <span className="ep-team__social-btn">
                                    <i className="fi-rr-share" />
                                  </span>
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
                          </div>
                        </div>
                      </div>
                    </section>
    </>
  );
}
