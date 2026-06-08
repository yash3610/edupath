import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Cell, Pie, PieChart, Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip } from "recharts";
import { CheckCircle2, Download, RotateCcw, Share2, Trophy, XCircle } from "lucide-react";
import { MotionCard } from "../../components/dashboard/DashboardPrimitives.jsx";
import { QuizHero, QuizMetric } from "../../components/dashboard/quiz/QuizShell.jsx";
import { useToast } from "../../context/ToastContext.jsx";
import { quizApi } from "../../services/quizApi.js";

export default function QuizResultPage() {
  const toast = useToast();
  const { attemptId } = useParams();
  const [result, setResult] = useState(null);
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState("");
  useEffect(() => { quizApi.getQuizResult(attemptId).then(setResult); }, [attemptId]);
  if (!result) return <div className="h-80 animate-pulse rounded-[28px] bg-slate-200 dark:bg-white/10" />;
  const attempt = result.attempt;
  const pie = [{ name: "Correct", value: attempt.correctCount }, { name: "Wrong", value: attempt.wrongCount }, { name: "Unanswered", value: attempt.unansweredCount }];
  const topics = [{ topic: "Hooks", score: 90 }, { topic: "Effects", score: 74 }, { topic: "Security", score: 82 }, { topic: "State", score: 68 }];

  async function downloadPdf() {
    setDownloading(true);
    setDownloadError("");
    try {
      const blob = await quizApi.downloadResultPdf(attemptId);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `edupath-quiz-result-${attemptId}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      toast.success("Quiz result PDF downloaded.", "Download complete");
    } catch (error) {
      setDownloadError(error.message || "PDF download failed. Please login again and try.");
      toast.error(error.message || "PDF download failed. Please login again and try.", "Download failed");
    } finally {
      setDownloading(false);
    }
  }

  async function shareResult() {
    const text = `I scored ${attempt.percentage}% on EduPath quiz.`;
    if (navigator.share) await navigator.share({ title: "EduPath Quiz Result", text });
    else await navigator.clipboard?.writeText(text);
    toast.success("Result share text is ready.", "Shared");
  }

  return (
    <div className="space-y-6">
      <QuizHero
        title={attempt.isPassed ? "Great work, you passed." : "Keep going, retake when ready."}
        subtitle={`Score ${attempt.score}/${attempt.totalMarks}. Accuracy ${result.accuracy}% with rank ${result.rank}.`}
        action={<div className="rounded-2xl bg-white px-5 py-3 text-sm font-black text-slate-950">{attempt.percentage}%</div>}
      />
      <MotionCard className="overflow-hidden p-0">
        <div className={`grid gap-0 lg:grid-cols-[320px_1fr] ${attempt.isPassed ? "bg-emerald-50 dark:bg-emerald-500/10" : "bg-rose-50 dark:bg-rose-500/10"}`}>
          <div className="flex flex-col items-center justify-center p-6 text-center">
            <div className={`grid h-24 w-24 place-items-center rounded-full ${attempt.isPassed ? "bg-emerald-500" : "bg-rose-500"} text-white shadow-xl`}>
              {attempt.isPassed ? <CheckCircle2 className="h-12 w-12" /> : <XCircle className="h-12 w-12" />}
            </div>
            <h3 className="mt-4 text-3xl font-black">{attempt.percentage}%</h3>
            <p className="text-sm font-black uppercase tracking-[0.16em] text-slate-500">{attempt.isPassed ? "Passed" : "Failed"}</p>
          </div>
          <div className="bg-white/70 p-5 dark:bg-slate-900/60">
            <div className="mb-3 flex items-center justify-between text-sm font-black"><span>Score Progress</span><span>{attempt.score}/{attempt.totalMarks}</span></div>
            <div className="h-4 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
              <div className="h-full rounded-full bg-gradient-to-r from-[#ff6b35] to-emerald-400" style={{ width: `${attempt.percentage}%` }} />
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <SoftStat label="Passing Marks" value={attempt.passingMarks} />
              <SoftStat label="Attempt" value={`#${attempt.attemptNumber || 1}`} />
              <SoftStat label="Rank" value={result.rank} />
            </div>
          </div>
        </div>
      </MotionCard>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
        <QuizMetric icon={Trophy} label="Score" value={`${attempt.score}/${attempt.totalMarks}`} />
        <QuizMetric label="Status" value={attempt.isPassed ? "Passed" : "Failed"} />
        <QuizMetric label="Correct" value={attempt.correctCount} />
        <QuizMetric label="Wrong" value={attempt.wrongCount} />
        <QuizMetric label="Unanswered" value={attempt.unansweredCount} />
        <QuizMetric label="Time" value={`${Math.round((attempt.timeTaken || 0) / 60)}m`} />
      </div>
      <div className="grid gap-5 xl:grid-cols-2">
        <MotionCard>
          <h3 className="text-lg font-black">Correct vs Wrong</h3>
          <div className="h-72"><ResponsiveContainer><PieChart><Pie data={pie} dataKey="value" outerRadius={95} label>{pie.map((_, index) => <Cell key={index} fill={["#10b981", "#f43f5e", "#94a3b8"][index]} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer></div>
        </MotionCard>
        <MotionCard>
          <h3 className="text-lg font-black">Topic Performance</h3>
          <div className="h-72"><ResponsiveContainer><RadarChart data={topics}><PolarGrid /><PolarAngleAxis dataKey="topic" /><Radar dataKey="score" fill="#ff6b35" fillOpacity={0.35} stroke="#ff6b35" /><Tooltip /></RadarChart></ResponsiveContainer></div>
        </MotionCard>
      </div>
      <MotionCard>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div><h3 className="text-xl font-black">Review answers</h3><p className="text-sm font-bold text-slate-500">Correct answers are shown only when the quiz setting allows it.</p></div>
          <div className="flex flex-wrap gap-2">
            <button onClick={downloadPdf} disabled={downloading} className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-black dark:border-white/10"><Download className="h-4 w-4" /> {downloading ? "Downloading..." : "PDF"}</button>
            <button onClick={shareResult} className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-black dark:border-white/10"><Share2 className="h-4 w-4" /> Share</button>
            <Link to="/dashboard/quizzes" className="inline-flex items-center gap-2 rounded-2xl bg-[#ff6b35] px-4 py-3 text-sm font-black text-white"><RotateCcw className="h-4 w-4" /> Retake</Link>
          </div>
        </div>
        {downloadError && <div className="mt-4 rounded-2xl bg-rose-50 p-4 text-sm font-black text-rose-700 dark:bg-rose-500/10 dark:text-rose-200">{downloadError}</div>}
        <div className="mt-5 space-y-3">
          {result.questions?.map((question, index) => (
            <div key={question._id} className="rounded-2xl bg-slate-50 p-4 dark:bg-white/5">
              <p className="font-black">{index + 1}. {question.questionText}</p>
              <p className="mt-2 text-sm font-bold text-slate-500">{question.explanation || "Explanation hidden for this quiz."}</p>
            </div>
          ))}
        </div>
      </MotionCard>
    </div>
  );
}

function SoftStat({ label, value }) {
  return <div className="rounded-2xl bg-white p-4 shadow-sm dark:bg-white/10"><p className="text-xs font-black uppercase tracking-[0.12em] text-slate-400">{label}</p><p className="mt-1 text-lg font-black">{value}</p></div>;
}
