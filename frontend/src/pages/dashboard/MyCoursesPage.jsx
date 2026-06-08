import React, { useMemo, useState } from "react";
import { courses } from "../../data/dashboardData.js";
import { MotionCard, ProgressBar, SectionHeading } from "../../components/dashboard/DashboardPrimitives.jsx";

const filters = ["All", "In Progress", "Completed", "Not Started"];

export default function MyCoursesPage() {
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const filtered = useMemo(
    () => courses.filter((course) => (filter === "All" || course.status === filter) && course.title.toLowerCase().includes(search.toLowerCase())),
    [filter, search]
  );

  return (
    <div className="space-y-5">
      <SectionHeading eyebrow="My Courses" title="All enrolled courses" />

      <MotionCard className="p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {filters.map((item) => (
              <button
                key={item}
                onClick={() => setFilter(item)}
                className={`shrink-0 rounded-xl px-4 py-2 text-sm font-black ${filter === item ? "bg-[#ff6b35] text-white" : "bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-slate-200"}`}
              >
                {item}
              </button>
            ))}
          </div>
          <input
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold outline-none dark:border-white/10 dark:bg-slate-800 lg:max-w-xs"
            placeholder="Search courses..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
      </MotionCard>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((course) => (
          <MotionCard key={course.id} className="overflow-hidden p-0">
            <img src={course.thumbnail} alt={course.title} className="h-44 w-full object-cover" />
            <div className="p-5">
              <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-black uppercase text-[#ff6b35] dark:bg-white/10">{course.status}</span>
              <h3 className="mt-3 line-clamp-2 text-lg font-black">{course.title}</h3>
              <p className="mt-1 text-sm font-bold text-slate-500 dark:text-slate-400">By {course.instructor}</p>
              <div className="mt-4">
                <ProgressBar value={course.progress} />
              </div>
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs font-bold text-slate-500 dark:text-slate-400">
                <span>{course.completedLectures}/{course.totalLectures} lectures</span>
                <span>{course.duration}</span>
                <span>{course.progress}%</span>
              </div>
              <button className="mt-5 w-full rounded-xl bg-slate-950 px-4 py-3 text-sm font-black text-white dark:bg-white dark:text-slate-950">
                Continue Learning
              </button>
            </div>
          </MotionCard>
        ))}
      </div>

      {filtered.length === 0 && (
        <MotionCard className="text-center">
          <h3 className="text-xl font-black">No courses found</h3>
          <p className="mt-2 text-slate-500">Try a different search or filter.</p>
        </MotionCard>
      )}
    </div>
  );
}
