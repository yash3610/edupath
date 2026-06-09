import React, { useEffect, useMemo, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { Icon } from "../components/dashboard/DashboardPrimitives.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";

const roleConfig = {
  admin: {
    label: "Admin Dashboard",
    accent: "#7c3aed",
    loginPath: "/staff/login",
    homePath: "/admin/dashboard",
    navItems: [
      ["Overview", "/admin/dashboard", "LayoutDashboard"],
      ["Quiz Management", "/admin/dashboard/quizzes", "BadgeHelp"],
    ],
  },
  instructor: {
    label: "Instructor Dashboard",
    accent: "#0f9f82",
    loginPath: "/staff/login",
    homePath: "/instructor/dashboard",
    navItems: [
      ["Overview", "/instructor/dashboard", "LayoutDashboard"],
      ["Quiz Builder", "/instructor/dashboard/quizzes/new", "NotebookPen"],
      ["Quiz Analytics", "/instructor/dashboard/quizzes/demo/analytics", "LineChart"],
    ],
  },
};

export default function RoleDashboardLayout({ role }) {
  const config = roleConfig[role];
  const [dark, setDark] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const { user, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const firstName = useMemo(() => user?.name?.split(" ")[0] || config.label.split(" ")[0], [config.label, user]);

  useEffect(() => {
    document.body.classList.add("dashboard-active");
    return () => document.body.classList.remove("dashboard-active");
  }, []);

  function handleLogout() {
    logout();
    toast.info("You have been logged out.");
    navigate(config.loginPath, { replace: true });
  }

  return (
    <div className={dark ? "dark" : ""} style={{ "--role-accent": config.accent }}>
      <div className="min-h-screen bg-[#f6f7fb] text-slate-900 dark:bg-slate-950 dark:text-white">
        <aside className="fixed inset-y-0 left-0 z-40 hidden h-screen w-64 flex-col border-r border-slate-200 bg-white px-4 py-5 dark:border-white/10 dark:bg-slate-900 lg:flex">
          <Sidebar config={config} onNavigate={() => {}} />
        </aside>

        {mobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <button className="absolute inset-0 bg-slate-950/45" aria-label="Close menu" onClick={() => setMobileOpen(false)} />
            <aside className="relative h-full w-[82vw] max-w-80 bg-white px-4 py-5 shadow-2xl dark:bg-slate-900">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-black uppercase tracking-[0.16em]" style={{ color: config.accent }}>Menu</span>
                <button className="rounded-xl border border-slate-200 p-2 dark:border-white/10" onClick={() => setMobileOpen(false)} aria-label="Close menu">
                  <Icon name="X" className="h-5 w-5" />
                </button>
              </div>
              <Sidebar config={config} onNavigate={() => setMobileOpen(false)} />
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
                  <p className="text-[11px] font-black uppercase tracking-[0.18em]" style={{ color: config.accent }}>{config.label}</p>
                  <h1 className="truncate text-lg font-black sm:text-2xl">Welcome back, {firstName}</h1>
                </div>
              </div>
              <div className="relative flex shrink-0 items-center gap-2">
                <button className="rounded-xl border border-slate-200 bg-white p-2.5 dark:border-white/10 dark:bg-white/10" onClick={() => setDark((value) => !value)} aria-label="Toggle theme">
                  <Icon name={dark ? "Sun" : "Moon"} className="h-5 w-5" />
                </button>
                <button className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 dark:border-white/10 dark:bg-white/10" onClick={() => setProfileOpen((value) => !value)}>
                  <Icon name="UserRound" className="h-5 w-5" />
                  <span className="hidden text-sm font-black sm:block">{firstName}</span>
                </button>
                {profileOpen && (
                  <div className="absolute right-0 top-14 w-60 rounded-2xl border border-slate-200 bg-white p-3 shadow-xl dark:border-white/10 dark:bg-slate-900">
                    <p className="font-black">{user?.name}</p>
                    <p className="break-all text-xs text-slate-500">{user?.email}</p>
                    <p className="mt-2 text-xs font-black uppercase tracking-wider" style={{ color: config.accent }}>{user?.role}</p>
                    <button className="mt-3 w-full rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-black text-white dark:bg-white dark:text-slate-950" onClick={handleLogout}>Logout</button>
                  </div>
                )}
              </div>
            </div>

            <nav className="mt-3 flex gap-2 overflow-x-auto pb-1 lg:hidden">
              {config.navItems.map(([label, path, icon]) => (
                <RoleNavLink key={path} label={label} path={path} icon={icon} homePath={config.homePath} />
              ))}
            </nav>
          </header>

          <main className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
            <Outlet context={{ role, user, accent: config.accent }} />
          </main>
        </div>
      </div>
    </div>
  );
}

function RoleNavLink({ label, path, icon, homePath, onNavigate }) {
  return (
    <NavLink
      to={path}
      end={path === homePath}
      onClick={onNavigate}
      className={({ isActive }) => `flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-sm font-black transition-colors ${isActive ? "bg-[var(--role-accent)] text-white" : "bg-slate-100 text-slate-700 hover:text-slate-950 dark:bg-white/10 dark:text-slate-200"}`}
    >
      <Icon name={icon} className="h-4 w-4" />
      {label}
    </NavLink>
  );
}

function Sidebar({ config, onNavigate }) {
  return (
    <>
      <NavLink to={config.homePath} className="mb-5 flex shrink-0 items-center gap-3 rounded-2xl px-2 py-2" onClick={onNavigate}>
        <img src="/assets/images/logo.svg" alt="EduPath" className="h-10 w-auto" />
      </NavLink>
      <div className="mb-4 rounded-2xl bg-slate-100 px-4 py-3 text-xs font-black uppercase tracking-[0.15em] dark:bg-white/10" style={{ color: config.accent }}>
        {config.label}
      </div>
      <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto">
        {config.navItems.map(([label, path, icon]) => (
          <RoleNavLink key={path} label={label} path={path} icon={icon} homePath={config.homePath} onNavigate={onNavigate} />
        ))}
      </nav>
    </>
  );
}
