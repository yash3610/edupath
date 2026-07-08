import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AlertTriangle, CheckCircle2, Clock3, Eye, ListChecks, Medal, Play } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LmsPageHeader } from "@/features/shared/components/PageHeader";
import { quizApi } from "@/services/quizApi";
import { MetricCard, PageLoader, unwrap } from "./LumaDynamicUtils";

export default function QuizInstructionsPage() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    quizApi.getQuizInstructions(quizId)
      .then((result) => setQuiz(unwrap(result)))
      .catch((error) => toast.error(error.message || "Unable to load quiz"));
  }, [quizId]);

  async function start() {
    if (shouldViewResult) {
      navigate(`/dashboard/quizzes/result/${quiz.latestSubmittedAttemptId}`);
      return;
    }
    setStarting(true);
    try {
      const result = unwrap(await quizApi.startQuiz(quizId));
      navigate(`/dashboard/quizzes/attempt/${result.attempt?._id || result.attemptId}`, { state: result });
    } catch (error) {
      toast.error(error.message || "Unable to start quiz");
    } finally {
      setStarting(false);
    }
  }

  if (!quiz) return <PageLoader label="Loading quiz instructions" />;
  const isInProgress = quiz.latestAttemptStatus === "in-progress" || quiz.status === "In Progress";
  const shouldViewResult = quiz.latestSubmittedAttemptId && !quiz.canAttempt;
  const actionText = shouldViewResult ? "View result" : isInProgress ? "Resume quiz" : "Start quiz";
  const ActionIcon = shouldViewResult ? Eye : Play;

  return (
    <div>
      <LmsPageHeader
        eyebrow="Secure Quiz"
        title={quiz.title || "Quiz instructions"}
        description={quiz.description || "Read the rules carefully before starting this timed assessment."}
        actions={<Button onClick={start} disabled={starting}><ActionIcon className="mr-2 h-4 w-4" />{starting ? "Starting..." : actionText}</Button>}
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <MetricCard icon={Clock3} label="Duration" value={`${quiz.duration || 0} min`} />
        <MetricCard icon={ListChecks} label="Questions" value={quiz.totalQuestions || 0} />
        <MetricCard icon={Medal} label="Marks" value={quiz.totalMarks || 0} />
        <MetricCard icon={CheckCircle2} label="Passing" value={quiz.passingMarks || 0} />
        <MetricCard icon={AlertTriangle} label="Negative" value={quiz.negativeMarking ? `-${quiz.negativeMarksPerQuestion || 0}` : "No"} />
      </div>
      <div className="mt-6 rounded-2xl card-premium p-6">
        <h2 className="text-lg font-semibold">Important instructions</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {(quiz.rules?.length ? quiz.rules : ["Do not refresh the page during the attempt.", "Submit before the timer ends."]).map((rule) => (
            <div key={rule} className="rounded-xl border border-border/70 bg-muted/25 p-4 text-sm text-muted-foreground">
              <Badge variant="secondary" className="mb-3 rounded-full">Rule</Badge>
              <p>{rule}</p>
            </div>
          ))}
        </div>
        <Button onClick={start} disabled={starting} className="mt-6">
          <ActionIcon className="mr-2 h-4 w-4" />
          {shouldViewResult ? "View submitted result" : isInProgress ? "Resume quiz" : "I understand, start quiz"}
        </Button>
      </div>
    </div>
  );
}
