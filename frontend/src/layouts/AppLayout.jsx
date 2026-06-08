import React from "react";
import { Outlet } from "react-router-dom";
import PageShell from "../components/PageShell.jsx";
import Footer from "../components/layout/Footer.jsx";
import Header from "../components/layout/Header.jsx";
import MobileMenu from "../components/layout/MobileMenu.jsx";
import Preloader from "../components/layout/Preloader.jsx";

export default function AppLayout() {
  return (
    <PageShell title="Edupath - Education, Course & Online Learning">
      <Preloader />
      <MobileMenu />
      <Header />
      <div id="smooth-wrapper">
        <div id="smooth-content">
          <main>
            <Outlet />
          </main>
          <Footer />
        </div>
      </div>
    </PageShell>
  );
}
