import React, { useState } from "react";
import { CheckCircle2, Filter, Trash2, XCircle } from "lucide-react";
import { MotionCard } from "../../components/dashboard/DashboardPrimitives.jsx";
import { QuizHero, SearchBox, StatusPill } from "../../components/dashboard/quiz/QuizShell.jsx";
import { fallbackQuizzes } from "../../data/quizData.js";

export default function AdminQuizManagementPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const quizzes = fallbackQuizzes.filter((quiz) => `${quiz.title} ${quiz.course.title}`.toLowerCase().includes(search.toLowerCase()) && (status === "all" || quiz.status === status));
  return (
    <div className="space-y-6">
      <QuizHero title="Admin Quiz Management" subtitle="Approve, reject, delete, and audit quizzes across instructors and courses." />
      <MotionCard>
        <div className="grid gap-3 md:grid-cols-[1fr_220px]"><SearchBox value={search} onChange={setSearch} placeholder="Search instructor, course, quiz..." /><select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-black dark:border-white/10 dark:bg-slate-900"><option value="all">All status</option><option value="Passed">Approved</option><option value="Locked">Pending</option><option value="Failed">Rejected</option></select></div>
        <div className="mt-5 space-y-3">
          {quizzes.map((quiz) => (
            <div key={quiz._id} className="grid gap-4 rounded-2xl border border-slate-200 p-4 dark:border-white/10 lg:grid-cols-[1fr_auto] lg:items-center">
              <div><div className="flex flex-wrap gap-2"><StatusPill status={quiz.status} /><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-500 dark:bg-white/10">{quiz.difficulty}</span></div><h3 className="mt-2 text-lg font-black">{quiz.title}</h3><p className="text-sm font-bold text-slate-500">{quiz.course.title} • Instructor review queue</p></div>
              <div className="flex flex-wrap gap-2"><button className="inline-flex items-center gap-2 rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-black text-white"><CheckCircle2 className="h-4 w-4" /> Approve</button><button className="inline-flex items-center gap-2 rounded-2xl bg-amber-500 px-4 py-3 text-sm font-black text-white"><XCircle className="h-4 w-4" /> Reject</button><button className="inline-flex items-center gap-2 rounded-2xl bg-rose-500 px-4 py-3 text-sm font-black text-white"><Trash2 className="h-4 w-4" /> Delete</button></div>
            </div>
          ))}
        </div>
      </MotionCard>
    </div>
  );
}
