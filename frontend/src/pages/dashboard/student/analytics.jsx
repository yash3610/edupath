import { motion } from "framer-motion";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Activity, Brain, Target, TrendingUp, Zap } from "lucide-react";
import { PageHeader } from "@/features/student/components/PageHeader";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { skillGrowth, weeklyActivity } from "@/features/student/data/mock";
const engagementPie = [
  { name: "Video", value: 52, fill: "oklch(0.78 0.16 70)" },
  { name: "Reading", value: 24, fill: "oklch(0.7 0.18 295)" },
  { name: "Quiz", value: 14, fill: "oklch(0.72 0.16 195)" },
  { name: "Practice", value: 10, fill: "oklch(0.75 0.16 155)" },
];
export default function AnalyticsPage() {
  return (
    <div className="mx-auto max-w-[1500px]">
      <PageHeader
        eyebrow="ML Insights"
        title="Performance Analytics"
        description="Your learning, modeled. Patterns, predictions, and growth — at a glance."
      />

      {/* KPI cards */}
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi
          icon={Activity}
          label="Engagement Score"
          value="87"
          suffix="/100"
          accent="primary"
          hint="Top 8% of cohort"
        />
        <Kpi
          icon={Target}
          label="Completion Probability"
          value="94"
          suffix="%"
          accent="success"
          hint="Next course"
        />
        <Kpi
          icon={TrendingUp}
          label="Skill Velocity"
          value="+18"
          suffix="% / mo"
          accent="accent"
          hint="Above target"
        />
        <Kpi
          icon={Brain}
          label="Focus Depth"
          value="42"
          suffix="min avg"
          accent="warning"
          hint="Best window: 8–10pm"
        />
      </div>

      {/* Skill growth */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-6 rounded-2xl card-premium p-6"
      >
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="font-display text-xl font-semibold">Skill Growth</h2>
            <p className="text-xs text-muted-foreground">
              Predicted mastery curves · last 7 months
            </p>
          </div>
          <Badge className="border-0 bg-success/15 text-success">
            <Zap className="mr-1 h-3 w-3" /> Trending up
          </Badge>
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={skillGrowth}>
              <CartesianGrid stroke="oklch(1 0 0 / 0.05)" vertical={false} />
              <XAxis
                dataKey="month"
                stroke="oklch(0.7 0.02 270)"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis stroke="oklch(0.7 0.02 270)" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{
                  background: "oklch(0.18 0.025 270)",
                  border: "1px solid oklch(1 0 0 / 0.1)",
                  borderRadius: 12,
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="frontend"
                stroke="oklch(0.78 0.16 70)"
                strokeWidth={3}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="backend"
                stroke="oklch(0.7 0.18 295)"
                strokeWidth={3}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="ai"
                stroke="oklch(0.72 0.16 195)"
                strokeWidth={3}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* XP this week */}
        <div className="lg:col-span-2 rounded-2xl card-premium p-6">
          <h2 className="font-display text-xl font-semibold">XP earned · this week</h2>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyActivity}>
                <CartesianGrid stroke="oklch(1 0 0 / 0.05)" vertical={false} />
                <XAxis
                  dataKey="day"
                  stroke="oklch(0.7 0.02 270)"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="oklch(0.7 0.02 270)"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    background: "oklch(0.18 0.025 270)",
                    border: "1px solid oklch(1 0 0 / 0.1)",
                    borderRadius: 12,
                  }}
                />
                <Bar dataKey="xp" radius={[8, 8, 0, 0]}>
                  {weeklyActivity.map((_, i) => (
                    <Cell key={i} fill={i === 5 ? "oklch(0.7 0.18 295)" : "oklch(0.78 0.16 70)"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Engagement mix */}
        <div className="rounded-2xl card-premium p-6">
          <h2 className="font-display text-xl font-semibold">Engagement mix</h2>
          <div className="mt-2 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={engagementPie}
                  dataKey="value"
                  innerRadius={55}
                  outerRadius={88}
                  paddingAngle={3}
                >
                  {engagementPie.map((e, i) => (
                    <Cell key={i} fill={e.fill} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "oklch(0.18 0.025 270)",
                    border: "1px solid oklch(1 0 0 / 0.1)",
                    borderRadius: 12,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ul className="mt-2 space-y-1 text-xs">
            {engagementPie.map((e) => (
              <li key={e.name} className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full" style={{ background: e.fill }} /> {e.name}
                </span>
                <span className="text-muted-foreground">{e.value}%</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Weakness detector */}
      <div className="mt-6 rounded-2xl card-premium p-6">
        <h2 className="font-display text-xl font-semibold">AI Weakness Detector</h2>
        <p className="text-xs text-muted-foreground">
          Topics where your accuracy dips. Recommend a 20-min focused drill.
        </p>
        <div className="mt-4 space-y-3">
          {[
            { t: "Async/await error handling", v: 58 },
            { t: "Backpropagation derivations", v: 64 },
            { t: "TypeScript variance", v: 71 },
            { t: "K8s networking", v: 49 },
          ].map((w) => (
            <div key={w.t}>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span>{w.t}</span>
                <span className={w.v < 60 ? "text-destructive" : "text-warning-foreground"}>
                  {w.v}%
                </span>
              </div>
              <Progress value={w.v} className="h-1.5" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
function Kpi({ icon: Icon, label, value, suffix, accent, hint }) {
  const cls = {
    primary: "gradient-primary text-primary-foreground",
    accent: "gradient-accent text-accent-foreground",
    success: "bg-success/15 text-success",
    warning: "bg-warning/15 text-warning-foreground",
  }[accent];
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl card-premium p-5 hover-lift"
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
            {label}
          </div>
          <div className="mt-2 font-display text-3xl font-semibold">
            {value}
            <span className="text-base text-muted-foreground">{suffix}</span>
          </div>
          {hint && <div className="mt-1 text-xs text-muted-foreground">{hint}</div>}
        </div>
        <div className={`grid h-11 w-11 place-items-center rounded-xl ${cls}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </motion.div>
  );
}

