import React from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Clock3, TrendingUp, Users } from "lucide-react";
import { MotionCard } from "../../components/dashboard/DashboardPrimitives.jsx";
import { QuizHero, QuizMetric, StatusPill } from "../../components/dashboard/quiz/QuizShell.jsx";

const rows = [{ name: "Aarav Sharma", score: 85, status: "Passed", time: "14m" }, { name: "Yash Hule", score: 72, status: "Passed", time: "17m" }, { name: "Priya Shah", score: 44, status: "Failed", time: "19m" }];
const topics = [{ topic: "Hooks", score: 82 }, { topic: "Effects", score: 64 }, { topic: "Security", score: 73 }, { topic: "Performance", score: 58 }];

export default function InstructorQuizAnalyticsPage() {
  return (
    <div className="space-y-6">
      <QuizHero title="Quiz Analytics" subtitle="Understand attempts, weak topics, hard questions, pass rate, and student-wise outcomes." />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <QuizMetric icon={Users} label="Attempts" value="248" />
        <QuizMetric icon={TrendingUp} label="Average" value="76%" />
        <QuizMetric label="Pass rate" value="82%" />
        <QuizMetric label="Fail rate" value="18%" />
        <QuizMetric icon={Clock3} label="Avg time" value="16m" />
      </div>
      <div className="grid gap-5 xl:grid-cols-2">
        <MotionCard><h3 className="text-lg font-black">Topic weak areas</h3><div className="h-72"><ResponsiveContainer><BarChart data={topics}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="topic" /><YAxis /><Tooltip /><Bar dataKey="score" fill="#ff6b35" radius={[12, 12, 0, 0]} /></BarChart></ResponsiveContainer></div></MotionCard>
        <MotionCard><h3 className="text-lg font-black">Hardest questions</h3><div className="mt-4 space-y-3">{["Effect dependency debugging", "Multiple memoization choices", "Backend route validation"].map((item, index) => <div key={item} className="rounded-2xl bg-slate-50 p-4 dark:bg-white/5"><p className="font-black">{index + 1}. {item}</p><p className="text-sm font-bold text-slate-500">Low correct rate, review recommended.</p></div>)}</div></MotionCard>
      </div>
      <MotionCard><h3 className="text-lg font-black">Student-wise results</h3><div className="mt-4 grid gap-3">{rows.map((row) => <div key={row.name} className="grid gap-3 rounded-2xl bg-slate-50 p-4 text-sm font-bold dark:bg-white/5 sm:grid-cols-4"><span className="font-black">{row.name}</span><span>{row.score}%</span><StatusPill status={row.status} /><span>{row.time}</span></div>)}</div></MotionCard>
    </div>
  );
}
