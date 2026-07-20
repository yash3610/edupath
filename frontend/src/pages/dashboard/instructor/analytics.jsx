import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { LmsPageHeader } from "@/features/shared/components/PageHeader";
import { ChartCard } from "@/features/shared/components/ChartCard";
import { StatCard } from "@/features/shared/components/StatCard";
import { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";
import { api } from "@/services/api";
import { toast } from "sonner";
const AXIS = "oklch(0.7 0.02 270)";
const GRID = "oklch(1 0 0 / 0.06)";
const TOOLTIP_STYLE = {
  background: "rgba(255, 255, 255, 0.98)",
  border: "1px solid #e5e7eb",
  borderRadius: 12,
  color: "#111827",
  boxShadow: "0 10px 30px rgba(15, 23, 42, 0.12)",
};
export default function Page() {
  const [analytics, setAnalytics] = useState({
    summary: { completion: 0, watchHours: 0, quizPass: 0, averageRating: 0 },
    engagement: [],
    completionByCourse: [],
    ratingDistribution: [5, 4, 3, 2, 1].map((star) => ({ star, count: 0 })),
  });

  useEffect(() => {
    let active = true;
    api.instructorAnalytics()
      .then((result) => active && setAnalytics((current) => ({ ...current, ...(result.data || {}) })))
      .catch((error) => toast.error(error.message || "Could not load analytics"));
    return () => { active = false; };
  }, []);

  const { summary, engagement, completionByCourse, ratingDistribution } = analytics;
  return (
    <div className="mx-auto max-w-[1500px]">
      <LmsPageHeader
        eyebrow="Overview"
        title="Analytics"
        description="Course progress and engagement insights."
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Completion" value={`${summary.completion || 0}%`} icon="CheckCircle2" index={0} />
        <StatCard label="Watch time" value={`${summary.watchHours || 0}h`} icon="Clock" index={1} />
        <StatCard label="Quiz pass" value={`${summary.quizPass || 0}%`} icon="Trophy" index={2} />
        <StatCard label="Avg rating" value={summary.averageRating || 0} decimals={2} icon="Star" index={3} />
      </div>

      <div className="mb-6 grid gap-5 lg:grid-cols-3">
        <ChartCard title="Engagement" className="lg:col-span-2">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={engagement}>
                <defs>
                  <linearGradient id="a1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.72 0.16 195)" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="oklch(0.72 0.16 195)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke={GRID} vertical={false} />
                <XAxis dataKey="d" stroke={AXIS} fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke={AXIS} fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={TOOLTIP_STYLE}
                  labelStyle={{ color: "#6b7280" }}
                  itemStyle={{ color: "#0891b2" }}
                />
                <Area
                  type="monotone"
                  dataKey="active"
                  stroke="oklch(0.72 0.16 195)"
                  strokeWidth={2.5}
                  fill="url(#a1)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
        <ChartCard title="Completion by course">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={completionByCourse.map((course) => ({
                  ...course,
                  name: course.name.split(" ").slice(0, 2).join(" "),
                }))}
                layout="vertical"
              >
                <CartesianGrid stroke={GRID} horizontal={false} />
                <XAxis
                  type="number"
                  stroke={AXIS}
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  stroke={AXIS}
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  width={90}
                />
                <Tooltip
                  contentStyle={TOOLTIP_STYLE}
                  labelStyle={{ color: "#6b7280" }}
                  itemStyle={{ color: "#d97706" }}
                />
                <Bar dataKey="value" radius={[0, 6, 6, 0]} fill="oklch(0.78 0.16 70)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <ChartCard title="Watch time trend" className="lg:col-span-2">
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={engagement}>
                <defs>
                  <linearGradient id="a2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.78 0.16 70)" stopOpacity={0.55} />
                    <stop offset="100%" stopColor="oklch(0.78 0.16 70)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke={GRID} vertical={false} />
                <XAxis dataKey="d" stroke={AXIS} fontSize={11} tickLine={false} axisLine={false} />
                <YAxis
                  stroke={AXIS}
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={TOOLTIP_STYLE}
                  labelStyle={{ color: "#6b7280" }}
                  itemStyle={{ color: "#d97706" }}
                />
                <Area
                  type="monotone"
                  dataKey="watch"
                  stroke="oklch(0.78 0.16 70)"
                  strokeWidth={3}
                  fill="url(#a2)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
        <ChartCard title="Rating distribution">
          <div className="space-y-2.5">
            {ratingDistribution.map((r) => {
              const total = ratingDistribution.reduce((s, x) => s + x.count, 0);
              const pct = total ? (r.count / total) * 100 : 0;
              return (
                <div key={r.star} className="flex items-center gap-3">
                  <span className="w-8 text-xs font-medium text-muted-foreground">{r.star}</span>
                  <Progress value={pct} className="h-2 flex-1" />
                  <span className="w-12 text-right text-xs text-muted-foreground">
                    {r.count.toLocaleString()}
                  </span>
                </div>
              );
            })}
          </div>
        </ChartCard>
      </div>
    </div>
  );
}

