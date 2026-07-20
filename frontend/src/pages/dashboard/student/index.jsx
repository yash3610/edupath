import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import {
  Award,
  BookOpen,
  CheckCircle2,
  Clock,
  Flame,
  PlayCircle,
  Sparkles,
  Trophy,
  TrendingUp,
  ArrowRight,
  GraduationCap,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts";
import { StatCard } from "@/features/student/components/StatCard";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/context/AuthContext";
import {
  student,
  stats,
  weeklyActivity,
  masteryRadar,
  upcoming,
  leaderboard,
  courses,
} from "@/features/student/data/mock";
import { learningApi } from "@/services/learningApi";
import { assetUrl } from "@/services/api";
export default function DashboardHome() {
  const { user } = useAuth();
  const studentName = user?.name || student.name;
  const goalPct = Math.round((student.xp / student.xpToNext) * 100);
  return (
    <div className="mx-auto max-w-[1400px] space-y-8">
      {/* Welcome hero */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative overflow-hidden rounded-3xl border border-border bg-card p-6 md:p-10 shadow-elegant"
      >
        <div className="pointer-events-none absolute inset-0 gradient-hero" />
        <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full gradient-aurora opacity-40 blur-3xl" />
        <div className="relative grid gap-8 md:grid-cols-[1fr_auto] md:items-center">
          <div className="min-w-0">
            <div className="mb-3 flex items-center gap-2">
              <Badge className="border-0 bg-primary/15 text-primary backdrop-blur-md">
                <Sparkles className="mr-1 h-3 w-3" /> Daily Edition
              </Badge>
              <Badge variant="outline" className="gap-1 border-border/60 bg-background/40">
                <Flame className="h-3 w-3 text-warning" /> {student.streak}-day streak
              </Badge>
            </div>
            <h1 className="font-display text-3xl font-semibold tracking-tight md:text-5xl">
              Welcome back, <span className="text-gradient">{studentName.split(" ")[0]}</span>
            </h1>
            <p className="mt-3 max-w-xl text-sm text-muted-foreground md:text-base">
              “The expert in anything was once a beginner.” Keep the momentum —
              you're 18% ahead of last week.
            </p>

            <div className="mt-6 max-w-md">
              <div className="mb-2 flex items-center justify-between text-xs">
                <span className="font-medium uppercase tracking-wider text-muted-foreground">
                  Weekly Learning Goal
                </span>
                <span className="font-semibold text-primary">{goalPct}%</span>
              </div>
              <Progress value={goalPct} className="h-2" />
              <div className="mt-2 text-xs text-muted-foreground">
                {student.xp.toLocaleString()} / {student.xpToNext.toLocaleString()} XP this week
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/dashboard/continue">
                <Button className="rounded-xl gradient-primary border-0 text-primary-foreground hover:opacity-90 shadow-glow">
                  <PlayCircle className="mr-2 h-4 w-4" /> Continue Learning
                </Button>
              </Link>
              <Link to="/dashboard/ai">
                <Button
                  variant="outline"
                  className="rounded-xl border-border/60 bg-background/40 backdrop-blur-md"
                >
                  <Sparkles className="mr-2 h-4 w-4" /> Ask AI Tutor
                </Button>
              </Link>
            </div>
          </div>

          {/* Floating XP ring */}
          <div className="relative hidden md:block">
            <div className="relative h-44 w-44 animate-float">
              <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
                <circle
                  cx="50"
                  cy="50"
                  r="44"
                  stroke="oklch(var(--foreground) / 0.08)"
                  strokeWidth="6"
                  fill="none"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="44"
                  fill="none"
                  strokeWidth="6"
                  strokeLinecap="round"
                  stroke="url(#xpgrad)"
                  strokeDasharray={`${(goalPct / 100) * 276.46} 276.46`}
                />
                <defs>
                  <linearGradient id="xpgrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="oklch(0.78 0.16 70)" />
                    <stop offset="100%" stopColor="oklch(0.7 0.18 295)" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 grid place-items-center text-center">
                <div>
                  <div className="font-display text-4xl font-semibold">Lv {student.level}</div>
                  <div className="mt-1 text-xs text-muted-foreground">{student.rank}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Stats */}
      <section className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        <StatCard
          label="Enrolled"
          value={stats.enrolled}
          icon={BookOpen}
          accent="primary"
          delay={0.05}
        />
        <StatCard
          label="Completed"
          value={stats.completed}
          icon={CheckCircle2}
          accent="success"
          delay={0.1}
          hint="+2 this week"
        />
        <StatCard
          label="Learning Hrs"
          value={stats.hours}
          icon={Clock}
          accent="accent"
          delay={0.15}
        />
        <StatCard
          label="Certificates"
          value={stats.certificates}
          icon={Award}
          accent="primary"
          delay={0.2}
        />
        <StatCard
          label="Quiz Avg"
          value={stats.quizAvg}
          suffix="%"
          icon={Trophy}
          accent="warning"
          delay={0.25}
        />
        <StatCard
          label="Streak"
          value={student.streak}
          suffix="days"
          icon={Flame}
          accent="accent"
          delay={0.3}
        />
      </section>

      {/* Continue Learning hero card */}
      <ContinueHero />

      {/* Charts row */}
      <section className="grid gap-6 lg:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="lg:col-span-2 rounded-2xl card-premium p-6"
        >
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="font-display text-xl font-semibold">Weekly Activity</h2>
              <p className="text-xs text-muted-foreground">Hours studied · last 7 days</p>
            </div>
            <Badge className="border-0 bg-success/15 text-success">
              <TrendingUp className="mr-1 h-3 w-3" /> +18%
            </Badge>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyActivity}>
                <defs>
                  <linearGradient id="actGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.78 0.16 70)" stopOpacity={0.6} />
                    <stop offset="100%" stopColor="oklch(0.78 0.16 70)" stopOpacity={0} />
                  </linearGradient>
                </defs>
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
                  cursor={{ stroke: "var(--border)", strokeWidth: 1 }}
                  contentStyle={{
                    background: "var(--card)",
                    color: "var(--card-foreground)",
                    border: "1px solid var(--border)",
                    borderRadius: 12,
                    boxShadow: "var(--shadow-md)",
                    padding: "8px 12px",
                  }}
                  labelStyle={{ display: "none" }}
                  itemStyle={{ color: "var(--card-foreground)", fontSize: 12, fontWeight: 600 }}
                  formatter={(value) => [`${value} hrs`, "Learning time"]}
                />
                <Area
                  type="monotone"
                  dataKey="hours"
                  stroke="oklch(0.78 0.16 70)"
                  strokeWidth={2.5}
                  fill="url(#actGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="rounded-2xl card-premium p-6"
        >
          <h2 className="font-display text-xl font-semibold">Topic Mastery</h2>
          <p className="text-xs text-muted-foreground">AI-analyzed skill coverage</p>
          <div className="mt-2 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={masteryRadar}>
                <PolarGrid stroke="oklch(1 0 0 / 0.08)" />
                <PolarAngleAxis
                  dataKey="topic"
                  tick={{ fill: "oklch(0.7 0.02 270)", fontSize: 11 }}
                />
                <PolarRadiusAxis angle={30} stroke="oklch(1 0 0 / 0.1)" tick={false} />
                <Radar
                  dataKey="score"
                  stroke="oklch(0.7 0.18 295)"
                  fill="oklch(0.7 0.18 295)"
                  fillOpacity={0.35}
                  strokeWidth={2}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </section>

      {/* Upcoming + Leaderboard */}
      <section className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-2xl card-premium p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-xl font-semibold">Upcoming</h2>
            <Link to="/dashboard/calendar" className="text-xs text-primary hover:underline">
              View calendar
            </Link>
          </div>
          <ul className="divide-y divide-border/60">
            {upcoming.map((u, i) => (
              <motion.li
                key={u.id}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-4 py-3"
              >
                <div
                  className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${u.type === "live" ? "gradient-accent text-accent-foreground" : u.type === "quiz" ? "gradient-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
                >
                  {u.type === "live" ? (
                    <PlayCircle className="h-5 w-5" />
                  ) : u.type === "quiz" ? (
                    <GraduationCap className="h-5 w-5" />
                  ) : (
                    <Clock className="h-5 w-5" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-medium">{u.title}</div>
                  <div className="text-xs text-muted-foreground">{u.date}</div>
                </div>
                <Button size="sm" variant="ghost" className="rounded-lg">
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </motion.li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl card-premium p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-xl font-semibold">Leaderboard</h2>
            <Badge className="border-0 bg-primary/15 text-primary">This week</Badge>
          </div>
          <ul className="space-y-3">
            {leaderboard.map((l) => (
              <li
                key={l.rank}
                className={`flex items-center gap-3 rounded-xl p-2 ${l.name === studentName ? "bg-primary/10 ring-1 ring-primary/30" : ""}`}
              >
                <div
                  className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg text-xs font-bold ${l.rank === 1 ? "gradient-primary text-primary-foreground" : "bg-muted text-foreground"}`}
                >
                  {l.rank}
                </div>
                <Avatar className="h-9 w-9">
                  <AvatarImage src={l.avatar} alt={l.name} />
                  <AvatarFallback>{l.name[0]}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">{l.name}</div>
                  <div className="text-xs text-muted-foreground">{l.xp.toLocaleString()} XP</div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Recommended */}
      <section>
        <div className="mb-4 flex items-end justify-between">
          <div>
            <h2 className="font-display text-2xl font-semibold">Recommended for you</h2>
            <p className="text-sm text-muted-foreground">AI-picked based on your goals</p>
          </div>
          <Link to="/dashboard/courses" className="text-sm text-primary hover:underline">
            Browse all
          </Link>
        </div>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {courses.slice(0, 3).map((c, i) => (
            <Link key={c.id} to="/dashboard/courses" className="block">
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ y: -4 }}
                className="overflow-hidden rounded-2xl card-premium"
              >
                <div className="relative aspect-[16/9] overflow-hidden">
                  <img
                    src={c.cover}
                    alt={c.title}
                    className="h-full w-full object-cover transition-transform duration-700 hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent" />
                  <Badge className="absolute left-3 top-3 border-0 bg-background/80 backdrop-blur-md">
                    {c.category}
                  </Badge>
                </div>
                <div className="p-4">
                  <div className="line-clamp-1 font-display text-base font-semibold">{c.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {c.instructor} · {c.duration}
                  </div>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
function ContinueHero() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function loadContinueLearning() {
      try {
        const enrollment = await learningApi.getContinueLearning();
        const course = enrollment?.course;
        const courseId = course?._id || course?.id || course;
        if (!courseId) {
          if (mounted) setData(null);
          return;
        }
        const modules = await learningApi.getCourseModules(courseId);
        if (!mounted) return;
        const lectures = (modules || []).flatMap((module) => (module.lectures || []).map((lecture) => ({ ...lecture, moduleTitle: module.title })));
        const lastLectureId = enrollment?.lastLecture?._id || enrollment?.lastLecture;
        const lecture = lectures.find((item) => String(item._id) === String(lastLectureId)) || lectures[0] || null;
        setData({ enrollment, course, courseId, lecture, totalLectures: lectures.length });
      } catch {
        if (mounted) setData(null);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    loadContinueLearning();
    return () => { mounted = false; };
  }, []);

  if (loading) return <div className="h-72 animate-pulse rounded-3xl bg-muted/40" />;
  if (!data) return null;

  const { enrollment, course, courseId, lecture, totalLectures } = data;
  const progress = Math.max(0, Math.min(100, Number(enrollment?.progress || 0)));
  const resumeUrl = lecture?._id ? `/dashboard/learn/${courseId}/${lecture._id}` : `/dashboard/learn/${courseId}`;
  const completedEstimate = totalLectures ? Math.round((progress / 100) * totalLectures) : 0;
  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="relative overflow-hidden rounded-3xl border border-border shadow-elegant"
    >
      <div className="grid md:grid-cols-[1.1fr_1fr]">
        <div className="relative aspect-[16/9] md:aspect-auto">
          <img src={assetUrl(course.thumbnail || course.image) || "/assets/images/course/course-1/1.png"} alt={course.title} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/40 to-transparent md:bg-gradient-to-r" />
          <Link to={resumeUrl} className="absolute inset-0 grid place-items-center" aria-label="Resume">
            <span className="grid h-20 w-20 place-items-center rounded-full gradient-primary shadow-glow animate-float">
              <PlayCircle className="h-10 w-10 text-primary-foreground" />
            </span>
          </Link>
        </div>
        <div className="relative bg-card p-6 md:p-10">
          <Badge className="mb-3 border-0 bg-accent/15 text-accent">
            Continue where you left off
          </Badge>
          <h2 className="font-display text-2xl font-semibold md:text-3xl">{course.title}</h2>
          <div className="mt-1 text-sm text-muted-foreground">{lecture?.moduleTitle || "Course content"}</div>
          <div className="mt-4 text-lg font-medium">{lecture?.title || "Start this course"}</div>

          <div className="mt-6 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Course progress</span>
              <span className="font-semibold text-primary">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
            <div className="text-xs text-muted-foreground">{completedEstimate}/{totalLectures} lectures completed</div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild className="rounded-xl gradient-primary border-0 text-primary-foreground shadow-glow hover:opacity-90">
              <Link to={resumeUrl}><PlayCircle className="mr-2 h-4 w-4" /> Resume lecture</Link>
            </Button>
            <Button asChild variant="outline" className="rounded-xl">
              <Link to={`/dashboard/learn/${courseId}`}>View syllabus</Link>
            </Button>
          </div>
        </div>
      </div>
    </motion.section>
  );
}

