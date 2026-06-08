import React, { useState } from "react";
import { Icon, MotionCard, SectionHeading } from "../../components/dashboard/DashboardPrimitives.jsx";

const resources = [
  ["React dashboard checklist", "React Mastery", "PDF", "2.4 MB", "June 8, 2026"],
  ["AI prompt pack", "AI Product Strategy", "ZIP", "8.1 MB", "June 7, 2026"],
  ["Certificate template", "Design Systems", "Image", "1.2 MB", "June 6, 2026"],
  ["Analytics worksheet", "Data Visualization", "DOC", "920 KB", "June 5, 2026"],
];

const fileIcons = { PDF: "BookOpen", ZIP: "Download", DOC: "NotebookPen", Image: "Award" };

export default function DownloadsPage() {
  const [filter, setFilter] = useState("All");
  const courses = ["All", ...new Set(resources.map((item) => item[1]))];
  const filtered = filter === "All" ? resources : resources.filter((item) => item[1] === filter);

  return (
    <div className="space-y-5">
      <SectionHeading eyebrow="Downloads" title="Course resources" />

      <MotionCard className="p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="font-black">Downloaded files</h3>
            <p className="text-sm text-slate-500 dark:text-slate-300">Filter resources course-wise and download again anytime.</p>
          </div>
          <select value={filter} onChange={(e) => setFilter(e.target.value)} className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold dark:border-white/10 dark:bg-slate-800">
            {courses.map((course) => <option key={course}>{course}</option>)}
          </select>
        </div>
      </MotionCard>

      <div className="grid gap-4">
        {filtered.map(([name, course, type, size, date]) => (
          <MotionCard key={name} className="p-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-orange-50 text-[#ff6b35] dark:bg-white/10">
                  <Icon name={fileIcons[type]} className="h-6 w-6" />
                </div>
                <div className="min-w-0">
                  <h3 className="truncate font-black">{name}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-300">{course} - {type} - {size} - {date}</p>
                </div>
              </div>
              <button className="w-full rounded-xl bg-slate-950 px-4 py-3 text-sm font-black text-white dark:bg-white dark:text-slate-950 sm:w-auto">
                Download again
              </button>
            </div>
          </MotionCard>
        ))}
      </div>
    </div>
  );
}
