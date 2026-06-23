import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Activity,
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  FolderPlus,
  ShieldCheck,
  Sparkles,
  Ticket,
  TrendingUp,
  Users,
} from "lucide-react";
import { StatCard } from "@/features/shared/components/StatCard";
import { StatusBadge } from "@/features/shared/components/StatusBadge";
import { ChartCard } from "@/features/shared/components/ChartCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  adminUser,
  platformKpis,
  revenueMonthly,
  dailySales,
  revenueByCategory,
  paymentMethods,
  newUserSeries,
  adminOrders,
  pendingApprovals,
  activityFeed,
  tickets,
  adminCourses,
} from "@/features/admin/data/admin";
import { inr } from "@/features/shared/utils/format";
const PIE_COLORS = [
  "oklch(0.78 0.16 70)",
  "oklch(0.7 0.18 295)",
  "oklch(0.72 0.16 195)",
  "oklch(0.65 0.2 25)",
  "oklch(0.75 0.15 145)",
];
const AXIS = "oklch(0.7 0.02 270)";
const GRID = "oklch(1 0 0 / 0.06)";
export default function AdminHome() {
  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  return (
    <div className="mx-auto max-w-[1500px]">
      {/* Welcome */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative mb-8 overflow-hidden rounded-3xl card-premium p-6 md:p-8"
      >
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full gradient-aurora opacity-30 blur-3xl" />
        <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 ring-2 ring-primary/40">
              <AvatarImage src={adminUser.avatar} />
              <AvatarFallback>{adminUser.name[0]}</AvatarFallback>
            </Avatar>
            <div>
              <Badge className="border-0 bg-success/15 text-success">
                <span className="mr-1.5 inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-success" />{" "}
                Platform healthy
              </Badge>
              <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight md:text-4xl">
                Welcome back, {adminUser.name.split(" ")[0]}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">{today}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
            <Link to="/admin/dashboard/categories">
              <Button variant="outline" className="rounded-xl border-border/60">
                <FolderPlus className="mr-1.5 h-4 w-4" /> Add Category
              </Button>
            </Link>
            <Link to="/admin/dashboard/coupons">
              <Button variant="outline" className="rounded-xl border-border/60">
                <Ticket className="mr-1.5 h-4 w-4" /> New Coupon
              </Button>
            </Link>
            <Link to="/admin/dashboard/reports">
              <Button variant="outline" className="rounded-xl border-border/60">
                <TrendingUp className="mr-1.5 h-4 w-4" /> Reports
              </Button>
            </Link>
            <Link to="/admin/dashboard/approvals">
              <Button className="rounded-xl gradient-primary border-0 text-primary-foreground">
                <ShieldCheck className="mr-1.5 h-4 w-4" /> Approvals
              </Button>
            </Link>
          </div>
        </div>
      </motion.div>

      {/* KPIs */}
      <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
        {platformKpis.map((k, i) => (
          <StatCard key={k.id} {...k} index={i} />
        ))}
      </div>

      {/* Revenue analytics */}
      <div className="mb-8 grid gap-5 lg:grid-cols-3">
        <ChartCard title="Revenue trend" subtitle="Last 7 months" className="lg:col-span-2">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueMonthly}>
                <defs>
                  <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.78 0.16 70)" stopOpacity={0.55} />
                    <stop offset="100%" stopColor="oklch(0.78 0.16 70)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke={GRID} vertical={false} />
                <XAxis dataKey="m" stroke={AXIS} fontSize={12} tickLine={false} axisLine={false} />
                <YAxis
                  stroke={AXIS}
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `${v / 100000}L`}
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
                  dataKey="revenue"
                  stroke="oklch(0.78 0.16 70)"
                  strokeWidth={3}
                  fill="url(#rev)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Revenue by category">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={revenueByCategory}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={3}
                  stroke="none"
                >
                  {revenueByCategory.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Legend wrapperStyle={{ fontSize: 12, color: AXIS }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      <div className="mb-8 grid gap-5 lg:grid-cols-3">
        <ChartCard title="Daily sales" subtitle="Last 14 days">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailySales}>
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
                <Bar dataKey="sales" radius={[6, 6, 0, 0]} fill="oklch(0.7 0.18 295)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="New signups" subtitle="This week">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={newUserSeries}>
                <defs>
                  <linearGradient id="su1" x1="0" y1="0" x2="0" y2="1">
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
                  dataKey="students"
                  stroke="oklch(0.72 0.16 195)"
                  strokeWidth={2.5}
                  fill="url(#su1)"
                />
                <Area
                  type="monotone"
                  dataKey="instructors"
                  stroke="oklch(0.78 0.16 70)"
                  strokeWidth={2.5}
                  fill="none"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Payment methods">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={paymentMethods}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={48}
                  outerRadius={78}
                  paddingAngle={3}
                  stroke="none"
                >
                  {paymentMethods.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[(i + 1) % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Legend wrapperStyle={{ fontSize: 11, color: AXIS }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      {/* Tables row */}
      <div className="mb-8 grid gap-5 lg:grid-cols-3">
        <ChartCard
          title="Recent orders"
          subtitle="Latest paid + refund activity"
          className="lg:col-span-2"
          action={
            <Link to="/admin/dashboard/orders">
              <Button variant="ghost" size="sm" className="rounded-lg">
                View all <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Button>
            </Link>
          }
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground">
                  <th className="pb-2 text-left font-medium">Order</th>
                  <th className="pb-2 text-left font-medium">Student</th>
                  <th className="pb-2 text-left font-medium">Course</th>
                  <th className="pb-2 text-right font-medium">Amount</th>
                  <th className="pb-2 text-left font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {adminOrders.slice(0, 6).map((o) => (
                  <tr key={o.id} className="border-t border-border/40">
                    <td className="py-2.5 font-mono text-xs text-primary">{o.id}</td>
                    <td className="py-2.5">{o.student}</td>
                    <td className="py-2.5 truncate max-w-[220px] text-muted-foreground">
                      {o.course}
                    </td>
                    <td className="py-2.5 text-right font-medium">{inr(o.amount)}</td>
                    <td className="py-2.5">
                      <StatusBadge status={o.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ChartCard>

        <ChartCard
          title="Support overview"
          action={
            <Link to="/admin/dashboard/support">
              <Button variant="ghost" size="sm" className="rounded-lg">
                View <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Button>
            </Link>
          }
        >
          <div className="grid grid-cols-3 gap-2 text-center">
            {[
              {
                label: "Open",
                value: tickets.filter((t) => t.status === "open").length,
                tone: "text-warning",
              },
              {
                label: "Pending",
                value: tickets.filter((t) => t.status === "pending").length,
                tone: "text-primary",
              },
              {
                label: "Resolved",
                value: tickets.filter((t) => t.status === "resolved").length,
                tone: "text-success",
              },
            ].map((s) => (
              <div key={s.label} className="rounded-xl bg-muted/30 p-3">
                <div className={`font-display text-2xl font-semibold ${s.tone}`}>{s.value}</div>
                <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 space-y-2">
            {tickets.slice(0, 4).map((t) => (
              <div
                key={t.id}
                className="flex items-start gap-3 rounded-xl border border-border/60 bg-muted/20 p-3"
              >
                <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary/15 text-primary text-xs font-mono">
                  {t.id.slice(-3)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">{t.subject}</div>
                  <div className="text-xs text-muted-foreground">
                    {t.user} · {t.date}
                  </div>
                </div>
                <StatusBadge status={t.priority} />
              </div>
            ))}
          </div>
        </ChartCard>
      </div>

      {/* Pending approvals + Activity */}
      <div className="grid gap-5 lg:grid-cols-3">
        <ChartCard
          title="Pending course approvals"
          subtitle={`${pendingApprovals.length} courses awaiting review`}
          className="lg:col-span-2"
          action={
            <Link to="/admin/dashboard/approvals">
              <Button variant="ghost" size="sm" className="rounded-lg">
                Review all <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Button>
            </Link>
          }
        >
          <div className="grid gap-3 sm:grid-cols-2">
            {pendingApprovals.slice(0, 4).map((c) => (
              <motion.div
                key={c.id}
                whileHover={{ y: -2 }}
                className="group overflow-hidden rounded-xl border border-border/60 bg-muted/20"
              >
                <div className="relative h-28 overflow-hidden">
                  <img
                    src={c.cover}
                    alt=""
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <Badge className="absolute left-2 top-2 border-0 bg-warning/90 text-warning-foreground">
                    Pending
                  </Badge>
                </div>
                <div className="p-3">
                  <div className="line-clamp-1 text-sm font-semibold">{c.title}</div>
                  <div className="mt-0.5 text-xs text-muted-foreground">
                    {c.instructor} · {c.category}
                  </div>
                  <div className="mt-3 flex gap-2">
                    <Button
                      size="sm"
                      className="h-8 flex-1 rounded-lg gradient-primary border-0 text-primary-foreground text-xs"
                    >
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 rounded-lg border-border/60 text-xs"
                    >
                      Preview
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
            {pendingApprovals.length === 0 && (
              <div className="col-span-2 rounded-xl border border-dashed border-border/60 p-6 text-center text-sm text-muted-foreground">
                <CheckCircle2 className="mx-auto mb-2 h-6 w-6 text-success" /> All caught up —
                no pending approvals.
              </div>
            )}
          </div>
        </ChartCard>

        <ChartCard title="Platform activity" subtitle="Last 24 hours">
          <ol className="relative space-y-3 pl-5">
            <span className="absolute left-2 top-1.5 bottom-1.5 w-px bg-border/60" />
            {activityFeed.map((a, i) => (
              <motion.li
                key={a.id}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className="relative"
              >
                <span className="absolute -left-3.5 top-1.5 grid h-3 w-3 place-items-center rounded-full gradient-primary shadow-glow">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary-foreground" />
                </span>
                <div className="text-sm">{a.text}</div>
                <div className="text-[11px] text-muted-foreground">{a.time}</div>
              </motion.li>
            ))}
          </ol>
        </ChartCard>
      </div>

      {/* Top courses footer */}
      <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        {[
          {
            label: "Top selling",
            icon: TrendingUp,
            sort: (a, b) => b.revenue - a.revenue,
          },
          {
            label: "Most enrolled",
            icon: Users,
            sort: (a, b) => b.enrollments - a.enrollments,
          },
          {
            label: "Highest rated",
            icon: BadgeCheck,
            sort: (a, b) => b.rating - a.rating,
          },
          {
            label: "Needs attention",
            icon: Activity,
            sort: (a, b) => a.rating - b.rating,
          },
        ].map((s, i) => (
          <ChartCard key={s.label} title={s.label} delay={i * 0.05}>
            <ul className="space-y-2.5">
              {[...adminCourses]
                .sort(s.sort)
                .slice(0, 3)
                .map((c) => (
                  <li key={c.id} className="flex items-center gap-3">
                    <img
                      src={c.cover}
                      alt=""
                      className="h-10 w-14 shrink-0 rounded-lg object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium">{c.title}</div>
                      <div className="truncate text-xs text-muted-foreground">{c.instructor}</div>
                    </div>
                    <Sparkles className="h-3 w-3 text-primary" />
                  </li>
                ))}
            </ul>
          </ChartCard>
        ))}
      </div>
    </div>
  );
}

