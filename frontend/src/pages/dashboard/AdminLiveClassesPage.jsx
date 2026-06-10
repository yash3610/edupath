import React, { useCallback, useEffect, useMemo, useState } from "react";
import { CheckCircle2, Radio, Search, Trash2, XCircle } from "lucide-react";
import { MotionCard } from "../../components/dashboard/DashboardPrimitives.jsx";
import { LiveClassCard, LiveClassSkeleton } from "../../components/dashboard/live/LiveClassComponents.jsx";
import { useToast } from "../../context/ToastContext.jsx";
import { liveClassApi } from "../../services/liveClassApi.js";

export default function AdminLiveClassesPage() {
  const toast = useToast();
  const [classes, setClasses] = useState([]);
  const [stats, setStats] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    return liveClassApi.getAdminLiveClasses(status).then(({ data }) => {
      setClasses(data?.classes || []);
      setStats(data?.stats || []);
    }).catch((error) => toast.error(error.message)).finally(() => setLoading(false));
  }, [status, toast]);

  useEffect(() => { load(); }, [load]);
  const filtered = useMemo(() => classes.filter((item) => `${item.title} ${item.course?.title} ${item.instructor?.name}`.toLowerCase().includes(search.toLowerCase())), [classes, search]);
  const stat = (name) => stats.find((item) => item._id === name)?.count || 0;
  const average = Math.round(stats.reduce((sum, item) => sum + Number(item.attendance || 0), 0) / Math.max(1, stats.length));

  async function act(item, action) {
    try {
      if (action === "approve") await liveClassApi.approveLiveClass(item._id);
      if (action === "reject") await liveClassApi.rejectLiveClass(item._id, window.prompt("Rejection reason") || "Changes required");
      if (action === "cancel") await liveClassApi.cancelAdminLiveClass(item._id, window.prompt("Cancellation reason") || "Cancelled by admin");
      if (action === "delete") await liveClassApi.deleteAdminLiveClass(item._id);
      toast.success("Live class updated.");
      await load();
    } catch (error) { toast.error(error.message); }
  }

  const cards = [
    ["Total Classes", classes.length, "Radio"], ["Pending", stat("pending-approval"), "Clock3"], ["Scheduled", stat("scheduled"), "CalendarDays"],
    ["Live Now", stat("live"), "Video"], ["Completed", stat("completed") + stat("recording-available"), "CheckCircle2"], ["Avg Attendance", `${average}%`, "Users"],
  ];

  return <div className="space-y-5">
    <section className="rounded-[28px] bg-[#1f1c35] p-7 text-white"><p className="text-xs font-extrabold uppercase tracking-[.18em] text-[#fec961]">Live Learning</p><h2 className="mt-2 text-3xl font-extrabold">Live class control room</h2><p className="mt-2 text-sm text-white/65">Approve schedules, monitor attendance, manage recordings, and send class updates.</p></section>
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">{cards.map(([label, value, icon]) => <MotionCard key={label} className="p-4"><Radio className="h-5 w-5 text-[#ff723a]" /><p className="mt-3 text-2xl font-extrabold">{value}</p><p className="text-xs font-bold text-slate-500">{label}</p></MotionCard>)}</div>
    <MotionCard className="p-4"><div className="grid gap-3 md:grid-cols-[1fr_220px]"><label className="flex items-center gap-2 rounded-xl bg-slate-50 px-4 dark:bg-white/5"><Search className="h-4 w-4 text-slate-400" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search class, course, instructor..." className="dashboard-search-input w-full bg-transparent py-3 text-sm font-bold outline-none" /></label><select value={status} onChange={(event) => setStatus(event.target.value)} className="rounded-xl border border-slate-200 px-4 dark:border-white/10 dark:bg-slate-900"><option value="">All statuses</option>{["pending-approval", "scheduled", "live", "completed", "recording-available", "cancelled", "rejected"].map((value) => <option key={value}>{value}</option>)}</select></div></MotionCard>
    {loading ? <LiveClassSkeleton /> : <div className="grid gap-4 lg:grid-cols-2">{filtered.map((item) => <LiveClassCard key={item._id} item={item} detailPath={`/admin/dashboard/live-classes/${item._id}`} actions={<>{["pending-approval", "rejected"].includes(item.status) && <button onClick={() => act(item, "approve")} className="action text-emerald-700"><CheckCircle2 className="h-4 w-4" /> Approve</button>}{item.status === "pending-approval" && <button onClick={() => act(item, "reject")} className="action text-amber-700"><XCircle className="h-4 w-4" /> Reject</button>}{!["completed", "recording-available", "cancelled"].includes(item.status) && <button onClick={() => act(item, "cancel")} className="action">Cancel</button>}<button onClick={() => act(item, "delete")} className="action text-rose-600"><Trash2 className="h-4 w-4" /> Delete</button></>} />)}</div>}
    {!loading && !filtered.length && <MotionCard className="text-center"><h3 className="font-extrabold">No live classes found</h3></MotionCard>}
    <style>{`.action{display:inline-flex;align-items:center;gap:.35rem;border-radius:.75rem;background:#f8fafc;padding:.5rem .7rem;font-size:.72rem;font-weight:800}.dark .action{background:rgba(255,255,255,.08)}`}</style>
  </div>;
}
