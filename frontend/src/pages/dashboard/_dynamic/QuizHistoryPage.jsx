import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Eye } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { LmsPageHeader } from "@/features/shared/components/PageHeader";
import { DataTable } from "@/features/shared/components/DataTable";
import { StatusBadge } from "@/features/shared/components/StatusBadge";
import { quizApi } from "@/services/quizApi";
import { EmptyPanel, PageLoader, unwrap } from "./LumaDynamicUtils";

export default function QuizHistoryPage() {
  const { quizId } = useParams();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    quizApi.getQuizHistory(quizId)
      .then((result) => setHistory(unwrap(result, [])))
      .catch((error) => toast.error(error.message || "Unable to load quiz history"))
      .finally(() => setLoading(false));
  }, [quizId]);

  if (loading) return <PageLoader label="Loading attempts" />;

  return (
    <div>
      <LmsPageHeader
        eyebrow="Quiz History"
        title="Attempt history"
        description="Review previous scores, completion dates, and time spent."
      />
      {!history.length ? (
        <EmptyPanel title="No attempts yet" description="Quiz attempts will appear here after you submit a quiz." />
      ) : (
        <DataTable
          rows={history.map((item) => ({ ...item, id: item._id }))}
          searchKeys={["quizTitle", "status"]}
          columns={[
            { key: "quiz", header: "Quiz", render: (row) => <span className="font-medium">{row.quiz?.title || row.quizTitle || "Quiz"}</span> },
            { key: "attempt", header: "Attempt", render: (row) => `#${row.attemptNumber || 1}` },
            { key: "score", header: "Score", render: (row) => `${row.score ?? 0} (${Math.round(row.percentage || 0)}%)` },
            { key: "status", header: "Status", render: (row) => <StatusBadge status={row.status === "passed" ? "approved" : row.status === "failed" ? "failed" : row.status || "submitted"} /> },
            { key: "date", header: "Date", render: (row) => row.createdAt ? new Date(row.createdAt).toLocaleDateString("en-IN") : "-" },
            { key: "time", header: "Time", render: (row) => `${Math.round((row.timeTaken || 0) / 60)}m` },
            { key: "result", header: "", render: (row) => <Button asChild size="sm" variant="outline"><Link to={`/dashboard/quizzes/result/${row._id}`}><Eye className="mr-2 h-4 w-4" />Result</Link></Button> },
          ]}
        />
      )}
    </div>
  );
}
