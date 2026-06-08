import React from "react";
import { pricingPlans } from "../../data/homeData.js";

export default function PricingSection() {
  return (
    <section className="ep-pricing section-gap position-relative pt-0">
      <div className="container ep-container">
        <div className="ep-pricing__shape updown-ani"><img src="/assets/images/pricing/arrow.svg" alt="pricing-shape" /></div>
        <div className="col-12">
          <div className="ep-section-head ep-section-head--style2">
            <h3 className="ep-section-head__color-title ep1-color ep1-border-color">5.Pricing</h3>
            <h2 className="ep-section-head__big-title ep-split-text left">Your Next Career Move Awaits <br />Guides for Success</h2>
          </div>
        </div>
        <div className="row">
          {pricingPlans.map((plan) => (
            <div className="col-lg-6 col-xl-4 col-md-6 col-12" key={plan.title}>
              <div className={`ep-pricing__card ${plan.cardClass} wow fadeInUp`}>
                <div className="ep-pricing__head">
                  <div className={`ep-pricing__icon ${plan.bgClass}`}>
                    <img src={`/assets/images/pricing/${plan.icon}`} alt="pricing-icon" />
                  </div>
                  <h3 className="ep-pricing__title">{plan.title}</h3>
                  <div className="ep-pricing__price">
                    <span className={`ep-pricing__amount ${plan.colorClass}`}>{plan.amount}</span>
                    <span className="ep-pricing__duration">{plan.duration}</span>
                  </div>
                </div>
                <ul className="ep-pricing__features">
                  {["Mistakes To Avoid", "Your Startup", "Knew About Fonts", "Winning Metric for Your Startup", "Your Startup"].map((feature) => (
                    <li key={feature}><i className="fi fi-sr-checkbox" /> {feature}</li>
                  ))}
                </ul>
                <div className="ep-pricing__btn"><a href="/contact" className="ep-btn border-btn">Buy Now</a></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
