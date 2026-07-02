import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Cell, Pie, PieChart, PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer, Tooltip } from "recharts";
import { CheckCircle2, Download, RotateCcw, Share2, Trophy, XCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { LmsPageHeader } from "@/features/shared/components/PageHeader";
import { StatusBadge } from "@/features/shared/components/StatusBadge";
import { quizApi } from "@/services/quizApi";
import { MetricCard, PageLoader, unwrap } from "./LumaDynamicUtils";

export default function QuizResultPage() {
  const { attemptId } = useParams();
  const [result, setResult] = useState(null);
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState("");

  useEffect(() => {
    quizApi.getQuizResult(attemptId)
      .then((response) => setResult(unwrap(response)))
      .catch((error) => toast.error(error.message || "Unable to load quiz result"));
  }, [attemptId]);

  if (!result) return <PageLoader label="Loading quiz result" />;
  const attempt = result.attempt || {};
  const pie = [
    { name: "Correct", value: attempt.correctCount || 0 },
    { name: "Wrong", value: attempt.wrongCount || 0 },
    { name: "Unanswered", value: attempt.unansweredCount || 0 },
  ];
  const topics = result.topicPerformance || [{ topic: "Hooks", score: 90 }, { topic: "Effects", score: 74 }, { topic: "Security", score: 82 }, { topic: "State", score: 68 }];

  async function downloadPdf() {
    setDownloading(true);
    setDownloadError("");
    try {
      const blob = await quizApi.downloadResultPdf(attemptId);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `edupath-quiz-result-${attemptId}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      toast.success("Quiz result PDF downloaded.");
    } catch (error) {
      setDownloadError(error.message || "PDF download failed. Please login again and try.");
      toast.error(error.message || "PDF download failed.");
    } finally {
      setDownloading(false);
    }
  }

  async function shareResult() {
    const text = `I scored ${attempt.percentage}% on EduPath quiz.`;
    if (navigator.share) await navigator.share({ title: "EduPath Quiz Result", text });
    else await navigator.clipboard?.writeText(text);
    toast.success("Result share text is ready.");
  }

  return (
    <div>
      <LmsPageHeader
        eyebrow="Quiz Result"
        title={attempt.isPassed ? "Great work, you passed." : "Keep going, retake when ready."}
        description={`Score ${attempt.score || 0}/${attempt.totalMarks || 0}. Accuracy ${result.accuracy || 0}% with rank ${result.rank || "-"}.`}
        actions={<StatusBadge status={attempt.isPassed ? "approved" : "failed"} />}
      />
      <div className={`rounded-2xl card-premium overflow-hidden ${attempt.isPassed ? "bg-success/5" : "bg-destructive/5"}`}>
        <div className="grid lg:grid-cols-[320px_1fr]">
          <div className="flex flex-col items-center justify-center p-6 text-center">
            <div className={`grid h-24 w-24 place-items-center rounded-full ${attempt.isPassed ? "bg-success" : "bg-destructive"} text-white shadow-xl`}>
              {attempt.isPassed ? <CheckCircle2 className="h-12 w-12" /> : <XCircle className="h-12 w-12" />}
            </div>
            <h2 className="mt-4 text-3xl font-semibold">{Math.round(attempt.percentage || 0)}%</h2>
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">{attempt.isPassed ? "Passed" : "Failed"}</p>
          </div>
          <div className="p-6">
            <div className="mb-3 flex items-center justify-between text-sm font-medium"><span>Score progress</span><span>{attempt.score || 0}/{attempt.totalMarks || 0}</span></div>
            <Progress value={attempt.percentage || 0} />
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <SoftStat label="Passing marks" value={attempt.passingMarks || 0} />
              <SoftStat label="Attempt" value={`#${attempt.attemptNumber || 1}`} />
              <SoftStat label="Rank" value={result.rank || "-"} />
            </div>
          </div>
        </div>
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
        <MetricCard icon={Trophy} label="Score" value={`${attempt.score || 0}/${attempt.totalMarks || 0}`} />
        <MetricCard icon={Trophy} label="Status" value={attempt.isPassed ? "Passed" : "Failed"} />
        <MetricCard icon={CheckCircle2} label="Correct" value={attempt.correctCount || 0} />
        <MetricCard icon={XCircle} label="Wrong" value={attempt.wrongCount || 0} />
        <MetricCard icon={Trophy} label="Unanswered" value={attempt.unansweredCount || 0} />
        <MetricCard icon={Trophy} label="Time" value={`${Math.round((attempt.timeTaken || 0) / 60)}m`} />
      </div>
      <div className="mt-6 grid gap-5 xl:grid-cols-2">
        <ChartCard title="Correct vs Wrong">
          <ResponsiveContainer>
            <PieChart><Pie data={pie} dataKey="value" outerRadius={95} label>{pie.map((_, index) => <Cell key={index} fill={["#10b981", "#f43f5e", "#94a3b8"][index]} />)}</Pie><Tooltip /></PieChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Topic Performance">
          <ResponsiveContainer>
            <RadarChart data={topics}><PolarGrid /><PolarAngleAxis dataKey="topic" /><Radar dataKey="score" fill="hsl(var(--primary))" fillOpacity={0.35} stroke="hsl(var(--primary))" /><Tooltip /></RadarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
      <div className="mt-6 rounded-2xl card-premium p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div><h2 className="text-lg font-semibold">Review answers</h2><p className="text-sm text-muted-foreground">Correct answers are shown only when the quiz setting allows it.</p></div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={downloadPdf} disabled={downloading}><Download className="mr-2 h-4 w-4" />{downloading ? "Downloading..." : "PDF"}</Button>
            <Button variant="outline" onClick={shareResult}><Share2 className="mr-2 h-4 w-4" />Share</Button>
            <Button asChild><Link to="/dashboard/quizzes"><RotateCcw className="mr-2 h-4 w-4" />Retake</Link></Button>
          </div>
        </div>
        {downloadError && <div className="mt-4 rounded-xl bg-destructive/10 p-4 text-sm font-medium text-destructive">{downloadError}</div>}
        <div className="mt-5 space-y-3">
          {result.questions?.map((question, index) => (
            <div key={question._id || index} className="rounded-xl border border-border/70 bg-muted/25 p-4">
              <p className="font-medium">{index + 1}. {question.questionText}</p>
              <p className="mt-2 text-sm text-muted-foreground">{question.explanation || "Explanation hidden for this quiz."}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SoftStat({ label, value }) {
  return <div className="rounded-xl bg-background/70 p-4"><p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">{label}</p><p className="mt-1 text-lg font-semibold">{value}</p></div>;
}

function ChartCard({ title, children }) {
  return <div className="rounded-2xl card-premium p-5"><h2 className="text-lg font-semibold">{title}</h2><div className="mt-4 h-72">{children}</div></div>;
}
