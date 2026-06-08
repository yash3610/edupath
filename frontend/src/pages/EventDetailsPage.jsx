import React from "react";

export default function EventDetailsPage() {
  return (
    <>
      <div className="ep-breadcrumbs breadcrumbs-bg background-image" style={{backgroundImage: 'url("/assets/images/breadcrumbs-bg.png")'}}>
                      <div className="container">
                        <div className="row justify-content-center">
                          <div className="col-lg-6 col-md-6 col-12">
                            <div className="ep-breadcrumbs__content">
                              <h3 className="ep-breadcrumbs__title">Event details</h3>
                              <ul className="ep-breadcrumbs__menu">
                                <li>
                                  <a href="/">Home</a>
                                </li>
                                <li>
                                  <i className="fi-bs-angle-right" />
                                </li>
                                <li className="active">
                                  <a href="/event-details">Event details</a>
                                </li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <section className="ep-event__details section-gap position-relative">
                      <div className="container ep-container">
                        <div className="row">
                          <div className="col-lg-12 col-xl-8 col-12">
                            <div className="ep-event__details-content">
                              <div className="ep-event__widget">
                                <h3 className="ep-event__widget-title">About The Event</h3>
                                <p className="ep-event__widget-text">
                                  Aliquam eros justo, posuere loborti vive rra laoreet
                                  matti ullamc orper posu ere viverra .Aliquam eros the
                                  justo, posuere lobo, vive rra laoreet augue mattis
                                  fermentum ullamcorper viverra laoreet Aliquam eros a
                                  justo, posuere loborti viverra laoreet mat ullamcorper
                                  posue viverra .Aliquam
                                </p>
                                <br />
                                <p className="ep-event__widget-text">
                                  Education is a vital aspect of a child's development.
                                  Preschools, elementary schools, and middle schools play
                                  a significant role in providing quality education and
                                  fostering growth in young minds Education is a vital
                                  aspect of a child's development. Preschools, elementary
                                  schools, and middle schools play a the a significant
                                  role in providing quality education and fostering growth
                                  in young minds
                                </p>
                                <br />
                                <ul className="ep-event__widget-list">
                                  <li>
                                    <i className="fi-ss-check-circle" />Nurturing Young
                                    Minds
                                  </li>
                                  <li>
                                    <i className="fi-ss-check-circle" />Unlocking Potential
                                  </li>
                                  <li>
                                    <i className="fi-ss-check-circle" />Through Education
                                  </li>
                                  <li>
                                    <i className="fi-ss-check-circle" />Igniting Curiosity
                                    Imagination
                                  </li>
                                  <li>
                                    <i className="fi-ss-check-circle" />Nurturing Young Min
                                  </li>
                                  <li>
                                    <i className="fi-ss-check-circle" />Foundation for
                                    Success
                                  </li>
                                </ul>
                              </div>
                              <div className="ep-event__widget">
                                <h3 className="ep-event__widget-title">Event Location</h3>
                                <ul className="ep-event__widget-meta">
                                  <li>
                                    <i className="fi fi-rs-marker" />Mirpur Bangladesh
                                  </li>
                                  <li><i className="fi fi-rr-clock" />10Am To 3Pm</li>
                                </ul>
                                <div className="ep-event__location-map">
                                  <div className="gmap_canvas">
                                    <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d7298.959613692403!2d90.36501104141328!3d23.83709017812546!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3755c17cf9e11737%3A0x44c49aa5dd7c3f00!2sMirpur%20DOHS%20Cultural%20Center!5e0!3m2!1sen!2sbd!4v1721998237394!5m2!1sen!2sbd" width={830} height={320} style={{border: 0}} />
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="col-lg-8 col-xl-4 col-12">
                            <div className="ep-event__sidebar">
                              <h4 className="ep-event__sidebar-title">Event Info</h4>
                              <p className="ep-event__sidebar-text">
                                Aliquam eros justo, posuere loborti vive rra laoreet matti
                                ullamc orper posu.
                              </p>
                              <div className="ep-event__checkout">
                                <ul>
                                  <li>Cost: <span className="ep3-color">$250.00</span></li>
                                  <li>Total Slot: <span>250</span></li>
                                  <li>Booked Slot: <span>2</span></li>
                                </ul>
                                <div className="ep-event__checkout-btn">
                                  <a href="#" className="ep-btn">Book Now <i className="fi-rs-arrow-small-right" />
                                  </a>
                                </div>
                              </div>
                              <div className="ep-event__time">
                                <p className="ep-event__time-title">
                                  Remaining Time For Event
                                </p>
                                <ul className="ep-event__time-list">
                                  <li>302 Days</li>
                                  <li>3 Hours</li>
                                  <li>20 Min</li>
                                  <li>25 Sec</li>
                                </ul>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </section>
    </>
  );
}
