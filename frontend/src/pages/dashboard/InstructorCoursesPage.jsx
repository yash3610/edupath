import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { BarChart3, BookOpen, Layers3 } from "lucide-react";
import { MotionCard } from "../../components/dashboard/DashboardPrimitives.jsx";
import { apiRequest } from "../../services/api.js";
import { useToast } from "../../context/ToastContext.jsx";

export default function InstructorCoursesPage() {
  const toast = useToast();
  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiRequest("/api/instructor/my-courses")
      .then(({ data }) => setCourses(data || []))
      .catch((error) => toast.error(error.message))
      .finally(() => setLoading(false));
  }, [toast]);

  const filtered = useMemo(
    () => courses.filter((course) => `${course.title} ${course.category} ${course.status}`.toLowerCase().includes(search.toLowerCase())),
    [courses, search]
  );

  return (
    <div className="space-y-5">
      <section className="rounded-[28px] bg-[#1f1c35] p-6 text-white sm:p-8">
        <p className="text-xs font-extrabold uppercase tracking-[.18em] text-[#fec961]">Teaching Studio</p>
        <h2 className="mt-2 text-3xl font-extrabold">Assigned courses</h2>
        <p className="mt-2 text-sm text-white/65">Create courses, manage curriculum, track students, and review performance from one place.</p>
      </section>

      <MotionCard className="p-4">
        <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search assigned courses..." className="dashboard-search-clean w-full rounded-xl bg-slate-50 px-4 py-3 text-sm font-bold outline-none dark:bg-white/5" />
      </MotionCard>

      {loading ? <div className="grid gap-5 lg:grid-cols-2">{[1, 2].map((item) => <div key={item} className="h-72 animate-pulse rounded-[28px] bg-slate-200 dark:bg-white/10" />)}</div> : (
        <div className="grid gap-5 lg:grid-cols-2">
          {filtered.map((course) => (
            <MotionCard key={course._id} className="overflow-hidden p-0">
              <div className="grid sm:grid-cols-[180px_1fr]">
                <div className="min-h-44 bg-[#fff5ef]"><img src={course.thumbnail || "/assets/images/course/course-1/1.png"} alt="" className="h-full w-full object-cover" /></div>
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="rounded-full bg-[#fff1e8] px-3 py-1 text-[10px] font-extrabold uppercase text-[#ff723a]">{course.status}</span>
                      <h3 className="mt-3 text-xl font-extrabold">{course.title}</h3>
                      <p className="mt-1 text-sm text-slate-500">{course.category || "Uncategorized"} · {course.level}</p>
                    </div>
                    <BookOpen className="h-5 w-5 text-[#ff723a]" />
                  </div>
                  <div className="mt-5 flex flex-wrap gap-2">
                    <Link to={`/instructor/dashboard/builder?course=${course._id}`} className="action"><Layers3 className="h-4 w-4" /> Curriculum</Link>
                    <Link to={`/instructor/dashboard/courses/${course._id}/analytics`} className="action"><BarChart3 className="h-4 w-4" /> Analytics</Link>
                  </div>
                </div>
              </div>
            </MotionCard>
          ))}
        </div>
      )}

      {!loading && !filtered.length && <MotionCard className="text-center"><h3 className="text-xl font-extrabold">No courses yet</h3><p className="mt-2 text-sm text-slate-500">Create your first course to start building curriculum.</p><Link to="/instructor/dashboard/create" className="action mt-4">Create course</Link></MotionCard>}
      <style>{`.action{display:inline-flex;align-items:center;gap:.4rem;border-radius:.65rem;background:#f8fafc;padding:.55rem .7rem;font-size:.72rem;font-weight:800}.dark .action{background:rgba(255,255,255,.08)}`}</style>
    </div>
  );
}
