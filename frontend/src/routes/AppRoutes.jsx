import React from "react";
import { Navigate, Route, Routes, useParams } from "react-router-dom";
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
import StaffLoginPage from "../pages/StaffLoginPage.jsx";
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
import LumaStudentLayout from "../layouts/luma/StudentLayout.jsx";
import LumaAdminLayout from "../layouts/luma/AdminLayout.jsx";
import LumaInstructorLayout from "../layouts/luma/InstructorLayout.jsx";
import LumaPage from "./LumaPage.jsx";
const AdminCourseEditorPage = React.lazy(() => import("../pages/dashboard/_dynamic/AdminCourseEditorPage.jsx"));
const CourseAnalyticsPage = React.lazy(() => import("../pages/dashboard/_dynamic/CourseAnalyticsPage.jsx"));
const InstructorCourseCreatePage = React.lazy(() => import("../pages/dashboard/_dynamic/InstructorCourseCreatePage.jsx"));
const InstructorQuizAnalyticsPage = React.lazy(() => import("../pages/dashboard/_dynamic/InstructorQuizAnalyticsPage.jsx"));
const InstructorQuizBuilderPage = React.lazy(() => import("../pages/dashboard/_dynamic/InstructorQuizBuilderPage.jsx"));
const LearningRoomPage = React.lazy(() => import("../pages/dashboard/_dynamic/LearningRoomPage.jsx"));
const LiveClassDetailPage = React.lazy(() => import("../pages/dashboard/_dynamic/LiveClassDetailPage.jsx"));
const LiveClassFormPage = React.lazy(() => import("../pages/dashboard/_dynamic/LiveClassFormPage.jsx"));
const QuizAttemptPage = React.lazy(() => import("../pages/dashboard/_dynamic/QuizAttemptPage.jsx"));
const QuizHistoryPage = React.lazy(() => import("../pages/dashboard/_dynamic/QuizHistoryPage.jsx"));
const QuizInstructionsPage = React.lazy(() => import("../pages/dashboard/_dynamic/QuizInstructionsPage.jsx"));
const QuizResultPage = React.lazy(() => import("../pages/dashboard/_dynamic/QuizResultPage.jsx"));
const RoleManagementPage = React.lazy(() => import("../pages/dashboard/_dynamic/RoleManagementPage.jsx"));
const StudentLiveClassesPage = React.lazy(() => import("../pages/dashboard/_dynamic/StudentLiveClassesPage.jsx"));

const lumaStudentPages = [
  "achievements", "ai", "analytics", "assignments", "calendar", "certificates",
  "community", "continue", "courses", "downloads", "messages", "notes",
  "notifications", "orders", "paths", "profile", "quizzes", "settings", "wishlist",
];

const lumaAdminPages = [
  "approvals", "assignments", "categories", "certificates", "cms", "community",
  "coupons", "courses", "earnings", "instructors", "live", "modules",
  "notifications", "orders", "payments", "payouts", "quizzes", "refunds",
  "reports", "reviews", "settings", "students", "support",
];

const lumaInstructorPages = [
  "analytics", "assignments", "builder", "courses", "doubts", "live",
  "messages", "modules", "notifications", "profile", "quizzes", "resources",
  "reviews", "settings", "students",
];

function DashboardSuspense({ children }) {
  return (
    <React.Suspense
      fallback={
        <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "var(--background)", color: "var(--foreground)" }}>
          <div style={{ textAlign: "center" }}>
            <div
              aria-hidden="true"
              style={{
                width: 36,
                height: 36,
                margin: "0 auto",
                borderRadius: "50%",
                border: "4px solid color-mix(in oklab, currentColor 12%, transparent)",
                borderTopColor: "var(--primary)",
                animation: "edupath-dashboard-spin .75s linear infinite",
              }}
            />
            <p style={{ marginTop: 14, fontSize: 14, fontWeight: 600 }}>Loading dashboard...</p>
            <style>{`@keyframes edupath-dashboard-spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        </div>
      }
    >
      {children}
    </React.Suspense>
  );
}

function ParamRedirect({ to }) {
  const params = useParams();
  const target = Object.entries(params).reduce((path, [key, value]) => path.replace(`:${key}`, value), to);
  return <Navigate to={target} replace />;
}

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
        <Route path="/wishlist" element={<ProtectedRoute allowedRoles={["student"]}><WishlistPage /></ProtectedRoute>} />
        <Route path="/checkout" element={<ProtectedRoute allowedRoles={["student"]}><CheckoutPage /></ProtectedRoute>} />
        <Route path="/team" element={<TeamPage />} />
        <Route path="/team-details" element={<TeamDetailsPage />} />
        <Route path="/team/:slug" element={<TeamDetailsPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/staff/login" element={<StaffLoginPage />} />
        <Route path="/admin/login" element={<Navigate to="/staff/login" replace />} />
        <Route path="/instructor/login" element={<Navigate to="/staff/login" replace />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/faq" element={<FaqPage />} />
        <Route path="/service" element={<ServicePage />} />
        <Route path="/portfolio" element={<PortfolioPage />} />
        <Route path="/testimonial" element={<TestimonialPage />} />
        <Route path="/404" element={<NotFoundPage />} />
      </Route>

      <Route path="/dashboard" element={<ProtectedRoute allowedRoles={["student"]}><DashboardSuspense><LumaStudentLayout /></DashboardSuspense></ProtectedRoute>}>
        <Route index element={<LumaPage role="student" />} />
        {lumaStudentPages.map((name) => (
          <Route key={`student-${name}`} path={name} element={<LumaPage role="student" name={name} />} />
        ))}
        <Route path="learn" element={<LearningRoomPage />} />
        <Route path="learn/:courseId" element={<LearningRoomPage />} />
        <Route path="learn/:courseId/:lectureId" element={<LearningRoomPage />} />
        <Route path="continue-learning" element={<LearningRoomPage />} />
        <Route path="quizzes/:quizId/instructions" element={<QuizInstructionsPage />} />
        <Route path="quizzes/attempt/:attemptId" element={<QuizAttemptPage />} />
        <Route path="quizzes/result/:attemptId" element={<QuizResultPage />} />
        <Route path="quizzes/history/:quizId" element={<QuizHistoryPage />} />
        <Route path="account" element={<Navigate to="/dashboard/profile" replace />} />
        <Route path="doubts" element={<LumaPage role="student" name="doubts" />} />
        <Route path="live-classes" element={<StudentLiveClassesPage />} />
        <Route path="live-classes/recordings" element={<StudentLiveClassesPage recordingsOnly />} />
        <Route path="live-classes/:id" element={<LiveClassDetailPage role="student" />} />
        <Route path="ai" element={<Navigate to="/dashboard/ai-tutor" replace />} />
        <Route path="ai-tutor" element={<LumaPage role="student" name="ai" />} />
        <Route path="ai-notes" element={<LumaPage role="student" name="notes" />} />
        <Route path="ai-recommendations" element={<LumaPage role="student" name="paths" />} />
      </Route>

      <Route path="/dashboard/admin/quizzes" element={<Navigate to="/admin/dashboard/quizzes" replace />} />
      <Route path="/dashboard/instructor/quizzes/builder" element={<Navigate to="/instructor/dashboard/quizzes/new" replace />} />
      <Route path="/dashboard/instructor/quizzes/:quizId/analytics" element={<Navigate to="/instructor/dashboard/quizzes/demo/analytics" replace />} />

      <Route
        path="/admin/dashboard"
        element={<ProtectedRoute allowedRoles={["admin"]} loginPath="/staff/login"><DashboardSuspense><LumaAdminLayout /></DashboardSuspense></ProtectedRoute>}
      >
        <Route index element={<LumaPage role="admin" />} />
        {lumaAdminPages.map((name) => (
          <Route key={`admin-${name}`} path={name} element={<LumaPage role="admin" name={name} />} />
        ))}
        <Route path="courses/new" element={<AdminCourseEditorPage />} />
        <Route path="courses/:courseId/edit" element={<AdminCourseEditorPage />} />
        <Route path="live-classes" element={<LumaPage role="admin" name="live" />} />
        <Route path="live-classes/:id" element={<LiveClassDetailPage role="admin" />} />
        <Route path="moderation" element={<RoleManagementPage type="moderation" />} />
        <Route path="account" element={<Navigate to="/admin/dashboard/settings" replace />} />
      </Route>

      <Route
        path="/instructor/dashboard"
        element={<ProtectedRoute allowedRoles={["instructor"]} loginPath="/staff/login"><DashboardSuspense><LumaInstructorLayout /></DashboardSuspense></ProtectedRoute>}
      >
        <Route index element={<LumaPage role="instructor" />} />
        {lumaInstructorPages.map((name) => (
          <Route key={`instructor-${name}`} path={name} element={<LumaPage role="instructor" name={name} />} />
        ))}
        <Route path="my-courses" element={<Navigate to="/instructor/dashboard/courses" replace />} />
        <Route path="courses/:courseId/analytics" element={<CourseAnalyticsPage />} />
        <Route path="create" element={<InstructorCourseCreatePage />} />
        <Route path="course-builder" element={<Navigate to="/instructor/dashboard/builder" replace />} />
        <Route path="live-classes" element={<LumaPage role="instructor" name="live" />} />
        <Route path="live-classes/create" element={<LiveClassFormPage />} />
        <Route path="live-classes/:id/edit" element={<LiveClassFormPage />} />
        <Route path="live-classes/:id/attendance" element={<LiveClassDetailPage role="instructor" />} />
        <Route path="live-classes/:id" element={<LiveClassDetailPage role="instructor" />} />
        <Route path="quizzes/new" element={<InstructorQuizBuilderPage />} />
        <Route path="quizzes/:quizId/edit" element={<InstructorQuizBuilderPage />} />
        <Route path="quizzes/:quizId/analytics" element={<InstructorQuizAnalyticsPage />} />
        <Route path="account" element={<Navigate to="/instructor/dashboard/profile" replace />} />
      </Route>

      <Route path="/index" element={<Navigate to="/" replace />} />
      <Route path="/luma" element={<Navigate to="/dashboard" replace />} />
      <Route path="/luma/:page" element={<ParamRedirect to="/dashboard/:page" />} />
      <Route path="/luma/admin" element={<Navigate to="/admin/dashboard" replace />} />
      <Route path="/luma/admin/:page" element={<ParamRedirect to="/admin/dashboard/:page" />} />
      <Route path="/luma/instructor" element={<Navigate to="/instructor/dashboard" replace />} />
      <Route path="/luma/instructor/:page" element={<ParamRedirect to="/instructor/dashboard/:page" />} />
      <Route path="/admin/live-classes" element={<Navigate to="/admin/dashboard/live-classes" replace />} />
      <Route path="/admin/live-classes/:id" element={<ParamRedirect to="/admin/dashboard/live-classes/:id" />} />
      <Route path="/instructor/live-classes" element={<Navigate to="/instructor/dashboard/live-classes" replace />} />
      <Route path="/instructor/live-classes/create" element={<Navigate to="/instructor/dashboard/live-classes/create" replace />} />
      <Route path="/instructor/live-classes/:id" element={<ParamRedirect to="/instructor/dashboard/live-classes/:id" />} />
      <Route path="/instructor/live-classes/:id/edit" element={<ParamRedirect to="/instructor/dashboard/live-classes/:id/edit" />} />
      <Route path="/student/live-classes" element={<Navigate to="/dashboard/live-classes" replace />} />
      <Route path="/student/live-classes/recordings" element={<Navigate to="/dashboard/live-classes/recordings" replace />} />
      <Route path="/student/live-classes/:id" element={<ParamRedirect to="/dashboard/live-classes/:id" />} />
      <Route path="/index-2" element={<Navigate to="/" replace />} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  );
}
