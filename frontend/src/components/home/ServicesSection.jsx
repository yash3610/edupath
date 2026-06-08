import React from "react";
import { services } from "../../data/homeData.js";

export default function ServicesSection() {
  return (
    <section className="ep-service section-gap pt-0">
      <div className="container ep-container">
        <div className="col-12">
          <div className="ep-section-head ep-section-head--style2">
            <h3 className="ep-section-head__color-title ep1-color ep1-border-color">3.Service</h3>
            <h2 className="ep-section-head__big-title ep-split-text left">Celebrate Our Successful <br />Graduates with Us</h2>
          </div>
        </div>
        <div className="row">
          {services.map(([icon, title, className]) => (
            <div className="col-lg-4 col-md-6 col-12" key={title}>
              <div className={`ep-service__card ${className} wow fadeInUp`}>
                <div className="ep-service__icon">
                  <img src={`/assets/images/service/${icon}`} alt="service-icon" />
                </div>
                <div className="ep-service__info">
                  <h3>{title}</h3>
                  <p>currencies and get paid like a local Use receiving accounts a number a</p>
                  <div className="ep-service__btn">
                    <a href="/contact">Read More <i className="fi fi-rs-arrow-small-right" /></a>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
