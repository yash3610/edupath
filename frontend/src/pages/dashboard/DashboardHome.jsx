import React from "react";
import { Link, useOutletContext } from "react-router-dom";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { courses, skillGrowth, stats, weeklyHours } from "../../data/dashboardData.js";
import { Icon, MotionCard, ProgressBar, SectionHeading } from "../../components/dashboard/DashboardPrimitives.jsx";

export default function DashboardHome() {
  const { student } = useOutletContext();
  const current = courses[0];
  const summaryStats = stats.slice(0, 4);
  const upcoming = [
    ["Live class", "Advanced React Patterns", "Today, 6:00 PM", "PlayCircle"],
    ["Assignment", "Dashboard case study", "Tomorrow, 11:59 PM", "UploadCloud"],
    ["Quiz", "React Hooks checkpoint", "June 12, 10:00 AM", "BadgeHelp"],
  ];

  return (
    <div className="space-y-5">
      <section className="relative overflow-hidden rounded-[22px] border border-[#f1e7db] bg-gradient-to-br from-[#fffaf3] to-[#fff4e6] p-5 text-[#1f1c35] shadow-[0_20px_50px_rgba(31,28,53,0.08)] dark:border-white/10 dark:from-[#1f1c35] dark:to-[#292541] dark:text-white sm:rounded-[28px] sm:p-7 lg:px-8 lg:py-7">
        <img
          src="/assets/images/video/video-1/bg.jpg"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover object-center opacity-75 sm:opacity-85 lg:object-[center_42%] lg:opacity-100"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#fffaf3] via-[#fff8ef]/65 to-transparent dark:from-[#1f1c35] dark:via-[#1f1c35]/65 dark:to-transparent" />
        <div className="relative grid min-w-0 items-center gap-6 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-7">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#ff723a]/15 bg-white/70 px-3 py-1.5 text-xs font-bold text-[#ff723a] dark:border-white/10 dark:bg-white/10">
              <Icon name="Sparkles" className="h-3.5 w-3.5" /> Your learning overview
            </div>
            <h2 className="mt-4 max-w-2xl text-2xl font-extrabold leading-[1.12] tracking-[-0.04em] sm:text-4xl lg:text-[38px]">
              Make today count, {student.name.split(" ")[0]}.
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-[#4f536c] dark:text-slate-300 sm:text-base">
              Continue your course, protect your {student.streak}-day streak, and move one step closer to your weekly goal.
            </p>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link to="/dashboard/learn" className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#ff723a] px-5 py-2.5 text-sm font-extrabold text-white transition hover:bg-[#ed5f29]">
                <Icon name="Play" className="h-4 w-4 fill-current" /> Continue learning
              </Link>
              <Link to="/dashboard/courses" className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#1f1c35]/15 bg-white/70 px-5 py-2.5 text-sm font-extrabold text-[#1f1c35] transition hover:bg-white dark:border-white/15 dark:bg-white/5 dark:text-white dark:hover:bg-white/10">
                View my courses <Icon name="ChevronRight" className="h-4 w-4" />
              </Link>
            </div>
          </div>
          <div className="rounded-[20px] border border-[#f0dfca] bg-white/80 p-4 shadow-[0_12px_30px_rgba(31,28,53,0.06)] backdrop-blur dark:border-white/10 dark:bg-white/[0.07]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-[#4f536c] dark:text-slate-400">Weekly goal</p>
                <p className="mt-0.5 text-2xl font-extrabold">{student.goal}%</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#fec961] text-[#1f1c35]">
                <Icon name="Gauge" className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4"><ProgressBar value={student.goal} /></div>
            <div className="mt-4 grid grid-cols-2 gap-3 border-t border-[#1f1c35]/10 pt-4 dark:border-white/10">
              <div><p className="text-xl font-extrabold">{student.streak}</p><p className="mt-0.5 text-[11px] text-[#4f536c] dark:text-slate-400">Day streak</p></div>
              <div><p className="text-xl font-extrabold">{student.rank}</p><p className="mt-0.5 text-[11px] text-[#4f536c] dark:text-slate-400">Class ranking</p></div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid items-stretch gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summaryStats.map(([label, value, icon], index) => (
          <MotionCard key={label} className="h-full min-h-[132px] p-5" delay={index * 0.04}>
            <div className="flex h-full items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400">{label}</p>
                <h3 className="mt-2 text-3xl font-extrabold tracking-[-0.03em] text-slate-950 dark:text-white">{value}</h3>
                <p className="mt-2 text-xs font-bold text-emerald-600">+{index + 2}% this month</p>
              </div>
              <span className="rounded-2xl bg-[#fff1e8] p-3 text-[#ff723a] dark:bg-orange-500/10">
                <Icon name={icon} className="h-6 w-6" />
              </span>
            </div>
          </MotionCard>
        ))}
      </section>

      <section className="grid items-start gap-5 xl:grid-cols-[minmax(0,1.5fr)_minmax(300px,.72fr)]">
        <div className="space-y-5">
          <MotionCard className="p-5 sm:p-6">
            <SectionHeading eyebrow="Continue Learning" title="Pick up where you left off" action={<Link to="/dashboard/courses" className="text-sm font-extrabold text-[#ff723a]">View all courses</Link>} />
            <div className="grid overflow-hidden rounded-2xl border border-slate-200/80 bg-slate-50/70 dark:border-white/10 dark:bg-white/5 sm:grid-cols-[210px_1fr]">
              <div className="relative min-h-48">
                <img src={current.thumbnail} alt={current.title} className="absolute inset-0 h-full w-full object-cover" />
                <div className="absolute inset-0 bg-slate-950/15" />
                <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-[11px] font-extrabold text-slate-800 backdrop-blur">{current.progress}% complete</span>
              </div>
              <div className="p-5 sm:p-6">
                <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[#ff723a]">Current course</p>
                <h3 className="mt-2 text-xl font-extrabold tracking-[-0.02em] text-slate-950 dark:text-white">{current.title}</h3>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{current.currentLecture}</p>
                <div className="mt-5"><ProgressBar value={current.progress} /></div>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-xs font-bold text-slate-500">
                  <span>{current.completedLectures} of {current.totalLectures} lectures</span>
                  <span>{current.duration} total</span>
                </div>
                <Link to={`/dashboard/learn/${current.id}`} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#1f1c35] px-5 py-3 text-sm font-extrabold text-white transition hover:bg-[#ff723a]">
                  Resume lesson <Icon name="ChevronRight" className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </MotionCard>

          <div className="grid items-stretch gap-5 lg:grid-cols-2">
            <MotionCard className="h-full p-5 sm:p-6">
              <SectionHeading eyebrow="Weekly Activity" title="Learning hours" />
              <div className="h-64">
                <ResponsiveContainer>
                  <BarChart data={weeklyHours}>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.12} />
                    <XAxis dataKey="day" axisLine={false} tickLine={false} />
                    <YAxis axisLine={false} tickLine={false} />
                    <Tooltip cursor={{ fill: "#eef2ff" }} />
                    <Bar dataKey="hours" fill="#ff723a" radius={[8, 8, 3, 3]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </MotionCard>
            <MotionCard className="h-full p-5 sm:p-6">
              <SectionHeading eyebrow="Skill Progress" title="Mastery overview" />
              <div className="h-64">
                <ResponsiveContainer>
                  <AreaChart data={skillGrowth}>
                    <defs>
                      <linearGradient id="skill" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="5%" stopColor="#fec961" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#fec961" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.12} />
                    <XAxis dataKey="skill" axisLine={false} tickLine={false} />
                    <YAxis axisLine={false} tickLine={false} />
                    <Tooltip />
                    <Area type="monotone" dataKey="value" stroke="#ff723a" fill="url(#skill)" strokeWidth={3} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </MotionCard>
          </div>
        </div>

        <div className="grid items-stretch gap-5 md:grid-cols-2 xl:grid-cols-1">
          <MotionCard className="h-full p-5 sm:p-6">
            <SectionHeading eyebrow="Schedule" title="Coming up" action={<Link to="/dashboard/calendar" className="text-xs font-extrabold text-[#ff723a]">Calendar</Link>} />
            <div className="space-y-2">
              {upcoming.map(([type, title, time, icon], index) => (
                <div key={title} className={`flex gap-3 py-4 ${index ? "border-t border-slate-100 dark:border-white/10" : ""}`}>
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#fff1e8] text-[#ff723a] dark:bg-orange-500/10"><Icon name={icon} className="h-5 w-5" /></div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-extrabold uppercase tracking-wide text-slate-400">{type}</p>
                    <h3 className="mt-0.5 truncate text-sm font-extrabold">{title}</h3>
                    <p className="mt-1 text-xs text-slate-500">{time}</p>
                  </div>
                </div>
              ))}
            </div>
          </MotionCard>

          <MotionCard className="h-full overflow-hidden p-0">
            <div className="flex h-full flex-col bg-[#1f1c35] p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15"><Icon name="Sparkles" className="h-5 w-5" /></div>
                <span className="rounded-full bg-white/15 px-3 py-1 text-[10px] font-extrabold uppercase tracking-wide">AI powered</span>
              </div>
              <h3 className="mt-5 text-xl font-extrabold">Stuck on a topic?</h3>
              <p className="mt-2 text-sm leading-6 text-slate-300">Ask the AI tutor for a clear explanation based on your current course.</p>
              <Link to="/dashboard/ai-tutor" className="mt-auto inline-flex w-fit items-center gap-2 rounded-xl bg-[#fec961] px-4 py-2.5 text-sm font-extrabold text-[#1f1c35]">
                Ask AI Tutor <Icon name="ChevronRight" className="h-4 w-4" />
              </Link>
            </div>
          </MotionCard>
        </div>
      </section>
    </div>
  );
}
