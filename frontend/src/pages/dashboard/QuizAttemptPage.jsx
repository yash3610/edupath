import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Bookmark, Check, ChevronLeft, ChevronRight, Eraser, Menu, Save, Timer, X } from "lucide-react";
import { ProgressBar } from "../../components/dashboard/DashboardPrimitives.jsx";
import { quizApi } from "../../services/quizApi.js";

export default function QuizAttemptPage() {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [data, setData] = useState(location.state || null);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [review, setReview] = useState({});
  const [saved, setSaved] = useState("Auto-saved");
  const [confirm, setConfirm] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [seconds, setSeconds] = useState(18 * 60);

  useEffect(() => { if (!data) quizApi.getAttempt(attemptId).then(setData); }, [attemptId, data]);
  useEffect(() => { if (data?.quiz?.duration) setSeconds(data.quiz.duration * 60); }, [data?.quiz?.duration]);
  useEffect(() => {
    if (!data) return undefined;
    const timer = setInterval(() => setSeconds((value) => {
      if (value <= 1) {
        clearInterval(timer);
        submit(true);
        return 0;
      }
      return value - 1;
    }), 1000);
    return () => clearInterval(timer);
  }, [data]);

  const questions = data?.quiz?.questions || [];
  const question = questions[current];
  const progress = questions.length ? Math.round((Object.keys(answers).length / questions.length) * 100) : 0;
  const lowTime = seconds <= 120;
  const timeText = `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;

  async function save(questionId, value) {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
    setSaved("Saving...");
    await quizApi.saveAnswer(attemptId, normalizePayload(question, value));
    setSaved("Auto-saved");
  }
  async function markReview() {
    setReview((prev) => ({ ...prev, [question._id]: !prev[question._id] }));
    await quizApi.markReview(attemptId, normalizePayload(question, answers[question._id], true));
  }
  async function clearAnswer() {
    setAnswers((prev) => { const next = { ...prev }; delete next[question._id]; return next; });
    await quizApi.clearAnswer(attemptId, question._id);
  }
  async function submit(auto = false) {
    await quizApi.submitQuiz(attemptId);
    navigate(`/dashboard/quizzes/result/${attemptId}`, { replace: true });
  }

  if (!question) return <div className="h-80 animate-pulse rounded-[28px] bg-slate-200 dark:bg-white/10" />;

  return (
    <div className="space-y-5">
      <header className="sticky top-[76px] z-20 rounded-[24px] border border-slate-200 bg-white/95 p-4 shadow-sm backdrop-blur dark:border-white/10 dark:bg-slate-900/95">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#ff6b35]">{saved}</p>
            <h2 className="text-xl font-black">{data.quiz.title}</h2>
          </div>
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-black ${lowTime ? "bg-rose-100 text-rose-700" : "bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-white"}`}><Timer className="h-4 w-4" /> {timeText}</span>
            <button onClick={() => setDrawer(true)} className="rounded-2xl border border-slate-200 p-2.5 dark:border-white/10 lg:hidden"><Menu className="h-5 w-5" /></button>
            <button onClick={() => setConfirm(true)} className="rounded-2xl bg-slate-950 px-4 py-2.5 text-sm font-black text-white dark:bg-white dark:text-slate-950">Submit</button>
          </div>
        </div>
        <div className="mt-4"><ProgressBar value={progress} /></div>
      </header>

      {lowTime && <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-black text-rose-700">Warning: less than 2 minutes remaining. Timer will auto-submit.</div>}

      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <motion.main initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-slate-900">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-[#ff6b35]/10 px-3 py-1 text-xs font-black text-[#ff6b35]">Question {current + 1}/{questions.length}</span>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-500 dark:bg-white/10">{question.questionType}</span>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-500 dark:bg-white/10">{question.marks} marks</span>
          </div>
          <h3 className="mt-5 text-2xl font-black leading-tight">{question.questionText}</h3>
          <AnswerInput question={question} value={answers[question._id]} onChange={(value) => save(question._id, value)} />
          <div className="mt-6 flex flex-wrap gap-2">
            <button onClick={() => setCurrent(Math.max(0, current - 1))} className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-black dark:border-white/10"><ChevronLeft className="h-4 w-4" /> Previous</button>
            <button onClick={() => setCurrent(Math.min(questions.length - 1, current + 1))} className="inline-flex items-center gap-2 rounded-2xl bg-[#ff6b35] px-4 py-3 text-sm font-black text-white">Next <ChevronRight className="h-4 w-4" /></button>
            <button onClick={markReview} className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-black dark:border-white/10"><Bookmark className="h-4 w-4" /> Mark review</button>
            <button onClick={clearAnswer} className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-black dark:border-white/10"><Eraser className="h-4 w-4" /> Clear</button>
          </div>
        </motion.main>
        <Navigator questions={questions} answers={answers} review={review} current={current} setCurrent={setCurrent} progress={progress} timeText={timeText} />
      </div>

      <AnimatePresence>{drawer && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-slate-950/50 lg:hidden"><div className="ml-auto h-full w-[86vw] max-w-sm bg-white p-4 dark:bg-slate-900"><button className="mb-3 rounded-xl border p-2 dark:border-white/10" onClick={() => setDrawer(false)}><X className="h-5 w-5" /></button><Navigator questions={questions} answers={answers} review={review} current={current} setCurrent={(i) => { setCurrent(i); setDrawer(false); }} progress={progress} timeText={timeText} mobile /></div></motion.div>}</AnimatePresence>
      {confirm && <ConfirmModal onCancel={() => setConfirm(false)} onSubmit={() => submit(false)} />}
    </div>
  );
}

function AnswerInput({ question, value, onChange }) {
  if (["fill-blank", "short-answer", "code"].includes(question.questionType)) {
    const isCode = question.questionType === "code";
    return <textarea value={value || ""} onChange={(event) => onChange(event.target.value)} rows={isCode ? 8 : 4} className="mt-5 w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 font-bold outline-none focus:border-[#ff6b35] dark:border-white/10 dark:bg-white/5" placeholder={isCode ? "Write code answer..." : "Type your answer..."} />;
  }
  const multiple = question.questionType === "multiple-choice";
  return (
    <div className="mt-5 grid gap-3 md:grid-cols-2">
      {question.options.map((option) => {
        const active = multiple ? (value || []).includes(option.label) : value === option.label;
        return <button key={option.label} onClick={() => onChange(multiple ? toggle(value || [], option.label) : option.label)} className={`rounded-2xl border p-4 text-left text-sm font-black transition ${active ? "border-[#ff6b35] bg-orange-50 text-[#ff6b35] dark:bg-orange-500/10" : "border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-white/5"}`}><span className="mr-2 rounded-lg bg-white px-2 py-1 shadow-sm dark:bg-slate-900">{option.label}</span>{option.text}</button>;
      })}
    </div>
  );
}

function Navigator({ questions, answers, review, current, setCurrent, progress, timeText, mobile = false }) {
  return (
    <aside className={`${mobile ? "block" : "hidden lg:block"} rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-slate-900`}>
      <div className="flex items-center justify-between"><h3 className="font-black">Navigator</h3><span className="text-sm font-black text-[#ff6b35]">{timeText}</span></div>
      <div className="mt-4"><ProgressBar value={progress} /></div>
      <div className="mt-5 grid grid-cols-5 gap-2">
        {questions.map((q, index) => <button key={q._id} onClick={() => setCurrent(index)} className={`h-11 rounded-xl text-sm font-black ${current === index ? "bg-slate-950 text-white dark:bg-white dark:text-slate-950" : review[q._id] ? "bg-amber-100 text-amber-700" : answers[q._id] ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500 dark:bg-white/10 dark:text-slate-300"}`}>{index + 1}</button>)}
      </div>
      <div className="mt-5 grid gap-2 text-xs font-black text-slate-500"><span>Green: Answered</span><span>Amber: Review</span><span>Grey: Unanswered</span></div>
    </aside>
  );
}

function ConfirmModal({ onCancel, onSubmit }) {
  return <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/55 p-4"><div className="w-full max-w-md rounded-[28px] bg-white p-6 shadow-2xl dark:bg-slate-900"><Check className="h-9 w-9 text-[#ff6b35]" /><h3 className="mt-4 text-2xl font-black">Submit quiz?</h3><p className="mt-2 text-sm font-bold text-slate-500">Once submitted, answers cannot be edited.</p><div className="mt-6 flex gap-2"><button onClick={onCancel} className="flex-1 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-black dark:border-white/10">Cancel</button><button onClick={onSubmit} className="flex-1 rounded-2xl bg-[#ff6b35] px-4 py-3 text-sm font-black text-white">Submit</button></div></div></div>;
}

function toggle(list, item) {
  return list.includes(item) ? list.filter((value) => value !== item) : [...list, item];
}

function normalizePayload(question, value, markedForReview = false) {
  const payload = { questionId: question._id, markedForReview };
  if (question.questionType === "multiple-choice") payload.selectedOptions = value || [];
  else if (["fill-blank", "short-answer"].includes(question.questionType)) payload.textAnswer = value || "";
  else if (question.questionType === "code") payload.codeAnswer = value || "";
  else payload.selectedOption = value || "";
  return payload;
}
