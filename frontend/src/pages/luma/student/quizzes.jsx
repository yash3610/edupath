import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock,
  HelpCircle,
  Play,
  RotateCcw,
  Sparkles,
  Trophy,
  XCircle,
} from "lucide-react";
import { PageHeader } from "@/features/student/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { quizProgress, quizzes } from "@/features/student/data/mock";
import usePersistedDashboardState from "@/hooks/usePersistedDashboardState";
import { toast } from "sonner";
const BANK = {
  q1: [
    {
      q: "What is the purpose of a Provider?",
      options: [
        "Pass props down through component tree implicitly",
        "Manage local component state",
        "Replace useState with useReducer",
        "Force component to re-render",
      ],
      answer: 0,
      explain: "Providers expose context values to descendants without prop drilling.",
    },
    {
      q: "useEffect runs…",
      options: ["Before render", "After render is committed", "During render", "Only on mount"],
      answer: 1,
      explain: "Effects run after the DOM is committed, with cleanup before the next run.",
    },
    {
      q: "useMemo is best used to…",
      options: [
        "Persist state",
        "Avoid expensive recomputation",
        "Replace useEffect",
        "Fetch data",
      ],
      answer: 1,
      explain: "useMemo caches a derived value across renders.",
    },
    {
      q: "Which hook returns a stable function reference?",
      options: ["useEffect", "useMemo", "useCallback", "useRef"],
      answer: 2,
      explain: "useCallback memoizes the function itself.",
    },
    {
      q: "Refs are appropriate for…",
      options: ["Triggering re-renders", "Imperative DOM access", "Replacing state", "Context"],
      answer: 1,
      explain: "Refs hold mutable values without causing re-render.",
    },
  ],
  q2: [
    {
      q: "Supervised learning requires…",
      options: ["Labeled data", "Only unlabeled data", "Rewards", "No data"],
      answer: 0,
      explain: "Supervised models learn input→label mappings.",
    },
    {
      q: "Overfitting means the model…",
      options: ["Generalizes well", "Memorizes training data", "Has high bias", "Is too simple"],
      answer: 1,
      explain: "Overfit models perform great on train, poorly on test.",
    },
    {
      q: "Cross-validation helps…",
      options: ["Train faster", "Estimate generalization", "Reduce dataset", "Pick a GPU"],
      answer: 1,
      explain: "It tests stability across folds.",
    },
    {
      q: "Regularization aims to…",
      options: ["Increase variance", "Reduce overfitting", "Speed training", "Remove features"],
      answer: 1,
      explain: "Penalty terms keep weights small.",
    },
  ],
  q3: [
    {
      q: "A generic <T> lets you…",
      options: ["Pin a single type", "Parametrize types", "Disable type checks", "Replace any"],
      answer: 1,
      explain: "Generics make code reusable across types.",
    },
    {
      q: "`keyof T` returns…",
      options: ["Values of T", "Union of T's keys", "Type of T", "Never"],
      answer: 1,
      explain: "It's a union of literal key types.",
    },
    {
      q: "Conditional types use…",
      options: ["if/else", "T extends U ? X : Y", "switch", "match"],
      answer: 1,
      explain: "Conditional types branch on assignability.",
    },
  ],
  q4: [
    {
      q: "Hierarchy is created primarily by…",
      options: ["Color alone", "Size, weight, space", "Borders", "Shadows"],
      answer: 1,
      explain: "Type scale and spacing drive perceived hierarchy.",
    },
    {
      q: "Whitespace primarily improves…",
      options: ["Density", "Legibility & focus", "Color", "Animation"],
      answer: 1,
      explain: "Negative space gives content room to breathe.",
    },
    {
      q: "A grid helps you…",
      options: ["Add color", "Maintain rhythm & alignment", "Animate faster", "Avoid typography"],
      answer: 1,
      explain: "Grids enforce consistent structure.",
    },
  ],
};
function questionsFor(id) {
  return BANK[id] ?? BANK.q1;
}
export default function QuizzesPage() {
  const [activeId, setActiveId] = useState(null);
  const [progress, setProgress] = usePersistedDashboardState("student", "quizProgress", quizProgress);
  const bestMap = progress.best;
  const attemptsMap = progress.attempts;
  const handleFinish = (id, score) => {
    setProgress((current) => ({
      best: { ...current.best, [id]: Math.max(current.best[id] ?? 0, score) },
      attempts: { ...current.attempts, [id]: (current.attempts[id] ?? 0) + 1 },
    }));
  };
  return (
    <div className="mx-auto max-w-[1400px]">
      <PageHeader
        eyebrow="Test yourself"
        title="Quizzes"
        description="Master concepts with instant feedback and AI explanations."
        actions={
          <Button variant="outline" className="rounded-xl border-border/60">
            <Sparkles className="mr-2 h-4 w-4 text-primary" /> Generate quiz
          </Button>
        }
      />

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {quizzes.map((q, i) => {
          const best = Math.max(q.best, bestMap[q.id] ?? 0);
          const attempts = q.attempts + (attemptsMap[q.id] ?? 0);
          return (
            <motion.div
              key={q.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ y: -4 }}
              className="relative overflow-hidden rounded-2xl card-premium p-6"
            >
              <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full gradient-aurora opacity-30 blur-2xl" />
              <Badge className="border-0 bg-primary/15 text-primary">{q.course}</Badge>
              <h3 className="mt-3 font-display text-xl font-semibold">{q.title}</h3>

              <div className="mt-4 grid grid-cols-3 gap-3 text-center">
                <div className="rounded-xl bg-muted/40 p-3">
                  <div className="text-xs text-muted-foreground">Questions</div>
                  <div className="mt-1 font-display text-xl font-semibold">
                    {questionsFor(q.id).length}
                  </div>
                </div>
                <div className="rounded-xl bg-muted/40 p-3">
                  <div className="text-xs text-muted-foreground">
                    <Clock className="inline h-3 w-3" /> Time
                  </div>
                  <div className="mt-1 font-display text-xl font-semibold">
                    {q.duration.split(" ")[0]}m
                  </div>
                </div>
                <div className="rounded-xl bg-muted/40 p-3">
                  <div className="text-xs text-muted-foreground">
                    <Trophy className="inline h-3 w-3" /> Best
                  </div>
                  <div className="mt-1 font-display text-xl font-semibold">{best || "—"}</div>
                </div>
              </div>

              <Button
                onClick={() => setActiveId(q.id)}
                className="mt-5 w-full rounded-xl gradient-primary border-0 text-primary-foreground"
              >
                <Play className="mr-2 h-4 w-4" /> {attempts ? "Retake quiz" : "Start quiz"}
              </Button>
              <div className="mt-2 text-center text-xs text-muted-foreground">
                {attempts} previous attempt{attempts === 1 ? "" : "s"}
              </div>
            </motion.div>
          );
        })}
      </div>

      <Dialog open={!!activeId} onOpenChange={(o) => !o && setActiveId(null)}>
        <DialogContent className="max-w-2xl rounded-2xl border-border/60 bg-card p-0 overflow-hidden">
          {activeId && (
            <QuizRunner
              quiz={quizzes.find((x) => x.id === activeId)}
              questions={questionsFor(activeId)}
              onClose={() => setActiveId(null)}
              onFinish={(score) => handleFinish(activeId, score)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
function QuizRunner({ quiz, questions, onClose, onFinish }) {
  const total = questions.length;
  const [idx, setIdx] = useState(0);
  const [picks, setPicks] = useState(() => Array(total).fill(null));
  const [revealed, setRevealed] = useState(false);
  const [done, setDone] = useState(false);
  const durationSec = parseInt(quiz.duration) * 60 || 600;
  const [secs, setSecs] = useState(durationSec);
  useEffect(() => {
    if (done) return;
    const t = setInterval(() => setSecs((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, [done]);
  const q = questions[idx];
  const pick = picks[idx];
  const score = useMemo(() => {
    const correct = picks.reduce((acc, p, i) => acc + (p === questions[i].answer ? 1 : 0), 0);
    return Math.round((correct / total) * 100);
  }, [picks, questions, total]);
  const finish = () => {
    setDone(true);
    onFinish(score);
    toast.success(`Quiz complete · ${score}%`, {
      description: score >= 80 ? "Brilliant work!" : "Review the explanations and retake.",
    });
  };
  const choose = (i) => {
    if (revealed) return;
    setPicks((p) => {
      const n = [...p];
      n[idx] = i;
      return n;
    });
    setRevealed(true);
  };
  const next = () => {
    if (idx < total - 1) {
      setIdx(idx + 1);
      setRevealed(picks[idx + 1] !== null);
    } else {
      finish();
    }
  };
  const prev = () => {
    if (idx > 0) {
      setIdx(idx - 1);
      setRevealed(picks[idx - 1] !== null);
    }
  };
  const restart = () => {
    setPicks(Array(total).fill(null));
    setIdx(0);
    setRevealed(false);
    setDone(false);
    setSecs(durationSec);
  };
  const mm = String(Math.floor(secs / 60)).padStart(2, "0");
  const ss = String(secs % 60).padStart(2, "0");
  if (done) {
    const passed = score >= 70;
    return (
      <div className="p-8">
        <div className="text-center">
          <div
            className={`mx-auto grid h-20 w-20 place-items-center rounded-2xl ${passed ? "gradient-primary" : "bg-destructive/20"} shadow-glow`}
          >
            <Trophy
              className={`h-9 w-9 ${passed ? "text-primary-foreground" : "text-destructive"}`}
            />
          </div>
          <div className="mt-4 text-xs uppercase tracking-[0.2em] text-muted-foreground">
            {passed ? "Passed" : "Keep going"}
          </div>
          <h2 className="mt-1 font-display text-3xl font-semibold">{score}%</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {picks.filter((p, i) => p === questions[i].answer).length} of {total} correct
          </p>
        </div>

        <div className="mt-6 max-h-64 space-y-2 overflow-auto pr-1">
          {questions.map((qq, i) => {
            const correct = picks[i] === qq.answer;
            return (
              <div
                key={i}
                className="flex items-start gap-3 rounded-xl border border-border/60 bg-muted/30 p-3"
              >
                {correct ? (
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-success" />
                ) : (
                  <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
                )}
                <div className="min-w-0">
                  <div className="text-sm font-medium">{qq.q}</div>
                  <div className="mt-0.5 text-xs text-muted-foreground">{qq.explain}</div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose} className="rounded-xl">
            Close
          </Button>
          <Button
            onClick={restart}
            className="rounded-xl gradient-primary border-0 text-primary-foreground"
          >
            <RotateCcw className="mr-2 h-4 w-4" /> Retake
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
            <HelpCircle className="mr-1 h-3 w-3" /> {quiz.course}
          </Badge>
          <h2 className="mt-2 font-display text-xl font-semibold">{quiz.title}</h2>
          <div className="mt-0.5 text-xs text-muted-foreground">
            Question {idx + 1} of {total}
          </div>
        </div>
        <div className="grid h-16 w-16 shrink-0 place-items-center rounded-xl gradient-primary shadow-glow">
          <div className="text-center text-primary-foreground">
            <div className="font-display text-sm font-bold leading-none">
              {mm}:{ss}
            </div>
            <div className="mt-0.5 text-[9px] uppercase tracking-wider">left</div>
          </div>
        </div>
      </div>

      <Progress value={((idx + 1) / total) * 100} className="mt-4 h-1.5" />

      <AnimatePresence mode="wait">
        <motion.div
          key={idx}
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -16 }}
          transition={{ duration: 0.25 }}
          className="mt-6"
        >
          <h3 className="font-display text-lg font-medium">{q.q}</h3>
          <div className="mt-4 grid gap-2">
            {q.options.map((opt, i) => {
              const isPick = pick === i;
              const isAnswer = i === q.answer;
              const show = revealed;
              const state = show
                ? isAnswer
                  ? "correct"
                  : isPick
                    ? "wrong"
                    : "muted"
                : isPick
                  ? "picked"
                  : "idle";
              const cls = {
                correct: "border-success/60 bg-success/10",
                wrong: "border-destructive/60 bg-destructive/10",
                muted: "border-border/60 bg-muted/30 opacity-70",
                picked: "border-primary/60 bg-primary/5",
                idle: "border-border/60 bg-muted/30 hover:border-primary/60 hover:bg-primary/5",
              }[state];
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => choose(i)}
                  disabled={revealed}
                  className={`flex items-center gap-3 rounded-xl border p-4 text-left text-sm transition-all ${cls}`}
                >
                  <span className="inline-grid h-7 w-7 shrink-0 place-items-center rounded-md bg-background text-xs font-semibold">
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span className="flex-1">{opt}</span>
                  {show && isAnswer && <CheckCircle2 className="h-4 w-4 text-success" />}
                  {show && isPick && !isAnswer && <XCircle className="h-4 w-4 text-destructive" />}
                </button>
              );
            })}
          </div>

          {revealed && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 rounded-xl border border-border/60 bg-muted/30 p-3 text-sm"
            >
              <span className="font-medium text-primary">Explanation · </span>
              <span className="text-muted-foreground">{q.explain}</span>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="mt-6 flex items-center justify-between gap-2">
        <Button variant="ghost" onClick={prev} disabled={idx === 0} className="rounded-xl">
          <ArrowLeft className="mr-2 h-4 w-4" /> Previous
        </Button>
        <div className="text-xs text-muted-foreground">
          Score so far: <span className="font-semibold text-primary">{score}%</span>
        </div>
        <Button
          onClick={next}
          disabled={!revealed}
          className="rounded-xl gradient-primary border-0 text-primary-foreground"
        >
          {idx === total - 1 ? "Finish" : "Next"} <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

