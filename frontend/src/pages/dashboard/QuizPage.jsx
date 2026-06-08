import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle2, Clock3, Lock, PlayCircle, RotateCcw, Sparkles } from "lucide-react";
import { ProgressBar } from "../../components/dashboard/DashboardPrimitives.jsx";
import { EmptyState, QuizHero, QuizMetric, SearchBox, StatusPill } from "../../components/dashboard/quiz/QuizShell.jsx";
import { quizApi } from "../../services/quizApi.js";

const tabs = ["All", "Available", "Completed", "Failed", "Locked"];

export default function QuizPage() {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("All");
  const [difficulty, setDifficulty] = useState("all");
  const [course, setCourse] = useState("all");

  useEffect(() => {
    quizApi.getStudentQuizzes().then(setQuizzes).finally(() => setLoading(false));
  }, []);

  const courses = [...new Map(quizzes.map((quiz) => [quiz.course?._id || quiz.course?.title, quiz.course])).values()].filter(Boolean);
  const filtered = useMemo(() => quizzes.filter((quiz) => {
    const status = quiz.status || "Not Started";
    const tabMatch = tab === "All" || (tab === "Available" ? ["Not Started", "In Progress"].includes(status) : tab === "Completed" ? status === "Passed" : status === tab);
    const difficultyMatch = difficulty === "all" || quiz.difficulty === difficulty;
    const courseMatch = course === "all" || quiz.course?._id === course;
    const searchMatch = `${quiz.title} ${quiz.course?.title}`.toLowerCase().includes(search.toLowerCase());
    return tabMatch && difficultyMatch && courseMatch && searchMatch;
  }), [quizzes, tab, difficulty, course, search]);

  return (
    <div className="space-y-6">
      <QuizHero
        title="Sharpen skills with timed, secure quizzes."
        subtitle="Track attempts, unlock course assessments, review answers, and retake quizzes when attempts are available."
        action={<Link to="/dashboard/quizzes/history/quiz-react-hooks" className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-black text-slate-950 shadow-lg"><Sparkles className="h-4 w-4 text-[#ff6b35]" /> View History</Link>}
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <QuizMetric icon={PlayCircle} label="Available" value={quizzes.filter((q) => ["Not Started", "In Progress"].includes(q.status)).length} />
        <QuizMetric icon={CheckCircle2} label="Completed" value={quizzes.filter((q) => q.status === "Passed").length} />
        <QuizMetric icon={RotateCcw} label="Retakes Left" value={quizzes.reduce((sum, q) => sum + Math.max(0, (q.attemptsAllowed || 0) - (q.attemptsUsed || 0)), 0)} />
        <QuizMetric icon={Lock} label="Locked" value={quizzes.filter((q) => q.status === "Locked").length} />
      </div>

      <div className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-slate-900">
        <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h3 className="text-lg font-black">Student quiz center</h3>
            <p className="text-sm font-bold text-slate-500 dark:text-slate-300">Find available quizzes, continue attempts, and review completed results.</p>
          </div>
        </div>
        <div className="grid gap-3 xl:grid-cols-[1fr_auto_auto]">
          <SearchBox value={search} onChange={setSearch} />
          <select value={course} onChange={(event) => setCourse(event.target.value)} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-black outline-none dark:border-white/10 dark:bg-slate-900">
            <option value="all">All courses</option>
            {courses.map((item) => <option key={item._id || item.title} value={item._id}>{item.title}</option>)}
          </select>
          <select value={difficulty} onChange={(event) => setDifficulty(event.target.value)} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-black outline-none dark:border-white/10 dark:bg-slate-900">
            <option value="all">All difficulty</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>
        <div className="mt-4 flex gap-2 overflow-x-auto">
          {tabs.map((item) => (
            <button key={item} onClick={() => setTab(item)} className={`shrink-0 rounded-xl px-4 py-2 text-sm font-black ${tab === item ? "bg-[#ff6b35] text-white" : "bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300"}`}>
              {item}
            </button>
          ))}
        </div>
      </div>

      {loading ? <div className="grid gap-4 lg:grid-cols-2">{[1, 2, 3, 4].map((i) => <div key={i} className="h-64 animate-pulse rounded-[28px] bg-slate-200 dark:bg-white/10" />)}</div> : filtered.length ? (
        <div className="grid gap-5 xl:grid-cols-2">
          {filtered.map((quiz, index) => <QuizCard key={quiz._id} quiz={quiz} delay={index * 0.04} />)}
        </div>
      ) : <EmptyState />}
    </div>
  );
}

function QuizCard({ quiz, delay }) {
  const locked = quiz.status === "Locked";
  const complete = quiz.status === "Passed";
  const cta = locked ? "Locked" : quiz.status === "In Progress" ? "Continue" : complete ? "View Result" : "Start Quiz";
  const href = complete ? `/dashboard/quizzes/result/${quiz.latestAttemptId || "attempt-local"}` : `/dashboard/quizzes/${quiz._id}/instructions`;

  return (
    <motion.article initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }} className="group overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl dark:border-white/10 dark:bg-slate-900">
      <div className="grid gap-0 md:grid-cols-[190px_1fr]">
        <div className="relative min-h-52 overflow-hidden md:min-h-full">
          <img src={quiz.course?.thumbnail || "/assets/images/course/course-1/1.png"} alt={quiz.course?.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/10 to-transparent" />
          <div className="absolute bottom-4 left-4 right-4">
            <p className="line-clamp-2 text-sm font-black text-white">{quiz.course?.title}</p>
            <p className="mt-1 text-xs font-bold text-white/70">{quiz.difficulty} level</p>
          </div>
        </div>
        <div className="min-w-0 p-5">
          <div className="flex flex-wrap items-center gap-2">
            <StatusPill status={quiz.status || "Not Started"} />
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black uppercase text-slate-500 dark:bg-white/10 dark:text-slate-300">{quiz.difficulty}</span>
            {complete && <span className="rounded-full bg-[#ff6b35]/10 px-3 py-1 text-xs font-black text-[#ff6b35]">Completion badge</span>}
          </div>
          <h3 className="mt-3 text-xl font-black leading-tight">{quiz.title}</h3>
          <p className="mt-2 line-clamp-2 text-sm font-bold text-slate-500 dark:text-slate-300">{quiz.description || "Secure course assessment with timer, attempt tracking, and result review."}</p>
          <div className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
            <Mini label="Questions" value={quiz.totalQuestions || quiz.questions?.length || 0} />
            <Mini label="Marks" value={`${quiz.totalMarks}/${quiz.passingMarks}`} />
            <Mini label="Duration" value={`${quiz.duration || quiz.durationMinutes}m`} />
            <Mini label="Attempts" value={`${quiz.attemptsUsed || 0}/${quiz.attemptsAllowed}`} />
          </div>
          <div className="mt-4">
            <div className="mb-2 flex items-center justify-between text-xs font-black text-slate-500"><span>Progress</span><span>{quiz.progress || 0}%</span></div>
            <ProgressBar value={quiz.progress || (complete ? 100 : 0)} />
          </div>
          <Link to={locked ? "#" : href} className={`mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-black sm:w-auto ${locked ? "pointer-events-none bg-slate-200 text-slate-500 dark:bg-white/10" : "bg-[#ff6b35] text-white shadow-lg shadow-orange-500/20"}`}>
            {locked ? <Lock className="h-4 w-4" /> : <Clock3 className="h-4 w-4" />} {cta}
          </Link>
        </div>
      </div>
    </motion.article>
  );
}

function Mini({ label, value }) {
  return <div className="rounded-2xl bg-slate-50 p-3 dark:bg-white/5"><p className="text-[11px] font-black uppercase text-slate-400">{label}</p><p className="mt-1 font-black">{value}</p></div>;
}
