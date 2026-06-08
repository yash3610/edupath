import React, { useState } from "react";
import { useToast } from "../context/ToastContext.jsx";
import { api } from "../services/api.js";

export default function ContactPage() {
  const toast = useToast();
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "", subject: "Website enquiry" });
  const [status, setStatus] = useState({ loading: false, message: "", error: "" });

  function updateField(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function submitContact(event) {
    event.preventDefault();
    if (status.loading) return;
    setStatus({ loading: true, message: "", error: "" });
    try {
      const result = await api.contact(form);
      setStatus({ loading: false, message: result.message, error: "" });
      toast.success(result.message || "We received your message.", "Message sent");
      setForm({ name: "", email: "", phone: "", message: "", subject: "Website enquiry" });
    } catch (error) {
      setStatus({ loading: false, message: "", error: error.message });
      toast.error(error.message, "Message failed");
    }
  }

  return (
    <>
      <div className="ep-breadcrumbs breadcrumbs-bg background-image" style={{backgroundImage: 'url("/assets/images/breadcrumbs-bg.png")'}}>
                      <div className="container">
                        <div className="row justify-content-center">
                          <div className="col-lg-6 col-md-6 col-12">
                            <div className="ep-breadcrumbs__content">
                              <h3 className="ep-breadcrumbs__title">Contact</h3>
                              <ul className="ep-breadcrumbs__menu">
                                <li>
                                  <a href="/">Home</a>
                                </li>
                                <li>
                                  <i className="fi-bs-angle-right" />
                                </li>
                                <li className="active">
                                  <a href="/contact">Contact</a>
                                </li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <section className="ep-contact section-gap position-relative pb-0">
                      <div className="container ep-container">
                        <div className="row">
                          <div className="col-lg-12 col-xl-5 col-12">
                            <div className="ep-contact__info">
                              <div className="ep-contact__info-head">
                                <span>Contact us</span>
                                <h3 className="ep-split-text left">
                                  Unlocking Potential Through Education
                                </h3>
                              </div>
                              <div className="ep-contact__info-item">
                                <div className="ep-contact__info-icon">
                                  <i className="fi-ss-marker" />
                                </div>
                                <div className="ep-contact__info-text">
                                  <h6>Address</h6>
                                  <p>
                                    EduPath Learning Center, Andheri East <br />Mumbai, Maharashtra 400069
                                  </p>
                                </div>
                              </div>
                              <div className="ep-contact__info-item">
                                <div className="ep-contact__info-icon">
                                  <i className="fi fi-sr-phone-call" />
                                </div>
                                <div className="ep-contact__info-text">
                                  <h6>Lets Talk us</h6>
                                  <p>
                                    Phone number:
                                    <a href="tel:+32566 - 800 - 890">
                                      +91 98765 43210</a>
                                    <br />
                                    Mon - Sat: 10:00 AM - 7:00 PM
                                  </p>
                                </div>
                              </div>
                              <div className="ep-contact__info-item">
                                <div className="ep-contact__info-icon">
                                  <i className="fi fi-sr-envelope" />
                                </div>
                                <div className="ep-contact__info-text">
                                  <h6>Send us email</h6>
                                  <a href="mailto:yashule2121@gmail.com">
                                    yashule2121@gmail.com
                                  </a>
                                  <br />
                                  <a href="mailto:support@edupath.com">support@edupath.com
                                  </a>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="col-lg-12 col-xl-7 col-12">
                            <div className="ep-contact__form">
                              <h3 className="ep-contact__form-title ep-split-text left">
                                Get in Touch With Us
                              </h3>
                              <form onSubmit={submitContact}>
                                <div className="form-group">
                                  <label>Your Name</label>
                                  <input type="text" id="name" name="name" value={form.name} onChange={updateField} placeholder="Name " required />
                                </div>
                                <div className="form-group">
                                  <label>Your Email</label>
                                  <input type="email" id="email" name="email" value={form.email} onChange={updateField} placeholder="Email " required />
                                </div>
                                <div className="form-group">
                                  <label>Your Number</label>
                                  <input type="tel" id="phone" name="phone" value={form.phone} onChange={updateField} placeholder="Phone Number" />
                                </div>
                                <div className="form-group">
                                  <label>Message</label>
                                  <textarea name="message" id="message" value={form.message} onChange={updateField} placeholder="Message here.." required />
                                </div>
                                {status.message && <p className="form-message">{status.message}</p>}
                                {status.error && <p className="form-message form-message--error">{status.error}</p>}
                                <button type="submit" className="ep-btn" disabled={status.loading} aria-disabled={status.loading}>{status.loading ? "Sending..." : "Send Message"}</button>
                              </form>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="ep-contact__map">
                        <div className="gmap_canvas">
                          <iframe title="EduPath Mumbai location" src="https://www.google.com/maps?q=Mumbai%2C%20Maharashtra%2C%20India&output=embed" width={1920} height={576} style={{border: 0}} loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
                        </div>
                      </div>
                    </section>
                    <div className="ep-brand section-gap">
                      <div className="container ep-container">
                        <div className="row">
                          <div className="col-12">
                            <div className="owl-carousel ep-brand__slider">
                              <a href="#" className="ep-brand__logo">
                                <img src="/assets/images/brand/brand-1/1.svg" alt="brand-logo" />
                              </a>
                              <a href="#" className="ep-brand__logo">
                                <img src="/assets/images/brand/brand-1/2.svg" alt="brand-logo" />
                              </a>
                              <a href="#" className="ep-brand__logo">
                                <img src="/assets/images/brand/brand-1/3.svg" alt="brand-logo" />
                              </a>
                              <a href="#" className="ep-brand__logo">
                                <img src="/assets/images/brand/brand-1/4.svg" alt="brand-logo" />
                              </a>
                              <a href="#" className="ep-brand__logo">
                                <img src="/assets/images/brand/brand-1/5.svg" alt="brand-logo" />
                              </a>
                              <a href="#" className="ep-brand__logo">
                                <img src="/assets/images/brand/brand-1/6.svg" alt="brand-logo" />
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
    </>
  );
}
