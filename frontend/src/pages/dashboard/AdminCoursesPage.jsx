import React, { useCallback, useEffect, useMemo, useState } from "react";
import { CheckCircle2, EyeOff, Search, Sparkles, Trash2, XCircle } from "lucide-react";
import { MotionCard } from "../../components/dashboard/DashboardPrimitives.jsx";
import { apiRequest } from "../../services/api.js";
import { useToast } from "../../context/ToastContext.jsx";

export default function AdminCoursesPage() {
  const toast = useToast();
  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [loading, setLoading] = useState(true);
  const load = useCallback(() => apiRequest("/api/admin/courses").then(({ data }) => setCourses(data || [])).catch((error) => toast.error(error.message)).finally(() => setLoading(false)), [toast]);
  useEffect(() => { load(); }, [load]);
  const filtered = useMemo(() => courses.filter((course) => (status === "all" || course.status === status) && `${course.title} ${course.category} ${course.instructor?.name}`.toLowerCase().includes(search.toLowerCase())), [courses, search, status]);

  async function action(course, name) {
    try {
      if (name === "delete") await apiRequest(`/api/admin/courses/${course._id}`, { method: "DELETE" });
      else if (name === "reject") {
        const reason = window.prompt("Rejection reason") || "Course needs changes.";
        await apiRequest(`/api/admin/courses/${course._id}/reject`, { method: "PATCH", body: JSON.stringify({ reason }) });
      } else if (name === "approve") await apiRequest(`/api/admin/courses/${course._id}/approve`, { method: "PATCH" });
      else if (name === "price") {
        const price = window.prompt("Course price", course.price || 0);
        if (price === null) return;
        const discountPrice = window.prompt("Discount price", course.discountPrice || 0);
        await apiRequest(`/api/admin/courses/${course._id}/control`, { method: "PATCH", body: JSON.stringify({ price: Number(price), discountPrice: Number(discountPrice || 0) }) });
      } else await apiRequest(`/api/admin/courses/${course._id}/control`, { method: "PATCH", body: JSON.stringify(name === "feature" ? { featured: !course.featured } : { disabled: !course.disabled }) });
      toast.success("Course updated.");
      await load();
    } catch (error) { toast.error(error.message); }
  }

  return <div className="space-y-5">
    <section className="rounded-[28px] bg-[#1f1c35] p-7 text-white"><p className="text-xs font-extrabold uppercase tracking-[.18em] text-[#fec961]">Course Control</p><h2 className="mt-2 text-3xl font-extrabold">Platform course catalog</h2><p className="mt-2 text-sm text-white/65">Review submissions, feature quality courses, disable access, and keep pricing and publishing synchronized.</p></section>
    <MotionCard className="p-4"><div className="grid gap-3 md:grid-cols-[1fr_220px]"><label className="flex items-center gap-3 rounded-xl bg-slate-50 px-4 dark:bg-white/5"><Search className="h-4 w-4 text-slate-400" /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search course or instructor..." className="w-full bg-transparent py-3 text-sm font-bold outline-none" /></label><select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-xl border border-slate-200 px-4 dark:border-white/10 dark:bg-slate-900">{["all", "draft", "pending", "approved", "rejected"].map((item) => <option key={item}>{item}</option>)}</select></div></MotionCard>
    {loading ? <div className="h-72 animate-pulse rounded-[28px] bg-slate-200 dark:bg-white/10" /> : <div className="grid gap-4 xl:grid-cols-2">{filtered.map((course) => <MotionCard key={course._id} className="p-5"><div className="flex gap-4"><img src={course.thumbnail || "/assets/images/course/course-1/1.png"} alt="" className="h-24 w-28 rounded-2xl object-cover" /><div className="min-w-0 flex-1"><div className="flex flex-wrap gap-2"><span className="rounded-full bg-[#fff1e8] px-2.5 py-1 text-[10px] font-extrabold uppercase text-[#ff723a]">{course.status}</span>{course.featured && <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-extrabold text-amber-700">Featured</span>}{course.disabled && <span className="rounded-full bg-rose-50 px-2.5 py-1 text-[10px] font-extrabold text-rose-700">Disabled</span>}</div><h3 className="mt-2 truncate text-lg font-extrabold">{course.title}</h3><p className="text-sm text-slate-500">{course.instructor?.name || "Instructor"} · {course.category || "Category"}</p><p className="mt-1 text-sm font-extrabold">{course.currency || "USD"} {course.discountPrice || course.price || 0}</p></div></div><div className="mt-4 flex flex-wrap gap-2">{course.status !== "approved" && <button onClick={() => action(course, "approve")} className="control text-emerald-700"><CheckCircle2 className="h-4 w-4" /> Approve</button>}<button onClick={() => action(course, "reject")} className="control text-amber-700"><XCircle className="h-4 w-4" /> Reject</button><button onClick={() => action(course, "price")} className="control">Edit price</button><button onClick={() => action(course, "feature")} className="control text-[#ff723a]"><Sparkles className="h-4 w-4" /> {course.featured ? "Unfeature" : "Feature"}</button><button onClick={() => action(course, "disable")} className="control"><EyeOff className="h-4 w-4" /> {course.disabled ? "Enable" : "Disable"}</button><button onClick={() => action(course, "delete")} className="control text-rose-600"><Trash2 className="h-4 w-4" /> Delete</button></div></MotionCard>)}</div>}
    <style>{`.control{display:inline-flex;align-items:center;gap:.4rem;border-radius:.65rem;background:#f8fafc;padding:.55rem .7rem;font-size:.72rem;font-weight:800}.dark .control{background:rgba(255,255,255,.08)}`}</style>
  </div>;
}
