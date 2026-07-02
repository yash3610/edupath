import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Clock3, TrendingUp, Users } from "lucide-react";
import { toast } from "sonner";
import { LmsPageHeader } from "@/features/shared/components/PageHeader";
import { DataTable } from "@/features/shared/components/DataTable";
import { StatusBadge } from "@/features/shared/components/StatusBadge";
import { apiRequest } from "@/services/api";
import { EmptyPanel, MetricCard, PageLoader } from "./LumaDynamicUtils";

export default function InstructorQuizAnalyticsPage() {
  const { quizId } = useParams();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiRequest(`/api/instructor/quizzes/${quizId}/analytics`)
      .then((result) => setAnalytics(result.data || result))
      .catch((error) => toast.error(error.message || "Unable to load quiz analytics"))
      .finally(() => setLoading(false));
  }, [quizId]);

  if (loading) return <PageLoader label="Loading quiz analytics" />;
  if (!analytics) return <EmptyPanel title="Analytics are not available" />;

  const topics = (analytics.topicWeakAreas || []).map((topic, index) => ({
    topic,
    score: Math.max(0, Math.round((analytics.averageScore || 0) - index * 8)),
  }));
  const rows = analytics.studentResults || [];

  return (
    <div>
      <LmsPageHeader
        eyebrow="Quiz Analytics"
        title="Attempt insights"
        description="Live attempts, weak topics, pass rate, and student-wise outcomes from the database."
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <MetricCard icon={Users} label="Attempts" value={analytics.totalAttempts || 0} />
        <MetricCard icon={TrendingUp} label="Average" value={`${Math.round(analytics.averageScore || 0)}%`} />
        <MetricCard icon={TrendingUp} label="Pass rate" value={`${Math.round(analytics.passRate || 0)}%`} />
        <MetricCard icon={TrendingUp} label="Fail rate" value={`${Math.round(analytics.failRate || 0)}%`} />
        <MetricCard icon={Clock3} label="Avg time" value={`${Math.round((analytics.averageTimeTaken || 0) / 60)}m`} />
      </div>
      <div className="mt-6 grid gap-5 xl:grid-cols-2">
        <div className="rounded-2xl card-premium p-5">
          <h2 className="text-lg font-semibold">Topic weak areas</h2>
          <div className="mt-4 h-72">
            {topics.length ? (
              <ResponsiveContainer>
                <BarChart data={topics}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="topic" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="score" fill="hsl(var(--primary))" radius={[10, 10, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyPanel title="No topic data yet" description="More attempts are needed to calculate weak areas." />
            )}
          </div>
        </div>
        <div className="rounded-2xl card-premium p-5">
          <h2 className="text-lg font-semibold">Hardest questions</h2>
          <div className="mt-4 space-y-3">
            {(analytics.hardestQuestions || []).map((item, index) => (
              <div key={item.questionText || index} className="rounded-xl border border-border/70 bg-muted/25 p-4 text-sm">
                {item.questionText || `Question ${index + 1}`}
              </div>
            ))}
            {!analytics.hardestQuestions?.length && <p className="text-sm text-muted-foreground">More attempts are needed to calculate question difficulty.</p>}
          </div>
        </div>
      </div>
      <div className="mt-6">
        <DataTable
          rows={rows.map((row) => ({ ...row, id: row._id }))}
          searchKeys={["studentName"]}
          emptyTitle="No submitted attempts"
          columns={[
            { key: "student", header: "Student", render: (row) => <span className="font-medium">{row.student?.name || row.studentName || "Student"}</span> },
            { key: "percentage", header: "Score", render: (row) => `${Math.round(row.percentage || 0)}%` },
            { key: "status", header: "Status", render: (row) => <StatusBadge status={row.isPassed ? "approved" : "failed"} /> },
            { key: "time", header: "Time", render: (row) => `${Math.round((row.timeTaken || 0) / 60)}m` },
          ]}
        />
      </div>
    </div>
  );
}
