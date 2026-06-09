import React, { useCallback, useEffect, useMemo, useState } from "react";
import { CheckCircle2, Trash2, XCircle } from "lucide-react";
import { MotionCard } from "../../components/dashboard/DashboardPrimitives.jsx";
import { QuizHero, SearchBox, StatusPill } from "../../components/dashboard/quiz/QuizShell.jsx";
import { apiRequest } from "../../services/api.js";
import { useToast } from "../../context/ToastContext.jsx";

export default function AdminQuizManagementPage() {
  const toast = useToast();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const query = status === "all" ? "" : `?status=${status}`;
      const result = await apiRequest(`/api/admin/quizzes${query}`);
      setQuizzes(result.data || []);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }, [status, toast]);

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => quizzes.filter((quiz) => `${quiz.title} ${quiz.course?.title || ""} ${quiz.instructor?.name || ""}`.toLowerCase().includes(search.toLowerCase())), [quizzes, search]);

  async function action(quizId, name, method = "PATCH") {
    try {
      await apiRequest(`/api/admin/quizzes/${quizId}${name === "delete" ? "" : `/${name}`}`, { method });
      toast.success(`Quiz ${name === "delete" ? "deleted" : `${name}d`}.`);
      await load();
    } catch (error) {
      toast.error(error.message);
    }
  }

  return (
    <div className="space-y-6">
      <QuizHero title="Admin Quiz Management" subtitle="Approve, reject, delete, and audit live quizzes across instructors and courses." />
      <MotionCard>
        <div className="grid gap-3 md:grid-cols-[1fr_220px]"><SearchBox value={search} onChange={setSearch} placeholder="Search instructor, course, quiz..." /><select value={status} onChange={(event) => setStatus(event.target.value)} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-black dark:border-white/10 dark:bg-slate-900"><option value="all">All status</option><option value="published">Published</option><option value="draft">Draft</option><option value="archived">Archived</option></select></div>
        <div className="mt-5 space-y-3">
          {loading && <p className="py-8 text-center text-sm font-bold text-slate-400">Loading quizzes...</p>}
          {!loading && filtered.map((quiz) => (
            <div key={quiz._id} className="grid gap-4 rounded-2xl border border-slate-200 p-4 dark:border-white/10 lg:grid-cols-[1fr_auto] lg:items-center">
              <div><div className="flex flex-wrap gap-2"><StatusPill status={quiz.status} /><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-500 dark:bg-white/10">{quiz.difficulty}</span></div><h3 className="mt-2 text-lg font-black">{quiz.title}</h3><p className="text-sm font-bold text-slate-500">{quiz.course?.title || "Course"} · {quiz.instructor?.name || "Instructor"}</p></div>
              <div className="flex flex-wrap gap-2"><button onClick={() => action(quiz._id, "approve")} className="inline-flex items-center gap-2 rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-black text-white"><CheckCircle2 className="h-4 w-4" /> Approve</button><button onClick={() => action(quiz._id, "reject")} className="inline-flex items-center gap-2 rounded-2xl bg-amber-500 px-4 py-3 text-sm font-black text-white"><XCircle className="h-4 w-4" /> Reject</button><button onClick={() => action(quiz._id, "delete", "DELETE")} className="inline-flex items-center gap-2 rounded-2xl bg-rose-500 px-4 py-3 text-sm font-black text-white"><Trash2 className="h-4 w-4" /> Delete</button></div>
            </div>
          ))}
          {!loading && !filtered.length && <p className="py-8 text-center text-sm font-bold text-slate-400">No quizzes found.</p>}
        </div>
      </MotionCard>
    </div>
  );
}
