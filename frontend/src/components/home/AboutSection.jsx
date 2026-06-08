import React from "react";

export default function AboutSection() {
  return (
    <section className="ep-about ep-about--style2 ep-section section-gap position-relative">
      <div className="container ep-container">
        <div className="row">
          <div className="col-12">
            <div className="ep-section-head ep-section-head--style2">
              <h3 className="ep-section-head__color-title ep1-color ep1-border-color">1.ABOUT US</h3>
            </div>
          </div>
        </div>
        <div className="row align-items-center">
          <div className="col-lg-6 col-12">
            <div className="ep-section__img ep-section__img--style2 position-relative">
              <div className="ep-section__img-main">
                <img src="/assets/images/about/about-2/about-img.png" alt="about-img" />
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
            <div className="ep-section__content ep-section__content--style2">
              <h3 className="ep-section__title ep-split-text left">Our Inspiring Story and <br />Vision Who We Are</h3>
              <p className="ep-section__text">
                Lorem ipsum dolor sit amet consectetur. Amet lectus mi ultricies dictum facilisis sem. Imperdiet massa turpis sit proin metus volutpat.
              </p>
              <div className="ep-section__widget ep-section__widget--style2">
                <ul className="ep-feature-list">
                  <li><i className="fi fi-ss-check-circle" />Exploring Minds</li>
                  <li><i className="fi fi-ss-check-circle" />Hoppers Kinderland</li>
                </ul>
                <ul className="ep-feature-list">
                  <li><i className="fi fi-ss-check-circle" />Elementary School</li>
                  <li><i className="fi fi-ss-check-circle" />Daycare and Learn</li>
                </ul>
              </div>
              <div className="ep-section__btn">
                <a href="/about" className="ep-btn ep1-bg">Read More <i className="fi fi-rs-arrow-small-right" /></a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
