import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { CalendarDays, List, Plus, Search } from "lucide-react";
import { MotionCard } from "../../components/dashboard/DashboardPrimitives.jsx";
import { LiveClassCard, LiveClassSkeleton, formatDate } from "../../components/dashboard/live/LiveClassComponents.jsx";
import { useToast } from "../../context/ToastContext.jsx";
import { liveClassApi } from "../../services/liveClassApi.js";

export default function InstructorLiveClassesPage() {
  const toast = useToast();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [view, setView] = useState("list");

  useEffect(() => { liveClassApi.getInstructorLiveClasses().then(({ data }) => setClasses(data || [])).catch((error) => toast.error(error.message)).finally(() => setLoading(false)); }, [toast]);
  const filtered = useMemo(() => classes.filter((item) => (!status || item.status === status) && `${item.title} ${item.course?.title}`.toLowerCase().includes(search.toLowerCase())), [classes, search, status]);
  const byDay = useMemo(() => Object.groupBy ? Object.groupBy(filtered, (item) => new Date(item.startAt).toDateString()) : filtered.reduce((groups, item) => ({ ...groups, [new Date(item.startAt).toDateString()]: [...(groups[new Date(item.startAt).toDateString()] || []), item] }), {}), [filtered]);

  return <div className="space-y-5">
    <section className="flex flex-col gap-5 rounded-[28px] bg-[#1f1c35] p-7 text-white sm:flex-row sm:items-center sm:justify-between"><div><p className="text-xs font-extrabold uppercase tracking-[.18em] text-[#fec961]">Teaching Live</p><h2 className="mt-2 text-3xl font-extrabold">Live classes</h2><p className="mt-2 text-sm text-white/65">Schedule sessions for assigned courses and manage attendance, recordings, and resources.</p></div><Link to="/instructor/dashboard/live-classes/create" className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#ff723a] px-5 py-3 text-sm font-extrabold"><Plus className="h-4 w-4" /> Schedule class</Link></section>
    <MotionCard className="p-4"><div className="grid gap-3 lg:grid-cols-[1fr_210px_auto]"><label className="flex items-center gap-2 rounded-xl bg-slate-50 px-4 dark:bg-white/5"><Search className="h-4 w-4 text-slate-400" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search live classes..." className="w-full bg-transparent py-3 text-sm font-bold outline-none" /></label><select value={status} onChange={(event) => setStatus(event.target.value)} className="rounded-xl border border-slate-200 px-4 dark:border-white/10 dark:bg-slate-900"><option value="">All statuses</option>{["pending-approval", "scheduled", "starting-soon", "live", "completed", "recording-available", "cancelled", "rejected"].map((value) => <option key={value}>{value}</option>)}</select><div className="flex rounded-xl bg-slate-100 p-1 dark:bg-white/5"><button onClick={() => setView("list")} className={`rounded-lg p-2 ${view === "list" ? "bg-white text-[#ff723a] shadow dark:bg-white/10" : ""}`}><List className="h-4 w-4" /></button><button onClick={() => setView("calendar")} className={`rounded-lg p-2 ${view === "calendar" ? "bg-white text-[#ff723a] shadow dark:bg-white/10" : ""}`}><CalendarDays className="h-4 w-4" /></button></div></div></MotionCard>
    {loading ? <LiveClassSkeleton /> : view === "list" ? <div className="grid gap-4 lg:grid-cols-2">{filtered.map((item) => <LiveClassCard key={item._id} item={item} detailPath={`/instructor/dashboard/live-classes/${item._id}`} />)}</div> : <div className="space-y-4">{Object.entries(byDay).map(([day, items]) => <MotionCard key={day}><h3 className="font-extrabold">{day}</h3><div className="mt-3 space-y-2">{items.map((item) => <Link key={item._id} to={`/instructor/dashboard/live-classes/${item._id}`} className="flex items-center justify-between rounded-xl bg-slate-50 p-3 text-sm dark:bg-white/5"><span className="font-bold">{item.title}</span><span className="text-xs text-slate-500">{formatDate(item.startAt)}</span></Link>)}</div></MotionCard>)}</div>}
    {!loading && !filtered.length && <MotionCard className="text-center"><h3 className="font-extrabold">No live classes found</h3></MotionCard>}
  </div>;
}
