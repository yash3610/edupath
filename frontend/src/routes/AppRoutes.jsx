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
const DashboardLayout = React.lazy(() => import("../layouts/DashboardLayout.jsx"));
const RoleDashboardLayout = React.lazy(() => import("../layouts/RoleDashboardLayout.jsx"));
const AssignmentsPage = React.lazy(() => import("../pages/dashboard/AssignmentsPage.jsx"));
const AIRecommendationsPage = React.lazy(() => import("../pages/dashboard/AIRecommendationsPage.jsx"));
const AINotesPage = React.lazy(() => import("../pages/dashboard/AINotesPage.jsx"));
const AITutorPage = React.lazy(() => import("../pages/dashboard/AITutorPage.jsx"));
const CalendarPage = React.lazy(() => import("../pages/dashboard/CalendarPage.jsx"));
const CommunityPage = React.lazy(() => import("../pages/dashboard/CommunityPage.jsx"));
const DashboardHome = React.lazy(() => import("../pages/dashboard/DashboardHome.jsx"));
const DownloadsPage = React.lazy(() => import("../pages/dashboard/DownloadsPage.jsx"));
const FeaturePage = React.lazy(() => import("../pages/dashboard/FeaturePage.jsx"));
const AdminQuizManagementPage = React.lazy(() => import("../pages/dashboard/AdminQuizManagementPage.jsx"));
const InstructorQuizAnalyticsPage = React.lazy(() => import("../pages/dashboard/InstructorQuizAnalyticsPage.jsx"));
const InstructorQuizBuilderPage = React.lazy(() => import("../pages/dashboard/InstructorQuizBuilderPage.jsx"));
const InstructorQuizManagementPage = React.lazy(() => import("../pages/dashboard/InstructorQuizManagementPage.jsx"));
const InstructorCourseBuilderPage = React.lazy(() => import("../pages/dashboard/InstructorCourseBuilderPage.jsx"));
const InstructorCourseEditorPage = React.lazy(() => import("../pages/dashboard/InstructorCourseEditorPage.jsx"));
const InstructorCoursesPage = React.lazy(() => import("../pages/dashboard/InstructorCoursesPage.jsx"));
const CourseAnalyticsPage = React.lazy(() => import("../pages/dashboard/CourseAnalyticsPage.jsx"));
const AdminCoursesPage = React.lazy(() => import("../pages/dashboard/AdminCoursesPage.jsx"));
const InstructorAssignmentsPage = React.lazy(() => import("../pages/dashboard/InstructorAssignmentsPage.jsx"));
const InstructorMessagesPage = React.lazy(() => import("../pages/dashboard/InstructorMessagesPage.jsx"));
const LearningRoomPage = React.lazy(() => import("../pages/dashboard/LearningRoomPage.jsx"));
const MessagesPage = React.lazy(() => import("../pages/dashboard/MessagesPage.jsx"));
const MyCoursesPage = React.lazy(() => import("../pages/dashboard/MyCoursesPage.jsx"));
const ProfilePage = React.lazy(() => import("../pages/dashboard/ProfilePage.jsx"));
const QuizAttemptPage = React.lazy(() => import("../pages/dashboard/QuizAttemptPage.jsx"));
const QuizHistoryPage = React.lazy(() => import("../pages/dashboard/QuizHistoryPage.jsx"));
const QuizInstructionsPage = React.lazy(() => import("../pages/dashboard/QuizInstructionsPage.jsx"));
const QuizPage = React.lazy(() => import("../pages/dashboard/QuizPage.jsx"));
const QuizResultPage = React.lazy(() => import("../pages/dashboard/QuizResultPage.jsx"));
const RoleDashboardHome = React.lazy(() => import("../pages/dashboard/RoleDashboardHome.jsx"));
const RoleManagementPage = React.lazy(() => import("../pages/dashboard/RoleManagementPage.jsx"));

function DashboardSuspense({ children }) {
  return <React.Suspense fallback={<div className="section-gap text-center">Loading dashboard...</div>}>{children}</React.Suspense>;
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
        <Route path="/wishlist" element={<WishlistPage />} />
        <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
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

      <Route path="/dashboard" element={<ProtectedRoute allowedRoles={["student"]}><DashboardSuspense><DashboardLayout /></DashboardSuspense></ProtectedRoute>}>
        <Route index element={<DashboardHome />} />
        <Route path="courses" element={<MyCoursesPage />} />
        <Route path="learn" element={<LearningRoomPage />} />
        <Route path="learn/:courseId" element={<LearningRoomPage />} />
        <Route path="learn/:courseId/:lectureId" element={<LearningRoomPage />} />
        <Route path="continue-learning" element={<LearningRoomPage />} />
        <Route path="assignments" element={<AssignmentsPage />} />
        <Route path="quizzes" element={<QuizPage />} />
        <Route path="quizzes/:quizId/instructions" element={<QuizInstructionsPage />} />
        <Route path="quizzes/attempt/:attemptId" element={<QuizAttemptPage />} />
        <Route path="quizzes/result/:attemptId" element={<QuizResultPage />} />
        <Route path="quizzes/history/:quizId" element={<QuizHistoryPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="paths" element={<FeaturePage type="paths" />} />
        <Route path="certificates" element={<FeaturePage type="certificates" />} />
        <Route path="achievements" element={<FeaturePage type="achievements" />} />
        <Route path="wishlist" element={<FeaturePage type="wishlist" />} />
        <Route path="community" element={<CommunityPage />} />
        <Route path="notes" element={<FeaturePage type="notes" />} />
        <Route path="downloads" element={<DownloadsPage />} />
        <Route path="calendar" element={<CalendarPage />} />
        <Route path="messages" element={<MessagesPage />} />
        <Route path="orders" element={<FeaturePage type="orders" />} />
        <Route path="ai" element={<Navigate to="/dashboard/ai-tutor" replace />} />
        <Route path="ai-tutor" element={<AITutorPage />} />
        <Route path="ai-notes" element={<AINotesPage />} />
        <Route path="ai-recommendations" element={<AIRecommendationsPage />} />
        <Route path="analytics" element={<FeaturePage type="analytics" />} />
        <Route path="settings" element={<FeaturePage type="settings" />} />
      </Route>

      <Route path="/dashboard/admin/quizzes" element={<Navigate to="/admin/dashboard/quizzes" replace />} />
      <Route path="/dashboard/instructor/quizzes/builder" element={<Navigate to="/instructor/dashboard/quizzes/new" replace />} />
      <Route path="/dashboard/instructor/quizzes/:quizId/analytics" element={<Navigate to="/instructor/dashboard/quizzes/demo/analytics" replace />} />

      <Route
        path="/admin/dashboard"
        element={<ProtectedRoute allowedRoles={["admin"]} loginPath="/staff/login"><DashboardSuspense><RoleDashboardLayout role="admin" /></DashboardSuspense></ProtectedRoute>}
      >
        <Route index element={<RoleDashboardHome />} />
        <Route path="students" element={<RoleManagementPage type="students" />} />
        <Route path="instructors" element={<RoleManagementPage type="instructors" />} />
        <Route path="courses" element={<AdminCoursesPage />} />
        <Route path="approvals" element={<RoleManagementPage type="approvals" />} />
        <Route path="categories" element={<RoleManagementPage type="categories" />} />
        <Route path="orders" element={<RoleManagementPage type="orders" />} />
        <Route path="payments" element={<RoleManagementPage type="payments" />} />
        <Route path="refunds" element={<RoleManagementPage type="refunds" />} />
        <Route path="coupons" element={<RoleManagementPage type="coupons" />} />
        <Route path="quizzes" element={<AdminQuizManagementPage />} />
        <Route path="assignments" element={<RoleManagementPage type="assignments" />} />
        <Route path="certificates" element={<RoleManagementPage type="certificates" />} />
        <Route path="reviews" element={<RoleManagementPage type="reviews" />} />
        <Route path="moderation" element={<RoleManagementPage type="moderation" />} />
        <Route path="reports" element={<RoleManagementPage type="reports" />} />
        <Route path="settings" element={<RoleManagementPage type="settings" />} />
      </Route>

      <Route
        path="/instructor/dashboard"
        element={<ProtectedRoute allowedRoles={["instructor"]} loginPath="/staff/login"><DashboardSuspense><RoleDashboardLayout role="instructor" /></DashboardSuspense></ProtectedRoute>}
      >
        <Route index element={<RoleDashboardHome />} />
        <Route path="my-courses" element={<InstructorCoursesPage />} />
        <Route path="create-course" element={<InstructorCourseEditorPage />} />
        <Route path="courses/:courseId/edit" element={<InstructorCourseEditorPage />} />
        <Route path="courses/:courseId/analytics" element={<CourseAnalyticsPage />} />
        <Route path="course-builder" element={<InstructorCourseBuilderPage />} />
        <Route path="students" element={<RoleManagementPage type="studentsProgress" />} />
        <Route path="live-classes" element={<RoleManagementPage type="liveClasses" />} />
        <Route path="quizzes" element={<InstructorQuizManagementPage />} />
        <Route path="quizzes/new" element={<InstructorQuizBuilderPage />} />
        <Route path="quizzes/:quizId/edit" element={<InstructorQuizBuilderPage />} />
        <Route path="quizzes/:quizId/analytics" element={<InstructorQuizAnalyticsPage />} />
        <Route path="assignments" element={<InstructorAssignmentsPage />} />
        <Route path="doubts" element={<RoleManagementPage type="doubts" />} />
        <Route path="reviews" element={<RoleManagementPage type="reviews" />} />
        <Route path="earnings" element={<RoleManagementPage type="earnings" />} />
        <Route path="payouts" element={<RoleManagementPage type="payouts" />} />
        <Route path="analytics" element={<RoleManagementPage type="analytics" />} />
        <Route path="messages" element={<InstructorMessagesPage />} />
        <Route path="profile" element={<RoleManagementPage type="profile" />} />
        <Route path="settings" element={<RoleManagementPage type="settings" />} />
      </Route>

      <Route path="/index" element={<Navigate to="/" replace />} />
      <Route path="/index-2" element={<Navigate to="/" replace />} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  );
}
