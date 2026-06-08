import React from "react";
import AboutSection from "../components/home/AboutSection.jsx";
import BlogSection from "../components/home/BlogSection.jsx";
import BrandSection from "../components/home/BrandSection.jsx";
import CoursesSection from "../components/home/CoursesSection.jsx";
import EventsSection from "../components/home/EventsSection.jsx";
import FaqSection from "../components/home/FaqSection.jsx";
import FunFactSection from "../components/home/FunFactSection.jsx";
import GroupStudySection from "../components/home/GroupStudySection.jsx";
import HeroSection from "../components/home/HeroSection.jsx";
import PricingSection from "../components/home/PricingSection.jsx";
import ServicesSection from "../components/home/ServicesSection.jsx";
import TeamSection from "../components/home/TeamSection.jsx";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <AboutSection />
      <FunFactSection />
      <GroupStudySection />
      <ServicesSection />
      <CoursesSection />
      <PricingSection />
      <EventsSection />
      <TeamSection />
      <FaqSection />
      <BlogSection />
      <BrandSection />
    </>
  );
}
