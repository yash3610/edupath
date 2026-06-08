import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import AppLayout from "../layouts/AppLayout.jsx";
import AboutPage from "../pages/AboutPage.jsx";
import BlogDetailsPage from "../pages/BlogDetailsPage.jsx";
import BlogPage from "../pages/BlogPage.jsx";
import CartPage from "../pages/CartPage.jsx";
import CheckoutPage from "../pages/CheckoutPage.jsx";
import ContactPage from "../pages/ContactPage.jsx";
import CourseDetailsPage from "../pages/CourseDetailsPage.jsx";
import CoursePage from "../pages/CoursePage.jsx";
import EventDetailsPage from "../pages/EventDetailsPage.jsx";
import EventPage from "../pages/EventPage.jsx";
import FaqPage from "../pages/FaqPage.jsx";
import HomePage from "../pages/HomePage.jsx";
import LoginPage from "../pages/LoginPage.jsx";
import NotFoundPage from "../pages/NotFoundPage.jsx";
import PortfolioPage from "../pages/PortfolioPage.jsx";
import RegisterPage from "../pages/RegisterPage.jsx";
import ServicePage from "../pages/ServicePage.jsx";
import ShopPage from "../pages/ShopPage.jsx";
import ShopSinglePage from "../pages/ShopSinglePage.jsx";
import TeamDetailsPage from "../pages/TeamDetailsPage.jsx";
import TeamPage from "../pages/TeamPage.jsx";
import TestimonialPage from "../pages/TestimonialPage.jsx";
import WishlistPage from "../pages/WishlistPage.jsx";
import ProtectedRoute from "../components/common/ProtectedRoute.jsx";

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/course" element={<CoursePage />} />
        <Route path="/course/:slug" element={<CourseDetailsPage />} />
        <Route path="/course-details" element={<Navigate to="/course/web-development-bootcamp" replace />} />
        <Route path="/event" element={<EventPage />} />
        <Route path="/event-details" element={<EventDetailsPage />} />
        <Route path="/event/:slug" element={<EventDetailsPage />} />
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/blog-details" element={<BlogDetailsPage />} />
        <Route path="/blog/:slug" element={<BlogDetailsPage />} />
        <Route path="/shop" element={<ShopPage />} />
        <Route path="/shop-single" element={<ShopSinglePage />} />
        <Route path="/shop/:slug" element={<ShopSinglePage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/wishlist" element={<WishlistPage />} />
        <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
        <Route path="/team" element={<TeamPage />} />
        <Route path="/team-details" element={<TeamDetailsPage />} />
        <Route path="/team/:slug" element={<TeamDetailsPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/faq" element={<FaqPage />} />
        <Route path="/service" element={<ServicePage />} />
        <Route path="/portfolio" element={<PortfolioPage />} />
        <Route path="/testimonial" element={<TestimonialPage />} />
        <Route path="/404" element={<NotFoundPage />} />
      </Route>

      <Route path="/index" element={<Navigate to="/" replace />} />
      <Route path="/index-2" element={<Navigate to="/" replace />} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  );
}
