import React from "react";
import Breadcrumb from "./Breadcrumb.jsx";

export default function ComingSoonPage({ title, description }) {
  return (
    <>
      <Breadcrumb title={title} />
      <section className="section-gap">
        <div className="container ep-container">
          <div className="row justify-content-center">
            <div className="col-lg-8 col-12 text-center">
              <div className="ep-auth__card">
                <h2>{title}</h2>
                <p className="mg-top-20">{description}</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
