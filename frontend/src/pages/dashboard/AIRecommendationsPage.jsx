import React from "react";
import { courses } from "../../data/dashboardData.js";
import { MotionCard, ProgressBar, SectionHeading } from "../../components/dashboard/DashboardPrimitives.jsx";

export default function AIRecommendationsPage() {
  return (
    <div className="space-y-5">
      <SectionHeading eyebrow="AI Recommendations" title="Find your next course" />
      <MotionCard>
        <div className="grid gap-4 md:grid-cols-3">
          <input className="rounded-xl border border-slate-200 bg-white p-3 text-sm font-bold dark:border-white/10 dark:bg-slate-800" placeholder="Interest: AI, React, Design" />
          <input className="rounded-xl border border-slate-200 bg-white p-3 text-sm font-bold dark:border-white/10 dark:bg-slate-800" placeholder="Current skills" />
          <input className="rounded-xl border border-slate-200 bg-white p-3 text-sm font-bold dark:border-white/10 dark:bg-slate-800" placeholder="Career goal" />
        </div>
      </MotionCard>
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {courses.slice(0, 3).map((course, index) => (
          <MotionCard key={course.id} className="overflow-hidden p-0">
            <img src={course.thumbnail} alt={course.title} className="h-40 w-full object-cover" />
            <div className="p-5">
              <h3 className="text-lg font-black">{course.title}</h3>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-300">Recommended because it matches your career goal and current skill level.</p>
              <div className="mt-4"><ProgressBar value={72 + index * 8} /></div>
              <p className="mt-2 text-xs font-black text-[#ff6b35]">Difficulty: {index === 0 ? "Intermediate" : "Beginner friendly"}</p>
              <button className="mt-5 w-full rounded-xl bg-[#ff6b35] px-4 py-3 text-sm font-black text-white">Start learning</button>
            </div>
          </MotionCard>
        ))}
      </div>
    </div>
  );
}
