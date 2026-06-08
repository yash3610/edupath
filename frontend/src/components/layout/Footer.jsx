import React from "react";
import { Link } from "react-router-dom";

const services = [
  "Reliable Rentals",
  "Golden Key Properties",
  "Swift Home Sales",
  "Elite Realty Services",
  "Dream Property Solutions",
];

export default function Footer() {
  return (
    <footer className="ep-footer ep-footer--style2 position-relative">
      <div className="ep-footer__overlay" />
      <div className="container ep-container">
        <div className="ep-footer__top">
          <div className="row">
            <div className="col-lg-3 col-md-6 col-12">
              <div className="ep-footer__widget footer-about">
                <div className="ep-footer__logo ep-footer__logo--style2">
                  <Link to="/"><img src="/assets/images/logo-2.svg" alt="Edupath" /></Link>
                </div>
                <p className="ep-footer__text mg-top-46">It is a long established fact that a reader will be distracted</p>
                <div className="ep-footer__social mg-top-42">
                  <h5 className="ep-footer__social-title">Follow Us</h5>
                  <ul>
                    {["facebook", "twitter", "linkedin", "pinterest"].map((name) => (
                      <li key={name}><a href="#" aria-label={name}><i className={`icofont-${name}`} /></a></li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
            <div className="col-lg-3 col-md-6 col-12">
              <div className="ep-footer__widget footer-services--style2">
                <h4 className="ep-footer__widget-title ep-footer__widget-title--style2">Services</h4>
                <ul className="ep-footer__links-list ep-footer__links-list--style2">
                  {services.map((service) => (
                    <li key={service}>
                      <Link to="/service"><i className="fi fi-br-angle-double-small-right ep6-color" />{service}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="col-lg-3 col-md-6 col-12">
              <div className="ep-footer__widget footer-contact">
                <h4 className="ep-footer__widget-title ep-footer__widget-title--style2">Contact</h4>
                <div className="ep-footer__contact">
                  <div className="ep-footer__contact-single">
                    <div className="ep-footer__contact-icon"><i className="fi fi-rs-marker ep6-color" /></div>
                    <div className="ep-footer__contact-info"><p>Address</p><span>66 Broklyant, New York India</span></div>
                  </div>
                  <div className="ep-footer__contact-single">
                    <div className="ep-footer__contact-icon"><i className="fi fi-rr-phone-call ep6-color" /></div>
                    <div className="ep-footer__contact-info ep-footer__contact-info--style2">
                      <p>Phone Number</p><a href="tel:0123456789101">012 345 678 9101</a>
                    </div>
                  </div>
                  <div className="ep-footer__contact-single">
                    <div className="ep-footer__contact-icon"><i className="fi fi-rr-envelope ep6-color" /></div>
                    <div className="ep-footer__contact-info ep-footer__contact-info--style2">
                      <p>Email</p><a href="mailto:codeglim@gmail.com">codeglim@gmail.com</a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-3 col-md-6 col-12">
              <div className="ep-footer__widget footer-newsletter">
                <h4 className="ep-footer__widget-title ep-footer__widget-title--style2">Newsletter</h4>
                <p className="ep-footer__text m-0">It is a long established fact that a reader will be distracted</p>
                <form className="ep-footer__newsletter ep-footer__newsletter--style2 mg-top-30">
                  <input type="email" name="email" placeholder="Your e-mail" required />
                  <button type="submit"><i className="fi fi-ss-paper-plane" /></button>
                </form>
              </div>
            </div>
          </div>
        </div>
        <div className="ep-footer__bottom">
          <div className="row">
            <div className="col-lg-6 col-12"><div className="ep-footer__copyright"><p>© Edupath 2024 | All Rights Reserved</p></div></div>
            <div className="col-lg-6 col-12">
              <div className="ep-footer__bottom-link">
                <ul>
                  <li><a href="#">Terms &amp; Condition</a></li>
                  <li><a href="#">Privacy Policy</a></li>
                  <li><Link to="/contact">Contact Us</Link></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="ep-footer__brand"><img src="/assets/images/footer/footer-brand-name.svg" alt="footer-brand-name" /></div>
    </footer>
  );
}
