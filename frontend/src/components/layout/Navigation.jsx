import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { navigationGroups } from "../../config/navigation.js";

export default function Navigation({ mobile = false }) {
  const { pathname } = useLocation();

  return (
    <ul className={mobile ? "list-none offcanvas-men-list" : "ep-header__menu ep-header__menu--style2"}>
      {navigationGroups.map((group) => {
        const activeGroup = group.links.some((link) => link.path === pathname);
        const directLink = group.links.length === 1 ? group.links[0] : null;

        if (directLink) {
          return (
            <li key={group.label} className={activeGroup ? "active" : ""}>
              <NavLink to={directLink.path}>{group.label}</NavLink>
            </li>
          );
        }

        return (
          <li key={group.label} className={activeGroup ? "active" : ""}>
            <button type="button" className={mobile ? "menu-arrow nav-group-button" : "nav-group-button"}>
              {group.label}
              {!mobile && <i className="fi fi-ss-angle-small-down" />}
            </button>
            <ul className="sub-menu">
              {group.links.map((link) => (
                <li key={link.path}>
                  <NavLink
                    to={link.path}
                    className={({ isActive }) => (isActive ? "menu-active" : "")}
                  >
                    {link.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </li>
        );
      })}
      <li className={pathname === "/contact" ? "active" : ""}>
        <NavLink to="/contact">Contact</NavLink>
      </li>
    </ul>
  );
}
