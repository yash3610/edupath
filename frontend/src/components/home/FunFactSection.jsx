import React from "react";

const facts = [
  ["1.svg", "200+", "Team member", "ep5-bg-light"],
  ["2.svg", "30k+", "Winning award", "ep1-bg-light"],
  ["3.svg", "25k", "Complete project", "ep7-bg-light"],
  ["4.svg", "300k", "Client review", "ep2-bg-light"],
];

export default function FunFactSection() {
  return (
    <section className="ep-funfact ep-funfact--style2 section-gap pt-0 position-relative">
      <div className="container ep-container">
        <div className="ep-funfact-shape updown-ani">
          <img src="/assets/images/funfact/funfact-2/arrow.svg" alt="arrow-icon" />
        </div>
        <div className="row">
          {facts.map(([icon, value, label, bg]) => (
            <div className="col-lg-4 col-xl-3 col-md-6 col-12" key={label}>
              <div className="ep-funfact__card ep-funfact__card--style2 wow fadeInUp">
                <div className={`ep-funfact__icon ${bg}`}>
                  <img src={`/assets/images/funfact/funfact-2/${icon}`} alt="funfact-icon" />
                </div>
                <div className="ep-funfact__info m-0">
                  <h4><span className="counter">{value}</span></h4>
                  <p>{label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
