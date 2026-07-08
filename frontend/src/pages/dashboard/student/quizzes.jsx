import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock,
  Eye,
  HelpCircle,
  Play,
  RefreshCcw,
  Trophy,
  XCircle,
} from "lucide-react";
import { PageHeader } from "@/features/student/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { quizApi } from "@/services/quizApi";
import { toast } from "sonner";

const quizId = (quiz) => quiz?._id || quiz?.id;

const normalizeQuiz = (quiz) => ({
  ...quiz,
  id: quizId(quiz),
  courseTitle: quiz.course?.title || quiz.courseTitle || "Course",
  totalQuestions: quiz.totalQuestions || quiz.questions?.length || 0,
  durationMinutes: quiz.duration || quiz.durationMinutes || 15,
  best: quiz.bestScore || quiz.best || 0,
  attemptsUsed: quiz.attemptsUsed || 0,
  attemptsAllowed: quiz.attemptsAllowed || 1,
  attemptsRemaining: quiz.attemptsRemaining ?? Math.max(0, (quiz.attemptsAllowed || 1) - (quiz.attemptsUsed || 0)),
  canAttempt: quiz.canAttempt ?? true,
});

export default function QuizzesPage() {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState(null);
  const [activeDirty, setActiveDirty] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const result = await quizApi.getStudentQuizzes();
      const nextQuizzes = (result.data || []).map(normalizeQuiz);
      setQuizzes(nextQuizzes);
      return nextQuizzes;
    } catch (error) {
      toast.error("Unable to load quizzes", {
        description: error.message || "Please refresh and try again.",
      });
      return [];
    } finally {
      setLoading(false);
    }
  };

  const markSubmitted = (quiz, attemptResult) => {
    const nextAttemptsUsed = (quiz.attemptsUsed || 0) + 1;
    const nextAttemptsRemaining = Math.max(0, (quiz.attemptsAllowed || 1) - nextAttemptsUsed);
    const passed = attemptResult?.isPassed || attemptResult?.status === "passed";
    setActiveDirty(true);
    setQuizzes((current) =>
      current.map((item) =>
        item.id === quiz.id
          ? {
              ...item,
              attemptsUsed: nextAttemptsUsed,
              attemptsRemaining: nextAttemptsRemaining,
              canAttempt: nextAttemptsRemaining > 0,
              latestAttemptId: attemptResult?._id || item.latestAttemptId,
              latestAttemptStatus: attemptResult?.status || item.latestAttemptStatus,
              latestSubmittedAttemptId: attemptResult?._id || item.latestSubmittedAttemptId,
              status: nextAttemptsRemaining > 0 ? (passed ? "Passed" : "Failed") : passed ? "Passed" : "Attempted",
            }
          : item
      )
    );
  };

  const closeActive = async (shouldReload = activeDirty) => {
    setActive(null);
    if (shouldReload) {
      setActiveDirty(false);
      await load();
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="mx-auto max-w-[1400px]">
      <PageHeader
        eyebrow="Test yourself"
        title="Quizzes"
        description="Attempt published quizzes from your enrolled courses and track your marks."
        actions={
          <Button variant="outline" className="rounded-xl border-border/60" onClick={load} disabled={loading}>
            <RefreshCcw className="mr-2 h-4 w-4" /> Refresh
          </Button>
        }
      />

      {quizzes.length ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {quizzes.map((quiz, index) => {
            const isInProgress = quiz.latestAttemptStatus === "in-progress" || quiz.status === "In Progress";
            const hasSubmitted = quiz.attemptsUsed > 0 && quiz.latestSubmittedAttemptId;
            const canStart = quiz.canAttempt && (isInProgress || quiz.attemptsRemaining > 0);
            const shouldViewResult = hasSubmitted && !canStart;
            const actionLabel = shouldViewResult ? "View result" : isInProgress ? "Resume quiz" : quiz.attemptsUsed ? "Retake quiz" : "Start quiz";
            const ActionIcon = shouldViewResult ? Eye : Play;
            return (
              <motion.div
                key={quiz.id}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -4 }}
                className="relative overflow-hidden rounded-2xl card-premium p-6"
              >
                <Badge className="border-0 bg-primary/15 text-primary">{quiz.courseTitle}</Badge>
                <h3 className="mt-3 font-display text-xl font-semibold">{quiz.title}</h3>
                <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{quiz.description || "Ready when you are."}</p>

                <div className="mt-4 grid grid-cols-3 gap-3 text-center">
                  <div className="rounded-xl bg-muted/40 p-3">
                    <div className="text-xs text-muted-foreground">Questions</div>
                    <div className="mt-1 font-display text-xl font-semibold">{quiz.totalQuestions}</div>
                  </div>
                  <div className="rounded-xl bg-muted/40 p-3">
                    <div className="text-xs text-muted-foreground">
                      <Clock className="inline h-3 w-3" /> Time
                    </div>
                    <div className="mt-1 font-display text-xl font-semibold">{quiz.durationMinutes}m</div>
                  </div>
                  <div className="rounded-xl bg-muted/40 p-3">
                    <div className="text-xs text-muted-foreground">
                      <Trophy className="inline h-3 w-3" /> Status
                    </div>
                    <div className="mt-1 truncate font-display text-sm font-semibold">{quiz.status || "New"}</div>
                  </div>
                </div>

                <Button
                  onClick={() => {
                    if (loading) return;
                    if (shouldViewResult) navigate(`/dashboard/quizzes/result/${quiz.latestSubmittedAttemptId}`);
                    else if (canStart) {
                      setActiveDirty(false);
                      setActive(quiz);
                    }
                  }}
                  className="mt-5 w-full rounded-xl gradient-primary border-0 text-primary-foreground"
                  disabled={loading || (!shouldViewResult && !canStart)}
                >
                  <ActionIcon className="mr-2 h-4 w-4" /> {actionLabel}
                </Button>
                <div className="mt-2 text-center text-xs text-muted-foreground">
                  {quiz.attemptsUsed} of {quiz.attemptsAllowed} attempt{quiz.attemptsAllowed === 1 ? "" : "s"} used
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-2xl card-premium p-10 text-center text-sm text-muted-foreground">
          {loading ? "Loading published quizzes..." : "No published quizzes available for your enrolled courses."}
        </div>
      )}

      <Dialog open={!!active} onOpenChange={(open) => !open && closeActive()}>
        <DialogContent className="top-4 max-h-[calc(100vh-2rem)] w-[calc(100vw-2rem)] max-w-2xl translate-y-0 overflow-y-auto rounded-2xl border-border/60 bg-card p-0">
          {active && (
            <QuizRunner
              quiz={active}
              onSubmitted={(attemptResult) => markSubmitted(active, attemptResult)}
              onClose={() => closeActive(true)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function QuizRunner({ quiz, onClose, onSubmitted }) {
  const [attempt, setAttempt] = useState(null);
  const [runnerQuiz, setRunnerQuiz] = useState(null);
  const [idx, setIdx] = useState(0);
  const [picks, setPicks] = useState([]);
  const [done, setDone] = useState(false);
  const [result, setResult] = useState(null);
  const [secs, setSecs] = useState((quiz.durationMinutes || 15) * 60);
  const [submitting, setSubmitting] = useState(false);
  const submittingRef = useRef(false);

  useEffect(() => {
    let mounted = true;
    quizApi.startQuiz(quiz.id)
      .then((response) => {
        if (!mounted) return;
        const data = response.data || response;
        setAttempt(data.attempt);
        setRunnerQuiz(data.quiz);
        setPicks(Array(data.quiz?.questions?.length || 0).fill(null));
        setSecs((data.quiz?.duration || quiz.durationMinutes || 15) * 60);
      })
      .catch((error) => {
        toast.error("Unable to start quiz", { description: error.message || "Please try again." });
        onClose();
      });
    return () => {
      mounted = false;
    };
  }, [quiz.id]);

  useEffect(() => {
    if (done || !runnerQuiz) return undefined;
    const timer = setInterval(() => setSecs((value) => Math.max(0, value - 1)), 1000);
    return () => clearInterval(timer);
  }, [done, runnerQuiz]);

  useEffect(() => {
    if (secs === 0 && runnerQuiz && !done) submit();
  }, [secs, runnerQuiz, done]);

  const questions = runnerQuiz?.questions || [];
  const total = questions.length;
  const question = questions[idx];
  const pick = picks[idx];
  const progress = total ? ((idx + 1) / total) * 100 : 0;
  const mm = String(Math.floor(secs / 60)).padStart(2, "0");
  const ss = String(secs % 60).padStart(2, "0");

  const answeredCount = useMemo(() => picks.filter((value) => value !== null).length, [picks]);

  const choose = async (optionIndex) => {
    const option = question.options?.[optionIndex];
    const label = option?.label || String.fromCharCode(65 + optionIndex);
    setPicks((current) => current.map((value, index) => (index === idx ? optionIndex : value)));
    try {
      await quizApi.saveAnswer(attempt._id, {
        questionId: question._id,
        selectedOption: label,
      });
    } catch (error) {
      toast.error("Unable to save answer", { description: error.message || "Please try again." });
    }
  };

  const submit = async () => {
    if (!attempt?._id || submittingRef.current || done) return;
    submittingRef.current = true;
    setSubmitting(true);
    try {
      const submitResult = await quizApi.submitQuiz(attempt._id);
      const attemptResult = submitResult.data || submitResult;
      setResult(attemptResult);
      onSubmitted?.(attemptResult);
      setDone(true);
      toast.success("Quiz submitted");
    } catch (error) {
      submittingRef.current = false;
      setSubmitting(false);
      toast.error("Unable to submit quiz", { description: error.message || "Please try again." });
    }
  };

  if (!runnerQuiz || !question) {
    return <div className="p-8 text-center text-sm text-muted-foreground">Starting quiz...</div>;
  }

  if (done) {
    const attemptResult = result?.attempt || result;
    const passed = attemptResult?.isPassed || attemptResult?.status === "passed";
    return (
      <div className="p-8">
        <div className="text-center">
          <div className={`mx-auto grid h-20 w-20 place-items-center rounded-2xl ${passed ? "gradient-primary" : "bg-destructive/20"} shadow-glow`}>
            {passed ? <CheckCircle2 className="h-9 w-9 text-primary-foreground" /> : <XCircle className="h-9 w-9 text-destructive" />}
          </div>
          <div className="mt-4 text-xs uppercase tracking-[0.2em] text-muted-foreground">
            {passed ? "Passed" : "Keep going"}
          </div>
          <h2 className="mt-1 font-display text-3xl font-semibold">{attemptResult?.percentage || 0}%</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {attemptResult?.score || 0} of {attemptResult?.totalMarks || runnerQuiz.totalMarks || 0} marks
          </p>
        </div>
        <div className="mt-6 flex justify-end">
          <Button onClick={onClose} className="rounded-xl gradient-primary border-0 text-primary-foreground">
            Close
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <Badge className="border-0 bg-accent/15 text-accent">
            <HelpCircle className="mr-1 h-3 w-3" /> {quiz.courseTitle}
          </Badge>
          <h2 className="mt-2 font-display text-xl font-semibold">{runnerQuiz.title}</h2>
          <div className="mt-0.5 text-xs text-muted-foreground">
            Question {idx + 1} of {total} - {answeredCount} answered
          </div>
        </div>
        <div className="grid h-16 w-16 shrink-0 place-items-center rounded-xl gradient-primary shadow-glow">
          <div className="text-center text-primary-foreground">
            <div className="font-display text-sm font-bold leading-none">{mm}:{ss}</div>
            <div className="mt-0.5 text-[9px] uppercase tracking-wider">left</div>
          </div>
        </div>
      </div>

      <Progress value={progress} className="mt-4 h-1.5" />

      <AnimatePresence mode="wait">
        <motion.div
          key={question._id || idx}
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -16 }}
          transition={{ duration: 0.25 }}
          className="mt-6"
        >
          <h3 className="font-display text-lg font-medium">{question.questionText || question.question}</h3>
          <div className="mt-4 grid gap-2">
            {(question.options || []).map((option, optionIndex) => {
              const isPick = pick === optionIndex;
              return (
                <button
                  key={option.label || optionIndex}
                  type="button"
                  onClick={() => choose(optionIndex)}
                  className={`flex items-center gap-3 rounded-xl border p-4 text-left text-sm transition-all ${isPick ? "border-primary/60 bg-primary/5" : "border-border/60 bg-muted/30 hover:border-primary/60 hover:bg-primary/5"}`}
                >
                  <span className="inline-grid h-7 w-7 shrink-0 place-items-center rounded-md bg-background text-xs font-semibold">
                    {option.label || String.fromCharCode(65 + optionIndex)}
                  </span>
                  <span className="flex-1">{option.text || option}</span>
                  {isPick && <CheckCircle2 className="h-4 w-4 text-primary" />}
                </button>
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="mt-6 flex items-center justify-between gap-2">
        <Button variant="ghost" onClick={() => setIdx((value) => Math.max(0, value - 1))} disabled={idx === 0} className="rounded-xl">
          <ArrowLeft className="mr-2 h-4 w-4" /> Previous
        </Button>
        <Button
          onClick={idx === total - 1 ? submit : () => setIdx((value) => Math.min(total - 1, value + 1))}
          disabled={pick === null || submitting}
          className="rounded-xl gradient-primary border-0 text-primary-foreground"
        >
          {idx === total - 1 ? (submitting ? "Submitting..." : "Submit") : "Next"} <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
