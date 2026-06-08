import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Download, FileText, PlayCircle } from "lucide-react";
import { Icon, MotionCard, ProgressBar, SectionHeading } from "../../components/dashboard/DashboardPrimitives.jsx";
import { useToast } from "../../context/ToastContext.jsx";
import { learningApi } from "../../services/learningApi.js";

export default function LearningRoomPage() {
  const toast = useToast();
  const { courseId, lectureId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [selectedLectureId, setSelectedLectureId] = useState(lectureId || "");
  const [completed, setCompleted] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      const firstEnrollment = courseId ? null : await learningApi.getContinueLearning();
      const activeCourseId = courseId || firstEnrollment?.course?._id || firstEnrollment?.course?.id || firstEnrollment?.course;
      const [courseData, moduleData, progressData] = await Promise.all([
        learningApi.getCourse(activeCourseId),
        learningApi.getCourseModules(activeCourseId),
        learningApi.getProgress(activeCourseId),
      ]);
      if (!mounted) return;
      const normalizedModules = normalizeModules(moduleData, progressData);
      const firstLecture = normalizedModules.flatMap((module) => module.lectures)[0];
      setCourse(courseData?.course || courseData);
      setModules(normalizedModules);
      setCompleted(new Set(progressData.filter((item) => item.completed).map((item) => String(item.lecture?._id || item.lecture))));
      setSelectedLectureId(lectureId || firstLecture?._id || "");
      setLoading(false);
    }
    load();
    return () => { mounted = false; };
  }, [courseId, lectureId]);

  const lectures = useMemo(() => modules.flatMap((module) => module.lectures.map((lecture) => ({ ...lecture, moduleTitle: module.title }))), [modules]);
  const currentIndex = lectures.findIndex((lecture) => String(lecture._id) === String(selectedLectureId));
  const currentLecture = lectures[currentIndex] || lectures[0];
  const progress = lectures.length ? Math.round((completed.size / lectures.length) * 100) : 0;

  function selectLecture(id) {
    setSelectedLectureId(id);
    if (course?._id || course?.id) navigate(`/dashboard/learn/${course._id || course.id}/${id}`, { replace: true });
  }

  async function markComplete() {
    if (!currentLecture) return;
    setSaving(true);
    try {
      await learningApi.completeLecture(currentLecture._id);
      setCompleted((prev) => new Set([...prev, String(currentLecture._id)]));
      toast.success("Lecture progress saved.", "Lecture completed");
    } catch (error) {
      toast.error(error.message, "Progress failed");
    } finally {
      setSaving(false);
    }
  }

  function go(offset) {
    const next = lectures[currentIndex + offset];
    if (next) selectLecture(next._id);
  }

  if (loading) {
    return <div className="grid gap-5 xl:grid-cols-[280px_1fr_280px]"><div className="h-[600px] animate-pulse rounded-[28px] bg-slate-200 dark:bg-white/10" /><div className="h-[600px] animate-pulse rounded-[28px] bg-slate-200 dark:bg-white/10" /><div className="h-[360px] animate-pulse rounded-[28px] bg-slate-200 dark:bg-white/10" /></div>;
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[300px_1fr_300px]">
      <MotionCard className="p-5 xl:sticky xl:top-24 xl:max-h-[calc(100vh-7rem)] xl:overflow-y-auto">
        <SectionHeading eyebrow="Content" title="Modules" />
        <div className="space-y-4">
          {modules.map((module) => (
            <div key={module._id || module.title}>
              <h4 className="mb-2 text-sm font-black">{module.title}</h4>
              <div className="space-y-2">
                {module.lectures.map((lecture) => {
                  const done = completed.has(String(lecture._id)) || lecture.completed;
                  const active = String(currentLecture?._id) === String(lecture._id);
                  return (
                    <button key={lecture._id} onClick={() => selectLecture(lecture._id)} className={`flex w-full items-center gap-3 rounded-xl p-3 text-left text-sm transition ${active ? "bg-[#ff6b35] text-white shadow-lg shadow-orange-500/20" : "bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/15"}`}>
                      <Icon name={done ? "CheckCircle2" : "PlayCircle"} className={`h-4 w-4 shrink-0 ${active ? "text-white" : done ? "text-emerald-500" : "text-slate-400"}`} />
                      <span className="min-w-0 flex-1 truncate font-bold">{lecture.title}</span>
                      <span className={`shrink-0 text-xs ${active ? "text-white/80" : "text-slate-500"}`}>{formatDuration(lecture.duration || lecture.durationSeconds)}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </MotionCard>

      <div className="space-y-5">
        <MotionCard className="overflow-hidden bg-slate-950 p-0">
          <div className="relative flex aspect-video items-center justify-center bg-gradient-to-br from-slate-950 via-[#181438] to-[#ff6b35] text-white">
            {currentLecture?.videoUrl ? <video src={currentLecture.videoUrl} controls className="h-full w-full" /> : (
              <>
                <button className="flex h-16 w-16 items-center justify-center rounded-full bg-white/15 backdrop-blur">
                  <Icon name="Play" className="h-8 w-8 fill-white" />
                </button>
                <div className="absolute bottom-5 left-5 right-5">
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-orange-200">{currentLecture?.moduleTitle}</p>
                  <h2 className="mt-1 text-2xl font-black">{currentLecture?.title}</h2>
                </div>
              </>
            )}
          </div>
        </MotionCard>

        <MotionCard>
          <SectionHeading eyebrow="Current Lecture" title={currentLecture?.title || "Select a lecture"} />
          <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">
            {currentLecture?.description || course?.description || "Continue your course with live progress tracking, module navigation, completion updates, and resources."}
          </p>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <button disabled={currentIndex <= 0} onClick={() => go(-1)} className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-black disabled:opacity-40 dark:border-white/10 dark:bg-white/10">Previous</button>
            <button onClick={markComplete} disabled={saving || completed.has(String(currentLecture?._id))} className="rounded-xl bg-[#ff6b35] px-5 py-3 text-sm font-black text-white disabled:opacity-60">{completed.has(String(currentLecture?._id)) ? "Completed" : saving ? "Saving..." : "Mark Complete"}</button>
            <button disabled={currentIndex >= lectures.length - 1} onClick={() => go(1)} className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-black text-white disabled:opacity-40 dark:bg-white dark:text-slate-950">Next</button>
          </div>
        </MotionCard>

        <MotionCard>
          <SectionHeading eyebrow="Resources" title="Lecture materials" />
          <div className="grid gap-3 sm:grid-cols-2">
            {(currentLecture?.resources?.length ? currentLecture.resources : [{ title: "Lesson Notes", type: "PDF" }, { title: "Source Files", type: "ZIP" }]).map((resource) => (
              <div key={resource.title} className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4 dark:bg-white/5">
                {resource.type === "ZIP" ? <Download className="h-5 w-5 text-[#ff6b35]" /> : <FileText className="h-5 w-5 text-[#ff6b35]" />}
                <div><p className="font-black">{resource.title}</p><p className="text-xs font-bold text-slate-500">{resource.type || "Resource"}</p></div>
              </div>
            ))}
          </div>
        </MotionCard>
      </div>

      <MotionCard className="p-5 xl:sticky xl:top-24 xl:h-fit">
        <SectionHeading eyebrow="Progress" title="Course Status" />
        <ProgressBar value={progress} />
        <p className="mt-3 text-sm font-black">{progress}% complete</p>
        <div className="mt-5 space-y-3 text-sm font-bold text-slate-500 dark:text-slate-300">
          <p>Course: {course?.title || "Current course"}</p>
          <p>Lectures: {completed.size}/{lectures.length}</p>
          <p>Instructor: {course?.instructor?.name || course?.instructor || "EduPath Instructor"}</p>
          <p>Current: {currentLecture?.title}</p>
        </div>
      </MotionCard>
    </div>
  );
}

function normalizeModules(modules, progress = []) {
  const done = new Set(progress.filter((item) => item.completed).map((item) => String(item.lecture?._id || item.lecture)));
  return (modules || []).map((module) => ({
    ...module,
    lectures: (module.lectures || []).map((lecture) => ({
      ...lecture,
      completed: lecture.completed || done.has(String(lecture._id)),
    })),
  }));
}

function formatDuration(value) {
  if (!value) return "0:00";
  if (typeof value === "string") return value;
  const minutes = Math.floor(value / 60);
  const seconds = String(value % 60).padStart(2, "0");
  return `${minutes}:${seconds}`;
}
