import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Clock3, Eye } from "lucide-react";
import { MotionCard } from "../../components/dashboard/DashboardPrimitives.jsx";
import { QuizHero, StatusPill } from "../../components/dashboard/quiz/QuizShell.jsx";
import { quizApi } from "../../services/quizApi.js";

export default function QuizHistoryPage() {
  const { quizId } = useParams();
  const [history, setHistory] = useState([]);
  useEffect(() => { quizApi.getQuizHistory(quizId).then(setHistory); }, [quizId]);
  return (
    <div className="space-y-6">
      <QuizHero title="Quiz attempt history" subtitle="Review previous attempts, scores, completion dates, and time taken." />
      <MotionCard>
        <div className="hidden overflow-hidden rounded-2xl border border-slate-200 dark:border-white/10 md:block">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500 dark:bg-white/5"><tr><th className="p-4">Quiz</th><th>Attempt</th><th>Score</th><th>Status</th><th>Date</th><th>Time</th><th /></tr></thead>
            <tbody>{history.map((item) => <HistoryRow key={item._id} item={item} />)}</tbody>
          </table>
        </div>
        <div className="grid gap-3 md:hidden">{history.map((item) => <HistoryCard key={item._id} item={item} />)}</div>
      </MotionCard>
    </div>
  );
}

function HistoryRow({ item }) {
  return <tr className="border-t border-slate-200 font-bold dark:border-white/10"><td className="p-4 font-black">{item.quiz?.title}</td><td>#{item.attemptNumber}</td><td>{item.score} ({item.percentage}%)</td><td><StatusPill status={item.status === "passed" ? "Passed" : "Failed"} /></td><td>{new Date(item.createdAt).toLocaleDateString()}</td><td>{Math.round(item.timeTaken / 60)}m</td><td><Link to={`/dashboard/quizzes/result/${item._id}`} className="inline-flex items-center gap-2 text-[#ff6b35]"><Eye className="h-4 w-4" /> Result</Link></td></tr>;
}

function HistoryCard({ item }) {
  return <div className="rounded-2xl bg-slate-50 p-4 dark:bg-white/5"><div className="flex items-start justify-between gap-3"><h3 className="font-black">{item.quiz?.title}</h3><StatusPill status={item.status === "passed" ? "Passed" : "Failed"} /></div><p className="mt-2 text-sm font-bold text-slate-500">Attempt #{item.attemptNumber} • {item.percentage}%</p><Link to={`/dashboard/quizzes/result/${item._id}`} className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#ff6b35] px-4 py-2 text-sm font-black text-white"><Clock3 className="h-4 w-4" /> View result</Link></div>;
}
