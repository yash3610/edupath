import React from "react";
import useApiResource from "../../hooks/useApiResource.js";
import { fallbackEvents } from "../../data/homeData.js";

export default function EventsSection() {
  const { data } = useApiResource("events");
  const events = data.length ? data : fallbackEvents;

  return (
    <section className="ep-event section-gap section-bg-1 position-relative">
      <div className="container ep-container">
        <div className="col-12">
          <div className="ep-section-head ep-section-head--style2">
            <h3 className="ep-section-head__color-title ep1-color ep1-border-color">6.Our event</h3>
            <div className="ep-section-head__inner">
              <h2 className="ep-section-head__big-title ep-split-text left">Stay Updated on <br />Upcoming Events</h2>
              <p className="ep-section-head__text mg-top-30">Lorem ipsum dolor sit amet consectetur. A lectus mi ultricies dictum facilisis.</p>
            </div>
          </div>
        </div>
      </div>
      <div className="ep-event__container">
        <div className="ep-event__shape updown-ani"><img src="/assets/images/event/event-1/arrow.svg" alt="arrow-icon" /></div>
        <div className="row">
          <div className="owl-carousel ep-event__slider">
            {events.map((event) => (
              <div className="ep-event__card" key={event.slug || event.title}>
                <a href="/event-details" className="ep-event__img"><img src={event.image} alt="event-img" /></a>
                <div className="ep-event__info">
                  <div className="ep-event__date ep6-bg">25 Dec</div>
                  <div className="ep-event__location"><i className="fi fi-rs-marker ep6-color" />{event.location}</div>
                  <a href="/event-details" className="ep-event__title">{event.title}</a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
