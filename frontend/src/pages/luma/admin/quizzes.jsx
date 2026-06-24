import { useCallback, useEffect, useMemo, useState } from "react";
import { Eye, RefreshCcw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DataTable } from "@/features/shared/components/DataTable";
import { LmsPageHeader } from "@/features/shared/components/PageHeader";
import { StatusBadge } from "@/features/shared/components/StatusBadge";
import { quizApi } from "@/services/quizApi";
import { confirmAction } from "@/utils/sweetAlert";

const statusOptions = [
  { label: "All status", value: "all" },
  { label: "Draft", value: "draft" },
  { label: "Published", value: "published" },
  { label: "Archived", value: "archived" },
];

function normalizeQuiz(quiz) {
  const questions = quiz.questions?.length || 0;
  const marks = quiz.totalMarks || quiz.questions?.reduce((sum, item) => sum + Number(item.marks || 1), 0) || 0;
  return {
    ...quiz,
    id: quiz._id,
    courseTitle: quiz.course?.title || "Unassigned course",
    instructorName: quiz.instructor?.name || quiz.instructor?.email || "Instructor",
    questionsCount: questions,
    marksCount: marks,
    approvedLabel: quiz.isApproved ? "Approved" : "Pending",
  };
}

export default function Page() {
  const [list, setList] = useState([]);
  const [status, setStatus] = useState("all");
  const [loading, setLoading] = useState(true);
  const [selectedQuiz, setSelectedQuiz] = useState(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const result = await quizApi.getAdminQuizzes(status === "all" ? "" : status);
      setList((result.data || []).map(normalizeQuiz));
    } catch (error) {
      toast.error("Quizzes could not be loaded", {
        description: error.message || "Please refresh and try again.",
      });
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => { load(); }, [load]);

  const cols = useMemo(() => [
    {
      key: "title",
      header: "Quiz",
      render: (r) => <span className="font-medium">{r.title}</span>,
    },
    {
      key: "courseTitle",
      header: "Course",
      render: (r) => <span className="text-sm text-muted-foreground">{r.courseTitle}</span>,
    },
    { key: "instructorName", header: "Instructor", render: (r) => r.instructorName },
    { key: "questionsCount", header: "Questions", render: (r) => r.questionsCount },
    { key: "marksCount", header: "Marks", render: (r) => r.marksCount },
    {
      key: "attemptsAllowed",
      header: "Attempts",
      sort: (a, b) => Number(a.attemptsAllowed || 0) - Number(b.attemptsAllowed || 0),
      render: (r) => Number(r.attemptsAllowed || 0).toLocaleString(),
    },
    {
      key: "passingMarks",
      header: "Passing",
      render: (r) => <span className="font-medium text-success">{r.passingMarks || 0}</span>,
    },
    {
      key: "approvedLabel",
      header: "Approval",
      render: (r) => <span className={r.isApproved ? "font-medium text-success" : "font-medium text-amber-600"}>{r.approvedLabel}</span>,
    },
    {
      key: "status",
      header: "Status",
      render: (r) => <StatusBadge status={r.status} />,
    },
  ], []);

  const runAction = async (quiz, action) => {
    const labels = {
      approve: { loading: "Approving quiz...", success: "Quiz approved", description: "Students can now see this quiz." },
      reject: { loading: "Rejecting quiz...", success: "Quiz rejected", description: "The quiz was moved back to draft." },
      delete: { loading: "Deleting quiz...", success: "Quiz deleted", description: "The quiz was removed from the admin list." },
    };

    if (action === "delete") {
      const confirmed = await confirmAction({
        title: "Delete this quiz?",
        text: quiz.title,
        confirmButtonText: "Delete quiz",
        danger: true,
      });
      if (!confirmed) return;
    }

    const toastId = toast.loading(labels[action].loading, {
      description: quiz.title,
    });

    try {
      if (action === "approve") await quizApi.approveAdminQuiz(quiz._id);
      if (action === "reject") await quizApi.rejectAdminQuiz(quiz._id);
      if (action === "delete") await quizApi.deleteAdminQuiz(quiz._id);
      toast.success(labels[action].success, {
        id: toastId,
        description: `${quiz.title}. ${labels[action].description}`,
      });
      await load();
    } catch (error) {
      toast.error("Quiz action failed", {
        id: toastId,
        description: error.message || `Could not ${action} ${quiz.title}.`,
      });
    }
  };

  return (
    <div className="mx-auto max-w-[1500px]">
      <LmsPageHeader
        eyebrow="Catalog"
        title="Quizzes"
        description="All quizzes across courses - review, approve, and analyze."
        actions={
          <Button variant="outline" className="rounded-xl" onClick={load} disabled={loading}>
            <RefreshCcw className="mr-2 h-4 w-4" /> Refresh
          </Button>
        }
      />
      <DataTable
        rows={list}
        columns={cols}
        searchKeys={["title", "courseTitle", "instructorName", "status", "approvedLabel"]}
        filters={
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="h-10 w-[180px] rounded-xl bg-muted/30">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}
            </SelectContent>
          </Select>
        }
        emptyTitle={loading ? "Loading quizzes..." : "No quizzes found"}
        emptyDesc={loading ? "Fetching latest quiz data." : "When instructors create quizzes, they will show up here."}
        actions={[
          {
            label: "View questions",
            onClick: (r) => setSelectedQuiz(r),
          },
          {
            label: "Approve",
            onClick: (r) => runAction(r, "approve"),
          },
          {
            label: "Reject",
            onClick: (r) => runAction(r, "reject"),
            danger: true,
          },
          {
            label: "Delete",
            onClick: (r) => runAction(r, "delete"),
            danger: true,
          },
        ]}
      />

      <Dialog open={!!selectedQuiz} onOpenChange={(open) => !open && setSelectedQuiz(null)}>
        <DialogContent className="max-h-[82vh] overflow-y-auto rounded-2xl sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>{selectedQuiz?.title}</DialogTitle>
            <DialogDescription>{selectedQuiz?.courseTitle} - {selectedQuiz?.questionsCount || 0} questions</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            {(selectedQuiz?.questions || []).map((question, index) => (
              <div key={question._id || index} className="rounded-xl border border-border/70 bg-muted/20 p-4">
                <div className="flex items-start gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">{index + 1}</span>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{question.question || question.questionText || "Untitled question"}</p>
                    <div className="mt-3 grid gap-2 sm:grid-cols-2">
                      {(question.options || []).map((option, optionIndex) => {
                        const label = option.label || String.fromCharCode(65 + optionIndex);
                        const text = option.text || option;
                        return <div key={`${label}-${optionIndex}`} className="rounded-lg bg-background px-3 py-2 text-sm text-muted-foreground">{label}. {text}</div>;
                      })}
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2 text-xs font-medium text-muted-foreground">
                      <span>Type: {question.questionType || "single-choice"}</span>
                      <span>Marks: {question.marks || 1}</span>
                      {question.correctAnswer && <span>Answer: {question.correctAnswer}</span>}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {!selectedQuiz?.questions?.length && (
              <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
                <Eye className="mx-auto mb-2 h-5 w-5" />
                No questions added yet.
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
