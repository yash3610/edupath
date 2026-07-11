import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ArrowRight, ClipboardList, MessageCircleQuestion, Plus, Star, Video } from "lucide-react";
import { StatCard } from "@/features/shared/components/StatCard";
import { ChartCard } from "@/features/shared/components/ChartCard";
import { StatusBadge } from "@/features/shared/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import {
  instructor,
  instructorKpis,
  instructorCourses,
  engagementSeries,
  upcomingLive,
  doubts,
  instructorReviews,
  ratingDistribution,
} from "@/features/instructor/data/instructor";
const AXIS = "oklch(0.7 0.02 270)";
const GRID = "oklch(1 0 0 / 0.06)";
export default function InstructorHome() {
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
        className="relative mb-8 overflow-hidden rounded-3xl card-premium"
      >
        <div className="relative h-44 overflow-hidden">
          <img src={instructor.cover} alt="" className="h-full w-full object-cover opacity-50" />
          <div className="absolute inset-0 bg-gradient-to-t from-card via-card/40 to-transparent" />
        </div>
        <div className="relative -mt-16 flex flex-col gap-6 px-6 pb-6 md:flex-row md:items-end md:justify-between md:px-8">
          <div className="flex items-end gap-4">
            <Avatar className="h-20 w-20 ring-4 ring-card">
              <AvatarImage src={instructor.avatar} />
              <AvatarFallback>{instructor.name[0]}</AvatarFallback>
            </Avatar>
            <div className="pb-1">
              <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                {today}
              </div>
              <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight md:text-4xl">
                Good to see you, {instructor.name.split(" ")[0]}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">{instructor.bio}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
            <Link to="/instructor/dashboard/create">
              <Button className="rounded-xl gradient-primary border-0 text-primary-foreground">
                <Plus className="mr-1.5 h-4 w-4" /> Create course
              </Button>
            </Link>
            <Link to="/instructor/dashboard/quizzes">
              <Button variant="outline" className="rounded-xl border-border/60">
                Create quiz
              </Button>
            </Link>
            <Link to="/instructor/dashboard/assignments">
              <Button variant="outline" className="rounded-xl border-border/60">
                New assignment
              </Button>
            </Link>
            <Link to="/instructor/dashboard/live">
              <Button variant="outline" className="rounded-xl border-border/60">
                <Video className="mr-1.5 h-4 w-4" /> Schedule live
              </Button>
            </Link>
          </div>
        </div>
      </motion.div>

      {/* KPIs */}
      <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
        {instructorKpis.filter((k) => !["earn", "month"].includes(k.id)).map((k, i) => (
          <StatCard key={k.id} {...k} index={i} />
        ))}
      </div>

      {/* Engagement */}
      <div className="mb-8 grid gap-5 lg:grid-cols-3">
        <ChartCard
          title="Student engagement"
          subtitle="Active learners + watch time"
          className="lg:col-span-2"
        >
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={engagementSeries}>
                <defs>
                  <linearGradient id="eng" x1="0" y1="0" x2="0" y2="1">
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
                  fill="url(#eng)"
                />
                <Area
                  type="monotone"
                  dataKey="watch"
                  stroke="oklch(0.78 0.16 70)"
                  strokeWidth={2}
                  fill="none"
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
                  <div className="flex-1">
                    <Progress value={pct} className="h-2" />
                  </div>
                  <span className="w-12 text-right text-xs text-muted-foreground">
                    {r.count.toLocaleString()}
                  </span>
                </div>
              );
            })}
          </div>
        </ChartCard>
      </div>

      {/* Course performance */}
      <div className="mb-8 grid gap-5 lg:grid-cols-3">
        <ChartCard
          title="Course performance"
          className="lg:col-span-2"
          action={
            <Link to="/instructor/dashboard/courses">
              <Button variant="ghost" size="sm" className="rounded-lg">
                View all <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Button>
            </Link>
          }
        >
          <div className="space-y-3">
            {instructorCourses.slice(0, 4).map((c) => (
              <div key={c.id} className="flex items-center gap-4 rounded-xl bg-muted/20 p-3">
                <img src={c.cover} alt="" className="h-14 w-20 shrink-0 rounded-lg object-cover" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <div className="truncate font-medium">{c.title}</div>
                    <StatusBadge status={c.status} />
                  </div>
                  <div className="mt-1 grid grid-cols-3 gap-3 text-xs text-muted-foreground">
                    <span>
                      Enrol ·{" "}
                      <span className="text-foreground font-medium">
                        {c.enrollments.toLocaleString()}
                      </span>
                    </span>
                    <span>
                      Complete · <span className="text-foreground font-medium">{c.completion}%</span>
                    </span>
                    <span>
                      ★{" "}
                      <span className="text-foreground font-medium">{c.rating.toFixed(1)}</span>
                    </span>
                  </div>
                  <div className="mt-2 flex items-center gap-3">
                    <Progress value={c.completion} className="h-1.5 flex-1" />
                    <span className="text-xs text-muted-foreground">
                      {c.completion}% completion
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ChartCard>

        <ChartCard title="Pending tasks">
          <ul className="space-y-2.5">
            {[
              {
                icon: MessageCircleQuestion,
                label: "Doubts to answer",
                count: 8,
                to: "/instructor/dashboard/doubts",
              },
              {
                icon: ClipboardList,
                label: "Assignments to grade",
                count: 14,
                to: "/instructor/dashboard/assignments",
              },
              {
                icon: Star,
                label: "Reviews to reply",
                count: 6,
                to: "/instructor/dashboard/reviews",
              },
              {
                icon: Video,
                label: "Live classes today",
                count: 1,
                to: "/instructor/dashboard/live",
              },
            ].map((t) => (
              <Link key={t.label} to={t.to}>
                <li className="flex items-center gap-3 rounded-xl border border-border/60 bg-muted/20 p-3 transition hover:border-primary/40 hover:bg-primary/5">
                  <div className="grid h-10 w-10 place-items-center rounded-lg gradient-primary shadow-glow">
                    <t.icon className="h-4 w-4 text-primary-foreground" />
                  </div>
                  <div className="flex-1 text-sm">{t.label}</div>
                  <Badge className="border-0 bg-primary/15 text-primary">{t.count}</Badge>
                </li>
              </Link>
            ))}
          </ul>
        </ChartCard>
      </div>

      {/* Latest reviews + upcoming live */}
      <div className="grid gap-5 lg:grid-cols-3">
        <ChartCard title="Latest reviews" className="lg:col-span-2">
          <div className="grid gap-3 sm:grid-cols-2">
            {instructorReviews.slice(0, 4).map((r) => (
              <div key={r.id} className="rounded-xl border border-border/60 bg-muted/20 p-4">
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={r.avatar} />
                    <AvatarFallback>{r.student[0]}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">{r.student}</div>
                    <div className="truncate text-xs text-muted-foreground">{r.course}</div>
                  </div>
                  <div className="inline-flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, k) => (
                      <Star
                        key={k}
                        className={`h-3 w-3 ${k < r.rating ? "fill-current text-warning" : "text-muted-foreground/30"}`}
                      />
                    ))}
                  </div>
                </div>
                <p className="mt-2 line-clamp-3 text-xs text-muted-foreground">{r.text}</p>
              </div>
            ))}
          </div>
        </ChartCard>

        <ChartCard title="Upcoming live classes">
          <div className="space-y-3">
            {upcomingLive.map((l) => (
              <div key={l.id} className="rounded-xl border border-border/60 bg-muted/20 p-3">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium">{l.title}</div>
                  <StatusBadge status={l.status} />
                </div>
                <div className="mt-1 text-xs text-muted-foreground">{l.course}</div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{l.date}</span>
                  <Button
                    size="sm"
                    className="h-7 rounded-lg gradient-primary border-0 text-primary-foreground text-xs"
                  >
                    {l.status === "live" ? "Join" : "Start"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>

      {/* Recent student activity */}
      <ChartCard title="Recent student activity" className="mt-8">
        <ol className="grid gap-3 md:grid-cols-2">
          {doubts.slice(0, 6).map((d) => (
            <li
              key={d.id}
              className="flex items-start gap-3 rounded-xl border border-border/60 bg-muted/20 p-3"
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src={d.avatar} />
                <AvatarFallback>{d.student[0]}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="text-sm">
                  <span className="font-medium">{d.student}</span> asked a question on{" "}
                  <span className="text-primary">{d.lecture}</span>
                </div>
                <div className="text-xs text-muted-foreground">{d.text}</div>
                <div className="mt-1 text-[11px] text-muted-foreground">{d.time}</div>
              </div>
            </li>
          ))}
        </ol>
      </ChartCard>
    </div>
  );
}

