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
    attemptsCount: quiz.attemptsCount || 0,
    studentsSolvedCount: quiz.studentsSolvedCount || 0,
    averageScore: quiz.averageScore || 0,
    passRate: quiz.passRate || 0,
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
    { key: "attemptsCount", header: "Attempts", render: (r) => r.attemptsCount.toLocaleString() },
    { key: "studentsSolvedCount", header: "Students", render: (r) => r.studentsSolvedCount },
    { key: "averageScore", header: "Avg", render: (r) => <span className="font-medium">{r.averageScore}%</span> },
    {
      key: "passingMarks",
      header: "Passing",
      render: (r) => <span className="font-medium text-success">{r.passingMarks || 0}</span>,
    },
    { key: "passRate", header: "Pass", render: (r) => <span className="font-medium text-success">{r.passRate}%</span> },
    {
      key: "status",
      header: "Status",
      render: (r) => <StatusBadge status={r.status} />,
    },
  ], []);

  const openQuizDetails = async (quiz) => {
    setSelectedQuiz({ ...quiz, studentResults: [] });
    try {
      const result = await quizApi.getAdminQuizAnalytics(quiz._id);
      setSelectedQuiz({ ...normalizeQuiz(result.data.quiz), ...result.data });
    } catch (error) {
      toast.error("Quiz analytics could not be loaded", {
        description: error.message || "Please refresh and try again.",
      });
    }
  };

  return (
    <div className="mx-auto max-w-[1500px]">
      <LmsPageHeader
        eyebrow="Catalog"
        title="Quizzes"
        description="All instructor-created quizzes with student attempts, marks, and pass analytics."
        actions={
          <Button variant="outline" className="rounded-xl" onClick={load} disabled={loading}>
            <RefreshCcw className="mr-2 h-4 w-4" /> Refresh
          </Button>
        }
      />
      <DataTable
        rows={list}
        columns={cols}
        searchKeys={["title", "courseTitle", "instructorName", "status"]}
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
            label: "View analytics",
            onClick: openQuizDetails,
          },
        ]}
      />

      <Dialog open={!!selectedQuiz} onOpenChange={(open) => !open && setSelectedQuiz(null)}>
        <DialogContent className="max-h-[82vh] overflow-y-auto rounded-2xl sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>{selectedQuiz?.title}</DialogTitle>
            <DialogDescription>
              {selectedQuiz?.course?.title || selectedQuiz?.courseTitle} - created by {selectedQuiz?.instructor?.name || selectedQuiz?.instructorName || "Instructor"}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 sm:grid-cols-4">
            {[
              ["Attempts", selectedQuiz?.totalAttempts || selectedQuiz?.attemptsCount || 0],
              ["Students", selectedQuiz?.studentsSolved || selectedQuiz?.studentsSolvedCount || 0],
              ["Average", `${selectedQuiz?.averageScore || 0}%`],
              ["Pass rate", `${selectedQuiz?.passRate || 0}%`],
            ].map(([label, value]) => (
              <div key={label} className="rounded-xl border border-border/60 bg-muted/30 p-3">
                <div className="text-xs text-muted-foreground">{label}</div>
                <div className="mt-1 font-display text-2xl font-semibold">{value}</div>
              </div>
            ))}
          </div>
          <div className="rounded-xl border border-border/60">
            <div className="border-b border-border/60 px-4 py-3 text-sm font-semibold">Students who solved this quiz</div>
            <div className="divide-y divide-border/60">
              {(selectedQuiz?.studentResults || []).map((attempt) => (
                <div key={attempt._id} className="grid gap-2 px-4 py-3 text-sm sm:grid-cols-[1fr_90px_90px_90px] sm:items-center">
                  <div>
                    <div className="font-medium">{attempt.student?.name || "Student"}</div>
                    <div className="text-xs text-muted-foreground">{attempt.student?.email || "No email"}</div>
                  </div>
                  <div>{attempt.score}/{attempt.totalMarks}</div>
                  <div>{attempt.percentage || 0}%</div>
                  <StatusBadge status={attempt.isPassed ? "passed" : "failed"} />
                </div>
              ))}
              {!(selectedQuiz?.studentResults || []).length && (
                <div className="p-6 text-center text-sm text-muted-foreground">No student attempts yet.</div>
              )}
            </div>
          </div>
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
