import React from "react";

export default function BrandSection() {
  return (
    <div className="ep-brand section-gap pt-0">
      <div className="container ep-container">
        <div className="row">
          <div className="col-12">
            <div className="owl-carousel ep-brand__slider">
              {[1, 2, 3, 4, 5].map((item) => (
                <a href="#" className="ep-brand__logo ep-brand__logo--style2" key={item}>
                  <img src={`/assets/images/brand/brand-2/${item}.svg`} alt="brand-logo" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
