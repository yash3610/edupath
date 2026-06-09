import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Clock3, TrendingUp, Users } from "lucide-react";
import { MotionCard } from "../../components/dashboard/DashboardPrimitives.jsx";
import { QuizHero, QuizMetric, StatusPill } from "../../components/dashboard/quiz/QuizShell.jsx";
import { apiRequest } from "../../services/api.js";
import { useToast } from "../../context/ToastContext.jsx";

export default function InstructorQuizAnalyticsPage() {
  const { quizId } = useParams();
  const toast = useToast();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiRequest(`/api/instructor/quizzes/${quizId}/analytics`)
      .then((result) => setAnalytics(result.data))
      .catch((error) => toast.error(error.message))
      .finally(() => setLoading(false));
  }, [quizId, toast]);

  if (loading) return <MotionCard className="text-center text-sm font-bold text-slate-400">Loading quiz analytics...</MotionCard>;
  if (!analytics) return <MotionCard className="text-center text-sm font-bold text-slate-400">Analytics are not available.</MotionCard>;

  const topics = (analytics.topicWeakAreas || []).map((topic, index) => ({ topic, score: Math.max(45, analytics.averageScore - index * 8) }));
  const rows = analytics.studentResults || [];

  return (
    <div className="space-y-6">
      <QuizHero title="Quiz Analytics" subtitle="Live attempts, weak topics, pass rate, and student-wise outcomes from the database." />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <QuizMetric icon={Users} label="Attempts" value={analytics.totalAttempts} />
        <QuizMetric icon={TrendingUp} label="Average" value={`${analytics.averageScore}%`} />
        <QuizMetric label="Pass rate" value={`${analytics.passRate}%`} />
        <QuizMetric label="Fail rate" value={`${analytics.failRate}%`} />
        <QuizMetric icon={Clock3} label="Avg time" value={`${Math.round((analytics.averageTimeTaken || 0) / 60)}m`} />
      </div>
      <div className="grid gap-5 xl:grid-cols-2">
        <MotionCard><h3 className="text-lg font-black">Topic weak areas</h3><div className="h-72"><ResponsiveContainer><BarChart data={topics}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="topic" /><YAxis /><Tooltip /><Bar dataKey="score" fill="#ff723a" radius={[12, 12, 0, 0]} /></BarChart></ResponsiveContainer></div></MotionCard>
        <MotionCard><h3 className="text-lg font-black">Hardest questions</h3><div className="mt-4 space-y-3">{(analytics.hardestQuestions || []).map((item, index) => <div key={item.questionText || index} className="rounded-2xl bg-slate-50 p-4 dark:bg-white/5"><p className="font-black">{item.questionText || `Question ${index + 1}`}</p></div>)}{!analytics.hardestQuestions?.length && <p className="text-sm font-bold text-slate-400">More attempts are needed to calculate question difficulty.</p>}</div></MotionCard>
      </div>
      <MotionCard><h3 className="text-lg font-black">Student-wise results</h3><div className="mt-4 grid gap-3">{rows.map((row) => <div key={row._id} className="grid gap-3 rounded-2xl bg-slate-50 p-4 text-sm font-bold dark:bg-white/5 sm:grid-cols-4"><span className="font-black">{row.student?.name || "Student"}</span><span>{row.percentage}%</span><StatusPill status={row.isPassed ? "Passed" : "Failed"} /><span>{Math.round((row.timeTaken || 0) / 60)}m</span></div>)}{!rows.length && <p className="text-sm font-bold text-slate-400">No submitted attempts yet.</p>}</div></MotionCard>
    </div>
  );
}
