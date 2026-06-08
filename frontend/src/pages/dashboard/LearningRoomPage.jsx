import React from "react";
import { courses, modules } from "../../data/dashboardData.js";
import { Icon, MotionCard, ProgressBar, SectionHeading } from "../../components/dashboard/DashboardPrimitives.jsx";

export default function LearningRoomPage() {
  const course = courses[0];

  return (
    <div className="grid gap-5 xl:grid-cols-[280px_1fr_280px]">
      <MotionCard className="p-5 xl:sticky xl:top-24 xl:max-h-[calc(100vh-7rem)] xl:overflow-y-auto">
        <SectionHeading eyebrow="Content" title="Modules" />
        <div className="space-y-4">
          {modules.map((module) => (
            <div key={module.title}>
              <h4 className="mb-2 text-sm font-black">{module.title}</h4>
              <div className="space-y-2">
                {module.lectures.map(([title, done, time]) => (
                  <button key={title} className="flex w-full items-center gap-3 rounded-xl bg-slate-100 p-3 text-left text-sm dark:bg-white/10">
                    <Icon name={done ? "CheckCircle2" : "Lock"} className={`h-4 w-4 shrink-0 ${done ? "text-emerald-500" : "text-slate-400"}`} />
                    <span className="min-w-0 flex-1 truncate font-bold">{title}</span>
                    <span className="shrink-0 text-xs text-slate-500">{time}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </MotionCard>

      <div className="space-y-5">
        <MotionCard className="overflow-hidden bg-slate-950 p-0">
          <div className="flex aspect-video items-center justify-center bg-slate-950 text-white">
            <button className="flex h-16 w-16 items-center justify-center rounded-full bg-white/15">
              <Icon name="Play" className="h-8 w-8 fill-white" />
            </button>
          </div>
        </MotionCard>

        <MotionCard>
          <SectionHeading eyebrow="Current Lecture" title={course.currentLecture} />
          <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">
            Learn how professional dashboard interfaces are structured with reusable components, responsive layouts, protected flows, and clean visual hierarchy.
          </p>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <button className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-black dark:border-white/10 dark:bg-white/10">Previous</button>
            <button className="rounded-xl bg-[#ff6b35] px-5 py-3 text-sm font-black text-white">Mark Complete</button>
            <button className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-black text-white dark:bg-white dark:text-slate-950">Next</button>
          </div>
        </MotionCard>
      </div>

      <MotionCard className="p-5 xl:sticky xl:top-24 xl:h-fit">
        <SectionHeading eyebrow="Progress" title="Course Status" />
        <ProgressBar value={course.progress} />
        <p className="mt-3 text-sm font-black">{course.progress}% complete</p>
        <div className="mt-5 space-y-3 text-sm font-bold text-slate-500 dark:text-slate-300">
          <p>Bookmarks: 14</p>
          <p>Downloads: 8 files</p>
          <p>Instructor: {course.instructor}</p>
        </div>
      </MotionCard>
    </div>
  );
}
