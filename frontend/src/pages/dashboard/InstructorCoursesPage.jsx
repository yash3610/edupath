import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { BarChart3, BookOpen, Edit3, Layers3, Plus, Send, Trash2 } from "lucide-react";
import { MotionCard } from "../../components/dashboard/DashboardPrimitives.jsx";
import { apiRequest } from "../../services/api.js";
import { useToast } from "../../context/ToastContext.jsx";

export default function InstructorCoursesPage() {
  const toast = useToast();
  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const load = useCallback(() => apiRequest("/api/instructor/my-courses").then(({ data }) => setCourses(data || [])).catch((error) => toast.error(error.message)).finally(() => setLoading(false)), [toast]);
  useEffect(() => { load(); }, [load]);
  const filtered = useMemo(() => courses.filter((course) => `${course.title} ${course.category} ${course.status}`.toLowerCase().includes(search.toLowerCase())), [courses, search]);

  async function act(course, action) {
    try {
      if (action === "delete") await apiRequest(`/api/instructor/courses/${course._id}`, { method: "DELETE" });
      if (action === "submit") await apiRequest(`/api/instructor/courses/${course._id}/submit`, { method: "PATCH" });
      toast.success(action === "delete" ? "Course deleted." : "Course submitted for review.");
      await load();
    } catch (error) { toast.error(error.message); }
  }

  return <div className="space-y-5">
    <section className="flex flex-col gap-5 rounded-[28px] bg-[#1f1c35] p-6 text-white sm:p-8 lg:flex-row lg:items-center lg:justify-between"><div><p className="text-xs font-extrabold uppercase tracking-[.18em] text-[#fec961]">Course Studio</p><h2 className="mt-2 text-3xl font-extrabold">Your course catalog</h2><p className="mt-2 text-sm text-white/65">Create, build, submit, and monitor every course from one organized workspace.</p></div><Link to="/instructor/dashboard/create-course" className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#ff723a] px-5 py-3 text-sm font-extrabold"><Plus className="h-4 w-4" /> New course</Link></section>
    <MotionCard className="p-4"><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search courses, category, status..." className="w-full rounded-xl bg-slate-50 px-4 py-3 text-sm font-bold outline-none dark:bg-white/5" /></MotionCard>
    {loading ? <div className="grid gap-5 lg:grid-cols-2">{[1, 2].map((item) => <div key={item} className="h-72 animate-pulse rounded-[28px] bg-slate-200 dark:bg-white/10" />)}</div> : <div className="grid gap-5 lg:grid-cols-2">{filtered.map((course) => <MotionCard key={course._id} className="overflow-hidden p-0"><div className="grid sm:grid-cols-[180px_1fr]"><div className="min-h-44 bg-[#fff5ef]"><img src={course.thumbnail || "/assets/images/course/course-1/1.png"} alt="" className="h-full w-full object-cover" /></div><div className="p-5"><div className="flex items-start justify-between gap-3"><div><span className="rounded-full bg-[#fff1e8] px-3 py-1 text-[10px] font-extrabold uppercase text-[#ff723a]">{course.status}</span><h3 className="mt-3 text-xl font-extrabold">{course.title}</h3><p className="mt-1 text-sm text-slate-500">{course.category || "Uncategorized"} · {course.level}</p></div><BookOpen className="h-5 w-5 text-[#ff723a]" /></div><div className="mt-5 flex flex-wrap gap-2"><Link to={`/instructor/dashboard/courses/${course._id}/edit`} className="action"><Edit3 className="h-4 w-4" /> Edit</Link><Link to={`/instructor/dashboard/course-builder?course=${course._id}`} className="action"><Layers3 className="h-4 w-4" /> Curriculum</Link><Link to={`/instructor/dashboard/courses/${course._id}/analytics`} className="action"><BarChart3 className="h-4 w-4" /> Analytics</Link>{["draft", "rejected"].includes(course.status) && <button onClick={() => act(course, "submit")} className="action text-emerald-700"><Send className="h-4 w-4" /> Submit</button>}<button onClick={() => act(course, "delete")} className="action text-rose-600"><Trash2 className="h-4 w-4" /> Delete</button></div>{course.rejectionReason && <p className="mt-3 rounded-xl bg-rose-50 p-3 text-xs font-bold text-rose-700">Admin feedback: {course.rejectionReason}</p>}</div></div></MotionCard>)}</div>}
    {!loading && !filtered.length && <MotionCard className="text-center"><h3 className="text-xl font-extrabold">No courses found</h3><p className="mt-2 text-sm text-slate-500">Create your first course to start building the curriculum.</p></MotionCard>}
    <style>{`.action{display:inline-flex;align-items:center;gap:.4rem;border-radius:.65rem;background:#f8fafc;padding:.55rem .7rem;font-size:.72rem;font-weight:800}.dark .action{background:rgba(255,255,255,.08)}`}</style>
  </div>;
}
