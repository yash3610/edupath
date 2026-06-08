import React from "react";

export default function GroupStudySection() {
  return (
    <section className="ep-group-study position-relative section-gap mg-btm-120 pt-0">
      <div className="container ep-container">
        <div className="ep-group-study__inner position-relative">
          <div className="ep-brand-name"><img src="/assets/images/brand-name.svg" alt="brand-name" /></div>
          <div className="ep-group-study__shape updown-ani"><img src="/assets/images/group-study/shape.svg" alt="arrow-icon" /></div>
          <div className="row">
            <div className="col-12">
              <div className="ep-section-head ep-section-head--style2">
                <h3 className="ep-section-head__color-title ep9-color ep9-border-color">2.Group ACTIVITIES</h3>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-lg-6 col-xl-4 col-12">
              <div className="ep-section__content ep-section__content--style2">
                <h3 className="ep-section__title ep-split-text left">Tools and Guides for <br />Success Explore</h3>
                <p className="ep-section__text">Lorem ipsum dolor sit amet consectetur. Amet lectus mi ultricies dictum facilisis.</p>
                <div className="ep-section__btn">
                  <a href="/about" className="ep-btn border-btn">Read More <i className="fi fi-rs-arrow-small-right" /></a>
                </div>
              </div>
            </div>
            <div className="col-lg-6 col-xl-6 offset-xl-2 col-12">
              <div className="ep-group-study__video background-image ep-hobble position-relative" style={{ backgroundImage: 'url("/assets/images/group-study/study-img.png")' }}>
                <a href="https://www.youtube.com/watch?v=gyGsPlt06bo" className="ep-video__btn popup-video ep-hover-layer-2">
                  <i className="fi fi-sr-play" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
