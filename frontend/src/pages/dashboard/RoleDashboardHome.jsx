import React, { useEffect, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Icon, MotionCard, SectionHeading } from "../../components/dashboard/DashboardPrimitives.jsx";
import { adminStats, adminTables, engagementData, instructorStats, instructorTables, revenueData } from "../../data/roleDashboardData.js";
import { apiRequest } from "../../services/api.js";

export default function RoleDashboardHome() {
  const { role, user, config } = useOutletContext();
  const isAdmin = role === "admin";
  const stats = isAdmin ? adminStats : instructorStats;
  const [liveStats, setLiveStats] = useState({});

  useEffect(() => {
    let active = true;
    apiRequest(`/api/${role}/stats`)
      .then((result) => {
        if (active) setLiveStats(result.data || {});
      })
      .catch(() => {});
    return () => { active = false; };
  }, [role]);

  const actions = isAdmin
    ? [["Create Course", "courses/new", "Plus"], ["Add Category", "categories", "FolderKanban"], ["Create Coupon", "coupons", "Megaphone"], ["View Reports", "reports", "ChartNoAxesCombined"]]
    : [["Assigned Courses", "my-courses", "BookOpen"], ["Add Lecture", "course-builder", "Video"], ["Create Quiz", "quizzes/new", "BadgeHelp"], ["Create Assignment", "assignments", "FileCheck2"], ["Schedule Class", "live-classes", "CalendarDays"]];

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-[22px] border border-[#f1e7db] bg-[#fff8ef] p-5 shadow-[0_24px_60px_rgba(31,28,53,.08)] dark:border-white/10 dark:bg-[#1f1c35] sm:rounded-[28px] sm:p-8 lg:p-10">
        <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-[#fec961]/50 blur-3xl" />
        <div className="relative grid min-w-0 items-center gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(260px,auto)] lg:gap-8">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1.5 text-xs font-extrabold text-[#ff723a] dark:bg-white/10"><Icon name={isAdmin ? "ShieldCheck" : "GraduationCap"} className="h-4 w-4" /> {config.title}</span>
            <h2 className="mt-5 text-2xl font-extrabold leading-tight tracking-[-0.04em] text-[#1f1c35] dark:text-white sm:text-4xl">
              {isAdmin ? "Keep the platform healthy and growing." : `Build learning experiences that students finish, ${user?.name?.split(" ")[0] || "Instructor"}.`}
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#4f536c] dark:text-slate-300 sm:text-base">
              {isAdmin ? "Review platform performance, manage learning content, and act on the items that need attention." : "Manage your courses, support learners, and understand what is driving engagement and revenue."}
            </p>
          </div>
          <div className="grid grid-cols-1 gap-3 min-[430px]:grid-cols-2 sm:flex sm:flex-wrap lg:max-w-md lg:justify-end">
            {actions.map(([label, segment, icon]) => (
              <Link key={label} to={`${config.homePath}/${segment}`} className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#ead9c7] bg-white/80 px-4 py-3 text-xs font-extrabold text-[#1f1c35] transition hover:border-[#ff723a] hover:text-[#ff723a] dark:border-white/10 dark:bg-white/10 dark:text-white">
                <Icon name={icon} className="h-4 w-4" /> {label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className={`grid gap-4 sm:grid-cols-2 ${isAdmin ? "xl:grid-cols-3 2xl:grid-cols-5" : "xl:grid-cols-3 2xl:grid-cols-5"}`}>
        {stats.map(([label, fallbackValue, icon, change], index) => {
          const key = metricKey(label);
          const value = liveStats[key] ?? fallbackValue;
          return (
            <MotionCard key={label} className="p-5" delay={index * 0.025}>
              <div className="flex items-start justify-between gap-3">
                <div><p className="text-xs font-bold text-slate-500">{label}</p><p className="mt-2 text-2xl font-extrabold tracking-[-0.03em] text-[#1f1c35] dark:text-white">{value}</p><p className="mt-2 text-[11px] font-bold text-[#d95524] dark:text-[#fec961]">{change}</p></div>
                <span className="rounded-2xl bg-[#fff1e8] p-3 text-[#ff723a] dark:bg-orange-500/10"><Icon name={icon} className="h-5 w-5" /></span>
              </div>
            </MotionCard>
          );
        })}
      </section>

      {isAdmin ? <AdminOverview /> : <InstructorOverview />}
    </div>
  );
}

function AdminOverview() {
  return (
    <>
      <section className="grid gap-6 xl:grid-cols-2">
        <ChartCard eyebrow="Business" title="Revenue overview">
          <AreaChart data={revenueData}><defs><linearGradient id="adminRevenue" x1="0" x2="0" y1="0" y2="1"><stop offset="5%" stopColor="#ff723a" stopOpacity={0.3} /><stop offset="95%" stopColor="#ff723a" stopOpacity={0} /></linearGradient></defs><CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.12} /><XAxis dataKey="month" axisLine={false} tickLine={false} /><YAxis axisLine={false} tickLine={false} /><Tooltip /><Area dataKey="revenue" stroke="#ff723a" fill="url(#adminRevenue)" strokeWidth={3} /></AreaChart>
        </ChartCard>
        <ChartCard eyebrow="Growth" title="Users and course sales">
          <BarChart data={revenueData}><CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.12} /><XAxis dataKey="month" axisLine={false} tickLine={false} /><YAxis axisLine={false} tickLine={false} /><Tooltip /><Bar dataKey="users" fill="#1f1c35" radius={[7, 7, 0, 0]} /><Bar dataKey="sales" fill="#fec961" radius={[7, 7, 0, 0]} /></BarChart>
        </ChartCard>
      </section>
      <section className="grid gap-6 xl:grid-cols-[1.2fr_.8fr]">
        <DashboardTable eyebrow="Courses" title="Top selling courses" headers={["Course", "Instructor", "Enrollments", "Revenue"]} rows={adminTables.topCourses} />
        <ActivityCard title="Recent platform activity" items={["24 new students joined today", "Advanced Node.js submitted for approval", "Payout PO-2405 completed", "Three community reports need review"]} />
      </section>
      <section className="grid gap-6 xl:grid-cols-2">
        <DashboardTable eyebrow="Approvals" title="Pending course reviews" headers={["Course", "Instructor", "Submitted", "Status"]} rows={adminTables.approvals} />
        <DashboardTable eyebrow="Commerce" title="Recent orders" headers={["Order", "Student", "Course", "Amount", "Status"]} rows={adminTables.orders} />
      </section>
    </>
  );
}

function InstructorOverview() {
  return (
    <>
      <section className="grid gap-6 xl:grid-cols-2">
        <ChartCard eyebrow="Earnings" title="Monthly earnings">
          <AreaChart data={revenueData}><defs><linearGradient id="earnings" x1="0" x2="0" y1="0" y2="1"><stop offset="5%" stopColor="#ff723a" stopOpacity={0.3} /><stop offset="95%" stopColor="#ff723a" stopOpacity={0} /></linearGradient></defs><CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.12} /><XAxis dataKey="month" axisLine={false} tickLine={false} /><YAxis axisLine={false} tickLine={false} /><Tooltip /><Area dataKey="revenue" stroke="#ff723a" fill="url(#earnings)" strokeWidth={3} /></AreaChart>
        </ChartCard>
        <ChartCard eyebrow="Students" title="Engagement and watch time">
          <BarChart data={engagementData}><CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.12} /><XAxis dataKey="day" axisLine={false} tickLine={false} /><YAxis axisLine={false} tickLine={false} /><Tooltip /><Bar dataKey="engagement" fill="#1f1c35" radius={[7, 7, 0, 0]} /><Bar dataKey="watchTime" fill="#fec961" radius={[7, 7, 0, 0]} /></BarChart>
        </ChartCard>
      </section>
      <section className="grid gap-6 xl:grid-cols-[1.25fr_.75fr]">
        <DashboardTable eyebrow="Performance" title="Course performance" headers={["Course", "Students", "Rating", "Revenue", "Status"]} rows={instructorTables.courses} />
        <ActivityCard title="Pending tasks" items={instructorTables.tasks.map((item) => `${item[0]} · ${item[1]}`)} />
      </section>
      <section className="grid gap-6 xl:grid-cols-2">
        <ActivityCard title="Recent student activity" items={["Aarav completed Responsive Dashboards", "Meera scored 94% in React Hooks", "Rohan submitted the analytics assignment", "12 students joined React Mastery"]} />
        <DashboardTable eyebrow="Schedule" title="Upcoming live classes" headers={["Class", "Date", "Registrations"]} rows={instructorTables.classes} />
      </section>
    </>
  );
}

function ChartCard({ eyebrow, title, children }) {
  return <MotionCard className="p-4 sm:p-6"><SectionHeading eyebrow={eyebrow} title={title} /><div className="h-60 min-w-0 sm:h-72"><ResponsiveContainer>{children}</ResponsiveContainer></div></MotionCard>;
}

function DashboardTable({ eyebrow, title, headers, rows }) {
  return (
    <MotionCard className="overflow-hidden p-0">
      <div className="p-5 pb-2 sm:p-6 sm:pb-2"><SectionHeading eyebrow={eyebrow} title={title} /></div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[600px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-400 dark:bg-white/5"><tr>{headers.map((head) => <th key={head} className="px-5 py-3 font-extrabold">{head}</th>)}</tr></thead>
          <tbody>{rows.map((row) => <tr key={row.join("-")} className="border-t border-slate-100 dark:border-white/10">{row.map((cell, index) => <td key={`${cell}-${index}`} className={`px-5 py-4 ${index === 0 ? "font-extrabold text-[#1f1c35] dark:text-white" : "font-semibold text-slate-500"}`}>{cell}</td>)}</tr>)}</tbody>
        </table>
      </div>
    </MotionCard>
  );
}

function ActivityCard({ title, items }) {
  return (
    <MotionCard className="p-5 sm:p-6">
      <SectionHeading eyebrow="Activity" title={title} />
      <div>{items.map((item, index) => <div key={item} className={`flex gap-3 py-4 ${index ? "border-t border-slate-100 dark:border-white/10" : ""}`}><span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#ff723a]" /><div><p className="text-sm font-extrabold">{item}</p><p className="mt-1 text-xs text-slate-400">{index + 1} hour{index ? "s" : ""} ago</p></div></div>)}</div>
    </MotionCard>
  );
}

function metricKey(label) {
  const mapping = {
    "Total Students": "students",
    "Total Instructors": "instructors",
    "Total Courses": "courses",
    "Published Courses": "publishedCourses",
    "Draft Courses": "draftCourses",
    "Pending Approvals": "pendingApprovals",
    "Total Enrollments": "enrollments",
    "Total Orders": "orders",
    "Total Revenue": "revenue",
    "Refund Requests": "refunds",
    "Assignment Reviews": "pendingAssignmentReviews",
  };
  return mapping[label] || label.toLowerCase().replace(/\s+/g, "");
}
