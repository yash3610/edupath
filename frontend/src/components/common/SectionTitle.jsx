import React from "react";

export default function SectionTitle({ subtitle, title, centered = false }) {
  return (
    <div className={`ep-section-head ${centered ? "text-center" : ""}`}>
      {subtitle ? <span className="ep-section-head__sm-title">{subtitle}</span> : null}
      {title ? <h3 className="ep-section-head__big-title ep-split-text left">{title}</h3> : null}
    </div>
  );
}
