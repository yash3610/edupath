import React from "react";
import { courses } from "../../data/dashboardData.js";
import { MotionCard, SectionHeading } from "../../components/dashboard/DashboardPrimitives.jsx";

export default function AINotesPage() {
  return (
    <div className="space-y-5">
      <SectionHeading eyebrow="AI Notes Summarizer" title="Generate smart summaries" />
      <MotionCard>
        <div className="grid gap-4 md:grid-cols-3">
          <select className="rounded-xl border border-slate-200 bg-white p-3 text-sm font-bold dark:border-white/10 dark:bg-slate-800">
            {courses.map((course) => <option key={course.id}>{course.title}</option>)}
          </select>
          <select className="rounded-xl border border-slate-200 bg-white p-3 text-sm font-bold dark:border-white/10 dark:bg-slate-800">
            <option>Current Lecture</option>
            <option>Module Summary</option>
            <option>Full Course</option>
          </select>
          <button className="rounded-xl bg-[#ff6b35] px-4 py-3 text-sm font-black text-white">Generate Summary</button>
        </div>
      </MotionCard>
      <div className="grid gap-5 xl:grid-cols-[1.1fr_.9fr]">
        <MotionCard>
          <SectionHeading eyebrow="Summary" title="Responsive dashboard patterns" />
          <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">
            This lecture explains how to structure a dashboard with protected layouts, reusable cards, charts, responsive navigation, and clean state handling.
          </p>
          <button className="mt-5 rounded-xl bg-slate-950 px-4 py-3 text-sm font-black text-white dark:bg-white dark:text-slate-950">Download notes</button>
        </MotionCard>
        <MotionCard>
          <SectionHeading eyebrow="Key Points" title="Action items" />
          <ul className="space-y-3 text-sm font-bold text-slate-600 dark:text-slate-300">
            <li>Use one shared dashboard layout.</li>
            <li>Keep mobile navigation reachable.</li>
            <li>Lazy-load charts and heavy pages.</li>
            <li>Save important answers to notes.</li>
          </ul>
        </MotionCard>
      </div>
    </div>
  );
}
