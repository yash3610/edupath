import React from "react";

export default function HeroSection() {
  return (
    <section className="ep-hero ep-hero--style2 hero-bg background-image" style={{ backgroundImage: 'url("/assets/images/hero/home-2/bg.png")' }}>
      <div className="container ep-container">
        <div className="row align-items-center">
          <div className="col-lg-12 col-xl-6 col-12">
            <div className="ep-hero__content ep-hero__content--style2">
              <h1 className="ep-hero__title ep-split-text left">
                Transforming Lives <span>Through</span> Education
              </h1>
              <p className="ep-hero__text">
                They play a vital role in the economy by providing security and stability design enabling individuals and businesses.
              </p>
              <div className="ep-hero__search">
                <form action="#" method="post" className="ep-hero__search-form position-relative">
                  <input type="search" name="search" placeholder="Search.." required />
                  <button type="submit" className="ep-hero__search-btn">
                    <i className="fi fi-rs-search" />
                  </button>
                </form>
              </div>
            </div>
          </div>
          <div className="col-lg-12 offset-xl-1 col-xl-5 col-12 order-top">
            <div className="ep-hero__widget ep-hero__widget-style2 position-relative">
              <div className="ep-hero__img">
                <img src="/assets/images/hero/home-2/hero-img.png" alt="hero-img" />
              </div>
              <div className="ep-hero__overview-card updown-ani">
                <h4><span>2</span>k+</h4>
                <p>Full Time Student</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
