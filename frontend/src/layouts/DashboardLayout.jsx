import React, { useEffect, useMemo, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Icon } from "../components/dashboard/DashboardPrimitives.jsx";
import { student } from "../data/dashboardData.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";

const navItems = [
  ["Dashboard", "/dashboard", "LayoutDashboard"],
  ["My Courses", "/dashboard/courses", "BookOpen"],
  ["Learning", "/dashboard/learn", "PlayCircle"],
  ["Paths", "/dashboard/paths", "Route"],
  ["Assignments", "/dashboard/assignments", "UploadCloud"],
  ["Quizzes", "/dashboard/quizzes", "BadgeHelp"],
  ["Certificates", "/dashboard/certificates", "Award"],
  ["Achievements", "/dashboard/achievements", "Trophy"],
  ["Wishlist", "/dashboard/wishlist", "Heart"],
  ["Community", "/dashboard/community", "MessagesSquare"],
  ["Notes", "/dashboard/notes", "NotebookPen"],
  ["Downloads", "/dashboard/downloads", "Download"],
  ["Calendar", "/dashboard/calendar", "CalendarDays"],
  ["Notifications", "/dashboard/notifications", "Bell"],
  ["Messages", "/dashboard/messages", "MessageCircle"],
  ["Orders", "/dashboard/orders", "ReceiptText"],
  ["AI Tutor", "/dashboard/ai-tutor", "Sparkles"],
  ["AI Notes", "/dashboard/ai-notes", "NotebookPen"],
  ["AI Courses", "/dashboard/ai-recommendations", "Compass"],
  ["Analytics", "/dashboard/analytics", "LineChart"],
  ["Profile", "/dashboard/profile", "UserRound"],
  ["Settings", "/dashboard/settings", "Settings"],
];

export default function DashboardLayout() {
  const [dark, setDark] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const { user, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const displayStudent = useMemo(() => ({ ...student, name: user?.name || student.name, email: user?.email || student.email }), [user]);

  useEffect(() => {
    document.body.classList.add("dashboard-active");
    return () => document.body.classList.remove("dashboard-active");
  }, []);

  return (
    <div className={dark ? "dark" : ""}>
      <div className="min-h-screen bg-[#f6f7fb] text-slate-900 dark:bg-slate-950 dark:text-white">
        <aside className="fixed inset-y-0 left-0 z-40 hidden h-screen w-64 flex-col border-r border-slate-200 bg-white px-4 py-5 dark:border-white/10 dark:bg-slate-900 lg:flex">
          <SidebarContent onNavigate={() => {}} />
        </aside>

        {mobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <button className="absolute inset-0 bg-slate-950/45" aria-label="Close menu" onClick={() => setMobileOpen(false)} />
            <aside className="relative h-full w-[82vw] max-w-80 bg-white px-4 py-5 shadow-2xl dark:bg-slate-900">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-black uppercase tracking-[0.16em] text-[#ff6b35]">Menu</span>
                <button className="rounded-xl border border-slate-200 p-2 dark:border-white/10" onClick={() => setMobileOpen(false)} aria-label="Close menu">
                  <Icon name="X" className="h-5 w-5" />
                </button>
              </div>
              <SidebarContent onNavigate={() => setMobileOpen(false)} />
            </aside>
          </div>
        )}

        <div className="min-w-0 lg:pl-64">
          <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur dark:border-white/10 dark:bg-slate-900/95 sm:px-6">
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <button className="rounded-xl border border-slate-200 p-2.5 dark:border-white/10 lg:hidden" onClick={() => setMobileOpen(true)} aria-label="Open menu">
                  <Icon name="Menu" className="h-5 w-5" />
                </button>
                <div className="min-w-0">
                <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#ff6b35]">Student Dashboard</p>
                <h1 className="truncate text-lg font-black sm:text-2xl">
                  Welcome back, {displayStudent.name.split(" ")[0]}
                </h1>
                </div>
              </div>
              <div className="hidden min-w-0 flex-1 px-4 xl:block">
                <div className="mx-auto flex max-w-md items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 dark:border-white/10 dark:bg-slate-800">
                  <Icon name="Search" className="h-4 w-4 text-slate-400" />
                  <input className="w-full bg-transparent text-sm font-bold outline-none" placeholder="Search courses, notes, messages..." />
                </div>
              </div>
              <div className="relative flex shrink-0 items-center gap-2">
                <button className="relative rounded-xl border border-slate-200 bg-white p-2.5 dark:border-white/10 dark:bg-white/10" aria-label="Notifications">
                  <Icon name="Bell" className="h-5 w-5" />
                  <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#ff6b35]" />
                </button>
                <button className="rounded-xl border border-slate-200 bg-white p-2.5 dark:border-white/10 dark:bg-white/10" onClick={() => setDark((value) => !value)} aria-label="Toggle theme">
                  <Icon name={dark ? "Sun" : "Moon"} className="h-5 w-5" />
                </button>
                <button className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-1.5 pr-3 dark:border-white/10 dark:bg-white/10" onClick={() => setProfileOpen((value) => !value)}>
                  <img src={displayStudent.avatar} alt={displayStudent.name} className="h-9 w-9 rounded-lg object-cover" />
                  <span className="hidden text-sm font-black sm:block">{displayStudent.name.split(" ")[0]}</span>
                </button>
                {profileOpen && (
                  <div className="absolute right-0 top-14 w-56 rounded-2xl border border-slate-200 bg-white p-3 shadow-xl dark:border-white/10 dark:bg-slate-900">
                    <p className="font-black">{displayStudent.name}</p>
                    <p className="break-all text-xs text-slate-500">{displayStudent.email}</p>
                    <button className="mt-3 w-full rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-black text-white dark:bg-white dark:text-slate-950" onClick={() => { logout(); toast.info("You have been logged out."); }}>
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>

            <nav className="mt-3 flex gap-2 overflow-x-auto pb-1 lg:hidden">
              {navItems.map(([label, path, icon]) => (
                <NavLink
                  key={path}
                  to={path}
                  end={path === "/dashboard"}
                  className={({ isActive }) => `flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-xs font-black ${isActive ? "bg-[#ff6b35] text-white" : "bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-slate-200"}`}
                >
                  <Icon name={icon} className="h-4 w-4" /> {label}
                </NavLink>
              ))}
            </nav>
          </header>

          <main className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
            <Outlet context={{ student: displayStudent }} />
          </main>
        </div>
      </div>
    </div>
  );
}

function NavItem({ label, path, icon, onNavigate }) {
  return (
    <NavLink
      to={path}
      end={path === "/dashboard"}
      onClick={onNavigate}
      className={({ isActive }) => `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-black transition-colors ${isActive ? "bg-[#ff6b35] text-white" : "text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white"}`}
    >
      <Icon name={icon} className="h-4 w-4" />
      <span>{label}</span>
    </NavLink>
  );
}

function SidebarContent({ onNavigate }) {
  return (
    <>
      <NavLink to="/dashboard" className="mb-5 flex shrink-0 items-center gap-3 rounded-2xl px-2 py-2" onClick={onNavigate}>
        <img src="/assets/images/logo.svg" alt="EduPath" className="h-10 w-auto" />
      </NavLink>
      <nav className="dashboard-sidebar-scroll min-h-0 flex-1 space-y-1 overflow-y-auto pr-1 pb-6">
        {navItems.map(([label, path, icon]) => (
          <NavItem key={path} label={label} path={path} icon={icon} onNavigate={onNavigate} />
        ))}
      </nav>
    </>
  );
}
