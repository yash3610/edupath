import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AlertTriangle, CheckCircle2, Clock3, ListChecks, Medal, Play } from "lucide-react";
import { MotionCard } from "../../components/dashboard/DashboardPrimitives.jsx";
import { QuizHero, QuizMetric, RuleCard } from "../../components/dashboard/quiz/QuizShell.jsx";
import { quizApi } from "../../services/quizApi.js";

export default function QuizInstructionsPage() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [starting, setStarting] = useState(false);

  useEffect(() => { quizApi.getQuizInstructions(quizId).then(setQuiz); }, [quizId]);
  async function start() {
    setStarting(true);
    const data = await quizApi.startQuiz(quizId);
    navigate(`/dashboard/quizzes/attempt/${data.attempt?._id || "attempt-local"}`, { state: data });
  }

  if (!quiz) return <div className="h-80 animate-pulse rounded-[28px] bg-slate-200 dark:bg-white/10" />;

  return (
    <div className="space-y-6">
      <QuizHero title={quiz.title} subtitle={quiz.description || "Read the rules carefully before starting this secure timed assessment."} action={<button onClick={start} disabled={starting} className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-black text-slate-950 shadow-lg"><Play className="h-4 w-4" /> {starting ? "Starting..." : "Start Quiz"}</button>} />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <QuizMetric icon={Clock3} label="Duration" value={`${quiz.duration} min`} />
        <QuizMetric icon={ListChecks} label="Questions" value={quiz.totalQuestions} />
        <QuizMetric icon={Medal} label="Marks" value={quiz.totalMarks} />
        <QuizMetric icon={CheckCircle2} label="Passing" value={quiz.passingMarks} />
        <QuizMetric icon={AlertTriangle} label="Negative" value={quiz.negativeMarking ? `-${quiz.negativeMarksPerQuestion}` : "No"} />
      </div>
      <MotionCard>
        <h3 className="text-xl font-black">Important instructions</h3>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {quiz.rules?.map((rule) => <RuleCard key={rule}>{rule}</RuleCard>)}
        </div>
        <button onClick={start} className="mt-6 w-full rounded-2xl bg-[#ff6b35] px-5 py-4 text-sm font-black text-white shadow-lg shadow-orange-500/20 sm:w-auto">I understand, start quiz</button>
      </MotionCard>
    </div>
  );
}
