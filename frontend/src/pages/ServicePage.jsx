import React from "react";
import Breadcrumb from "../components/common/Breadcrumb.jsx";
import ServicesSection from "../components/home/ServicesSection.jsx";

export default function ServicePage() {
  return (
    <>
      <Breadcrumb title="Services" />
      <div className="section-gap">
        <ServicesSection />
      </div>
    </>
  );
}
