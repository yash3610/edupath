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
import {
  engagementSeries,
  instructorCourses,
  ratingDistribution,
} from "@/features/instructor/data/instructor";
import { Progress } from "@/components/ui/progress";
const AXIS = "oklch(0.7 0.02 270)";
const GRID = "oklch(1 0 0 / 0.06)";
export default function Page() {
  return (
    <div className="mx-auto max-w-[1500px]">
      <LmsPageHeader
        eyebrow="Overview"
        title="Analytics"
        description="Course progress and engagement insights."
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Completion" value="68%" delta={3.4} icon="CheckCircle2" index={0} />
        <StatCard label="Watch time" value="12.4k" delta={6.8} icon="Clock" index={1} />
        <StatCard label="Quiz pass" value="82%" delta={2.1} icon="Trophy" index={2} />
        <StatCard label="Avg rating" value={4.86} decimals={2} delta={1.4} icon="Star" index={3} />
      </div>

      <div className="mb-6 grid gap-5 lg:grid-cols-3">
        <ChartCard title="Engagement" className="lg:col-span-2">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={engagementSeries}>
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
                  contentStyle={{
                    background: "oklch(0.18 0.02 270)",
                    border: "1px solid oklch(1 0 0 / 0.08)",
                    borderRadius: 12,
                  }}
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
                data={instructorCourses.slice(0, 6).map((course) => ({
                  name: course.title.split(" ").slice(0, 2).join(" "),
                  value: course.completion,
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
                  contentStyle={{
                    background: "oklch(0.18 0.02 270)",
                    border: "1px solid oklch(1 0 0 / 0.08)",
                    borderRadius: 12,
                  }}
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
              <AreaChart data={engagementSeries}>
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
                  contentStyle={{
                    background: "oklch(0.18 0.02 270)",
                    border: "1px solid oklch(1 0 0 / 0.08)",
                    borderRadius: 12,
                  }}
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
              const pct = (r.count / total) * 100;
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

