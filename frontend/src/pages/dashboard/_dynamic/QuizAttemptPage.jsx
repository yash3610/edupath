import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Bookmark, Check, ChevronLeft, ChevronRight, Eraser, Menu, Timer, X } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { quizApi } from "@/services/quizApi";
import { PageLoader, unwrap } from "./LumaDynamicUtils";

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
  const [submitting, setSubmitting] = useState(false);
  const submittingRef = useRef(false);

  useEffect(() => {
    if (!data) quizApi.getAttempt(attemptId).then((result) => setData(unwrap(result))).catch((error) => toast.error(error.message || "Unable to load attempt"));
  }, [attemptId, data]);
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
    try {
      await quizApi.saveAnswer(attemptId, normalizePayload(question, value));
      setSaved("Auto-saved");
    } catch (error) {
      setSaved("Save failed");
      toast.error(error.message || "Answer save failed");
    }
  }
  async function markReview() {
    setReview((prev) => ({ ...prev, [question._id]: !prev[question._id] }));
    try {
      await quizApi.markReview(attemptId, normalizePayload(question, answers[question._id], true));
      toast.info("Question marked for review.");
    } catch (error) {
      toast.error(error.message || "Review mark failed");
    }
  }
  async function clearAnswer() {
    setAnswers((prev) => {
      const next = { ...prev };
      delete next[question._id];
      return next;
    });
    try {
      await quizApi.clearAnswer(attemptId, question._id);
      toast.info("Answer cleared.");
    } catch (error) {
      toast.error(error.message || "Clear failed");
    }
  }
  async function submit(auto = false) {
    if (submittingRef.current) return;
    submittingRef.current = true;
    setSubmitting(true);
    try {
      await quizApi.submitQuiz(attemptId);
      toast.success(auto ? "Timer ended, quiz auto-submitted." : "Quiz submitted successfully.");
      navigate(`/dashboard/quizzes/result/${attemptId}`, { replace: true });
    } catch (error) {
      submittingRef.current = false;
      setSubmitting(false);
      toast.error(error.message || "Submit failed");
    }
  }

  if (!question) return <PageLoader label="Loading quiz attempt" />;

  return (
    <div className="space-y-5">
      <header className="sticky top-[76px] z-20 rounded-2xl card-premium p-4 backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-primary">{saved}</p>
            <h1 className="text-xl font-semibold">{data.quiz.title}</h1>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={`rounded-full px-4 py-2 ${lowTime ? "bg-destructive text-destructive-foreground" : ""}`}>
              <Timer className="mr-2 h-4 w-4" /> {timeText}
            </Badge>
            <Button variant="outline" size="icon" className="lg:hidden" onClick={() => setDrawer(true)}><Menu className="h-5 w-5" /></Button>
            <Button onClick={() => setConfirm(true)} disabled={submitting}>{submitting ? "Submitting..." : "Submit"}</Button>
          </div>
        </div>
        <Progress value={progress} className="mt-4" />
      </header>

      {lowTime && <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm font-medium text-destructive">Less than 2 minutes remaining. Timer will auto-submit.</div>}

      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <main className="rounded-2xl card-premium p-5">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">Question {current + 1}/{questions.length}</Badge>
            <Badge variant="outline">{question.questionType}</Badge>
            <Badge variant="outline">{question.marks} marks</Badge>
          </div>
          <h2 className="mt-5 text-2xl font-semibold leading-tight">{question.questionText}</h2>
          <AnswerInput question={question} value={answers[question._id]} onChange={(value) => save(question._id, value)} />
          <div className="mt-6 flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => setCurrent(Math.max(0, current - 1))}><ChevronLeft className="mr-2 h-4 w-4" />Previous</Button>
            <Button onClick={() => setCurrent(Math.min(questions.length - 1, current + 1))}>Next<ChevronRight className="ml-2 h-4 w-4" /></Button>
            <Button variant="outline" onClick={markReview}><Bookmark className="mr-2 h-4 w-4" />Mark review</Button>
            <Button variant="ghost" onClick={clearAnswer}><Eraser className="mr-2 h-4 w-4" />Clear</Button>
          </div>
        </main>
        <Navigator questions={questions} answers={answers} review={review} current={current} setCurrent={setCurrent} progress={progress} timeText={timeText} />
      </div>

      {drawer && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur lg:hidden">
          <div className="ml-auto h-full w-[86vw] max-w-sm bg-background p-4">
            <Button variant="outline" size="icon" className="mb-3" onClick={() => setDrawer(false)}><X className="h-5 w-5" /></Button>
            <Navigator questions={questions} answers={answers} review={review} current={current} setCurrent={(i) => { setCurrent(i); setDrawer(false); }} progress={progress} timeText={timeText} mobile />
          </div>
        </div>
      )}
      {confirm && <ConfirmModal submitting={submitting} onCancel={() => setConfirm(false)} onSubmit={() => submit(false)} />}
    </div>
  );
}

function AnswerInput({ question, value, onChange }) {
  if (["fill-blank", "short-answer", "code"].includes(question.questionType)) {
    return <Textarea value={value || ""} onChange={(event) => onChange(event.target.value)} rows={question.questionType === "code" ? 8 : 4} className="mt-5" placeholder={question.questionType === "code" ? "Write code answer..." : "Type your answer..."} />;
  }
  const multiple = question.questionType === "multiple-choice";
  return (
    <div className="mt-5 grid gap-3 md:grid-cols-2">
      {(question.options || []).map((option, index) => {
        const label = option.label || String.fromCharCode(65 + index);
        const active = multiple ? (value || []).includes(label) : value === label;
        return (
          <button key={label} type="button" onClick={() => onChange(multiple ? toggle(value || [], label) : label)} className={`rounded-xl border p-4 text-left text-sm transition ${active ? "border-primary bg-primary/10 text-primary" : "border-border bg-muted/25"}`}>
            <span className="mr-2 rounded-lg bg-background px-2 py-1 font-semibold">{label}</span>{option.text || option}
          </button>
        );
      })}
    </div>
  );
}

function Navigator({ questions, answers, review, current, setCurrent, progress, timeText, mobile = false }) {
  return (
    <aside className={`${mobile ? "block" : "hidden lg:block"} rounded-2xl card-premium p-5`}>
      <div className="flex items-center justify-between"><h2 className="font-semibold">Navigator</h2><span className="text-sm font-semibold text-primary">{timeText}</span></div>
      <Progress value={progress} className="mt-4" />
      <div className="mt-5 grid grid-cols-5 gap-2">
        {questions.map((q, index) => <button key={q._id} type="button" onClick={() => setCurrent(index)} className={`h-11 rounded-xl text-sm font-semibold ${current === index ? "bg-primary text-primary-foreground" : review[q._id] ? "bg-warning/15 text-warning" : answers[q._id] ? "bg-success/15 text-success" : "bg-muted text-muted-foreground"}`}>{index + 1}</button>)}
      </div>
      <div className="mt-5 grid gap-2 text-xs text-muted-foreground"><span>Green: Answered</span><span>Amber: Review</span><span>Grey: Unanswered</span></div>
    </aside>
  );
}

function ConfirmModal({ onCancel, onSubmit, submitting = false }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-background/80 p-4 backdrop-blur">
      <div className="w-full max-w-md rounded-2xl card-premium p-6">
        <Check className="h-9 w-9 text-primary" />
        <h2 className="mt-4 text-2xl font-semibold">Submit quiz?</h2>
        <p className="mt-2 text-sm text-muted-foreground">Once submitted, answers cannot be edited.</p>
        <div className="mt-6 flex gap-2">
          <Button variant="outline" onClick={onCancel} disabled={submitting} className="flex-1">Cancel</Button>
          <Button onClick={onSubmit} disabled={submitting} className="flex-1">{submitting ? "Submitting..." : "Submit"}</Button>
        </div>
      </div>
    </div>
  );
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
