import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Icon, MotionCard, SectionHeading } from "../../components/dashboard/DashboardPrimitives.jsx";
import { apiRequest } from "../../services/api.js";
import { useToast } from "../../context/ToastContext.jsx";

export default function InstructorQuizManagementPage() {
  const toast = useToast();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const result = await apiRequest("/api/instructor/quizzes");
      setQuizzes(result.data || []);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { load(); }, [load]);

  async function action(quiz, name) {
    try {
      await apiRequest(`/api/instructor/quizzes/${quiz._id}${name === "delete" ? "" : "/publish"}`, { method: name === "delete" ? "DELETE" : "PATCH" });
      toast.success(`Quiz ${name === "delete" ? "deleted" : "published"}.`);
      await load();
    } catch (error) {
      toast.error(error.message);
    }
  }

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 rounded-[26px] border border-[#f1e7db] bg-[#fff8ef] p-6 dark:border-white/10 dark:bg-[#1f1c35] sm:flex-row sm:items-center sm:justify-between sm:p-8">
        <div><p className="text-[11px] font-extrabold uppercase tracking-[.18em] text-[#ff723a]">Assessments</p><h2 className="mt-1 text-3xl font-extrabold">Your quizzes</h2><p className="mt-2 text-sm text-slate-500">Manage real quizzes, publish them, and inspect student analytics.</p></div>
        <Link to="/instructor/dashboard/quizzes/new" className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#ff723a] px-5 py-3 text-sm font-extrabold text-white"><Icon name="Plus" className="h-4 w-4" /> Create quiz</Link>
      </section>
      <MotionCard>
        <SectionHeading eyebrow="Database" title={`${quizzes.length} quizzes`} />
        {loading ? <p className="py-8 text-center text-sm font-bold text-slate-400">Loading quizzes...</p> : <div className="grid gap-4 lg:grid-cols-2">{quizzes.map((quiz) => <div key={quiz._id} className="rounded-2xl border border-slate-200 p-5 dark:border-white/10"><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-extrabold uppercase text-[#ff723a]">{quiz.status}</p><h3 className="mt-1 text-lg font-extrabold">{quiz.title}</h3><p className="mt-1 text-sm text-slate-500">{quiz.course?.title || "Course"} - {quiz.questions?.length || 0} questions</p></div><span className="rounded-xl bg-[#fff1e8] p-2.5 text-[#ff723a]"><Icon name="BadgeHelp" /></span></div><div className="mt-5 flex flex-wrap gap-2">{quiz.status !== "published" && <button onClick={() => action(quiz, "publish")} className="rounded-lg bg-emerald-50 px-3 py-2 text-xs font-extrabold text-emerald-700">Publish</button>}<Link to={`/instructor/dashboard/quizzes/${quiz._id}/edit`} className="rounded-lg bg-amber-50 px-3 py-2 text-xs font-extrabold text-amber-700">Edit</Link><Link to={`/instructor/dashboard/quizzes/${quiz._id}/analytics`} className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-extrabold text-slate-700">Analytics</Link><button onClick={() => action(quiz, "delete")} className="rounded-lg bg-rose-50 px-3 py-2 text-xs font-extrabold text-rose-700">Delete</button></div></div>)}</div>}
        {!loading && !quizzes.length && <p className="py-8 text-center text-sm font-bold text-slate-400">No quizzes created yet.</p>}
      </MotionCard>
    </div>
  );
}
