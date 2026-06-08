import React from "react";
import FaqSection from "../components/home/FaqSection.jsx";
import Breadcrumb from "../components/common/Breadcrumb.jsx";

export default function FaqPage() {
  return (
    <>
      <Breadcrumb title="FAQ" />
      <FaqSection />
    </>
  );
}
