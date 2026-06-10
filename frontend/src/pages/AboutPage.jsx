import React from "react";

export default function AboutPage() {
  return (
    <>
      <div className="ep-breadcrumbs breadcrumbs-bg background-image" style={{backgroundImage: 'url("/assets/images/breadcrumbs-bg.png")'}}>
                      <div className="container">
                        <div className="row justify-content-center">
                          <div className="col-lg-6 col-md-6 col-12">
                            <div className="ep-breadcrumbs__content">
                              <h3 className="ep-breadcrumbs__title">About Us</h3>
                              <ul className="ep-breadcrumbs__menu">
                                <li>
                                  <a href="/">Home</a>
                                </li>
                                <li>
                                  <i className="fi-bs-angle-right" />
                                </li>
                                <li className="active">
                                  <a href="/about">About Us</a>
                                </li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <section className="ep-about ep-section section-gap position-relative">
                      <div className="ep-about__shape updown-ani">
                        <img src="/assets/images/about/about-1/circle-shape.svg" alt="circle-shape" />
                      </div>
                      <div className="container ep-container">
                        <div className="row align-items-center">
                          <div className="col-lg-6 col-12">
                            <div className="ep-section__img position-relative">
                              <div className="ep-section__img-shape rotate-ani">
                                <img src="/assets/images/about/about-1/pattern-shape.svg" alt="pattern-shape" />
                              </div>
                              <div className="ep-section__img-main">
                                <img src="/assets/images/about/about-1/about-img.png" alt="about-img" />
                              </div>
                              <div className="overview-card updown-ani">
                                <div className="overview-card__icon">
                                  <img src="/assets/images/about/about-1/user.svg" alt="user-icon" />
                                </div>
                                <div className="overview-card__info">
                                  <h4><span>2</span>k+</h4>
                                  <p>Full Time Student</p>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="col-lg-6 col-12">
                            <div className="ep-section__content">
                              <div className="ep-section-head">
                                <span className="ep-section-head__sm-title ep1-color">Know About Us</span>
                                <h3 className="ep-section-head__big-title ep-split-text left">
                                  Unlocking the <span>Power</span> <br />
                                  of Knowledge
                                </h3>
                                <p className="ep-section-head__text">
                                  Et purus duis sollicitudin dignissim habitant. Egestas
                                  nulla quis venenatis cras sed eu massa eu faucibus. Urna
                                  fusce aenean tortor pretium. Ac
                                </p>
                              </div>
                              <div className="ep-section__widget">
                                <div className="ep-feature-list">
                                  <div className="ep-feature-list__icon">
                                    <i className="fi fi-ss-check-circle" />
                                  </div>
                                  <div className="ep-feature-list__info">
                                    <h5>Ignite your passion for learning</h5>
                                    <p>
                                      Et purus duis sollicitudin dignissim habitant.
                                      Egestas nulla quis venenatis cras sed eu massa eu
                                      faucibus.
                                    </p>
                                  </div>
                                </div>
                                <div className="ep-feature-list">
                                  <div className="ep-feature-list__icon">
                                    <i className="fi fi-ss-check-circle" />
                                  </div>
                                  <div className="ep-feature-list__info">
                                    <h5>Discover the joy of lifelong learning</h5>
                                    <p>
                                      Et purus duis sollicitudin dignissim habitant.
                                      Egestas nulla quis venenatis cras sed eu massa eu
                                      faucibus.
                                    </p>
                                  </div>
                                </div>
                              </div>
                              <div className="ep-section__btn">
                                <a href="/about" className="ep-btn border-btn">Read More <i className="fi fi-rs-arrow-small-right" />
                                </a>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </section>
                    <section className="ep-category section-gap pt-0">
                      <div className="container ep-container">
                        <div className="row justify-content-center">
                          <div className="col-lg-8 col-xl-4 col-md-8 col-12">
                            <div className="ep-section-head text-center">
                              <span className="ep-section-head__sm-title ep1-color">Categories</span>
                              <h3 className="ep-section-head__big-title ep-split-text left">
                                Study Aids to <span>Boost</span> <br />Your Learning
                              </h3>
                            </div>
                          </div>
                        </div>
                        <div className="row">
                          <div className="col-lg-4 col-xl-3 col-md-6 col-12">
                            <a href="/course" className="ep-category__card wow fadeInUp" data-wow-delay=".3s" data-wow-duration="1s">
                              <div className="ep-category__icon ep1-bg">
                                <img src="/assets/images/category/category-1/1.svg" alt="category-icon" />
                              </div>
                              <div className="ep-category__info">
                                <h3>Study Buddy</h3>
                              </div>
                            </a>
                          </div>
                          <div className="col-lg-4 col-xl-3 col-md-6 col-12">
                            <a href="/course" className="ep-category__card wow fadeInUp" data-wow-delay=".5s" data-wow-duration="1s">
                              <div className="ep-category__icon ep2-bg">
                                <img src="/assets/images/category/category-1/2.svg" alt="category-icon" />
                              </div>
                              <div className="ep-category__info">
                                <h3>Tutoring Services</h3>
                              </div>
                            </a>
                          </div>
                          <div className="col-lg-4 col-xl-3 col-md-6 col-12">
                            <a href="/course" className="ep-category__card wow fadeInUp" data-wow-delay=".7s" data-wow-duration="1s">
                              <div className="ep-category__icon ep4-bg">
                                <img src="/assets/images/category/category-1/3.svg" alt="category-icon" />
                              </div>
                              <div className="ep-category__info">
                                <h3>Digital Advertising</h3>
                              </div>
                            </a>
                          </div>
                          <div className="col-lg-4 col-xl-3 col-md-6 col-12">
                            <a href="/course" className="ep-category__card wow fadeInUp" data-wow-delay=".9s" data-wow-duration="1s">
                              <div className="ep-category__icon ep3-bg">
                                <img src="/assets/images/category/category-1/4.svg" alt="category-icon" />
                              </div>
                              <div className="ep-category__info">
                                <h3>Brain Boost</h3>
                              </div>
                            </a>
                          </div>
                          <div className="col-lg-4 col-xl-3 col-md-6 col-12">
                            <a href="/course" className="ep-category__card wow fadeInUp" data-wow-delay=".3s" data-wow-duration="1s">
                              <div className="ep-category__icon ep4-bg">
                                <img src="/assets/images/category/category-1/5.svg" alt="category-icon" />
                              </div>
                              <div className="ep-category__info">
                                <h3>Edu Connect</h3>
                              </div>
                            </a>
                          </div>
                          <div className="col-lg-4 col-xl-3 col-md-6 col-12">
                            <a href="/course" className="ep-category__card wow fadeInUp" data-wow-delay=".5s" data-wow-duration="1s">
                              <div className="ep-category__icon ep5-bg">
                                <img src="/assets/images/category/category-1/6.svg" alt="category-icon" />
                              </div>
                              <div className="ep-category__info">
                                <h3>Tutoring Services</h3>
                              </div>
                            </a>
                          </div>
                          <div className="col-lg-4 col-xl-3 col-md-6 col-12">
                            <a href="/course" className="ep-category__card wow fadeInUp" data-wow-delay=".7s" data-wow-duration="1s">
                              <div className="ep-category__icon ep6-bg">
                                <img src="/assets/images/category/category-1/7.svg" alt="category-icon" />
                              </div>
                              <div className="ep-category__info">
                                <h3>Study Buddy</h3>
                              </div>
                            </a>
                          </div>
                          <div className="col-lg-4 col-xl-3 col-md-6 col-12">
                            <a href="/course" className="ep-category__card wow fadeInUp" data-wow-delay=".9s" data-wow-duration="1s">
                              <div className="ep-category__icon ep4-bg">
                                <img src="/assets/images/category/category-1/8.svg" alt="category-icon" />
                              </div>
                              <div className="ep-category__info">
                                <h3>Online Courses</h3>
                              </div>
                            </a>
                          </div>
                        </div>
                      </div>
                    </section>
                    <div className="ep-section-bg bg-img-1">
                      <section className="ep-funfact section-gap pb-0">
                        <div className="container ep-container">
                          <div className="row g-0 justify-content-between">
                            <div className="col-xl-auto col-lg-3 col-md-6 col-12">
                              <div className="ep-funfact__card wow fadeInUp" data-wow-delay=".3s" data-wow-duration="1s">
                                <div className="ep-funfact__icon ep3-bg">
                                  <img src="/assets/images/funfact/funfact-1/1.svg" alt="funfact-icon" />
                                </div>
                                <div className="ep-funfact__info">
                                  <h4><span className="counter">14</span>k+</h4>
                                  <p>Student Enrolled</p>
                                </div>
                              </div>
                            </div>
                            <div className="col-xl-auto col-lg-3 col-md-6 col-12">
                              <div className="ep-funfact__card wow fadeInUp" data-wow-delay=".5s" data-wow-duration="1s">
                                <div className="ep-funfact__icon ep1-bg">
                                  <img src="/assets/images/funfact/funfact-1/2.svg" alt="funfact-icon" />
                                </div>
                                <div className="ep-funfact__info">
                                  <h4><span className="counter">20</span>k+</h4>
                                  <p>Class Completed</p>
                                </div>
                              </div>
                            </div>
                            <div className="col-xl-auto col-lg-3 col-md-6 col-12">
                              <div className="ep-funfact__card wow fadeInUp" data-wow-delay=".7s" data-wow-duration="1s">
                                <div className="ep-funfact__icon ep8-bg">
                                  <img src="/assets/images/funfact/funfact-1/3.svg" alt="funfact-icon" />
                                </div>
                                <div className="ep-funfact__info">
                                  <h4><span className="counter">100</span>%</h4>
                                  <p>Happy Customers</p>
                                </div>
                              </div>
                            </div>
                            <div className="col-xl-auto col-lg-3 col-md-6 col-12">
                              <div className="ep-funfact__card wow fadeInUp" data-wow-delay=".9s" data-wow-duration="1s">
                                <div className="ep-funfact__icon ep7-bg">
                                  <img src="/assets/images/funfact/funfact-1/4.svg" alt="funfact-icon" />
                                </div>
                                <div className="ep-funfact__info">
                                  <h4><span className="counter">900</span>+</h4>
                                  <p>Top Instructors</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </section>
                      <section className="ep-faq mg-top-80 position-relative">
                        <div className="ep-faq__pattern-2 updown-ani">
                          <img src="/assets/images/faq/faq-1/pattern-2.svg" alt="pattern-2" />
                        </div>
                        <div className="container ep-container">
                          <div className="ep-faq__inner position-relative">
                            <div className="ep-faq__pattern-1 rotate-ani">
                              <img src="/assets/images/faq/faq-1/pattern-1.svg" alt="pattern-1" />
                            </div>
                            <div className="row g-0 align-items-center">
                              <div className="col-lg-12 col-xl-6 col-12">
                                <div className="ep-faq__img">
                                  <img src="/assets/images/faq/faq-1/faq-img.png" alt="faq-img" />
                                </div>
                              </div>
                              <div className="col-lg-12 col-xl-6 col-12">
                                <div className="ep-faq__content">
                                  <div className="ep-section-head">
                                    <span className="ep-section-head__sm-title ep1-color">Faq</span>
                                    <h3 className="ep-section-head__big-title ep-split-text left">
                                      Frequently <span>Asked</span> <br />
                                      Questions and Answers
                                    </h3>
                                  </div>
                                  <div className="ep-faq__accordion faq-inner accordion" id="accordionExample">
                                    <div className="ep-faq__accordion-item">
                                      <h2 className="accordion-header" id="headingOne">
                                        <button className="accordion-button" type="button" aria-expanded="true" aria-controls="collapseOne">
                                          <span>01</span>What are the benefits of
                                          education?
                                        </button>
                                      </h2>
                                      <div id="collapseOne" className="accordion-collapse collapse show" aria-labelledby="headingOne" data-bs-parent="#accordionExample">
                                        <div className="ep-faq__accordion-body">
                                          <p className="ep-faq__accordion-text">
                                            Education builds practical skills, improves
                                            confidence, and creates better career
                                            opportunities. EduPath combines guided
                                            lessons, practice, and progress tracking.
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="ep-faq__accordion-item">
                                      <h2 className="accordion-header" id="headingTwo">
                                        <button className="accordion-button collapsed" type="button" aria-expanded="false" aria-controls="collapseTwo">
                                          <span>02</span>How can I find the program for
                                          me?
                                        </button>
                                      </h2>
                                      <div id="collapseTwo" className="accordion-collapse collapse" aria-labelledby="headingTwo" data-bs-parent="#accordionExample">
                                        <div className="ep-faq__accordion-body">
                                          <p className="ep-faq__accordion-text">
                                            Compare the course level, curriculum,
                                            duration, instructor, and expected outcomes.
                                            Start with beginner content when learning a
                                            new subject and progress step by step.
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="ep-faq__accordion-item">
                                      <h2 className="accordion-header" id="headingThree">
                                        <button className="accordion-button collapsed" type="button" aria-expanded="false" aria-controls="collapseThree">
                                          <span>03</span>Can I get financial for my
                                          education?
                                        </button>
                                      </h2>
                                      <div id="collapseThree" className="accordion-collapse collapse" aria-labelledby="headingThree" data-bs-parent="#accordionExample">
                                        <div className="ep-faq__accordion-body">
                                          <p className="ep-faq__accordion-text">
                                            Course discounts and available payment
                                            options are displayed at checkout. You can
                                            review the complete price before confirming
                                            your enrollment.
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
                    </div>
                    <div className="ep-brand section-gap pb-0">
                      <div className="container ep-container">
                        <div className="row">
                          <div className="col-12">
                            <div className="owl-carousel ep-brand__slider">
                              <a href="#" className="ep-brand__logo">
                                <img src="/assets/images/brand/brand-1/1.svg" alt="brand-logo" />
                              </a>
                              <a href="#" className="ep-brand__logo">
                                <img src="/assets/images/brand/brand-1/2.svg" alt="brand-logo" />
                              </a>
                              <a href="#" className="ep-brand__logo">
                                <img src="/assets/images/brand/brand-1/3.svg" alt="brand-logo" />
                              </a>
                              <a href="#" className="ep-brand__logo">
                                <img src="/assets/images/brand/brand-1/4.svg" alt="brand-logo" />
                              </a>
                              <a href="#" className="ep-brand__logo">
                                <img src="/assets/images/brand/brand-1/5.svg" alt="brand-logo" />
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <section className="ep-testimonial section-gap">
                      <div className="container ep-container">
                        <div className="row">
                          <div className="col-12">
                            <div className="owl-carousel ep-testimonial__slider">
                              <div className="ep-testimonial__item position-relative">
                                <div className="ep-testimonial__rattings">
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
                                  </ul>
                                </div>
                                <p className="ep-testimonial__desc">
                                  Their product exceeded his my daily design routine
                                  expectations wa The quality and heres attention to
                                  detail were outstanding and it isi has become an
                                  essential
                                </p>
                                <div className="ep-testimonial__author">
                                  <div className="ep-testimonial__author-img">
                                    <img src="/assets/images/testimonial/testimonial-1/author-1.png" alt="author-img" />
                                  </div>
                                  <div className="ep-testimonial__author-info">
                                    <h5>Edward Ramirez</h5>
                                    <p>CEO Of Google</p>
                                  </div>
                                </div>
                                <div className="ep-testimonial__shape">
                                  <img src="/assets/images/testimonial/testimonial-1/dot-shape.svg" alt="dot-pattern" />
                                </div>
                              </div>
                              <div className="ep-testimonial__item position-relative">
                                <div className="ep-testimonial__rattings">
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
                                  </ul>
                                </div>
                                <p className="ep-testimonial__desc">
                                  Their product exceeded his my daily design routine
                                  expectations wa The quality and heres attention to
                                  detail were outstanding and it isi has become an
                                  essential
                                </p>
                                <div className="ep-testimonial__author">
                                  <div className="ep-testimonial__author-img">
                                    <img src="/assets/images/testimonial/testimonial-1/author-2.png" alt="author-img" />
                                  </div>
                                  <div className="ep-testimonial__author-info">
                                    <h5>Edward Ramirez</h5>
                                    <p>CEO Of Google</p>
                                  </div>
                                </div>
                                <div className="ep-testimonial__shape">
                                  <img src="/assets/images/testimonial/testimonial-1/dot-shape.svg" alt="dot-pattern" />
                                </div>
                              </div>
                              <div className="ep-testimonial__item position-relative">
                                <div className="ep-testimonial__rattings">
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
                                  </ul>
                                </div>
                                <p className="ep-testimonial__desc">
                                  Their product exceeded his my daily design routine
                                  expectations wa The quality and heres attention to
                                  detail were outstanding and it isi has become an
                                  essential
                                </p>
                                <div className="ep-testimonial__author">
                                  <div className="ep-testimonial__author-img">
                                    <img src="/assets/images/testimonial/testimonial-1/author-1.png" alt="author-img" />
                                  </div>
                                  <div className="ep-testimonial__author-info">
                                    <h5>Edward Ramirez</h5>
                                    <p>CEO Of Google</p>
                                  </div>
                                </div>
                                <div className="ep-testimonial__shape">
                                  <img src="/assets/images/testimonial/testimonial-1/dot-shape.svg" alt="dot-pattern" />
                                </div>
                              </div>
                              <div className="ep-testimonial__item position-relative">
                                <div className="ep-testimonial__rattings">
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
                                  </ul>
                                </div>
                                <p className="ep-testimonial__desc">
                                  Their product exceeded his my daily design routine
                                  expectations wa The quality and heres attention to
                                  detail were outstanding and it isi has become an
                                  essential
                                </p>
                                <div className="ep-testimonial__author">
                                  <div className="ep-testimonial__author-img">
                                    <img src="/assets/images/testimonial/testimonial-1/author-2.png" alt="author-img" />
                                  </div>
                                  <div className="ep-testimonial__author-info">
                                    <h5>Edward Ramirez</h5>
                                    <p>CEO Of Google</p>
                                  </div>
                                </div>
                                <div className="ep-testimonial__shape">
                                  <img src="/assets/images/testimonial/testimonial-1/dot-shape.svg" alt="dot-pattern" />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </section>
                    <div className="ep-video section-gap pt-0">
                      <div className="container ep-container">
                        <div className="ep-video__bg background-image ep-hobble position-relative" style={{backgroundImage: 'url("/assets/images/video/video-1/bg.jpg")'}}>
                          <a href="https://www.youtube.com/watch?v=gyGsPlt06bo" className="ep-video__btn popup-video ep-hover-layer-2">
                            <i className="fi fi-sr-play" />
                          </a>
                        </div>
                      </div>
                    </div>
    </>
  );
}
