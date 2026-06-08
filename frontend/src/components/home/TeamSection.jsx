import React from "react";
import useApiResource from "../../hooks/useApiResource.js";
import { fallbackTeam } from "../../data/homeData.js";

export default function TeamSection() {
  const { data } = useApiResource("team");
  const team = data.length ? data : fallbackTeam;

  return (
    <section className="ep-team ep-team--style2 section-gap position-relative">
      <div className="ep-team__pattern-style2">
        <img className="pattern-1 updown-ani" src="/assets/images/team/team-2/pattern-1.svg" alt="pattern-1" />
        <img className="pattern-2 rotate-ani" src="/assets/images/team/team-2/pattern-2.svg" alt="pattern-2" />
        <img className="pattern-3 updown-ani" src="/assets/images/team/team-2/pattern-3.svg" alt="pattern-3" />
      </div>
      <div className="container ep-container">
        <div className="row">
          <div className="col-12">
            <div className="ep-section-head ep-section-head--style2">
              <h3 className="ep-section-head__color-title ep1-color ep1-border-color">7.Our Team Member</h3>
              <h2 className="ep-section-head__big-title ep-split-text left">Popular Courses the <br />Main learning</h2>
            </div>
          </div>
        </div>
        <div className="row">
          {team.slice(0, 3).map((member) => (
            <div className="col-lg-6 col-xl-4 col-md-6 col-12" key={member.slug || member.name}>
              <div className="ep-team__card ep-team__card--style2 wow fadeInUp">
                <a href="/team-details" className="ep-team__img"><img src={member.image} alt="team-img" /></a>
                <div className="ep-team__content">
                  <div className="ep-team__author">
                    <a href="/team-details"><h5>{member.name}</h5></a>
                    <p>{member.role}</p>
                  </div>
                  <div className="ep-team__social">
                    <span className="ep-team__social-btn"><i className="fi-rr-share" /></span>
                    <ul>
                      {["twitter", "facebook", "instagram", "linkedin"].map((item) => (
                        <li key={item}><a href="#"><i className={`icofont-${item}`} /></a></li>
                      ))}
                    </ul>
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
