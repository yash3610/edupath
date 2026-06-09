import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Clock3, IndianRupee, Star, TrendingUp, UserRoundCheck, Users } from "lucide-react";
import { MotionCard } from "../../components/dashboard/DashboardPrimitives.jsx";
import { apiRequest } from "../../services/api.js";
import { useToast } from "../../context/ToastContext.jsx";

export default function CourseAnalyticsPage() {
  const { courseId } = useParams();
  const toast = useToast();
  const [data, setData] = useState(null);
  useEffect(() => { apiRequest(`/api/instructor/courses/${courseId}/analytics`).then((result) => setData(result.data)).catch((error) => toast.error(error.message)); }, [courseId, toast]);
  if (!data) return <div className="h-80 animate-pulse rounded-[28px] bg-slate-200 dark:bg-white/10" />;
  const cards = [
    ["Total students", data.totalStudents, Users],
    ["Active students", data.activeStudents, UserRoundCheck],
    ["Completion rate", `${data.completionRate}%`, TrendingUp],
    ["Average watch time", `${Math.round(data.averageWatchTimeSeconds / 60)}m`, Clock3],
    ["Revenue", `₹${Number(data.revenue || 0).toLocaleString()}`, IndianRupee],
    ["Course rating", data.rating || "New", Star],
  ];
  return <div className="space-y-5"><section className="rounded-[28px] bg-[#1f1c35] p-7 text-white"><p className="text-xs font-extrabold uppercase tracking-[.18em] text-[#fec961]">Course Analytics</p><h2 className="mt-2 text-3xl font-extrabold">Performance overview</h2><p className="mt-2 text-sm text-white/65">Live enrollment, completion, engagement, revenue, and rating data.</p></section><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{cards.map(([label, value, CardIcon]) => <MotionCard key={label}><CardIcon className="h-5 w-5 text-[#ff723a]" /><p className="mt-5 text-xs font-extrabold uppercase tracking-wider text-slate-400">{label}</p><p className="mt-1 text-3xl font-extrabold">{value}</p></MotionCard>)}</div></div>;
}
