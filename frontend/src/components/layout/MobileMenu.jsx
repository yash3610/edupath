import React from "react";
import { Link } from "react-router-dom";
import Navigation from "./Navigation.jsx";

export default function MobileMenu() {
  return (
    <div className="modal mobile-menu-modal offcanvas-modal fade" id="offcanvas-modal">
      <div className="modal-dialog offcanvas-dialog">
        <div className="modal-content">
          <div className="modal-header offcanvas-header">
            <div className="offcanvas-logo">
              <Link to="/">
                <img src="/assets/images/logo.svg" alt="Edupath" />
              </Link>
            </div>
            <button type="button" className="btn-close" aria-label="Close menu">
              <i className="fi fi-ss-cross" />
            </button>
          </div>
          <div className="mobile-menu-modal-main-body">
            <nav id="offcanvas-menu" className="navigation offcanvas-menu">
              <Navigation mobile />
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
}
