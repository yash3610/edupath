import React from "react";
import { useOutletContext } from "react-router-dom";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { courses, skillGrowth, stats, weeklyHours } from "../../data/dashboardData.js";
import { Icon, MotionCard, ProgressBar, SectionHeading } from "../../components/dashboard/DashboardPrimitives.jsx";

export default function DashboardHome() {
  const { student } = useOutletContext();
  const current = courses[0];

  return (
    <div className="space-y-5 lg:space-y-7">
      <section className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <MotionCard className="p-5 sm:p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-[#ff6b35]">Today</p>
              <h2 className="mt-2 text-2xl font-black leading-tight text-slate-950 dark:text-white sm:text-3xl">
                Keep learning, {student.name.split(" ")[0]}
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300 sm:text-base">
                {student.quote} Your current streak is {student.streak} days.
              </p>
            </div>
            <div className="shrink-0 rounded-2xl bg-orange-50 px-4 py-3 text-sm font-black text-[#ff6b35] dark:bg-white/10">
              {student.rank} learner
            </div>
          </div>

          <div className="mt-6">
            <div className="mb-2 flex justify-between text-sm font-black">
              <span>Daily goal</span>
              <span>{student.goal}%</span>
            </div>
            <ProgressBar value={student.goal} />
          </div>
        </MotionCard>

        <MotionCard className="p-5 sm:p-6">
          <div className="flex items-center gap-4">
            <img src={student.avatar} alt={student.name} className="h-16 w-16 rounded-2xl object-cover" />
            <div className="min-w-0">
              <h3 className="truncate text-lg font-black">{student.name}</h3>
              <p className="truncate text-sm text-slate-500 dark:text-slate-300">{student.email}</p>
            </div>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3 text-center text-sm font-black">
            <div className="rounded-2xl bg-slate-100 p-3 dark:bg-white/10">{student.streak}<span className="block text-xs text-slate-500">Streak</span></div>
            <div className="rounded-2xl bg-slate-100 p-3 dark:bg-white/10">{student.goal}%<span className="block text-xs text-slate-500">Goal</span></div>
          </div>
        </MotionCard>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {stats.map(([label, value, icon]) => (
          <MotionCard key={label} className="p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-bold text-slate-500 dark:text-slate-400">{label}</p>
                <h3 className="mt-1 text-3xl font-black text-slate-950 dark:text-white">
                  {value}{label.includes("Score") ? "%" : ""}
                </h3>
              </div>
              <span className="rounded-2xl bg-orange-50 p-3 text-[#ff6b35] dark:bg-white/10">
                <Icon name={icon} className="h-6 w-6" />
              </span>
            </div>
          </MotionCard>
        ))}
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.15fr_.85fr]">
        <MotionCard className="p-5 sm:p-6">
          <SectionHeading eyebrow="Continue Learning" title={current.title} />
          <div className="grid gap-4 sm:grid-cols-[180px_1fr]">
            <img src={current.thumbnail} alt={current.title} className="h-40 w-full rounded-2xl object-cover" />
            <div>
              <p className="font-bold text-slate-700 dark:text-slate-200">{current.currentLecture}</p>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                {current.completedLectures}/{current.totalLectures} lectures complete - {current.duration}
              </p>
              <div className="mt-5">
                <ProgressBar value={current.progress} />
              </div>
              <button className="mt-5 rounded-xl bg-[#ff6b35] px-5 py-3 text-sm font-black text-white">
                Continue Learning
              </button>
            </div>
          </div>
        </MotionCard>

        <MotionCard className="p-5 sm:p-6">
          <SectionHeading eyebrow="Weekly" title="Learning hours" />
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={weeklyHours}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.16} />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="hours" fill="#ff6b35" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </MotionCard>
      </section>

      <MotionCard className="p-5 sm:p-6">
        <SectionHeading eyebrow="Skills" title="Mastery trend" />
        <div className="h-72">
          <ResponsiveContainer>
            <AreaChart data={skillGrowth}>
              <defs>
                <linearGradient id="skill" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" opacity={0.16} />
              <XAxis dataKey="skill" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="value" stroke="#7c3aed" fill="url(#skill)" strokeWidth={3} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </MotionCard>
    </div>
  );
}
