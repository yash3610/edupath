import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Icon, MotionCard, SectionHeading } from "../../components/dashboard/DashboardPrimitives.jsx";
import { useToast } from "../../context/ToastContext.jsx";
import { apiRequest } from "../../services/api.js";

export default function InstructorCourseBuilderPage() {
  const toast = useToast();
  const [searchParams] = useSearchParams();
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
        setCourseId(searchParams.get("course") || data[0]?._id || "");
      })
      .catch((error) => toast.error(error.message))
      .finally(() => setLoading(false));
  }, [searchParams, toast]);

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

  async function moveModule(index, offset) {
    const next = [...modules];
    const target = index + offset;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    setModules(next);
    try {
      await apiRequest(`/api/instructor/courses/${courseId}/modules/reorder`, { method: "PATCH", body: JSON.stringify({ order: next.map((item) => item._id) }) });
    } catch (error) { toast.error(error.message); await loadModules(); }
  }

  async function addLecture(event, moduleId) {
    event.preventDefault();
    const draft = lectureDrafts[moduleId] || {};
    try {
      await apiRequest(`/api/instructor/modules/${moduleId}/lectures`, { method: "POST", body: JSON.stringify({
        title: draft.title,
        description: draft.description,
        type: draft.type || "video",
        videoUrl: draft.videoUrl,
        durationSeconds: Number(draft.durationSeconds || 0),
        estimatedDurationMinutes: Number(draft.estimatedDurationMinutes || 0),
        isPreview: Boolean(draft.isPreview),
        isLocked: Boolean(draft.isLocked),
        published: draft.published !== false,
        dripEnabled: Boolean(draft.dripEnabled),
        unlockType: draft.unlockType || "immediate",
        daysAfterEnrollment: Number(draft.daysAfterEnrollment || 0),
        unlockAt: draft.unlockAt || undefined,
        notesPdfUrl: draft.notesPdfUrl,
        resources: draft.resourceUrl ? [{ title: draft.resourceTitle || "Lecture resource", url: draft.resourceUrl, type: "resource" }] : [],
        order: (lectures[moduleId]?.length || 0) + 1,
      }) });
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

  async function editLecture(lecture) {
    const title = window.prompt("Lecture title", lecture.title);
    if (!title) return;
    const description = window.prompt("Lecture description", lecture.description || "") ?? lecture.description;
    try {
      await apiRequest(`/api/instructor/lectures/${lecture._id}`, { method: "PATCH", body: JSON.stringify({ title, description }) });
      await loadModules();
      toast.success("Lecture updated.");
    } catch (error) { toast.error(error.message); }
  }

  async function duplicateLecture(lectureId) {
    try {
      await apiRequest(`/api/instructor/lectures/${lectureId}/duplicate`, { method: "POST" });
      await loadModules();
      toast.success("Lecture duplicated.");
    } catch (error) { toast.error(error.message); }
  }

  async function moveLecture(moduleId, index, offset) {
    const next = [...(lectures[moduleId] || [])];
    const target = index + offset;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    setLectures((current) => ({ ...current, [moduleId]: next }));
    try {
      await apiRequest(`/api/instructor/modules/${moduleId}/lectures/reorder`, { method: "PATCH", body: JSON.stringify({ order: next.map((item) => item._id) }) });
    } catch (error) { toast.error(error.message); await loadModules(); }
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
            <div className="flex flex-wrap gap-2"><button onClick={() => moveModule(index, -1)} disabled={index === 0} className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-extrabold disabled:opacity-30 dark:bg-white/10">Up</button><button onClick={() => moveModule(index, 1)} disabled={index === modules.length - 1} className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-extrabold disabled:opacity-30 dark:bg-white/10">Down</button><button onClick={() => renameModule(module)} className="rounded-lg bg-amber-50 px-3 py-2 text-xs font-extrabold text-amber-700">Rename</button><button onClick={() => deleteModule(module._id)} className="rounded-lg bg-rose-50 px-3 py-2 text-xs font-extrabold text-rose-700">Delete</button></div>
          </div>
          <div className="mt-5 space-y-2">
            {(lectures[module._id] || []).map((lecture, lectureIndex) => <div key={lecture._id} className="flex flex-col gap-3 rounded-xl bg-slate-50 p-3 dark:bg-white/5 sm:flex-row sm:items-center"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#fff1e8] text-[#ff723a]"><Icon name={lecture.type === "video" ? "PlayCircle" : "FileText"} className="h-4 w-4" /></span><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><p className="truncate text-sm font-extrabold">{lectureIndex + 1}. {lecture.title}</p><span className="rounded-full bg-white px-2 py-0.5 text-[9px] font-extrabold uppercase text-slate-500 dark:bg-white/10">{lecture.type || "video"}</span>{lecture.isPreview && <span className="text-[10px] font-extrabold text-emerald-600">Preview</span>}{lecture.isLocked && <span className="text-[10px] font-extrabold text-amber-600">Locked</span>}{lecture.dripEnabled && <span className="text-[10px] font-extrabold text-violet-600">Drip</span>}</div><p className="truncate text-xs text-slate-400">{lecture.description || lecture.videoUrl || "Lesson content"}</p></div><div className="flex flex-wrap gap-2"><button onClick={() => moveLecture(module._id, lectureIndex, -1)} disabled={lectureIndex === 0} className="text-xs font-extrabold disabled:opacity-30">Up</button><button onClick={() => moveLecture(module._id, lectureIndex, 1)} disabled={lectureIndex === (lectures[module._id]?.length || 0) - 1} className="text-xs font-extrabold disabled:opacity-30">Down</button><button onClick={() => editLecture(lecture)} className="text-xs font-extrabold text-amber-700">Edit</button><button onClick={() => duplicateLecture(lecture._id)} className="text-xs font-extrabold text-[#ff723a]">Duplicate</button><button onClick={() => deleteLecture(lecture._id)} className="text-xs font-extrabold text-rose-600">Delete</button></div></div>)}
          </div>
          <form onSubmit={(event) => addLecture(event, module._id)} className="mt-4 grid gap-3 border-t border-slate-100 pt-4 dark:border-white/10 md:grid-cols-2 xl:grid-cols-4">
            <input required value={lectureDrafts[module._id]?.title || ""} onChange={(event) => setLectureDrafts((current) => ({ ...current, [module._id]: { ...current[module._id], title: event.target.value } }))} placeholder="Lecture title" className="rounded-xl border border-slate-200 px-3 py-2.5 dark:border-white/10 dark:bg-slate-900" />
            <select value={lectureDrafts[module._id]?.type || "video"} onChange={(event) => setLectureDrafts((current) => ({ ...current, [module._id]: { ...current[module._id], type: event.target.value } }))} className="rounded-xl border border-slate-200 px-3 py-2.5 dark:border-white/10 dark:bg-slate-900">{["video", "pdf", "article", "resource", "assignment", "quiz", "live"].map((type) => <option key={type}>{type}</option>)}</select>
            <input value={lectureDrafts[module._id]?.videoUrl || ""} onChange={(event) => setLectureDrafts((current) => ({ ...current, [module._id]: { ...current[module._id], videoUrl: event.target.value } }))} placeholder="Video URL" className="rounded-xl border border-slate-200 px-3 py-2.5 dark:border-white/10 dark:bg-slate-900" />
            <input type="number" value={lectureDrafts[module._id]?.durationSeconds || ""} onChange={(event) => setLectureDrafts((current) => ({ ...current, [module._id]: { ...current[module._id], durationSeconds: event.target.value } }))} placeholder="Seconds" className="rounded-xl border border-slate-200 px-3 py-2.5 dark:border-white/10 dark:bg-slate-900" />
            <input value={lectureDrafts[module._id]?.description || ""} onChange={(event) => setLectureDrafts((current) => ({ ...current, [module._id]: { ...current[module._id], description: event.target.value } }))} placeholder="Description" className="rounded-xl border border-slate-200 px-3 py-2.5 dark:border-white/10 dark:bg-slate-900" />
            <input value={lectureDrafts[module._id]?.notesPdfUrl || ""} onChange={(event) => setLectureDrafts((current) => ({ ...current, [module._id]: { ...current[module._id], notesPdfUrl: event.target.value } }))} placeholder="Notes PDF URL" className="rounded-xl border border-slate-200 px-3 py-2.5 dark:border-white/10 dark:bg-slate-900" />
            <input value={lectureDrafts[module._id]?.resourceUrl || ""} onChange={(event) => setLectureDrafts((current) => ({ ...current, [module._id]: { ...current[module._id], resourceUrl: event.target.value } }))} placeholder="Resource URL" className="rounded-xl border border-slate-200 px-3 py-2.5 dark:border-white/10 dark:bg-slate-900" />
            <select value={lectureDrafts[module._id]?.unlockType || "immediate"} onChange={(event) => setLectureDrafts((current) => ({ ...current, [module._id]: { ...current[module._id], unlockType: event.target.value, dripEnabled: event.target.value !== "immediate" } }))} className="rounded-xl border border-slate-200 px-3 py-2.5 dark:border-white/10 dark:bg-slate-900"><option value="immediate">Unlock immediately</option><option value="days">Unlock after days</option><option value="date">Specific date</option></select>
            {lectureDrafts[module._id]?.unlockType === "days" && <input type="number" value={lectureDrafts[module._id]?.daysAfterEnrollment || ""} onChange={(event) => setLectureDrafts((current) => ({ ...current, [module._id]: { ...current[module._id], daysAfterEnrollment: event.target.value } }))} placeholder="Days after enrollment" className="rounded-xl border border-slate-200 px-3 py-2.5 dark:border-white/10 dark:bg-slate-900" />}
            {lectureDrafts[module._id]?.unlockType === "date" && <input type="datetime-local" value={lectureDrafts[module._id]?.unlockAt || ""} onChange={(event) => setLectureDrafts((current) => ({ ...current, [module._id]: { ...current[module._id], unlockAt: event.target.value } }))} className="rounded-xl border border-slate-200 px-3 py-2.5 dark:border-white/10 dark:bg-slate-900" />}
            <div className="flex flex-wrap items-center gap-4 rounded-xl bg-slate-50 px-3 py-2 text-xs font-bold dark:bg-white/5"><label><input type="checkbox" checked={Boolean(lectureDrafts[module._id]?.isPreview)} onChange={(event) => setLectureDrafts((current) => ({ ...current, [module._id]: { ...current[module._id], isPreview: event.target.checked } }))} /> Preview</label><label><input type="checkbox" checked={Boolean(lectureDrafts[module._id]?.isLocked)} onChange={(event) => setLectureDrafts((current) => ({ ...current, [module._id]: { ...current[module._id], isLocked: event.target.checked } }))} /> Locked</label></div>
            <button className="rounded-xl bg-[#1f1c35] px-4 py-2.5 text-sm font-extrabold text-white xl:col-span-4">Add lecture</button>
          </form>
        </MotionCard>
      ))}
    </div>
  );
}
