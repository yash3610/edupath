import React, { useEffect, useState } from "react";
import { Icon, MotionCard, SectionHeading } from "../../components/dashboard/DashboardPrimitives.jsx";
import { useToast } from "../../context/ToastContext.jsx";
import { apiRequest } from "../../services/api.js";

export default function InstructorCourseBuilderPage() {
  const toast = useToast();
  const [courses, setCourses] = useState([]);
  const [courseId, setCourseId] = useState("");
  const [modules, setModules] = useState([]);
  const [lectures, setLectures] = useState({});
  const [moduleTitle, setModuleTitle] = useState("");
  const [lectureDrafts, setLectureDrafts] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiRequest("/api/instructor/my-courses")
      .then((result) => {
        const data = result.data || [];
        setCourses(data);
        setCourseId(data[0]?._id || "");
      })
      .catch((error) => toast.error(error.message))
      .finally(() => setLoading(false));
  }, [toast]);

  useEffect(() => {
    if (!courseId) {
      setModules([]);
      return;
    }
    loadModules();
  }, [courseId]);

  async function loadModules() {
    try {
      const result = await apiRequest(`/api/instructor/courses/${courseId}/modules`);
      const nextModules = result.data || [];
      setModules(nextModules);
      const lectureEntries = await Promise.all(nextModules.map(async (module) => {
        const lectureResult = await apiRequest(`/api/instructor/modules/${module._id}/lectures`);
        return [module._id, lectureResult.data || []];
      }));
      setLectures(Object.fromEntries(lectureEntries));
    } catch (error) {
      toast.error(error.message);
    }
  }

  async function addModule(event) {
    event.preventDefault();
    try {
      await apiRequest(`/api/instructor/courses/${courseId}/modules`, { method: "POST", body: JSON.stringify({ title: moduleTitle, order: modules.length + 1 }) });
      setModuleTitle("");
      await loadModules();
      toast.success("Module created.");
    } catch (error) {
      toast.error(error.message);
    }
  }

  async function renameModule(module) {
    const title = window.prompt("Module title", module.title);
    if (!title || title === module.title) return;
    try {
      await apiRequest(`/api/instructor/modules/${module._id}`, { method: "PATCH", body: JSON.stringify({ title }) });
      await loadModules();
    } catch (error) {
      toast.error(error.message);
    }
  }

  async function deleteModule(moduleId) {
    try {
      await apiRequest(`/api/instructor/modules/${moduleId}`, { method: "DELETE" });
      await loadModules();
      toast.success("Module deleted.");
    } catch (error) {
      toast.error(error.message);
    }
  }

  async function addLecture(event, moduleId) {
    event.preventDefault();
    const draft = lectureDrafts[moduleId] || {};
    try {
      await apiRequest(`/api/instructor/modules/${moduleId}/lectures`, { method: "POST", body: JSON.stringify({ title: draft.title, videoUrl: draft.videoUrl, durationSeconds: Number(draft.durationSeconds || 0), order: (lectures[moduleId]?.length || 0) + 1 }) });
      setLectureDrafts((current) => ({ ...current, [moduleId]: {} }));
      await loadModules();
      toast.success("Lecture added.");
    } catch (error) {
      toast.error(error.message);
    }
  }

  async function deleteLecture(lectureId) {
    try {
      await apiRequest(`/api/instructor/lectures/${lectureId}`, { method: "DELETE" });
      await loadModules();
    } catch (error) {
      toast.error(error.message);
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[26px] border border-[#f1e7db] bg-[#fff8ef] p-6 dark:border-white/10 dark:bg-[#1f1c35] sm:p-8">
        <p className="text-[11px] font-extrabold uppercase tracking-[.18em] text-[#ff723a]">Course Builder</p>
        <h2 className="mt-1 text-3xl font-extrabold tracking-[-.03em]">Modules and lectures</h2>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-300">Build your real course curriculum directly in the database.</p>
      </section>

      <MotionCard className="p-4">
        <label className="text-sm font-extrabold">Select course
          <select value={courseId} onChange={(event) => setCourseId(event.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 dark:border-white/10 dark:bg-slate-900">
            {!courses.length && <option value="">No courses available</option>}
            {courses.map((course) => <option key={course._id} value={course._id}>{course.title}</option>)}
          </select>
        </label>
      </MotionCard>

      {courseId && <MotionCard>
        <SectionHeading eyebrow="Curriculum" title={`${modules.length} modules`} />
        <form onSubmit={addModule} className="flex flex-col gap-3 sm:flex-row">
          <input required value={moduleTitle} onChange={(event) => setModuleTitle(event.target.value)} placeholder="New module title" className="flex-1 rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-[#ff723a] dark:border-white/10 dark:bg-slate-900" />
          <button className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#ff723a] px-5 py-3 text-sm font-extrabold text-white"><Icon name="Plus" className="h-4 w-4" /> Add module</button>
        </form>
      </MotionCard>}

      {loading ? <p className="text-sm font-bold text-slate-400">Loading courses...</p> : modules.map((module, index) => (
        <MotionCard key={module._id} className="p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div><p className="text-[10px] font-extrabold uppercase tracking-widest text-[#ff723a]">Module {index + 1}</p><h3 className="mt-1 text-xl font-extrabold">{module.title}</h3></div>
            <div className="flex gap-2"><button onClick={() => renameModule(module)} className="rounded-lg bg-amber-50 px-3 py-2 text-xs font-extrabold text-amber-700">Rename</button><button onClick={() => deleteModule(module._id)} className="rounded-lg bg-rose-50 px-3 py-2 text-xs font-extrabold text-rose-700">Delete</button></div>
          </div>
          <div className="mt-5 space-y-2">
            {(lectures[module._id] || []).map((lecture, lectureIndex) => <div key={lecture._id} className="flex items-center gap-3 rounded-xl bg-slate-50 p-3 dark:bg-white/5"><span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#fff1e8] text-[#ff723a]"><Icon name="PlayCircle" className="h-4 w-4" /></span><div className="min-w-0 flex-1"><p className="truncate text-sm font-extrabold">{lectureIndex + 1}. {lecture.title}</p><p className="truncate text-xs text-slate-400">{lecture.videoUrl || "No video URL"}</p></div><button onClick={() => deleteLecture(lecture._id)} className="text-xs font-extrabold text-rose-600">Delete</button></div>)}
          </div>
          <form onSubmit={(event) => addLecture(event, module._id)} className="mt-4 grid gap-3 border-t border-slate-100 pt-4 dark:border-white/10 md:grid-cols-[1fr_1fr_140px_auto]">
            <input required value={lectureDrafts[module._id]?.title || ""} onChange={(event) => setLectureDrafts((current) => ({ ...current, [module._id]: { ...current[module._id], title: event.target.value } }))} placeholder="Lecture title" className="rounded-xl border border-slate-200 px-3 py-2.5 dark:border-white/10 dark:bg-slate-900" />
            <input value={lectureDrafts[module._id]?.videoUrl || ""} onChange={(event) => setLectureDrafts((current) => ({ ...current, [module._id]: { ...current[module._id], videoUrl: event.target.value } }))} placeholder="Video URL" className="rounded-xl border border-slate-200 px-3 py-2.5 dark:border-white/10 dark:bg-slate-900" />
            <input type="number" value={lectureDrafts[module._id]?.durationSeconds || ""} onChange={(event) => setLectureDrafts((current) => ({ ...current, [module._id]: { ...current[module._id], durationSeconds: event.target.value } }))} placeholder="Seconds" className="rounded-xl border border-slate-200 px-3 py-2.5 dark:border-white/10 dark:bg-slate-900" />
            <button className="rounded-xl bg-[#1f1c35] px-4 py-2.5 text-sm font-extrabold text-white">Add lecture</button>
          </form>
        </MotionCard>
      ))}
    </div>
  );
}
