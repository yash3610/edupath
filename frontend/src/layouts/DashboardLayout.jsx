import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { Icon } from "../components/dashboard/DashboardPrimitives.jsx";
import { student } from "../data/dashboardData.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import { api } from "../services/api.js";

const navGroups = [
  {
    label: "Overview",
    items: [
      ["Dashboard", "/dashboard", "LayoutDashboard"],
      ["My Courses", "/dashboard/courses", "BookOpen"],
      ["Continue Learning", "/dashboard/learn", "PlayCircle"],
      ["Learning Paths", "/dashboard/paths", "Route"],
    ],
  },
  {
    label: "Study",
    items: [
      ["Assignments", "/dashboard/assignments", "UploadCloud"],
      ["Quizzes", "/dashboard/quizzes", "BadgeHelp"],
      ["Notes", "/dashboard/notes", "NotebookPen"],
      ["Calendar", "/dashboard/calendar", "CalendarDays"],
      ["Live Classes", "/dashboard/live-classes", "Video"],
      ["Recordings", "/dashboard/live-classes/recordings", "PlayCircle"],
      ["Downloads", "/dashboard/downloads", "Download"],
    ],
  },
  {
    label: "Connect",
    items: [
      ["Community", "/dashboard/community", "Users"],
      ["Messages", "/dashboard/messages", "MessageCircle"],
    ],
  },
  {
    label: "Smart Tools",
    items: [
      ["AI Tutor", "/dashboard/ai-tutor", "Sparkles"],
      ["AI Notes", "/dashboard/ai-notes", "NotebookPen"],
      ["Recommendations", "/dashboard/ai-recommendations", "Compass"],
      ["Analytics", "/dashboard/analytics", "LineChart"],
    ],
  },
  {
    label: "Account",
    items: [
      ["Achievements", "/dashboard/achievements", "Trophy"],
      ["Certificates", "/dashboard/certificates", "Award"],
      ["Profile", "/dashboard/profile", "UserRound"],
      ["Settings", "/dashboard/settings", "Settings"],
    ],
  },
];
const notificationIcons = { course: "BookOpen", quiz: "BadgeHelp", assignment: "UploadCloud", certificate: "Award", payment: "ReceiptText" };

export default function DashboardLayout() {
  const [dark, setDark] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [headerNotifications, setHeaderNotifications] = useState([]);
  const [notificationsLoading, setNotificationsLoading] = useState(true);
  const notificationRef = useRef(null);
  const { user, logout } = useAuth();
  const toast = useToast();
  const location = useLocation();
  const displayStudent = useMemo(() => ({ ...student, name: user?.name || student.name, email: user?.email || student.email }), [user]);

  const loadNotifications = useCallback(async () => {
    try {
      setNotificationsLoading(true);
      const result = await api.notifications(5);
      setHeaderNotifications(result.data || []);
    } catch (error) {
      toast.error(error.message || "Could not load notifications.");
    } finally {
      setNotificationsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    document.body.classList.add("dashboard-active");
    return () => document.body.classList.remove("dashboard-active");
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  useEffect(() => {
    setNotificationOpen(false);
    setProfileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    function closeNotifications(event) {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setNotificationOpen(false);
      }
    }

    document.addEventListener("mousedown", closeNotifications);
    return () => document.removeEventListener("mousedown", closeNotifications);
  }, []);

  async function removeNotification(notificationId) {
    try {
      await api.deleteNotification(notificationId);
      await loadNotifications();
    } catch (error) {
      toast.error(error.message || "Could not remove notification.");
    }
  }

  async function removeAllVisibleNotifications() {
    const visibleIds = headerNotifications.map((item) => item._id);
    try {
      await Promise.all(visibleIds.map((notificationId) => api.deleteNotification(notificationId)));
      await loadNotifications();
    } catch (error) {
      toast.error(error.message || "Could not clear notifications.");
      await loadNotifications();
    }
  }

  return (
    <div className={`w-full overflow-x-hidden ${dark ? "dark" : ""}`}>
      <div className="min-h-screen w-full overflow-x-hidden bg-[#f7f8fc] text-slate-900 dark:bg-slate-950 dark:text-white">
        <aside className="fixed inset-y-0 left-0 z-40 hidden h-screen w-[276px] flex-col border-r border-slate-200/80 bg-white px-4 py-5 dark:border-white/10 dark:bg-slate-900 xl:flex">
          <SidebarContent onNavigate={() => {}} />
        </aside>

        {mobileOpen && (
          <div className="fixed inset-0 z-50 xl:hidden">
            <button className="absolute inset-0 bg-slate-950/45" aria-label="Close menu" onClick={() => setMobileOpen(false)} />
            <aside className="relative flex h-full w-[82vw] max-w-80 flex-col bg-white px-4 py-5 shadow-2xl dark:bg-slate-900">
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

        <div className="min-w-0 max-w-full overflow-x-hidden xl:pl-[276px]">
          <header className="sticky top-0 z-30 max-w-full border-b border-slate-200/80 bg-white/90 px-3 py-3.5 backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/90 sm:px-6">
            <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <button className="shrink-0 rounded-xl border border-slate-200 p-2.5 dark:border-white/10 xl:hidden" onClick={() => setMobileOpen(true)} aria-label="Open menu">
                  <Icon name="Menu" className="h-5 w-5" />
                </button>
                <div className="hidden min-w-0 min-[390px]:block">
                <p className="hidden text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#ff723a] sm:block">Student workspace</p>
                <h1 className="truncate text-base font-extrabold tracking-[-0.02em] sm:text-xl">Welcome back, {displayStudent.name.split(" ")[0]}</h1>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
                <div ref={notificationRef} className="relative">
                  <button
                    onClick={() => {
                      setNotificationOpen((value) => {
                        if (!value) loadNotifications();
                        return !value;
                      });
                      setProfileOpen(false);
                    }}
                    className="relative rounded-xl border border-slate-200 bg-white p-2.5 transition hover:border-orange-200 hover:bg-orange-50 dark:border-white/10 dark:bg-white/10"
                    aria-label="Notifications"
                    aria-expanded={notificationOpen}
                  >
                    <Icon name="Bell" className="h-5 w-5" />
                    {headerNotifications.length > 0 && <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#ff723a] ring-2 ring-white dark:ring-slate-900" />}
                  </button>
                  {notificationOpen && (
                    <div className="absolute right-0 top-14 z-50 w-[min(360px,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_18px_50px_rgba(31,28,53,0.16)] dark:border-white/10 dark:bg-slate-900">
                      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3.5 dark:border-white/10">
                        <div>
                          <p className="font-extrabold text-[#1f1c35] dark:text-white">Notifications</p>
                          <p className="mt-0.5 text-xs text-slate-400">{headerNotifications.length} new updates</p>
                        </div>
                        <button onClick={removeAllVisibleNotifications} className="text-xs font-extrabold text-[#ff723a] disabled:opacity-40" disabled={!headerNotifications.length}>
                          Clear all
                        </button>
                      </div>
                      <div>
                        {notificationsLoading && <div className="px-4 py-8 text-center text-sm font-bold text-slate-400">Loading notifications...</div>}
                        {!notificationsLoading && headerNotifications.map((item) => (
                            <button
                              key={item._id}
                              onClick={() => removeNotification(item._id)}
                              className="flex w-full gap-3 border-b border-slate-100 bg-[#fffaf6] px-4 py-3.5 text-left transition last:border-0 hover:bg-[#fff8f2] dark:border-white/10 dark:bg-transparent dark:hover:bg-white/5"
                            >
                              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#fff1e8] text-[#ff723a]">
                                <Icon name={notificationIcons[item.type?.toLowerCase()] || "Bell"} className="h-[18px] w-[18px]" />
                              </span>
                              <span className="min-w-0 flex-1">
                                <span className="block text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#ff723a]">{item.type}</span>
                                <span className="mt-0.5 block text-sm font-bold leading-5 text-[#1f1c35] dark:text-white">{item.title}</span>
                                {item.message && <span className="mt-1 block truncate text-xs text-slate-500">{item.message}</span>}
                                <span className="mt-1 block text-xs text-slate-400">{formatNotificationTime(item.createdAt)}</span>
                              </span>
                              <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[#ff723a]" />
                            </button>
                        ))}
                        {!notificationsLoading && !headerNotifications.length && (
                          <div className="px-4 py-9 text-center">
                            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-white/10"><Icon name="Bell" className="h-5 w-5" /></div>
                            <p className="mt-3 text-sm font-extrabold text-[#1f1c35] dark:text-white">No new notifications</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                <button className="hidden rounded-xl border border-slate-200 bg-white p-2.5 dark:border-white/10 dark:bg-white/10 min-[390px]:block" onClick={() => setDark((value) => !value)} aria-label="Toggle theme">
                  <Icon name={dark ? "Sun" : "Moon"} className="h-5 w-5" />
                </button>
                <div className="relative">
                  <button className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-1.5 min-[390px]:pr-3 dark:border-white/10 dark:bg-white/10" onClick={() => { setProfileOpen((value) => !value); setNotificationOpen(false); }}>
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
            </div>

          </header>

          <main className="dashboard-content mx-auto w-full max-w-[1500px] px-3 py-4 sm:px-6 sm:py-5 lg:px-8 lg:py-8">
            <Outlet context={{ student: displayStudent }} />
          </main>
        </div>
      </div>
    </div>
  );
}

function formatNotificationTime(value) {
  if (!value) return "Just now";
  const date = new Date(value);
  const diffMinutes = Math.max(0, Math.floor((Date.now() - date.getTime()) / 60000));
  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes} min ago`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} hr ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;
  return date.toLocaleDateString();
}

function NavItem({ label, path, icon, onNavigate }) {
  const location = useLocation();

  return (
    <NavLink
      to={path}
      end={path === "/dashboard"}
      onClick={onNavigate}
      className={({ isActive }) => `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-bold transition-all ${isActive ? "bg-[#ff723a] text-white shadow-[0_8px_18px_rgba(255,114,58,0.22)]" : "text-slate-600 hover:bg-[#fff5ef] hover:text-[#1f1c35] dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white"}`}
    >
      <Icon name={icon} className={`h-[18px] w-[18px] ${location.pathname === path ? "" : "text-slate-400 group-hover:text-slate-700 dark:group-hover:text-white"}`} />
      <span>{label}</span>
    </NavLink>
  );
}

function SidebarContent({ onNavigate }) {
  return (
    <>
      <NavLink to="/dashboard" className="mb-5 flex shrink-0 items-center gap-3 rounded-2xl px-2 py-1" onClick={onNavigate}>
        <img src="/assets/images/logo.svg" alt="EduPath" className="h-10 w-auto" />
      </NavLink>
      <nav className="dashboard-sidebar-scroll min-h-0 flex-1 overflow-y-auto pr-1 pb-4">
        {navGroups.map((group, index) => (
          <div key={group.label} className={index ? "mt-4" : ""}>
            <p className="mb-2 px-3 text-[10px] font-extrabold uppercase tracking-[0.18em] text-slate-400">{group.label}</p>
            <div className="space-y-1">
              {group.items.map(([label, path, icon]) => (
                <NavItem key={path} label={label} path={path} icon={icon} onNavigate={onNavigate} />
              ))}
            </div>
          </div>
        ))}
      </nav>
    </>
  );
}
