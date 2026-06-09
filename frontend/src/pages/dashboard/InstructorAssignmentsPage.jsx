import React, { useCallback, useEffect, useState } from "react";
import { Icon, MotionCard, SectionHeading } from "../../components/dashboard/DashboardPrimitives.jsx";
import { apiRequest } from "../../services/api.js";
import { useToast } from "../../context/ToastContext.jsx";

export default function InstructorAssignmentsPage() {
  const toast = useToast();
  const [courses, setCourses] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [selected, setSelected] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [form, setForm] = useState({});

  const load = useCallback(async () => {
    try {
      const [courseResult, assignmentResult] = await Promise.all([apiRequest("/api/instructor/my-courses"), apiRequest("/api/instructor/assignments")]);
      setCourses(courseResult.data || []);
      setAssignments(assignmentResult.data || []);
    } catch (error) {
      toast.error(error.message);
    }
  }, [toast]);

  useEffect(() => { load(); }, [load]);

  async function createAssignment(event) {
    event.preventDefault();
    try {
      await apiRequest(`/api/instructor/courses/${form.courseId}/assignments`, { method: "POST", body: JSON.stringify({ title: form.title, description: form.description, dueDate: form.dueDate, maxMarks: Number(form.maxMarks || 100) }) });
      setForm({});
      toast.success("Assignment created.");
      await load();
    } catch (error) {
      toast.error(error.message);
    }
  }

  async function loadSubmissions(assignment) {
    try {
      setSelected(assignment);
      const result = await apiRequest(`/api/instructor/assignments/${assignment._id}/submissions`);
      setSubmissions(result.data || []);
    } catch (error) {
      toast.error(error.message);
    }
  }

  async function grade(submission) {
    const gradeValue = window.prompt("Grade", submission.grade || "");
    if (gradeValue === null) return;
    const feedback = window.prompt("Feedback", submission.feedback || "") ?? "";
    try {
      await apiRequest(`/api/instructor/assignments/${submission._id}/grade`, { method: "PATCH", body: JSON.stringify({ grade: gradeValue, feedback }) });
      toast.success("Submission graded.");
      await loadSubmissions(selected);
    } catch (error) {
      toast.error(error.message);
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[26px] border border-[#f1e7db] bg-[#fff8ef] p-6 dark:border-white/10 dark:bg-[#1f1c35] sm:p-8"><p className="text-[11px] font-extrabold uppercase tracking-[.18em] text-[#ff723a]">Assignments</p><h2 className="mt-1 text-3xl font-extrabold">Create and review submissions</h2></section>
      <MotionCard><SectionHeading eyebrow="New Assignment" title="Assign work to a course" /><form onSubmit={createAssignment} className="grid gap-3 md:grid-cols-2 xl:grid-cols-5"><select required value={form.courseId || ""} onChange={(event) => setForm((current) => ({ ...current, courseId: event.target.value }))} className="rounded-xl border border-slate-200 px-3 py-3 dark:border-white/10 dark:bg-slate-900"><option value="">Select course</option>{courses.map((course) => <option key={course._id} value={course._id}>{course.title}</option>)}</select><input required value={form.title || ""} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} placeholder="Assignment title" className="rounded-xl border border-slate-200 px-3 py-3 dark:border-white/10 dark:bg-slate-900" /><input type="date" value={form.dueDate || ""} onChange={(event) => setForm((current) => ({ ...current, dueDate: event.target.value }))} className="rounded-xl border border-slate-200 px-3 py-3 dark:border-white/10 dark:bg-slate-900" /><input type="number" value={form.maxMarks || ""} onChange={(event) => setForm((current) => ({ ...current, maxMarks: event.target.value }))} placeholder="Marks" className="rounded-xl border border-slate-200 px-3 py-3 dark:border-white/10 dark:bg-slate-900" /><button className="rounded-xl bg-[#ff723a] px-4 py-3 text-sm font-extrabold text-white">Create</button></form></MotionCard>
      <div className="grid gap-6 xl:grid-cols-[.8fr_1.2fr]">
        <MotionCard><SectionHeading eyebrow="Database" title="Assignments" /><div className="space-y-2">{assignments.map((item) => <button key={item._id} onClick={() => loadSubmissions(item)} className={`flex w-full items-center gap-3 rounded-xl p-3 text-left ${selected?._id === item._id ? "bg-[#fff1e8]" : "bg-slate-50 dark:bg-white/5"}`}><Icon name="FileCheck2" className="h-5 w-5 text-[#ff723a]" /><span className="min-w-0"><span className="block truncate text-sm font-extrabold">{item.title}</span><span className="text-xs text-slate-400">{item.course?.title}</span></span></button>)}</div></MotionCard>
        <MotionCard><SectionHeading eyebrow="Review" title={selected ? `${selected.title} submissions` : "Select an assignment"} /><div className="space-y-3">{submissions.map((submission) => <div key={submission._id} className="flex flex-col gap-3 rounded-xl bg-slate-50 p-4 dark:bg-white/5 sm:flex-row sm:items-center"><div className="flex-1"><p className="font-extrabold">{submission.student?.name || "Student"}</p><p className="text-xs text-slate-400">{submission.status} · {submission.grade || "Not graded"}</p></div><button onClick={() => grade(submission)} className="rounded-lg bg-[#1f1c35] px-3 py-2 text-xs font-extrabold text-white">Grade</button></div>)}{selected && !submissions.length && <p className="text-sm font-bold text-slate-400">No submissions yet.</p>}</div></MotionCard>
      </div>
    </div>
  );
}
