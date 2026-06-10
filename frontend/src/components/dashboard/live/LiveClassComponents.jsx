import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { CalendarDays, Clock3, Radio, Users, Video } from "lucide-react";
import { motion } from "framer-motion";

const statusStyles = {
  draft: "bg-slate-100 text-slate-600",
  "pending-approval": "bg-amber-100 text-amber-700",
  scheduled: "bg-blue-100 text-blue-700",
  "starting-soon": "bg-orange-100 text-orange-700",
  live: "bg-rose-100 text-rose-700",
  completed: "bg-emerald-100 text-emerald-700",
  "recording-available": "bg-violet-100 text-violet-700",
  cancelled: "bg-slate-200 text-slate-600",
  rejected: "bg-red-100 text-red-700",
};

export function LiveClassStatusBadge({ status }) {
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide ${statusStyles[status] || statusStyles.draft}`}>{String(status || "draft").replaceAll("-", " ")}</span>;
}

export function CountdownTimer({ startAt }) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);
  const text = useMemo(() => {
    const diff = new Date(startAt).getTime() - now;
    if (diff <= 0) return "Class time reached";
    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    return days ? `${days}d ${hours}h ${minutes}m` : `${hours}h ${minutes}m ${seconds}s`;
  }, [now, startAt]);
  return <span className="text-xs font-extrabold text-[#ff723a]">{text}</span>;
}

export function LiveClassCard({ item, detailPath, actions }) {
  return (
    <motion.article initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-[22px] border border-slate-200/80 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,.05)] dark:border-white/10 dark:bg-slate-900">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0"><LiveClassStatusBadge status={item.status} /><h3 className="mt-3 truncate text-lg font-extrabold">{item.title}</h3><p className="mt-1 text-sm text-slate-500">{item.course?.title || "Course"} · {item.instructor?.name || "Instructor"}</p></div>
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#fff1e8] text-[#ff723a]"><Radio className="h-5 w-5" /></span>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2 text-xs font-bold text-slate-500">
        <span className="flex items-center gap-2"><CalendarDays className="h-4 w-4" /> {formatDate(item.startAt)}</span>
        <span className="flex items-center gap-2"><Clock3 className="h-4 w-4" /> {item.duration} min</span>
        <span className="flex items-center gap-2"><Video className="h-4 w-4" /> {item.meetingPlatform?.replace("-", " ")}</span>
        <span className="flex items-center gap-2"><Users className="h-4 w-4" /> {item.totalJoined || item.registrations || 0} joined</span>
      </div>
      {["scheduled", "starting-soon"].includes(item.status) && <div className="mt-4 rounded-xl bg-[#fff8ef] px-3 py-2 dark:bg-white/5"><CountdownTimer startAt={item.startAt} /></div>}
      <div className="mt-4 flex flex-wrap gap-2">
        {detailPath && <Link to={detailPath} className="rounded-xl bg-[#1f1c35] px-3 py-2 text-xs font-extrabold text-white">View details</Link>}
        {actions}
      </div>
    </motion.article>
  );
}

export function AttendanceTable({ rows = [] }) {
  return <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-white/10"><table className="min-w-full text-left text-sm"><thead className="bg-slate-50 text-xs uppercase text-slate-500 dark:bg-white/5"><tr>{["Student", "Joined", "Minutes", "Attendance", "Status"].map((value) => <th key={value} className="px-4 py-3">{value}</th>)}</tr></thead><tbody>{rows.map((row) => <tr key={row._id} className="border-t border-slate-100 dark:border-white/10"><td className="px-4 py-3 font-bold">{row.student?.name}<span className="block text-xs font-normal text-slate-400">{row.student?.email}</span></td><td className="px-4 py-3">{formatDate(row.joinTime)}</td><td className="px-4 py-3">{row.attendedMinutes || 0}</td><td className="px-4 py-3">{row.attendancePercentage || 0}%</td><td className="px-4 py-3"><LiveClassStatusBadge status={row.status} /></td></tr>)}</tbody></table>{!rows.length && <p className="p-8 text-center text-sm font-bold text-slate-400">No attendance records yet.</p>}</div>;
}

export function LiveClassSkeleton() {
  return <div className="grid gap-4 lg:grid-cols-2">{[1, 2, 3, 4].map((item) => <div key={item} className="h-64 animate-pulse rounded-[22px] bg-slate-200 dark:bg-white/10" />)}</div>;
}

export function formatDate(value) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}
