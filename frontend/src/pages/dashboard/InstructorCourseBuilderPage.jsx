import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Icon, MotionCard, SectionHeading } from "../../components/dashboard/DashboardPrimitives.jsx";
import { useToast } from "../../context/ToastContext.jsx";
import { apiRequest } from "../../services/api.js";

export default function InstructorCourseBuilderPage({ view = "builder" }) {
  const toast = useToast();
  const [searchParams] = useSearchParams();
  const [courses, setCourses] = useState([]);
  const [courseId, setCourseId] = useState("");
  const [modules, setModules] = useState([]);
  const [lectures, setLectures] = useState({});
  const [moduleTitle, setModuleTitle] = useState("");
  const [lectureDrafts, setLectureDrafts] = useState({});
  const [loading, setLoading] = useState(true);
  const [courseDetails, setCourseDetails] = useState(null);
  const [courseForm, setCourseForm] = useState({});
  const [completion, setCompletion] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [savingCourse, setSavingCourse] = useState(false);
  const [editingLectures, setEditingLectures] = useState({});

  const isModulesView = view === "modules";

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
      setCourseDetails(null);
      setCompletion(null);
      return;
    }
    loadModules();
  }, [courseId]);

  async function loadModules() {
    try {
      const [detailsResult, result] = await Promise.all([
        apiRequest(`/api/instructor/courses/${courseId}`),
        apiRequest(`/api/instructor/courses/${courseId}/modules`),
      ]);
      const course = detailsResult.data?.course || null;
      setCourseDetails(course);
      setCourseForm(course ? {
        title: course.title || "",
        subtitle: course.subtitle || "",
        category: course.category || "",
        level: course.level || "beginner",
        thumbnail: course.thumbnail || "",
        promoVideoUrl: course.promoVideoUrl || "",
        description: course.description || "",
        pricingType: course.pricingType || "paid",
        price: course.price || 0,
        discountPrice: course.discountPrice || 0,
      } : {});
      setCompletion(detailsResult.data?.completion || null);
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

  async function saveCourseDetails(event) {
    event.preventDefault();
    try {
      setSavingCourse(true);
      await apiRequest(`/api/instructor/courses/${courseId}`, {
        method: "PATCH",
        body: JSON.stringify({
          ...courseForm,
          price: Number(courseForm.price || 0),
          discountPrice: Number(courseForm.discountPrice || 0),
        }),
      });
      toast.success("Course details saved.");
      await loadModules();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSavingCourse(false);
    }
  }

  async function submitForReview() {
    try {
      setSubmitting(true);
      await apiRequest(`/api/instructor/courses/${courseId}/submit-review`, { method: "PATCH", body: JSON.stringify({}) });
      toast.success("Course submitted for admin review.");
      await loadModules();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSubmitting(false);
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
    try {
      const draft = editingLectures[lecture._id] || lecture;
      await apiRequest(`/api/instructor/lectures/${lecture._id}`, {
        method: "PATCH",
        body: JSON.stringify({
          title: draft.title,
          description: draft.description,
          type: draft.type || "video",
          videoUrl: draft.videoUrl,
          durationSeconds: Number(draft.durationSeconds || 0),
          estimatedDurationMinutes: Number(draft.estimatedDurationMinutes || 0),
          notesPdfUrl: draft.notesPdfUrl,
          isPreview: Boolean(draft.isPreview),
          isLocked: Boolean(draft.isLocked),
          published: draft.published !== false,
        }),
      });
      setEditingLectures((current) => {
        const next = { ...current };
        delete next[lecture._id];
        return next;
      });
      await loadModules();
      toast.success("Lecture updated.");
    } catch (error) { toast.error(error.message); }
  }

  function startEditLecture(lecture) {
    setEditingLectures((current) => ({
      ...current,
      [lecture._id]: {
        title: lecture.title || "",
        description: lecture.description || "",
        type: lecture.type || "video",
        videoUrl: lecture.videoUrl || "",
        durationSeconds: lecture.durationSeconds || "",
        estimatedDurationMinutes: lecture.estimatedDurationMinutes || "",
        notesPdfUrl: lecture.notesPdfUrl || "",
        isPreview: Boolean(lecture.isPreview),
        isLocked: Boolean(lecture.isLocked),
        published: lecture.published !== false,
      },
    }));
  }

  function updateEditingLecture(lectureId, patch) {
    setEditingLectures((current) => ({
      ...current,
      [lectureId]: { ...current[lectureId], ...patch },
    }));
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
        <p className="text-[11px] font-extrabold uppercase tracking-[.18em] text-[#ff723a]">{isModulesView ? "Curriculum" : "Course Builder"}</p>
        <h2 className="mt-1 text-3xl font-extrabold tracking-[-.03em]">{isModulesView ? "Modules & lectures" : "Build course content"}</h2>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-300">
          {isModulesView ? "Manage modules, lessons, resources, preview flags, and lecture order from live database data." : "Set up course details, curriculum, and review submission in one place."}
        </p>
      </section>

      <MotionCard className="p-4">
        <label className="text-sm font-extrabold">Select course
          <select value={courseId} onChange={(event) => setCourseId(event.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 dark:border-white/10 dark:bg-slate-900">
            {!courses.length && <option value="">No courses available</option>}
            {courses.map((course) => <option key={course._id} value={course._id}>{course.title}</option>)}
          </select>
        </label>
      </MotionCard>

      {courseDetails && (
        <MotionCard className="p-5 sm:p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-[#fff1e8] px-3 py-1 text-[10px] font-extrabold uppercase text-[#ff723a]">{statusLabel(courseDetails.status)}</span>
                <span className="text-sm font-extrabold">{completion?.percentage || 0}% complete</span>
              </div>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10"><div className="h-full rounded-full bg-[#ff723a]" style={{ width: `${completion?.percentage || 0}%` }} /></div>
              {courseDetails.reviewFeedback && <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm font-bold text-amber-800">Admin feedback: {courseDetails.reviewFeedback}</div>}
              <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {Object.entries(completion?.checks || {}).map(([key, done]) => (
                  <div key={key} className={`flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-extrabold ${done ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500 dark:bg-white/5"}`}>
                    <Icon name={done ? "CheckCircle2" : "Circle"} className="h-4 w-4" /> {checkLabel(key)}
                  </div>
                ))}
              </div>
            </div>
            <button
              type="button"
              onClick={submitForReview}
              disabled={submitting || !["assigned", "content_in_progress", "changes_requested"].includes(courseDetails.status)}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#ff723a] px-5 py-3 text-sm font-extrabold text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Icon name="Send" className="h-4 w-4" /> {submitting ? "Submitting..." : "Submit for review"}
            </button>
          </div>
        </MotionCard>
      )}

      {courseDetails && !isModulesView && (
        <MotionCard className="p-5 sm:p-6">
          <SectionHeading eyebrow="Course Setup" title="Basics and publishing details" />
          <form onSubmit={saveCourseDetails} className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <input required value={courseForm.title || ""} onChange={(event) => setCourseForm((current) => ({ ...current, title: event.target.value }))} placeholder="Course title" className="rounded-xl border border-slate-200 px-3 py-2.5 dark:border-white/10 dark:bg-slate-900" />
            <input value={courseForm.subtitle || ""} onChange={(event) => setCourseForm((current) => ({ ...current, subtitle: event.target.value }))} placeholder="Subtitle" className="rounded-xl border border-slate-200 px-3 py-2.5 dark:border-white/10 dark:bg-slate-900" />
            <input required value={courseForm.category || ""} onChange={(event) => setCourseForm((current) => ({ ...current, category: event.target.value }))} placeholder="Category" className="rounded-xl border border-slate-200 px-3 py-2.5 dark:border-white/10 dark:bg-slate-900" />
            <select value={courseForm.level || "beginner"} onChange={(event) => setCourseForm((current) => ({ ...current, level: event.target.value }))} className="rounded-xl border border-slate-200 px-3 py-2.5 dark:border-white/10 dark:bg-slate-900">
              {["beginner", "intermediate", "advanced"].map((level) => <option key={level} value={level}>{level}</option>)}
            </select>
            <input value={courseForm.thumbnail || ""} onChange={(event) => setCourseForm((current) => ({ ...current, thumbnail: event.target.value }))} placeholder="Thumbnail URL" className="rounded-xl border border-slate-200 px-3 py-2.5 dark:border-white/10 dark:bg-slate-900 xl:col-span-2" />
            <input value={courseForm.promoVideoUrl || ""} onChange={(event) => setCourseForm((current) => ({ ...current, promoVideoUrl: event.target.value }))} placeholder="Promo video URL" className="rounded-xl border border-slate-200 px-3 py-2.5 dark:border-white/10 dark:bg-slate-900 xl:col-span-2" />
            <select value={courseForm.pricingType || "paid"} onChange={(event) => setCourseForm((current) => ({ ...current, pricingType: event.target.value }))} className="rounded-xl border border-slate-200 px-3 py-2.5 dark:border-white/10 dark:bg-slate-900">
              <option value="paid">paid</option>
              <option value="free">free</option>
            </select>
            <input type="number" value={courseForm.price || ""} onChange={(event) => setCourseForm((current) => ({ ...current, price: event.target.value }))} placeholder="Price" disabled={courseForm.pricingType === "free"} className="rounded-xl border border-slate-200 px-3 py-2.5 disabled:bg-slate-100 dark:border-white/10 dark:bg-slate-900" />
            <input type="number" value={courseForm.discountPrice || ""} onChange={(event) => setCourseForm((current) => ({ ...current, discountPrice: event.target.value }))} placeholder="Discount price" disabled={courseForm.pricingType === "free"} className="rounded-xl border border-slate-200 px-3 py-2.5 disabled:bg-slate-100 dark:border-white/10 dark:bg-slate-900" />
            <button disabled={savingCourse || !["assigned", "content_in_progress", "changes_requested"].includes(courseDetails.status)} className="rounded-xl bg-[#1f1c35] px-4 py-2.5 text-sm font-extrabold text-white disabled:opacity-40">Save details</button>
            <textarea required value={courseForm.description || ""} onChange={(event) => setCourseForm((current) => ({ ...current, description: event.target.value }))} placeholder="Course description" rows={4} className="rounded-xl border border-slate-200 px-3 py-2.5 dark:border-white/10 dark:bg-slate-900 md:col-span-2 xl:col-span-4" />
          </form>
        </MotionCard>
      )}

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
            {(lectures[module._id] || []).map((lecture, lectureIndex) => {
              const draft = editingLectures[lecture._id];
              return (
                <div key={lecture._id} className="rounded-xl bg-slate-50 p-3 dark:bg-white/5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#fff1e8] text-[#ff723a]"><Icon name={lecture.type === "video" ? "PlayCircle" : "FileText"} className="h-4 w-4" /></span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate text-sm font-extrabold">{lectureIndex + 1}. {lecture.title}</p>
                        <span className="rounded-full bg-white px-2 py-0.5 text-[9px] font-extrabold uppercase text-slate-500 dark:bg-white/10">{lecture.type || "video"}</span>
                        {lecture.isPreview && <span className="text-[10px] font-extrabold text-emerald-600">Preview</span>}
                        {lecture.isLocked && <span className="text-[10px] font-extrabold text-amber-600">Locked</span>}
                        {lecture.dripEnabled && <span className="text-[10px] font-extrabold text-violet-600">Drip</span>}
                      </div>
                      <p className="truncate text-xs text-slate-400">{lecture.description || lecture.videoUrl || "Lesson content"}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button type="button" onClick={() => moveLecture(module._id, lectureIndex, -1)} disabled={lectureIndex === 0} className="text-xs font-extrabold disabled:opacity-30">Up</button>
                      <button type="button" onClick={() => moveLecture(module._id, lectureIndex, 1)} disabled={lectureIndex === (lectures[module._id]?.length || 0) - 1} className="text-xs font-extrabold disabled:opacity-30">Down</button>
                      <button type="button" onClick={() => draft ? editLecture(lecture) : startEditLecture(lecture)} className="text-xs font-extrabold text-amber-700">{draft ? "Save" : "Edit"}</button>
                      {draft && <button type="button" onClick={() => setEditingLectures((current) => { const next = { ...current }; delete next[lecture._id]; return next; })} className="text-xs font-extrabold">Cancel</button>}
                      <button type="button" onClick={() => duplicateLecture(lecture._id)} className="text-xs font-extrabold text-[#ff723a]">Duplicate</button>
                      <button type="button" onClick={() => deleteLecture(lecture._id)} className="text-xs font-extrabold text-rose-600">Delete</button>
                    </div>
                  </div>
                  {draft && (
                    <div className="mt-3 grid gap-2 border-t border-slate-200 pt-3 dark:border-white/10 md:grid-cols-2 xl:grid-cols-4">
                      <input value={draft.title} onChange={(event) => updateEditingLecture(lecture._id, { title: event.target.value })} className="rounded-xl border border-slate-200 px-3 py-2.5 dark:border-white/10 dark:bg-slate-900" placeholder="Lecture title" />
                      <select value={draft.type} onChange={(event) => updateEditingLecture(lecture._id, { type: event.target.value })} className="rounded-xl border border-slate-200 px-3 py-2.5 dark:border-white/10 dark:bg-slate-900">{["video", "pdf", "article", "resource", "assignment", "quiz", "live"].map((type) => <option key={type}>{type}</option>)}</select>
                      <input type="number" value={draft.durationSeconds} onChange={(event) => updateEditingLecture(lecture._id, { durationSeconds: event.target.value })} className="rounded-xl border border-slate-200 px-3 py-2.5 dark:border-white/10 dark:bg-slate-900" placeholder="Duration seconds" />
                      <input value={draft.videoUrl} onChange={(event) => updateEditingLecture(lecture._id, { videoUrl: event.target.value })} className="rounded-xl border border-slate-200 px-3 py-2.5 dark:border-white/10 dark:bg-slate-900" placeholder="Content URL" />
                      <input value={draft.notesPdfUrl} onChange={(event) => updateEditingLecture(lecture._id, { notesPdfUrl: event.target.value })} className="rounded-xl border border-slate-200 px-3 py-2.5 dark:border-white/10 dark:bg-slate-900" placeholder="Notes PDF URL" />
                      <textarea value={draft.description} onChange={(event) => updateEditingLecture(lecture._id, { description: event.target.value })} rows={2} className="rounded-xl border border-slate-200 px-3 py-2.5 dark:border-white/10 dark:bg-slate-900 xl:col-span-2" placeholder="Description" />
                      <label className="flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-xs font-bold dark:bg-white/10"><input type="checkbox" checked={draft.isPreview} onChange={(event) => updateEditingLecture(lecture._id, { isPreview: event.target.checked })} /> Preview</label>
                      <label className="flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-xs font-bold dark:bg-white/10"><input type="checkbox" checked={draft.isLocked} onChange={(event) => updateEditingLecture(lecture._id, { isLocked: event.target.checked })} /> Locked</label>
                      <label className="flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-xs font-bold dark:bg-white/10"><input type="checkbox" checked={draft.published} onChange={(event) => updateEditingLecture(lecture._id, { published: event.target.checked })} /> Published</label>
                    </div>
                  )}
                </div>
              );
            })}
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

function statusLabel(value) {
  return String(value || "assigned").split("_").map((part) => part[0].toUpperCase() + part.slice(1)).join(" ");
}

function checkLabel(value) {
  return ({ basicInfo: "Basic Info", thumbnail: "Thumbnail", promoVideo: "Promo Video", modules: "Modules", lectures: "Lectures", resources: "Resources", quiz: "Quiz", assignment: "Assignment", certificateRules: "Certificate Rules" })[value] || value;
}
