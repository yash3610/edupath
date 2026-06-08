import React from "react";
import { Link } from "react-router-dom";

export default function TeamCard({ member }) {
  return (
    <Link to={`/team/${member.slug}`} className="ep-team__card">
      <div className="ep-team__img">
        <img src={member.image} alt={member.name} />
      </div>
      <div className="ep-team__content">
        <h5>{member.name}</h5>
        <p>{member.role}</p>
      </div>
    </Link>
  );
}
