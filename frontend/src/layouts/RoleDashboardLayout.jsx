import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Icon } from "../components/dashboard/DashboardPrimitives.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import { api, assetUrl } from "../services/api.js";

const configs = {
  admin: {
    label: "Admin workspace",
    title: "Platform Administration",
    homePath: "/admin/dashboard",
    loginPath: "/staff/login",
    navigation: [
      { label: "Dashboard", segment: "", icon: "LayoutDashboard" },
      { label: "Users", icon: "Users", items: [["Students", "students", "UserRound"], ["Instructors", "instructors", "GraduationCap"]] },
      { label: "Courses", icon: "BookOpen", items: [["Manage Courses", "courses", "ListChecks"], ["Add Course", "courses/new", "Plus"], ["Course Approvals", "approvals", "PackageCheck"], ["Categories", "categories", "FolderKanban"], ["Assignments", "assignments", "FileCheck2"], ["Certificates", "certificates", "Award"]] },
      { label: "Live Classes", icon: "Video", items: [["Manage Live Classes", "live-classes", "Radio"]] },
      { label: "Quizzes", icon: "BadgeHelp", items: [["Manage Quizzes", "quizzes", "ListChecks"]] },
      { label: "Payments & Orders", icon: "CreditCard", items: [["Orders", "orders", "ReceiptText"], ["Payments", "payments", "CreditCard"], ["Refunds", "refunds", "RefreshCcw"], ["Coupons", "coupons", "Megaphone"]] },
      { label: "Platform", icon: "Settings", items: [["Reviews", "reviews", "Star"], ["Community", "moderation", "ShieldCheck"], ["Reports", "reports", "ChartNoAxesCombined"]] },
      { label: "Account", segment: "account", icon: "UserRound" },
    ],
  },
  instructor: {
    label: "Instructor workspace",
    title: "Teaching Studio",
    homePath: "/instructor/dashboard",
    loginPath: "/staff/login",
    navigation: [
      { label: "Dashboard", segment: "", icon: "LayoutDashboard" },
      { label: "Courses", icon: "BookOpen", items: [["Assigned Courses", "my-courses", "BookOpen"], ["Course Builder", "course-builder", "PanelTop"], ["Students", "students", "Users"], ["Analytics", "analytics", "LineChart"]] },
      { label: "Live Classes", icon: "Video", items: [["Manage Classes", "live-classes", "ListChecks"], ["Schedule Class", "live-classes/create", "Plus"]] },
      { label: "Teaching", icon: "GraduationCap", items: [["Manage Quizzes", "quizzes", "BadgeHelp"], ["Create Quiz", "quizzes/new", "Plus"], ["Assignments", "assignments", "FileCheck2"], ["Doubts / Q&A", "doubts", "MessagesSquare"], ["Reviews", "reviews", "Star"]] },
      { label: "Payments", icon: "WalletCards", items: [["Earnings", "earnings", "WalletCards"], ["Payouts", "payouts", "CreditCard"]] },
      { label: "Account", icon: "UserRound", items: [["Messages", "messages", "MessageCircle"], ["Account Settings", "account", "UserRound"]] },
    ],
  },
};

const notificationIcons = { course: "BookOpen", quiz: "BadgeHelp", assignment: "UploadCloud", payment: "CreditCard" };

export default function RoleDashboardLayout({ role }) {
  const config = configs[role];
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const notificationRef = useRef(null);
  const contentRef = useRef(null);
  const { user, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const firstName = useMemo(() => user?.name?.split(" ")[0] || (role === "admin" ? "Admin" : "Instructor"), [role, user]);

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
    contentRef.current?.scrollTo({ top: 0, behavior: "instant" });
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
    <div className={`role-dashboard role-dashboard--${role} h-screen h-dvh w-full overflow-hidden`}>
      <div className="role-dashboard-shell h-full w-full overflow-hidden text-slate-900 dark:text-white">
        <aside className="role-dashboard-sidebar fixed inset-y-0 left-0 z-40 hidden h-screen w-[276px] flex-col px-4 py-5 xl:flex">
          <RoleSidebar config={config} pathFor={pathFor} onNavigate={() => {}} />
        </aside>

        {mobileOpen && (
          <div className="fixed inset-0 z-50 xl:hidden">
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

        <div className="flex h-full min-w-0 max-w-full flex-col overflow-hidden xl:pl-[276px]">
          <header className="dashboard-topbar role-dashboard-header relative z-30 shrink-0 max-w-full px-3 py-3.5 backdrop-blur-xl sm:px-6">
            <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <button className="shrink-0 rounded-xl border border-slate-200 p-2.5 dark:border-white/10 xl:hidden" onClick={() => setMobileOpen(true)}><Icon name="Menu" /></button>
                <div className="hidden min-w-0 min-[390px]:block">
                  <p className="hidden text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#ff723a] sm:block">{config.label}</p>
                  <h1 className="truncate text-base font-extrabold tracking-[-0.02em] sm:text-xl">Welcome back, {firstName}</h1>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
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
                <div className="relative">
                  <button onClick={() => { setProfileOpen((value) => !value); setNotificationOpen(false); }} className="role-dashboard-profile flex items-center gap-2 rounded-xl p-1.5 min-[390px]:pr-3">
                    <span className="role-dashboard-avatar relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-lg text-sm font-extrabold text-white">
                      {firstName[0]}
                      {user?.avatar && <img src={assetUrl(user.avatar)} alt={user.name || firstName} onError={(event) => { event.currentTarget.style.display = "none"; }} className="absolute inset-0 h-full w-full object-cover" />}
                    </span>
                    <span className="hidden text-sm font-extrabold sm:block">{firstName}</span>
                  </button>
                  {profileOpen && (
                    <div className="role-dashboard-dropdown absolute right-0 top-14 w-60 rounded-2xl p-3">
                      <p className="font-extrabold">{user?.name || firstName}</p>
                      <p className="break-all text-xs text-slate-500">{user?.email}</p>
                      <p className="mt-2 text-[10px] font-extrabold uppercase tracking-widest text-[#ff723a]">{role}</p>
                      <NavLink to={`${config.homePath}/account`} className="mt-3 block w-full rounded-xl bg-[#fff1e8] px-4 py-2.5 text-center text-sm font-extrabold text-[#ff723a]">Manage account</NavLink>
                      <button className="mt-3 w-full rounded-xl bg-[#1f1c35] px-4 py-2.5 text-sm font-extrabold text-white hover:bg-[#ff723a]" onClick={handleLogout}>Logout</button>
                    </div>
                  )}
                </div>
              </div>
            </div>

          </header>

          <main ref={contentRef} className="dashboard-content role-dashboard-main min-h-0 flex-1 overflow-y-auto overscroll-contain">
            <div className="role-dashboard-page-frame mx-auto w-full max-w-[1500px] px-3 py-4 sm:px-6 sm:py-5 lg:px-8 lg:py-8">
              <Outlet context={{ role, user, config }} />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

function RoleSidebar({ config, pathFor, onNavigate }) {
  const location = useLocation();
  const activeGroup = config.navigation.find((entry) =>
    entry.items?.some(([, segment]) => groupRouteMatches(location.pathname, pathFor(segment)))
  )?.label || "";
  const [openGroup, setOpenGroup] = useState(activeGroup);

  useEffect(() => {
    if (activeGroup) setOpenGroup(activeGroup);
  }, [activeGroup]);

  return (
    <>
      <NavLink to="/" className="mb-5 flex shrink-0 items-center px-2 py-1" onClick={onNavigate}><img src="/assets/images/logo.svg" alt="EduPath" className="h-10 w-auto" /></NavLink>
      <nav className="dashboard-sidebar-scroll min-h-0 flex-1 overflow-y-auto pr-1 pb-4">
        <p className="mb-2 px-3 text-[10px] font-extrabold uppercase tracking-[0.18em] text-slate-400">Workspace</p>
        <div className="space-y-1.5">
          {config.navigation.map((entry) => {
            if (!entry.items) {
              return <RoleNavItem key={entry.label} label={entry.label} path={pathFor(entry.segment)} icon={entry.icon} homePath={config.homePath} onNavigate={onNavigate} />;
            }

            const isOpen = openGroup === entry.label;
            const isActive = entry.label === activeGroup;
            return (
              <div key={entry.label} className={`rounded-xl ${isActive ? "bg-[#fff8f2] dark:bg-white/5" : ""}`}>
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => setOpenGroup((current) => current === entry.label ? "" : entry.label)}
                  className={`dashboard-nav-item flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[13px] font-extrabold transition ${isActive ? "text-[#ff723a]" : "text-slate-600 hover:bg-[#fff5ef] hover:text-[#1f1c35] dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white"}`}
                >
                  <Icon name={entry.icon} className="h-[18px] w-[18px]" />
                  <span className="min-w-0 flex-1">{entry.label}</span>
                  <Icon name="ChevronDown" className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                </button>
                <div className={`grid transition-[grid-template-rows,opacity] duration-200 ${isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
                  <div className="overflow-hidden">
                    <div className="mb-2 ml-5 space-y-1 border-l border-slate-200 pl-3 dark:border-white/10">
                      {entry.items.map(([label, segment, icon]) => (
                        <RoleNavItem key={`${label}-${segment}`} label={label} path={pathFor(segment)} icon={icon} homePath={config.homePath} onNavigate={onNavigate} nested />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </nav>
    </>
  );
}

function RoleNavItem({ label, path, icon, homePath, onNavigate, nested = false }) {
  return (
    <NavLink to={path} end={path === homePath || nested} onClick={onNavigate} className={({ isActive }) => `dashboard-nav-item group flex shrink-0 items-center gap-3 rounded-xl px-3 ${nested ? "py-2 text-[12px]" : "py-2.5 text-[13px]"} font-bold transition ${isActive ? "bg-[#ff723a] text-white shadow-[0_8px_18px_rgba(255,114,58,.22)]" : "text-slate-600 hover:bg-[#fff5ef] hover:text-[#1f1c35] dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white"}`}>
      <Icon name={icon} className={nested ? "h-4 w-4" : "h-[18px] w-[18px]"} />
      <span>{label}</span>
    </NavLink>
  );
}

function groupRouteMatches(pathname, target) {
  return pathname === target || pathname.startsWith(`${target}/`);
}
