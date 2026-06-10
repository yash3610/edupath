import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Icon, MotionCard, SectionHeading } from "../../components/dashboard/DashboardPrimitives.jsx";
import { useToast } from "../../context/ToastContext.jsx";
import { apiRequest } from "../../services/api.js";

export default function DownloadsPage() {
  const toast = useToast();
  const [courses, setCourses] = useState([]);
  const [resources, setResources] = useState([]);
  const [activeCourse, setActiveCourse] = useState("all");
  const [activeType, setActiveType] = useState("All");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [downloaded, setDownloaded] = useState(() => readHistory());

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const enrollmentResult = await apiRequest("/api/enrollments/my");
      const enrolledCourses = (enrollmentResult.data || []).filter((item) => item.course && ["active", "completed"].includes(item.status));
      setCourses(enrolledCourses.map((item) => item.course));
      const resourceResults = await Promise.all(enrolledCourses.map(async (item) => {
        try {
          const result = await apiRequest(`/api/learning/course/${item.course._id}/resources`);
          return flattenResources(result.data || [], item.course);
        } catch {
          return [];
        }
      }));
      setResources(resourceResults.flat());
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { load(); }, [load]);

  const types = useMemo(() => ["All", ...new Set(resources.map((item) => item.type))], [resources]);
  const filtered = useMemo(() => resources.filter((item) => {
    const matchesCourse = activeCourse === "all" || item.courseId === activeCourse;
    const matchesType = activeType === "All" || item.type === activeType;
    const text = `${item.title} ${item.courseTitle} ${item.lectureTitle}`.toLowerCase();
    return matchesCourse && matchesType && text.includes(search.trim().toLowerCase());
  }), [activeCourse, activeType, resources, search]);

  function download(resource) {
    if (!resource.url) return;
    const next = { ...downloaded, [resource.id]: new Date().toISOString() };
    setDownloaded(next);
    localStorage.setItem("edupath-download-history", JSON.stringify(next));
    window.open(resource.url, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="space-y-5">
      <SectionHeading eyebrow="Downloads" title="Your learning resources" />

      <div className="grid gap-3 sm:grid-cols-3">
        <Stat icon="Download" label="Resources" value={resources.length} />
        <Stat icon="BookOpen" label="Courses" value={courses.length} />
        <Stat icon="CheckCircle2" label="Opened" value={Object.keys(downloaded).filter((id) => resources.some((resource) => resource.id === id)).length} />
      </div>

      <div className="grid min-w-0 gap-5 xl:grid-cols-[250px_minmax(0,1fr)]">
        <aside>
          <MotionCard className="p-4 xl:sticky xl:top-24">
            <p className="px-1 text-[10px] font-extrabold uppercase tracking-[.16em] text-slate-400">Courses</p>
            <div className="mt-2 flex gap-2 overflow-x-auto pb-1 xl:block xl:space-y-1">
              <CourseFilter active={activeCourse === "all"} label="All resources" count={resources.length} onClick={() => setActiveCourse("all")} />
              {courses.map((course) => <CourseFilter key={course._id} active={activeCourse === course._id} label={course.title} count={resources.filter((item) => item.courseId === course._id).length} onClick={() => setActiveCourse(course._id)} />)}
            </div>
            <div className="mt-5 rounded-2xl bg-[#fff8ef] p-4 dark:bg-white/5">
              <Icon name="Download" className="h-5 w-5 text-[#ff723a]" />
              <p className="mt-3 text-sm font-extrabold">Course library</p>
              <p className="mt-1 text-xs leading-5 text-slate-500">Resources uploaded inside your enrolled courses appear here automatically.</p>
            </div>
          </MotionCard>
        </aside>

        <main className="min-w-0 space-y-4">
          <MotionCard className="p-4">
            <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto]">
              <label className="flex min-w-0 items-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 dark:border-white/10"><Icon name="Search" className="h-4 w-4 text-slate-400" /><input value={search} onChange={(event) => setSearch(event.target.value)} className="min-w-0 flex-1 bg-transparent text-sm font-bold outline-none" placeholder="Search files, courses or lectures" /></label>
              <div className="flex gap-2 overflow-x-auto">
                {types.map((type) => <button key={type} onClick={() => setActiveType(type)} className={`shrink-0 rounded-xl px-3 py-2.5 text-xs font-extrabold ${activeType === type ? "bg-[#ff723a] text-white" : "bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300"}`}>{type}</button>)}
              </div>
            </div>
          </MotionCard>

          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-bold text-slate-500">{filtered.length} files available</p>
            {(activeCourse !== "all" || activeType !== "All" || search) && <button onClick={() => { setActiveCourse("all"); setActiveType("All"); setSearch(""); }} className="text-xs font-extrabold text-[#ff723a]">Clear filters</button>}
          </div>

          {loading && [1, 2, 3].map((item) => <div key={item} className="h-28 animate-pulse rounded-[22px] bg-slate-200 dark:bg-white/10" />)}
          {!loading && filtered.map((resource, index) => (
            <MotionCard key={resource.id} className="p-4" delay={index * 0.02}>
              <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center">
                <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${typeStyle(resource.type)}`}><Icon name={fileIcon(resource.type)} className="h-6 w-6" /></span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="break-words font-extrabold">{resource.title}</h3>
                    <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-extrabold uppercase text-slate-500 dark:bg-white/10">{resource.type}</span>
                  </div>
                  <p className="mt-1 text-sm font-bold text-slate-500 dark:text-slate-300">{resource.courseTitle}</p>
                  <p className="mt-0.5 truncate text-xs text-slate-400">From {resource.lectureTitle}</p>
                  {downloaded[resource.id] && <p className="mt-1 text-[10px] font-extrabold text-emerald-600">Opened {formatDate(downloaded[resource.id])}</p>}
                </div>
                <button onClick={() => download(resource)} className="inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-[#1f1c35] px-4 py-3 text-sm font-extrabold text-white transition hover:bg-[#ff723a] dark:bg-white dark:text-slate-950 sm:w-auto"><Icon name="Download" className="h-4 w-4" /> Download</button>
              </div>
            </MotionCard>
          ))}
          {!loading && !filtered.length && <MotionCard className="py-12 text-center"><span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-[#ff723a] dark:bg-white/10"><Icon name="Download" /></span><h3 className="mt-4 font-extrabold">No resources found</h3><p className="mt-1 text-sm text-slate-500">{resources.length ? "Try changing the selected filters." : "Resources uploaded to your enrolled courses will appear here."}</p></MotionCard>}
        </main>
      </div>
    </div>
  );
}

function flattenResources(lectures, course) {
  return lectures.flatMap((lecture) => (lecture.resources || []).filter((resource) => resource.url).map((resource, index) => ({
    id: String(resource._id || `${lecture._id}-${index}-${resource.url}`),
    title: resource.title || fileName(resource.url) || "Course resource",
    url: resource.url,
    type: normalizeType(resource.type, resource.url),
    lectureTitle: lecture.title || "Course lecture",
    courseId: String(course._id),
    courseTitle: course.title || "Course",
  })));
}

function CourseFilter({ active, label, count, onClick }) {
  return <button onClick={onClick} className={`flex shrink-0 items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-extrabold xl:w-full ${active ? "bg-[#ff723a] text-white" : "bg-slate-50 text-slate-600 hover:bg-orange-50 dark:bg-white/5 dark:text-slate-300"}`}><span className="max-w-44 truncate">{label}</span><span className="text-xs opacity-70">{count}</span></button>;
}

function Stat({ icon, label, value }) {
  return <MotionCard className="p-4"><div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-[#ff723a] dark:bg-white/10"><Icon name={icon} className="h-5 w-5" /></span><div><p className="text-xl font-extrabold">{value}</p><p className="text-xs font-bold text-slate-500">{label}</p></div></div></MotionCard>;
}

function normalizeType(type, url) {
  const value = `${type || ""} ${url || ""}`.toLowerCase();
  if (value.includes("pdf")) return "PDF";
  if (value.includes("zip") || value.includes("rar")) return "Archive";
  if (value.includes("doc")) return "Document";
  if (value.includes("image") || /\.(png|jpe?g|webp|gif)(\?|$)/i.test(url || "")) return "Image";
  if (value.includes("video") || /\.(mp4|webm|mov)(\?|$)/i.test(url || "")) return "Video";
  return "File";
}

function fileIcon(type) {
  return ({ PDF: "FileText", Archive: "Download", Document: "NotebookPen", Image: "Image", Video: "PlayCircle" })[type] || "FileText";
}

function typeStyle(type) {
  return ({ PDF: "bg-rose-50 text-rose-600", Archive: "bg-violet-50 text-violet-600", Document: "bg-blue-50 text-blue-600", Image: "bg-emerald-50 text-emerald-600", Video: "bg-orange-50 text-[#ff723a]" })[type] || "bg-slate-100 text-slate-600";
}

function fileName(url) {
  try { return decodeURIComponent(new URL(url).pathname.split("/").pop()); } catch { return ""; }
}

function readHistory() {
  try { return JSON.parse(localStorage.getItem("edupath-download-history") || "{}"); } catch { return {}; }
}

function formatDate(value) {
  return new Date(value).toLocaleString([], { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}
