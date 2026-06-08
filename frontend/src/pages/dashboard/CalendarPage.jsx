import React from "react";
import { Icon, MotionCard, SectionHeading } from "../../components/dashboard/DashboardPrimitives.jsx";

const days = Array.from({ length: 30 }, (_, index) => index + 1);
const events = {
  9: ["Live Class"],
  11: ["Quiz"],
  14: ["Assignment"],
  20: ["Workshop"],
  24: ["Certificate"],
};

const upcoming = [
  ["Live Class", "Dashboard UI patterns", "June 9, 2026", "10:00 AM"],
  ["Quiz", "React Hooks", "June 11, 2026", "6:00 PM"],
  ["Assignment", "Dashboard Case Study", "June 14, 2026", "11:59 PM"],
  ["Workshop", "AI Learning Roadmaps", "June 20, 2026", "4:00 PM"],
];

export default function CalendarPage() {
  return (
    <div className="space-y-5">
      <SectionHeading eyebrow="Calendar" title="Learning schedule" />

      <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
        <MotionCard>
          <div className="mb-5 flex items-center justify-between">
            <h3 className="text-xl font-black">June 2026</h3>
            <div className="flex gap-2">
              <button className="rounded-xl bg-slate-100 px-3 py-2 text-sm font-black dark:bg-white/10">Prev</button>
              <button className="rounded-xl bg-[#ff6b35] px-3 py-2 text-sm font-black text-white">Today</button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2 text-center text-xs font-black text-slate-500">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => <div key={day}>{day}</div>)}
          </div>
          <div className="mt-3 grid grid-cols-7 gap-2">
            {days.map((day) => (
              <div key={day} className={`min-h-20 rounded-2xl border p-2 text-sm font-black ${events[day] ? "border-[#ff6b35] bg-orange-50 text-[#ff6b35] dark:bg-white/10" : "border-slate-200 bg-white dark:border-white/10 dark:bg-slate-800"}`}>
                <span>{day}</span>
                {events[day]?.map((event) => <p key={event} className="mt-2 truncate rounded-lg bg-white px-2 py-1 text-[11px] dark:bg-slate-900">{event}</p>)}
              </div>
            ))}
          </div>
        </MotionCard>

        <div className="space-y-4">
          <MotionCard>
            <SectionHeading eyebrow="Upcoming" title="This month" />
            <div className="space-y-3">
              {upcoming.map(([type, title, date, time]) => (
                <div key={title} className="rounded-2xl bg-slate-100 p-4 dark:bg-white/10">
                  <div className="flex items-center gap-2 text-sm font-black text-[#ff6b35]"><Icon name="CalendarDays" className="h-4 w-4" />{type}</div>
                  <h4 className="mt-2 font-black">{title}</h4>
                  <p className="text-sm text-slate-500 dark:text-slate-300">{date} - {time}</p>
                </div>
              ))}
            </div>
          </MotionCard>
        </div>
      </div>
    </div>
  );
}
