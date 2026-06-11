import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Icon, MotionCard, ProgressBar, SectionHeading } from "../../components/dashboard/DashboardPrimitives.jsx";
import { useToast } from "../../context/ToastContext.jsx";
import { apiRequest } from "../../services/api.js";

const metricConfig = [
  ["enrolledCourses", "Enrolled", "BookOpen"],
  ["averageProgress", "Average progress", "TrendingUp", "%"],
  ["learningHours", "Learning hours", "Clock3", "h"],
  ["quizAverage", "Quiz average", "Gauge", "%"],
];

export default function StudentAnalyticsPage() {
  const toast = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    apiRequest("/api/student/analytics")
      .then((result) => setData(result.data))
      .catch((requestError) => {
        setError(requestError.message || "Analytics could not be loaded.");
        toast.error(requestError.message || "Analytics could not be loaded.");
      })
      .finally(() => setLoading(false));
  }, [toast]);

  const totalMinutes = useMemo(
    () => (data?.weeklyActivity || []).reduce((sum, item) => sum + Number(item.minutes || 0), 0),
    [data],
  );

  if (loading) {
    return <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">{[1, 2, 3, 4].map((item) => <div key={item} className="h-28 animate-pulse rounded-[22px] bg-slate-200 dark:bg-white/10" />)}</div>;
  }

  if (!data) {
    return <MotionCard className="text-center"><Icon name="ChartNoAxesCombined" className="mx-auto h-9 w-9 text-slate-300" /><h2 className="mt-3 text-lg font-extrabold">Analytics unavailable</h2><p className="mt-2 text-sm text-slate-500">{error}</p></MotionCard>;
  }

  return (
    <div className="space-y-5">
      <section className="relative overflow-hidden rounded-[24px] border border-[#f1e1d2] bg-gradient-to-br from-[#fffaf4] via-[#fff7ee] to-[#fff1e5] p-5 text-[#1f1c35] shadow-[0_18px_45px_rgba(31,28,53,.08)] dark:border-white/10 dark:from-[#292541] dark:via-[#242039] dark:to-[#1f1c35] dark:text-white sm:p-7">
        <div className="absolute -right-12 -top-16 h-48 w-48 rounded-full bg-[#fec961]/45 blur-3xl" />
        <div className="absolute -bottom-20 left-1/3 h-44 w-44 rounded-full bg-[#ff723a]/10 blur-3xl" />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-[.18em] text-[#ff723a]">Learning Analytics</p>
            <h2 className="mt-2 text-2xl font-extrabold sm:text-3xl">Your progress, clearly measured</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#656078] dark:text-white/65">Live insights calculated from your course progress, lecture activity and quiz attempts.</p>
          </div>
          <div className="rounded-2xl border border-white/70 bg-white/65 px-4 py-3 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/10">
            <p className="text-xs font-bold text-slate-500 dark:text-white/60">This week</p>
            <p className="mt-1 text-2xl font-extrabold text-[#ff723a]">{totalMinutes} min</p>
          </div>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {metricConfig.map(([key, label, icon, suffix], index) => (
          <MotionCard key={key} className="p-4" delay={index * 0.04}>
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#fff1e8] text-[#ff723a] dark:bg-orange-500/10"><Icon name={icon} /></span>
              <div><p className="text-xs font-bold text-slate-500">{label}</p><p className="mt-0.5 text-2xl font-extrabold">{data.summary[key]}{suffix || ""}</p></div>
            </div>
          </MotionCard>
        ))}
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.35fr_.65fr]">
        <MotionCard className="p-5 sm:p-6">
          <SectionHeading eyebrow="Activity" title="Last 7 days" />
          {totalMinutes > 0 ? (
            <div className="h-64 min-w-0">
              <ResponsiveContainer>
                <AreaChart data={data.weeklyActivity}>
                  <defs><linearGradient id="activityFill" x1="0" x2="0" y1="0" y2="1"><stop offset="5%" stopColor="#ff723a" stopOpacity={0.35} /><stop offset="95%" stopColor="#ff723a" stopOpacity={0} /></linearGradient></defs>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.12} />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} width={32} allowDecimals={false} />
                  <Tooltip formatter={(value) => [`${value} min`, "Learning"]} />
                  <Area type="monotone" dataKey="minutes" stroke="#ff723a" strokeWidth={3} fill="url(#activityFill)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-orange-200 bg-[#fffaf6] p-6 text-center dark:border-orange-500/20 dark:bg-orange-500/5">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#fff1e8] text-[#ff723a]"><Icon name="Clock3" className="h-7 w-7" /></span>
              <h3 className="mt-4 text-base font-extrabold text-[#1f1c35] dark:text-white">No learning activity recorded yet</h3>
              <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">Start or continue a lesson. Your watch time and completed lectures will appear here automatically.</p>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {(data.weeklyActivity || []).map((item) => <span key={item.day} className="rounded-lg bg-white px-2.5 py-1 text-xs font-bold text-slate-400 shadow-sm dark:bg-white/10">{item.day}</span>)}
              </div>
              <Link to="/dashboard/learn" className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#ff723a] px-4 py-2.5 text-sm font-extrabold text-white">
                Continue learning <Icon name="ChevronRight" className="h-4 w-4" />
              </Link>
            </div>
          )}
        </MotionCard>

        <MotionCard className="p-5 sm:p-6">
          <SectionHeading eyebrow="Prediction" title={`${data.insights.completionProbability}% completion`} />
          <ProgressBar value={data.insights.completionProbability} />
          <div className="mt-6 space-y-4">
            <Insight label="Engagement" value={data.insights.engagement} />
            <Insight label="Strongest course" value={data.insights.strongestCourse} />
            <Insight label="Completed lectures" value={data.summary.completedLectures} />
            <Insight label="Certificates" value={data.summary.certificates} />
          </div>
        </MotionCard>
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
        <MotionCard className="p-5 sm:p-6">
          <SectionHeading eyebrow="Courses" title="Progress by course" />
          <div className="space-y-4">
            {data.courseProgress.map((course) => (
              <div key={course.id} className="rounded-2xl border border-slate-100 p-4 dark:border-white/10">
                <div className="mb-3 flex items-center justify-between gap-3"><p className="truncate text-sm font-extrabold">{course.title}</p><span className="shrink-0 text-sm font-extrabold text-[#ff723a]">{course.progress}%</span></div>
                <ProgressBar value={course.progress} />
              </div>
            ))}
            {!data.courseProgress.length && <EmptyText text="Enroll in a course to see progress analytics." />}
          </div>
        </MotionCard>

        <MotionCard className="p-5 sm:p-6">
          <SectionHeading eyebrow="Quizzes" title="Recent score trend" />
          {data.quizTrend.length ? (
            <div className="h-64 min-w-0">
              <ResponsiveContainer>
                <BarChart data={data.quizTrend}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.12} />
                  <XAxis dataKey="attempt" axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 100]} axisLine={false} tickLine={false} width={32} />
                  <Tooltip formatter={(value) => [`${value}%`, "Score"]} labelFormatter={(label) => `Attempt ${label}`} />
                  <Bar dataKey="score" fill="#1f1c35" radius={[8, 8, 2, 2]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : <EmptyText text="Complete a quiz to unlock score trends." />}
        </MotionCard>
      </section>

      <MotionCard className="flex flex-col gap-3 border-orange-100 bg-[#fffaf6] p-5 dark:border-orange-500/20 dark:bg-orange-500/5 sm:flex-row sm:items-center">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#fff1e8] text-[#ff723a]"><Icon name="Sparkles" /></span>
        <div><p className="text-sm font-extrabold text-[#1f1c35] dark:text-white">Recommended next step</p><p className="mt-1 text-sm text-slate-500">{data.insights.recommendation}</p></div>
      </MotionCard>
    </div>
  );
}

function Insight({ label, value }) {
  return <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3 last:border-0 last:pb-0 dark:border-white/10"><span className="text-xs font-bold text-slate-400">{label}</span><strong className="max-w-[65%] text-right text-sm text-[#1f1c35] dark:text-white">{value}</strong></div>;
}

function EmptyText({ text }) {
  return <div className="flex min-h-52 items-center justify-center rounded-2xl bg-slate-50 p-5 text-center text-sm font-bold text-slate-400 dark:bg-white/5">{text}</div>;
}
