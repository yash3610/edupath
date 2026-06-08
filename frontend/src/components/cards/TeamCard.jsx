import React from "react";

export default function TeamCard({ member }) {
  return (
    <a href="/team-details" className="ep-team__card">
      <div className="ep-team__img">
        <img src={member.image} alt={member.name} />
      </div>
      <div className="ep-team__content">
        <h5>{member.name}</h5>
        <p>{member.role}</p>
      </div>
    </a>
  );
}
