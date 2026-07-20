import React, { useEffect, useRef } from "react";
import AboutSection from "../components/home/AboutSection.jsx";
import BlogSection from "../components/home/BlogSection.jsx";
import BrandSection from "../components/home/BrandSection.jsx";
import CoursesSection from "../components/home/CoursesSection.jsx";
import EventsSection from "../components/home/EventsSection.jsx";
import FaqSection from "../components/home/FaqSection.jsx";
import FunFactSection from "../components/home/FunFactSection.jsx";
import GroupStudySection from "../components/home/GroupStudySection.jsx";
import HeroSection from "../components/home/HeroSection.jsx";
import ServicesSection from "../components/home/ServicesSection.jsx";
import TeamSection from "../components/home/TeamSection.jsx";

export default function HomePage() {
  const pageRef = useRef(null);

  useEffect(() => {
    const page = pageRef.current;
    if (!page) return undefined;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const sections = [...page.querySelectorAll(":scope > section:not(.ep-hero)")];
    const staggerSelector = [
      ".ep-funfact__card", ".ep-service__card", ".ep-course__card",
      ".ep-blog__card", ".ep-team__card",
      ".ep-event__card", ".ep-brand__item",
    ].join(",");

    sections.forEach((section) => {
      section.classList.add("home-scroll-reveal");
      [...section.querySelectorAll(staggerSelector)].forEach((item, index) => {
        item.classList.add("home-stagger-item");
        item.style.setProperty("--reveal-delay", `${Math.min(index, 5) * 80}ms`);
      });
    });

    if (reduceMotion || !("IntersectionObserver" in window)) {
      sections.forEach((section) => section.classList.add("is-visible"));
      return undefined;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={pageRef} className="home-motion-page">
      <HeroSection />
      <AboutSection />
      <FunFactSection />
      <GroupStudySection />
      <ServicesSection />
      <CoursesSection />
      <EventsSection />
      <TeamSection />
      <FaqSection />
      <BlogSection />
      <BrandSection />
    </div>
  );
}
