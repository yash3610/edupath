import React, { useMemo, useState } from "react";
import { Icon, MotionCard, SectionHeading } from "../../components/dashboard/DashboardPrimitives.jsx";

const notifications = [
  ["Course", "New lecture added", "Responsive dashboard patterns is now live.", "2 min ago", false],
  ["Quiz", "Quiz result", "You scored 92% in React Hooks quiz.", "1 hour ago", false],
  ["Assignment", "Instructor feedback", "Your Analytics Report was reviewed.", "Yesterday", true],
  ["Certificate", "Certificate ready", "Data Visualization certificate is ready.", "June 7, 2026", true],
  ["Payment", "Payment confirmed", "Invoice INV-2402 has been paid.", "June 5, 2026", true],
];

const filters = ["All", "Course", "Quiz", "Assignment", "Certificate", "Payment"];

export default function NotificationsPage() {
  const [filter, setFilter] = useState("All");
  const filtered = useMemo(() => filter === "All" ? notifications : notifications.filter((item) => item[0] === filter), [filter]);

  return (
    <div className="space-y-5">
      <SectionHeading eyebrow="Notifications" title="Learning updates" action={<button className="rounded-xl bg-slate-950 px-4 py-3 text-sm font-black text-white dark:bg-white dark:text-slate-950">Mark all as read</button>} />

      <MotionCard className="p-4">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {filters.map((item) => (
            <button key={item} onClick={() => setFilter(item)} className={`shrink-0 rounded-xl px-4 py-2 text-sm font-black ${filter === item ? "bg-[#ff6b35] text-white" : "bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-slate-200"}`}>
              {item}
            </button>
          ))}
        </div>
      </MotionCard>

      <div className="space-y-3">
        {filtered.map(([type, title, text, time, read]) => (
          <MotionCard key={`${type}-${title}`} className={`p-4 ${!read ? "border-[#ff6b35]/40 bg-orange-50 dark:bg-slate-900" : ""}`}>
            <div className="flex gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-[#ff6b35] dark:bg-white/10">
                <Icon name={type === "Quiz" ? "BadgeHelp" : type === "Certificate" ? "Award" : type === "Payment" ? "ReceiptText" : "Bell"} className="h-6 w-6" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-black">{title}</h3>
                  {!read && <span className="rounded-full bg-[#ff6b35] px-2 py-0.5 text-[11px] font-black text-white">Unread</span>}
                </div>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{text}</p>
                <p className="mt-2 text-xs font-bold text-slate-400">{type} - {time}</p>
              </div>
            </div>
          </MotionCard>
        ))}
      </div>
    </div>
  );
}
