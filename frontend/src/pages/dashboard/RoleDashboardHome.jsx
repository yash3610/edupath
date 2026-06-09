import React, { useEffect, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { Icon, MotionCard, SectionHeading } from "../../components/dashboard/DashboardPrimitives.jsx";
import { apiRequest } from "../../services/api.js";

const content = {
  admin: {
    eyebrow: "Platform Control",
    title: "Administration overview",
    description: "Monitor platform activity and keep learning content organized.",
    endpoint: "/api/admin/dashboard",
    fallback: { users: 0, courses: 0, orders: 0, payments: 0 },
    metrics: [
      ["Total Users", "users", "UserRound"],
      ["Courses", "courses", "BookOpen"],
      ["Orders", "orders", "ReceiptText"],
      ["Payments", "payments", "Gauge"],
    ],
    actionLabel: "Manage quizzes",
    actionPath: "/admin/dashboard/quizzes",
  },
  instructor: {
    eyebrow: "Teaching Workspace",
    title: "Instructor overview",
    description: "Build assessments, review learner activity, and manage your teaching work.",
    endpoint: "/api/instructor/dashboard",
    fallback: { courses: 0, students: 0 },
    metrics: [
      ["My Courses", "courses", "BookOpen"],
      ["Students", "students", "UserRound"],
    ],
    actionLabel: "Create a quiz",
    actionPath: "/instructor/dashboard/quizzes/new",
  },
};

export default function RoleDashboardHome() {
  const { role, user, accent } = useOutletContext();
  const page = content[role];
  const [stats, setStats] = useState(page.fallback);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    let active = true;
    apiRequest(page.endpoint)
      .then((result) => {
        if (active) setStats({ ...page.fallback, ...(result.data || {}) });
        if (active) setStatus("ready");
      })
      .catch(() => {
        if (active) setStatus("unavailable");
      });
    return () => {
      active = false;
    };
  }, [page]);

  return (
    <div className="space-y-6">
      <MotionCard className="overflow-hidden p-0">
        <div className="p-6 text-white sm:p-8" style={{ background: `linear-gradient(135deg, ${accent}, #172033)` }}>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-white/70">{page.eyebrow}</p>
          <h2 className="mt-2 text-2xl font-black sm:text-4xl">{page.title}</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-white/80 sm:text-base">{page.description}</p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link to={page.actionPath} className="rounded-xl bg-white px-5 py-3 text-sm font-black text-slate-950">{page.actionLabel}</Link>
            <span className="rounded-xl bg-white/10 px-4 py-3 text-sm font-bold">{user?.email}</span>
          </div>
        </div>
      </MotionCard>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {page.metrics.map(([label, key, icon]) => (
          <MotionCard key={key} className="p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-bold text-slate-500 dark:text-slate-400">{label}</p>
                <p className="mt-1 text-3xl font-black">{status === "loading" ? "..." : stats[key]}</p>
              </div>
              <span className="rounded-2xl p-3" style={{ color: accent, backgroundColor: `${accent}14` }}>
                <Icon name={icon} className="h-6 w-6" />
              </span>
            </div>
          </MotionCard>
        ))}
      </section>

      <MotionCard>
        <SectionHeading eyebrow="Access" title="Your workspace is role protected" />
        <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">
          This dashboard is available only to {role} accounts. Student, instructor, and admin sessions now use separate login pages and routes.
        </p>
        {status === "unavailable" && <p className="mt-3 text-sm font-bold text-amber-600">Live dashboard totals are unavailable. The portal navigation is still ready to use.</p>}
      </MotionCard>
    </div>
  );
}
