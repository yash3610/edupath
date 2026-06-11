import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  Clock3,
  Compass,
  Flag,
  LockKeyhole,
  Play,
  Route,
  Sparkles,
  Target,
  Trophy,
} from "lucide-react";
import { MotionCard, ProgressBar } from "../../components/dashboard/DashboardPrimitives.jsx";
import { learningApi } from "../../services/learningApi.js";

const suggestedPaths = [
  {
    title: "Frontend Developer",
    description: "Build responsive interfaces with HTML, CSS, JavaScript, and React.",
    courses: 6,
    duration: "12 weeks",
    level: "Beginner",
    icon: "code",
    accent: "from-[#ff723a] to-[#ffb35c]",
  },
  {
    title: "Data Analyst",
    description: "Turn raw data into clear business insights and visual stories.",
    courses: 5,
    duration: "10 weeks",
    level: "Intermediate",
    icon: "chart",
    accent: "from-[#705cf6] to-[#9b8cff]",
  },
  {
    title: "AI Product Builder",
    description: "Learn practical AI tools, prompting, automation, and product thinking.",
    courses: 7,
    duration: "14 weeks",
    level: "Intermediate",
    icon: "sparkles",
    accent: "from-[#0fa98a] to-[#57d4b7]",
  },
];

export default function LearningPathsPage() {
  const navigate = useNavigate();
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    learningApi.getMyCourses().then(setEnrollments).finally(() => setLoading(false));
  }, []);

  const courses = useMemo(() => enrollments.map(normalizeEnrollment), [enrollments]);
  const overallProgress = courses.length
    ? Math.round(courses.reduce((total, course) => total + course.progress, 0) / courses.length)
    : 0;
  const completed = courses.filter((course) => course.progress >= 100).length;
  const totalHours = courses.reduce((total, course) => total + durationToHours(course.duration), 0);
  const nextCourse = courses.find((course) => course.progress < 100) || courses[0];

  return (
    <div className="space-y-5 sm:space-y-6">
      <section className="relative overflow-hidden rounded-[24px] border border-orange-100 bg-gradient-to-br from-[#fff8f3] via-[#fffaf7] to-[#fff0e5] px-5 py-6 text-[#1f1c35] shadow-[0_20px_60px_rgba(255,114,58,0.12)] dark:border-orange-500/20 dark:from-[#2a1d1a] dark:via-[#231c20] dark:to-[#332019] dark:text-white sm:px-7 sm:py-8 lg:px-9">
        <div className="absolute -right-14 -top-20 h-64 w-64 rounded-full bg-[#ff723a]/20 blur-3xl" />
        <div className="absolute bottom-0 right-[24%] h-32 w-32 rounded-full bg-[#fec961]/25 blur-2xl" />
        <div className="relative grid gap-6 lg:grid-cols-[1fr_310px] lg:items-center">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white/75 px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#ff723a] dark:border-white/10 dark:bg-white/10 dark:text-[#ffd2bd]">
              <Sparkles className="h-3.5 w-3.5" />
              Personalized journey
            </span>
            <h1 className="mt-4 max-w-2xl text-2xl font-extrabold leading-tight tracking-[-0.035em] sm:text-3xl lg:text-[36px]">
              Your roadmap from learning to career ready
            </h1>
            <p className="mt-3 max-w-2xl text-sm font-medium leading-6 text-slate-600 dark:text-white/65 sm:text-base">
              Follow each milestone in order, track your progress, and always know what to learn next.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <button
                onClick={() => nextCourse && navigate(`/dashboard/learn/${nextCourse.id}`)}
                disabled={!nextCourse}
                className="inline-flex items-center gap-2 rounded-xl bg-[#ff723a] px-5 py-3 text-sm font-extrabold text-white transition hover:bg-[#ff6428] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Play className="h-4 w-4 fill-current" />
                {nextCourse ? "Continue roadmap" : "Explore courses"}
              </button>
              <button onClick={() => navigate("/dashboard/courses")} className="inline-flex items-center gap-2 rounded-xl border border-orange-200 bg-white/80 px-5 py-3 text-sm font-extrabold text-[#1f1c35] transition hover:border-orange-300 hover:bg-white dark:border-white/20 dark:bg-white/10 dark:text-white dark:hover:bg-white/15">
                View my courses <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="rounded-[22px] border border-orange-100 bg-white/75 p-5 shadow-[0_12px_35px_rgba(255,114,58,0.08)] backdrop-blur-sm dark:border-white/10 dark:bg-white/[0.08]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-slate-400 dark:text-white/50">Path progress</p>
                <p className="mt-2 text-4xl font-black">{overallProgress}%</p>
              </div>
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#ff723a] text-white shadow-lg shadow-orange-950/20">
                <Route className="h-7 w-7" />
              </div>
            </div>
            <div className="mt-5 h-2.5 overflow-hidden rounded-full bg-orange-100 dark:bg-white/10">
              <div className="h-full rounded-full bg-gradient-to-r from-[#ff723a] to-[#fec961] transition-all duration-700" style={{ width: `${overallProgress}%` }} />
            </div>
            <div className="mt-4 flex items-center justify-between text-xs font-bold text-slate-500 dark:text-white/60">
              <span>{completed} of {courses.length} courses completed</span>
              <span>{Math.max(courses.length - completed, 0)} remaining</span>
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat icon={BookOpen} label="Courses" value={courses.length} color="orange" />
        <Stat icon={CheckCircle2} label="Completed" value={completed} color="green" />
        <Stat icon={Clock3} label="Learning time" value={`${totalHours || 0}h`} color="purple" />
        <Stat icon={Target} label="Current goal" value={`${overallProgress}%`} color="blue" />
      </div>

      <div className="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1fr)_330px]">
        <MotionCard className="overflow-hidden p-0">
          <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-5 dark:border-white/10 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div>
              <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#ff723a]">Active roadmap</p>
              <h2 className="mt-1 text-xl font-extrabold tracking-[-0.02em]">Your learning milestones</h2>
            </div>
            <span className="w-fit rounded-full bg-[#fff1e8] px-3 py-1.5 text-xs font-extrabold text-[#ff723a] dark:bg-orange-500/10">
              {courses.length} milestones
            </span>
          </div>

          <div className="p-4 sm:p-6">
            {loading && (
              <div className="space-y-4">
                {[1, 2, 3].map((item) => <div key={item} className="h-28 animate-pulse rounded-2xl bg-slate-100 dark:bg-white/10" />)}
              </div>
            )}

            {!loading && courses.length > 0 && (
              <div>
                {courses.map((course, index) => {
                  const isComplete = course.progress >= 100;
                  const isCurrent = !isComplete && course.id === nextCourse?.id;
                  return (
                    <div key={course.id} className="relative flex min-w-0 gap-3 pb-5 last:pb-0 sm:gap-4">
                      {index < courses.length - 1 && <div className={`absolute left-[19px] top-10 h-[calc(100%-24px)] w-0.5 sm:left-[23px] ${isComplete ? "bg-emerald-300" : "bg-slate-200 dark:bg-white/10"}`} />}
                      <div className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border-4 border-white sm:h-12 sm:w-12 dark:border-slate-900 ${isComplete ? "bg-emerald-500 text-white" : isCurrent ? "bg-[#ff723a] text-white shadow-lg shadow-orange-200" : "bg-slate-100 text-slate-400 dark:bg-white/10"}`}>
                        {isComplete ? <Check className="h-5 w-5 stroke-[3]" /> : isCurrent ? <Play className="h-4 w-4 fill-current" /> : <LockKeyhole className="h-4 w-4" />}
                      </div>
                      <div className={`min-w-0 flex-1 rounded-2xl border p-4 ${isCurrent ? "border-orange-200 bg-[#fffaf6] dark:border-orange-500/30 dark:bg-orange-500/5" : "border-slate-100 bg-slate-50/60 dark:border-white/10 dark:bg-white/[0.03]"}`}>
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-slate-400">Milestone {index + 1}</p>
                              {isCurrent && <span className="rounded-full bg-[#ff723a] px-2 py-0.5 text-[9px] font-black uppercase text-white">Current</span>}
                            </div>
                            <h3 className="mt-1 truncate text-base font-extrabold sm:text-lg">{course.title}</h3>
                            <p className="mt-1 text-xs font-bold text-slate-500 dark:text-slate-400">{course.instructor} · {course.duration}</p>
                          </div>
                          <button
                            onClick={() => navigate(`/dashboard/learn/${course.id}`)}
                            className={`shrink-0 rounded-xl px-4 py-2.5 text-xs font-extrabold ${isCurrent ? "bg-[#ff723a] text-white" : "bg-white text-slate-700 shadow-sm dark:bg-white/10 dark:text-white"}`}
                          >
                            {isComplete ? "Review" : course.progress > 0 ? "Continue" : "Start"}
                          </button>
                        </div>
                        <div className="mt-4">
                          <div className="mb-2 flex justify-between text-[11px] font-extrabold text-slate-400"><span>Course progress</span><span>{course.progress}%</span></div>
                          <ProgressBar value={course.progress} color={isComplete ? "from-emerald-500 to-emerald-400" : undefined} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {!loading && courses.length === 0 && (
              <div className="py-10 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#fff1e8] text-[#ff723a]"><Compass className="h-7 w-7" /></div>
                <h3 className="mt-4 text-lg font-extrabold">Build your first roadmap</h3>
                <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">Enroll in a course and it will appear here as your first learning milestone.</p>
                <button onClick={() => navigate("/course")} className="mt-5 rounded-xl bg-[#ff723a] px-5 py-3 text-sm font-extrabold text-white">Browse courses</button>
              </div>
            )}
          </div>
        </MotionCard>

        <div className="space-y-5">
          <MotionCard className="bg-gradient-to-br from-[#fff8f3] to-white dark:from-orange-500/10 dark:to-slate-900">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#ff723a] text-white"><Trophy className="h-5 w-5" /></div>
            <p className="mt-4 text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#ff723a]">Next achievement</p>
            <h3 className="mt-1 text-lg font-extrabold">Roadmap Explorer</h3>
            <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">Complete {Math.max(3 - completed, 0)} more courses to unlock this milestone.</p>
            <div className="mt-4"><ProgressBar value={Math.min((completed / 3) * 100, 100)} /></div>
            <p className="mt-2 text-right text-xs font-extrabold text-slate-400">{Math.min(completed, 3)}/3 courses</p>
          </MotionCard>

          <MotionCard>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600 dark:bg-violet-500/10"><Flag className="h-5 w-5" /></div>
              <div>
                <p className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-slate-400">Weekly target</p>
                <h3 className="font-extrabold">5 learning hours</h3>
              </div>
            </div>
            <div className="mt-5 grid grid-cols-7 gap-1.5">
              {["M", "T", "W", "T", "F", "S", "S"].map((day, index) => (
                <div key={`${day}-${index}`} className="text-center">
                  <span className={`mx-auto block h-8 w-full max-w-8 rounded-lg ${index < 4 ? "bg-[#ff723a]" : "bg-slate-100 dark:bg-white/10"}`} />
                  <span className="mt-1.5 block text-[10px] font-extrabold text-slate-400">{day}</span>
                </div>
              ))}
            </div>
            <p className="mt-4 text-xs font-bold text-slate-500">3h 20m completed this week</p>
          </MotionCard>
        </div>
      </div>

      <section>
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#ff723a]">Discover</p>
            <h2 className="mt-1 text-xl font-extrabold tracking-[-0.02em] sm:text-2xl">Recommended career paths</h2>
          </div>
          <button onClick={() => navigate("/course")} className="flex w-fit items-center gap-1.5 text-sm font-extrabold text-[#ff723a]">Explore all courses <ArrowRight className="h-4 w-4" /></button>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {suggestedPaths.map((path, index) => (
            <MotionCard key={path.title} delay={index * 0.06} className="group overflow-hidden p-0">
              <div className={`h-2 bg-gradient-to-r ${path.accent}`} />
              <div className="p-5 sm:p-6">
                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br text-white ${path.accent}`}>
                  {path.icon === "sparkles" ? <Sparkles className="h-6 w-6" /> : path.icon === "chart" ? <Target className="h-6 w-6" /> : <Route className="h-6 w-6" />}
                </div>
                <h3 className="mt-4 text-lg font-extrabold">{path.title}</h3>
                <p className="mt-2 min-h-12 text-sm leading-6 text-slate-500 dark:text-slate-400">{path.description}</p>
                <div className="mt-4 flex flex-wrap gap-2 text-[11px] font-extrabold">
                  <span className="rounded-lg bg-slate-100 px-2.5 py-1.5 dark:bg-white/10">{path.courses} courses</span>
                  <span className="rounded-lg bg-slate-100 px-2.5 py-1.5 dark:bg-white/10">{path.duration}</span>
                  <span className="rounded-lg bg-slate-100 px-2.5 py-1.5 dark:bg-white/10">{path.level}</span>
                </div>
                <button onClick={() => navigate("/course")} className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-sm font-extrabold text-white transition group-hover:bg-[#ff723a] dark:bg-white dark:text-slate-950">
                  View path <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </MotionCard>
          ))}
        </div>
      </section>
    </div>
  );
}

function normalizeEnrollment(enrollment) {
  const course = enrollment.course || enrollment;
  return {
    id: course._id || course.id,
    title: course.title || "Untitled course",
    instructor: course.instructor?.name || course.instructor || "EduPath Instructor",
    duration: course.duration || "Self paced",
    progress: Math.min(100, Math.max(0, Number(enrollment.progress ?? course.progress ?? 0))),
  };
}

function durationToHours(value) {
  const match = String(value || "").match(/(\d+(?:\.\d+)?)\s*(?:h|hour)/i);
  return match ? Number(match[1]) : 0;
}

function Stat({ icon: Icon, label, value, color }) {
  const colors = {
    orange: "bg-orange-50 text-[#ff723a] dark:bg-orange-500/10",
    green: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10",
    purple: "bg-violet-50 text-violet-600 dark:bg-violet-500/10",
    blue: "bg-sky-50 text-sky-600 dark:bg-sky-500/10",
  };

  return (
    <MotionCard className="p-3.5 sm:p-4">
      <div className="flex min-h-12 items-center gap-3">
        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${colors[color]}`}><Icon className="h-5 w-5" /></span>
        <div className="min-w-0">
          <p className="truncate text-[10px] font-extrabold uppercase tracking-[0.12em] text-slate-400 sm:text-[11px]">{label}</p>
          <p className="mt-0.5 text-xl font-black leading-none">{value}</p>
        </div>
      </div>
    </MotionCard>
  );
}
