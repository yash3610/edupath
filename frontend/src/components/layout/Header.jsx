import React from "react";
import { Link } from "react-router-dom";
import Navigation from "./Navigation.jsx";
import { dashboardPathForRole, useAuth } from "../../context/AuthContext.jsx";
import { useCart } from "../../context/CartContext.jsx";

export default function Header() {
  const { user, logout } = useAuth();
  const { items } = useCart();
  return (
    <header className="ep-header ep-header--style2 position-relative">
      <div id="active-sticky" className="ep-header__middle ep-header__middle--style2">
        <div className="container ep-container">
          <div className="ep-header__inner ep-header__inner--style2">
            <div className="row align-items-center">
              <div className="col-lg-2 col-6">
                <div className="ep-logo">
                  <Link to="/">
                    <img src="/assets/images/logo.svg" alt="Edupath" />
                  </Link>
                </div>
              </div>
              <div className="col-lg-10 col-6">
                <div className="ep-header__inner-right">
                  <nav className="ep-header__navigation">
                    <Navigation />
                  </nav>
                  <div className="ep-header__btn">
                    <Link to="/cart" className="header-cart-link" aria-label={`Cart with ${items.length} courses`}>
                      <i className="fi fi-rr-shopping-cart" /> {items.length}
                    </Link>
                    {user ? (
                      <>
                        <Link to={dashboardPathForRole(user.role)} className="ep-btn ep5-bg">Dashboard</Link>
                        <button type="button" className="ep-btn ep5-bg" onClick={logout}>Logout</button>
                      </>
                    ) : (
                      <Link to="/login" className="ep-btn ep5-bg">Login</Link>
                    )}
                  </div>
                </div>
                <button type="button" className="mobile-menu-offcanvas-toggler" aria-label="Open menu">
                  <span className="line" />
                  <span className="line" />
                  <span className="line" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
