import React, { useEffect, useMemo, useState } from "react";
import { CalendarDays, List, Video } from "lucide-react";
import { MotionCard } from "../../components/dashboard/DashboardPrimitives.jsx";
import { LiveClassCard, LiveClassSkeleton, formatDate } from "../../components/dashboard/live/LiveClassComponents.jsx";
import { useToast } from "../../context/ToastContext.jsx";
import { liveClassApi } from "../../services/liveClassApi.js";

export default function StudentLiveClassesPage({ recordingsOnly = false }) {
  const toast = useToast();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("list");
  const [tab, setTab] = useState(recordingsOnly ? "recordings" : "upcoming");

  useEffect(() => {
    const request = recordingsOnly ? liveClassApi.getLiveClassRecordings() : liveClassApi.getStudentLiveClasses();
    request.then(({ data }) => setClasses(data || [])).catch((error) => toast.error(error.message)).finally(() => setLoading(false));
  }, [recordingsOnly, toast]);

  const now = Date.now();
  const filtered = useMemo(() => classes.filter((item) => {
    if (tab === "recordings") return item.status === "recording-available";
    if (tab === "today") return new Date(item.startAt).toDateString() === new Date().toDateString();
    if (tab === "missed") return new Date(item.endAt).getTime() < now && !["recording-available"].includes(item.status);
    return new Date(item.endAt).getTime() >= now && !["cancelled", "rejected"].includes(item.status);
  }), [classes, now, tab]);

  return <div className="space-y-5">
    <section className="rounded-[28px] bg-[#1f1c35] p-7 text-white"><p className="text-xs font-extrabold uppercase tracking-[.18em] text-[#fec961]">Live Learning</p><h2 className="mt-2 text-3xl font-extrabold">{recordingsOnly ? "Class recordings" : "Live classes"}</h2><p className="mt-2 text-sm text-white/65">Join upcoming sessions, track attendance, and revisit completed class recordings.</p></section>
    {!recordingsOnly && <MotionCard className="p-3"><div className="flex flex-wrap items-center justify-between gap-3"><div className="flex flex-wrap gap-2">{["upcoming", "today", "recordings", "missed"].map((value) => <button key={value} onClick={() => setTab(value)} className={`rounded-xl px-4 py-2 text-xs font-extrabold capitalize ${tab === value ? "bg-[#ff723a] text-white" : "bg-slate-100 dark:bg-white/5"}`}>{value}</button>)}</div><div className="flex rounded-xl bg-slate-100 p-1 dark:bg-white/5"><button onClick={() => setView("list")} className={`rounded-lg p-2 ${view === "list" ? "bg-white text-[#ff723a] dark:bg-white/10" : ""}`}><List className="h-4 w-4" /></button><button onClick={() => setView("calendar")} className={`rounded-lg p-2 ${view === "calendar" ? "bg-white text-[#ff723a] dark:bg-white/10" : ""}`}><CalendarDays className="h-4 w-4" /></button></div></div></MotionCard>}
    {loading ? <LiveClassSkeleton /> : view === "list" ? <div className="grid gap-4 lg:grid-cols-2">{filtered.map((item) => <LiveClassCard key={item._id} item={item} detailPath={`/dashboard/live-classes/${item._id}`} actions={item.recordingUrl && <a href={item.recordingUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-xl bg-violet-100 px-3 py-2 text-xs font-extrabold text-violet-700"><Video className="h-4 w-4" /> Watch recording</a>} />)}</div> : <MotionCard><div className="space-y-2">{filtered.map((item) => <div key={item._id} className="flex items-center justify-between rounded-xl bg-slate-50 p-3 dark:bg-white/5"><span className="font-bold">{item.title}</span><span className="text-xs text-slate-500">{formatDate(item.startAt)}</span></div>)}</div></MotionCard>}
    {!loading && !filtered.length && <MotionCard className="text-center"><h3 className="font-extrabold">Nothing here yet</h3><p className="mt-1 text-sm text-slate-500">Live classes will appear when an instructor schedules them.</p></MotionCard>}
  </div>;
}
