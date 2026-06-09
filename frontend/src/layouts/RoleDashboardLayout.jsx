import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Icon } from "../components/dashboard/DashboardPrimitives.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import { api } from "../services/api.js";

const configs = {
  admin: {
    label: "Admin workspace",
    title: "Platform Administration",
    homePath: "/admin/dashboard",
    loginPath: "/staff/login",
    groups: [
      { label: "Overview", items: [["Dashboard", "", "LayoutDashboard"], ["Reports", "reports", "ChartNoAxesCombined"]] },
      { label: "People", items: [["Students", "students", "Users"], ["Instructors", "instructors", "GraduationCap"]] },
      { label: "Learning", items: [["Courses", "courses", "BookOpen"], ["Course Approvals", "approvals", "PackageCheck"], ["Categories", "categories", "FolderKanban"], ["Quizzes", "quizzes", "BadgeHelp"], ["Assignments", "assignments", "FileCheck2"], ["Certificates", "certificates", "Award"]] },
      { label: "Commerce", items: [["Orders", "orders", "ReceiptText"], ["Payments", "payments", "CreditCard"], ["Refunds", "refunds", "RefreshCcw"], ["Coupons", "coupons", "Megaphone"]] },
      { label: "Platform", items: [["Reviews", "reviews", "Star"], ["Community", "moderation", "ShieldCheck"], ["Settings", "settings", "Settings"]] },
    ],
  },
  instructor: {
    label: "Instructor workspace",
    title: "Teaching Studio",
    homePath: "/instructor/dashboard",
    loginPath: "/staff/login",
    groups: [
      { label: "Overview", items: [["Dashboard", "", "LayoutDashboard"], ["Analytics", "analytics", "LineChart"]] },
      { label: "Courses", items: [["My Courses", "my-courses", "BookOpen"], ["Create Course", "create-course", "Plus"], ["Course Builder", "course-builder", "PanelTop"], ["Students", "students", "Users"], ["Live Classes", "live-classes", "Video"]] },
      { label: "Teaching", items: [["Quizzes", "quizzes", "BadgeHelp"], ["Create Quiz", "quizzes/new", "Plus"], ["Assignments", "assignments", "FileCheck2"], ["Doubts / Q&A", "doubts", "MessagesSquare"], ["Reviews", "reviews", "Star"]] },
      { label: "Business", items: [["Earnings", "earnings", "WalletCards"], ["Payouts", "payouts", "CreditCard"]] },
      { label: "Account", items: [["Messages", "messages", "MessageCircle"], ["Profile", "profile", "UserRound"], ["Settings", "settings", "Settings"]] },
    ],
  },
};

const notificationIcons = { course: "BookOpen", quiz: "BadgeHelp", assignment: "UploadCloud", payment: "CreditCard" };

export default function RoleDashboardLayout({ role }) {
  const config = configs[role];
  const [dark, setDark] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const notificationRef = useRef(null);
  const { user, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const firstName = useMemo(() => user?.name?.split(" ")[0] || (role === "admin" ? "Admin" : "Instructor"), [role, user]);
  const navItems = useMemo(() => config.groups.flatMap((group) => group.items), [config]);

  const loadNotifications = useCallback(async () => {
    try {
      const result = await api.notifications(5);
      setNotifications(result.data || []);
    } catch {
      setNotifications([]);
    }
  }, []);

  useEffect(() => {
    document.body.classList.add("dashboard-active");
    loadNotifications();
    return () => document.body.classList.remove("dashboard-active");
  }, [loadNotifications]);

  useEffect(() => {
    setNotificationOpen(false);
    setProfileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    function closeDropdown(event) {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) setNotificationOpen(false);
    }
    document.addEventListener("mousedown", closeDropdown);
    return () => document.removeEventListener("mousedown", closeDropdown);
  }, []);

  function pathFor(segment) {
    return segment ? `${config.homePath}/${segment}` : config.homePath;
  }

  async function removeNotification(id) {
    try {
      await api.deleteNotification(id);
      await loadNotifications();
    } catch (error) {
      toast.error(error.message);
    }
  }

  function handleLogout() {
    logout();
    toast.info("You have been logged out.");
    navigate(config.loginPath, { replace: true });
  }

  return (
    <div className={`role-dashboard role-dashboard--${role} ${dark ? "dark" : ""}`}>
      <div className="role-dashboard-shell min-h-screen text-slate-900 dark:text-white">
        <aside className="role-dashboard-sidebar fixed inset-y-0 left-0 z-40 hidden h-screen w-[276px] flex-col px-4 py-5 lg:flex">
          <RoleSidebar config={config} pathFor={pathFor} onNavigate={() => {}} />
        </aside>

        {mobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <button className="absolute inset-0 bg-slate-950/45" aria-label="Close menu" onClick={() => setMobileOpen(false)} />
            <aside className="role-dashboard-sidebar relative flex h-full w-[84vw] max-w-80 flex-col px-4 py-5 shadow-2xl">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-extrabold uppercase tracking-[0.16em] text-[#ff723a]">{role} menu</span>
                <button className="rounded-xl border border-slate-200 p-2 dark:border-white/10" onClick={() => setMobileOpen(false)}><Icon name="X" /></button>
              </div>
              <RoleSidebar config={config} pathFor={pathFor} onNavigate={() => setMobileOpen(false)} />
            </aside>
          </div>
        )}

        <div className="min-w-0 lg:pl-[276px]">
          <header className="role-dashboard-header sticky top-0 z-30 px-4 py-3.5 backdrop-blur-xl sm:px-6">
            <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <button className="rounded-xl border border-slate-200 p-2.5 dark:border-white/10 lg:hidden" onClick={() => setMobileOpen(true)}><Icon name="Menu" /></button>
                <div className="min-w-0">
                  <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#ff723a]">{config.label}</p>
                  <h1 className="truncate text-lg font-extrabold tracking-[-0.02em] sm:text-xl">Welcome back, {firstName}</h1>
                </div>
              </div>

              <div className="hidden min-w-0 flex-1 px-5 xl:block">
                <div className="role-dashboard-search mx-auto flex max-w-lg items-center gap-2.5 rounded-2xl px-4 py-2.5">
                  <Icon name="Search" className="h-4 w-4 text-slate-400" />
                  <input className="dashboard-search-input min-w-0 flex-1 text-sm font-semibold" placeholder={`Search ${role} workspace...`} />
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <div ref={notificationRef} className="relative">
                  <button onClick={() => { setNotificationOpen((value) => !value); setProfileOpen(false); if (!notificationOpen) loadNotifications(); }} className="role-dashboard-icon-button relative rounded-xl p-2.5">
                    <Icon name="Bell" />
                    {notifications.length > 0 && <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#ff723a] ring-2 ring-white" />}
                  </button>
                  {notificationOpen && (
                    <div className="role-dashboard-dropdown absolute right-0 top-14 z-50 w-[min(360px,calc(100vw-2rem))] overflow-hidden rounded-2xl">
                      <div className="border-b border-slate-100 px-4 py-3.5 dark:border-white/10">
                        <p className="font-extrabold">Notifications</p>
                        <p className="text-xs text-slate-400">{notifications.length} new updates</p>
                      </div>
                      {notifications.map((item) => (
                        <button key={item._id} onClick={() => removeNotification(item._id)} className="flex w-full gap-3 border-b border-slate-100 px-4 py-3.5 text-left last:border-0 hover:bg-[#fff8f2] dark:border-white/10">
                          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#fff1e8] text-[#ff723a]"><Icon name={notificationIcons[item.type?.toLowerCase()] || "Bell"} className="h-[18px] w-[18px]" /></span>
                          <span className="min-w-0"><span className="block text-sm font-extrabold">{item.title}</span><span className="mt-1 block truncate text-xs text-slate-500">{item.message || item.type}</span></span>
                        </button>
                      ))}
                      {!notifications.length && <p className="px-4 py-8 text-center text-sm font-bold text-slate-400">No new notifications</p>}
                    </div>
                  )}
                </div>
                <button className="role-dashboard-icon-button rounded-xl p-2.5" onClick={() => setDark((value) => !value)}><Icon name={dark ? "Sun" : "Moon"} /></button>
                <div className="relative">
                  <button onClick={() => { setProfileOpen((value) => !value); setNotificationOpen(false); }} className="role-dashboard-profile flex items-center gap-2 rounded-xl p-1.5 pr-3">
                    <span className="role-dashboard-avatar flex h-9 w-9 items-center justify-center rounded-lg text-sm font-extrabold text-white">{firstName[0]}</span>
                    <span className="hidden text-sm font-extrabold sm:block">{firstName}</span>
                  </button>
                  {profileOpen && (
                    <div className="role-dashboard-dropdown absolute right-0 top-14 w-60 rounded-2xl p-3">
                      <p className="font-extrabold">{user?.name || firstName}</p>
                      <p className="break-all text-xs text-slate-500">{user?.email}</p>
                      <p className="mt-2 text-[10px] font-extrabold uppercase tracking-widest text-[#ff723a]">{role}</p>
                      <button className="mt-3 w-full rounded-xl bg-[#1f1c35] px-4 py-2.5 text-sm font-extrabold text-white hover:bg-[#ff723a]" onClick={handleLogout}>Logout</button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <nav className="mt-3 flex gap-2 overflow-x-auto pb-1 lg:hidden">
              {navItems.map(([label, segment, icon]) => <RoleNavItem key={`${label}-${segment}`} label={label} path={pathFor(segment)} icon={icon} homePath={config.homePath} />)}
            </nav>
          </header>

          <main className="role-dashboard-main mx-auto w-full max-w-[1500px] px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
            <Outlet context={{ role, user, config }} />
          </main>
        </div>
      </div>
    </div>
  );
}

function RoleSidebar({ config, pathFor, onNavigate }) {
  return (
    <>
      <NavLink to={config.homePath} className="mb-5 flex shrink-0 items-center px-2 py-1" onClick={onNavigate}><img src="/assets/images/logo.svg" alt="EduPath" className="h-10 w-auto" /></NavLink>
      <nav className="dashboard-sidebar-scroll min-h-0 flex-1 overflow-y-auto pr-1 pb-4">
        {config.groups.map((group, index) => (
          <div key={group.label} className={index ? "mt-4" : ""}>
            <p className="mb-2 px-3 text-[10px] font-extrabold uppercase tracking-[0.18em] text-slate-400">{group.label}</p>
            <div className="space-y-1">
              {group.items.map(([label, segment, icon]) => <RoleNavItem key={`${label}-${segment}`} label={label} path={pathFor(segment)} icon={icon} homePath={config.homePath} onNavigate={onNavigate} />)}
            </div>
          </div>
        ))}
      </nav>
    </>
  );
}

function RoleNavItem({ label, path, icon, homePath, onNavigate }) {
  return (
    <NavLink to={path} end={path === homePath} onClick={onNavigate} className={({ isActive }) => `group flex shrink-0 items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-bold transition ${isActive ? "bg-[#ff723a] text-white shadow-[0_8px_18px_rgba(255,114,58,.22)]" : "text-slate-600 hover:bg-[#fff5ef] hover:text-[#1f1c35] dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white"}`}>
      <Icon name={icon} className="h-[18px] w-[18px]" />
      <span>{label}</span>
    </NavLink>
  );
}
