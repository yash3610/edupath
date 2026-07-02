import { useEffect, useRef, useState } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { motion } from "framer-motion";
import { ArrowLeft, BarChart3, CheckCircle2, Plus, RefreshCcw, Trash2, X } from "lucide-react";
import { LmsPageHeader } from "@/features/shared/components/PageHeader";
import { DataTable } from "@/features/shared/components/DataTable";
import { StatusBadge } from "@/features/shared/components/StatusBadge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogOverlay,
  DialogPortal,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { quizApi } from "@/services/quizApi";

const RESULT_PAGE_SIZE = 8;

const createQuestion = () => ({
  id: `question-${Date.now()}-${Math.random().toString(16).slice(2)}`,
  text: "",
  type: "single-choice",
  marks: 5,
  answer: "A",
  options: ["", "", "", ""],
});

const createDraft = () => ({
  title: "React Hooks Deep Dive",
  course: "",
  duration: 20,
  marks: 50,
  passingMarks: 35,
  difficulty: "medium",
  shuffle: true,
  showResults: true,
  questions: [
    {
      ...createQuestion(),
      text: "What is the purpose of a Provider?",
      options: ["Pass context values to descendants", "Store only local state", "Replace reducers", "Force a render"],
    },
  ],
});

const getQuizId = (quiz) => quiz?._id || quiz?.id;

const draftFromQuiz = (quiz) => ({
  title: quiz.title || "",
  course: quiz.course?._id || quiz.course || "",
  duration: quiz.duration || quiz.durationMinutes || 20,
  marks: quiz.totalMarks || quiz.marksCount || 0,
  passingMarks: quiz.passingMarks || 0,
  difficulty: quiz.difficulty || "medium",
  shuffle: Boolean(quiz.shuffleQuestions),
  showResults: quiz.showResultImmediately ?? true,
  questions: (quiz.questions?.length ? quiz.questions : createDraft().questions).map((question) => ({
    id: question._id || question.id || `question-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    text: question.questionText || question.question || question.text || "",
    type: question.questionType || question.type || "single-choice",
    marks: question.marks || 1,
    answer: question.correctAnswer || question.answer || question.options?.find((option) => option.isCorrect)?.label || "A",
    options: (question.options?.length ? question.options : ["", "", "", ""]).map((option) => option.text || option),
  })),
});

const normalizeQuiz = (quiz) => {
  const attempts = Number(quiz.attemptsCount ?? quiz.attempts ?? 0);
  const passRate = Number(quiz.passRate ?? quiz.pass ?? 0);
  return {
    ...quiz,
    id: getQuizId(quiz),
    courseTitle: quiz.course?.title || quiz.courseTitle || quiz.course || "Unassigned course",
    questionsCount: quiz.questions?.length || quiz.questionsCount || quiz.questions || 0,
    marksCount: quiz.totalMarks || quiz.marks || 0,
    attemptsCount: attempts,
    passRate,
  };
};

const toQuizPayload = (draft, status) => {
  const questions = draft.questions.map((question, index) => ({
    questionText: question.text.trim(),
    questionType: question.type,
    marks: Number(question.marks) || 1,
    difficulty: draft.difficulty,
    correctAnswer: question.answer,
    options: question.options.map((option, optionIndex) => ({
      label: String.fromCharCode(65 + optionIndex),
      text: option.trim(),
      isCorrect: String.fromCharCode(65 + optionIndex) === question.answer,
    })),
    order: index + 1,
  }));

  return {
    title: draft.title.trim(),
    course: draft.course,
    duration: Number(draft.duration) || 15,
    totalMarks: Number(draft.marks) || questions.reduce((sum, question) => sum + Number(question.marks || 0), 0),
    passingMarks: Number(draft.passingMarks) || 0,
    difficulty: draft.difficulty,
    shuffleQuestions: draft.shuffle,
    showResultImmediately: draft.showResults,
    showCorrectAnswers: draft.showResults,
    attemptsAllowed: 3,
    status,
    questions,
  };
};

export default function QuizzesPage() {
  const [build, setBuild] = useState(false);
  const [draft, setDraft] = useState(createDraft);
  const [activeQuestion, setActiveQuestion] = useState(0);
  const [courses, setCourses] = useState([]);
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [resultsPage, setResultsPage] = useState(0);
  const quizBuilderScrollRef = useRef(null);
  const currentQuestion = draft.questions[activeQuestion] || draft.questions[0];

  const load = async () => {
    setLoading(true);
    const [quizResult, courseResult] = await Promise.allSettled([
      quizApi.getInstructorQuizzes(),
      quizApi.getInstructorCourses(),
    ]);

    if (quizResult.status === "fulfilled") {
      setList((quizResult.value.data || []).map(normalizeQuiz));
    } else {
      setList([]);
      toast.error("Quiz data load zala nahi", {
        description: quizResult.reason?.message || "Backend/API check kara.",
      });
    }

    if (courseResult.status === "fulfilled") {
      setCourses(courseResult.value.data || []);
    } else {
      setCourses([]);
      toast.error("Course list load zali nahi", {
        description: courseResult.reason?.message || "Backend/API check kara.",
      });
    }

    setLoading(false);
  };

  useEffect(() => {
    if (!build) return;
    window.requestAnimationFrame(() => {
      quizBuilderScrollRef.current?.scrollTo({ top: 0, left: 0 });
    });
  }, [build]);

  useEffect(() => {
    load();
  }, []);

  const openBuilder = (quiz = null) => {
    const existingQuiz = quiz && getQuizId(quiz) ? quiz : null;
    setEditingQuiz(existingQuiz);
    setDraft(existingQuiz ? draftFromQuiz(existingQuiz) : createDraft());
    setActiveQuestion(0);
    setBuild(true);
    window.requestAnimationFrame(() => {
      quizBuilderScrollRef.current?.scrollTo({ top: 0, left: 0 });
    });
  };

  const updateDraft = (key, value) => {
    setDraft((current) => ({ ...current, [key]: value }));
  };

  const updateQuestion = (patch) => {
    setDraft((current) => ({
      ...current,
      questions: current.questions.map((question, index) =>
        index === activeQuestion ? { ...question, ...patch } : question,
      ),
    }));
  };

  const updateOption = (optionIndex, value) => {
    updateQuestion({
      options: currentQuestion.options.map((option, index) => (index === optionIndex ? value : option)),
    });
  };

  const addQuestion = () => {
    const nextIndex = draft.questions.length;
    setDraft((current) => ({ ...current, questions: [...current.questions, createQuestion()] }));
    setActiveQuestion(nextIndex);
  };

  const removeQuestion = (indexToRemove) => {
    if (draft.questions.length === 1) {
      toast.error("At least one question is required.");
      return;
    }
    setDraft((current) => ({
      ...current,
      questions: current.questions.filter((_, index) => index !== indexToRemove),
    }));
    setActiveQuestion((index) => Math.max(0, Math.min(index, draft.questions.length - 2)));
  };

  const addOption = () => {
    if (currentQuestion.options.length >= 6) {
      toast.error("Maximum 6 options per question.");
      return;
    }
    updateQuestion({ options: [...currentQuestion.options, ""] });
  };

  const removeOption = (optionIndex) => {
    if (currentQuestion.options.length <= 2) {
      toast.error("At least 2 options are required.");
      return;
    }

    const removedLabel = String.fromCharCode(65 + optionIndex);
    updateQuestion({
      options: currentQuestion.options.filter((_, index) => index !== optionIndex),
      answer: currentQuestion.answer === removedLabel ? "A" : currentQuestion.answer,
    });
  };

  const saveQuiz = async (status) => {
    const title = draft.title.trim();
    if (!title) {
      toast.error("Quiz title is required.");
      return;
    }
    if (!draft.course) {
      toast.error("Please pick a course.");
      return;
    }
    if (draft.questions.some((question) => !question.text.trim() || question.options.some((option) => !option.trim()))) {
      toast.error("Please add text for every question.");
      return;
    }

    try {
      setSaving(true);
      if (editingQuiz) {
        await quizApi.updateInstructorQuiz(getQuizId(editingQuiz), toQuizPayload(draft, status));
        if (status === "published") await quizApi.publishInstructorQuiz(getQuizId(editingQuiz));
      } else {
        await quizApi.createInstructorQuiz(toQuizPayload(draft, status));
      }
      toast.success(status === "published" ? "Quiz published" : "Quiz saved as draft");
      setBuild(false);
      setEditingQuiz(null);
      await load();
    } catch (error) {
      toast.error("Quiz save zala nahi", {
        description: error.message || "Please try again.",
      });
    } finally {
      setSaving(false);
    }
  };

  const publishExisting = async (quiz) => {
    try {
      await quizApi.publishInstructorQuiz(getQuizId(quiz));
      toast.success(`${quiz.title} published`);
      await load();
    } catch (error) {
      toast.error("Publish zala nahi", { description: error.message });
    }
  };

  const deleteQuiz = async (quiz) => {
    try {
      await quizApi.deleteInstructorQuiz(getQuizId(quiz));
      toast.success(`${quiz.title} deleted`);
      await load();
    } catch (error) {
      toast.error("Delete zala nahi", { description: error.message });
    }
  };

  const openAnalytics = async (quiz) => {
    setAnalytics({ quiz, studentResults: [] });
    setResultsPage(0);
    try {
      setAnalyticsLoading(true);
      const result = await quizApi.getInstructorQuizAnalytics(getQuizId(quiz));
      setAnalytics(result.data);
    } catch (error) {
      toast.error("Analytics load zale nahi", { description: error.message });
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const resultQuiz = analytics?.quiz || analytics;
  const studentResults = analytics?.studentResults || [];
  const resultPages = Math.max(1, Math.ceil(studentResults.length / RESULT_PAGE_SIZE));
  const pagedStudentResults = studentResults.slice(resultsPage * RESULT_PAGE_SIZE, resultsPage * RESULT_PAGE_SIZE + RESULT_PAGE_SIZE);

  const cols = [
    {
      key: "title",
      header: "Quiz",
      render: (r) => <span className="font-medium">{r.title}</span>,
    },
    {
      key: "course",
      header: "Course",
      render: (r) => <span className="text-sm text-muted-foreground">{r.courseTitle}</span>,
    },
    { key: "questionsCount", header: "Q", render: (r) => r.questionsCount },
    {
      key: "attemptsCount",
      header: "Attempts",
      render: (r) => r.attemptsCount.toLocaleString(),
    },
    {
      key: "passRate",
      header: "Pass",
      render: (r) => <span className="text-success font-medium">{r.passRate}%</span>,
    },
    {
      key: "difficulty",
      header: "Difficulty",
      render: (r) => <StatusBadge status={r.difficulty} />,
    },
    {
      key: "status",
      header: "Status",
      render: (r) => <StatusBadge status={r.status} />,
    },
  ];

  return (
    <div className="mx-auto max-w-[1500px]">
      <LmsPageHeader
        eyebrow={analytics ? "Results" : "Learners"}
        title={analytics ? resultQuiz?.title || "Student Results" : "Quiz Builder"}
        description={analytics ? "Student attempts, marks, pass rate, and score details for this quiz." : "Create assessments with multiple question types."}
        actions={
          analytics ? (
            <Button
              variant="outline"
              className="rounded-xl"
              onClick={() => {
                setAnalytics(null);
                setResultsPage(0);
              }}
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
          ) : (
            <>
              <Button variant="outline" className="rounded-xl" onClick={load} disabled={loading}>
                <RefreshCcw className="mr-2 h-4 w-4" /> Refresh
              </Button>
              <Button
                className="rounded-xl gradient-primary border-0 text-primary-foreground"
                onClick={() => openBuilder()}
              >
                <Plus className="mr-1.5 h-4 w-4" /> New quiz
              </Button>
            </>
          )
        }
      />
      {analytics ? (
        <div className="space-y-4">
          <div
            className="grid gap-3"
            style={{ gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}
          >
            {[
              ["Attempts", analytics?.totalAttempts || 0],
              ["Students", analytics?.studentResults?.length || 0],
              ["Average", `${analytics?.averageScore || 0}%`],
              ["Pass rate", `${analytics?.passRate || 0}%`],
            ].map(([label, value]) => (
              <div key={label} className="rounded-xl card-premium p-4">
                <div className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">{label}</div>
                <div className="mt-2 font-display text-2xl font-semibold">{value}</div>
              </div>
            ))}
          </div>

          <div className="rounded-2xl card-premium overflow-hidden">
            <div className="flex items-center justify-between gap-3 border-b border-border/60 px-4 py-3">
              <div>
                <div className="text-sm font-semibold">Student results</div>
                <div className="text-xs text-muted-foreground">
                  {resultQuiz?.course?.title || resultQuiz?.courseTitle || "Course"} result details
                </div>
              </div>
              {analyticsLoading && <Badge variant="outline" className="border-border/60">Loading</Badge>}
            </div>
            <div className="hidden grid-cols-[minmax(0,1fr)_120px_100px_110px] gap-3 border-b border-border/60 bg-muted/30 px-4 py-3 text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground md:grid">
              <div>Student</div>
              <div>Score</div>
              <div>Percent</div>
              <div>Status</div>
            </div>
            <div className="divide-y divide-border/60">
              {pagedStudentResults.map((attempt) => (
                <div key={attempt._id} className="grid gap-3 px-4 py-3 text-sm md:grid-cols-[minmax(0,1fr)_120px_100px_110px] md:items-center">
                  <div>
                    <div className="font-medium">{attempt.student?.name || "Student"}</div>
                    <div className="text-xs text-muted-foreground">{attempt.student?.email || "No email"}</div>
                  </div>
                  <div className="font-medium">{attempt.score}/{attempt.totalMarks}</div>
                  <div>{attempt.percentage || 0}%</div>
                  <StatusBadge status={attempt.isPassed ? "passed" : "failed"} />
                </div>
              ))}
              {!analyticsLoading && !(analytics?.studentResults || []).length && (
                <div className="p-10 text-center text-sm text-muted-foreground">
                  <BarChart3 className="mx-auto mb-2 h-5 w-5" />
                  No student has solved this quiz yet.
                </div>
              )}
            </div>
            {studentResults.length > RESULT_PAGE_SIZE && (
              <div className="flex items-center justify-between border-t border-border/60 px-4 py-3 text-xs text-muted-foreground">
                <span>
                  {studentResults.length} students - page {resultsPage + 1} of {resultPages}
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={resultsPage === 0}
                    onClick={() => setResultsPage((page) => Math.max(0, page - 1))}
                    className="rounded-lg"
                  >
                    Prev
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={resultsPage >= resultPages - 1}
                    onClick={() => setResultsPage((page) => Math.min(resultPages - 1, page + 1))}
                    className="rounded-lg"
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <DataTable
          rows={list}
          columns={cols}
          searchKeys={["title", "courseTitle", "status", "difficulty"]}
          emptyTitle={loading ? "Loading quizzes..." : "No quizzes yet"}
          emptyDesc={loading ? "Fetching your live quiz data." : "Create a draft or publish a quiz directly from here."}
          actions={[
            { label: "Edit questions", onClick: openBuilder },
            {
              label: "View student results",
              onClick: openAnalytics,
            },
            {
              label: "Publish",
              onClick: publishExisting,
            },
            {
              label: "Delete",
              onClick: deleteQuiz,
              danger: true,
            },
          ]}
        />
      )}

      <Dialog open={build} onOpenChange={setBuild}>
        <DialogPortal>
          <DialogOverlay style={{ background: "rgba(0, 0, 0, 0.62)" }} />
          <DialogPrimitive.Content
            onOpenAutoFocus={(event) => event.preventDefault()}
            style={{
              position: "fixed",
              top: 0,
              right: 0,
              bottom: 0,
              zIndex: 50,
              display: "flex",
              width: "min(780px, 100vw)",
              maxWidth: "100vw",
              height: "100dvh",
              flexDirection: "column",
              overflow: "hidden",
              borderLeft: "1px solid #eee2d6",
              background: "#fffdf9",
              color: "#1f1c35",
              boxShadow: "-24px 0 60px rgba(31, 28, 53, 0.18)",
              animation: "quizDrawerIn 240ms cubic-bezier(0.22, 1, 0.36, 1)",
            }}
          >
          <style>
            {`
              @keyframes quizDrawerIn {
                from { opacity: 0.98; transform: translateX(100%); }
                to { opacity: 1; transform: translateX(0); }
              }
              .quiz-drawer-scroll {
                scrollbar-width: thin;
                scrollbar-color: #ff9b1a #fff7ed;
              }
              .quiz-drawer-scroll::-webkit-scrollbar {
                width: 10px;
              }
              .quiz-drawer-scroll::-webkit-scrollbar-track {
                background: #fff7ed;
              }
              .quiz-drawer-scroll::-webkit-scrollbar-thumb {
                background: #ff9b1a;
                border: 2px solid #fff7ed;
                border-radius: 999px;
              }
            `}
          </style>
          <DialogPrimitive.Close
            style={{
              position: "absolute",
              top: 14,
              right: 16,
              display: "grid",
              width: 32,
              height: 32,
              placeItems: "center",
              border: 0,
              borderRadius: 8,
              background: "transparent",
              color: "hsl(var(--muted-foreground))",
              cursor: "pointer",
            }}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
          <DialogHeader className="shrink-0 border-b border-border/60 px-4 py-2 pr-14 sm:px-6">
            <DialogTitle className="font-display">{editingQuiz ? "Edit quiz" : "New quiz"}</DialogTitle>
          </DialogHeader>

          <div
            ref={quizBuilderScrollRef}
            className="quiz-drawer-scroll px-4 py-3 sm:px-6"
            style={{
              flex: "1 1 auto",
              minHeight: 0,
              overflowY: "auto",
              overscrollBehavior: "contain",
            }}
          >
            <div className="grid shrink-0 gap-2 sm:grid-cols-2 lg:grid-cols-4">
              <div className="sm:col-span-2">
                <Label>Title</Label>
                <Input
                  value={draft.title}
                  onChange={(event) => updateDraft("title", event.target.value)}
                  placeholder="React Hooks Deep Dive"
                  className="mt-1 h-9 rounded-xl"
                />
              </div>
              <div>
                <Label>Course</Label>
                <Select value={draft.course} onValueChange={(value) => updateDraft("course", value)}>
                  <SelectTrigger className="mt-1 h-9 rounded-xl">
                    <SelectValue placeholder="Pick a course" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map((course) => (
                      <SelectItem key={course._id} value={course._id}>
                        {course.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Duration (min)</Label>
                <Input
                  type="number"
                  value={draft.duration}
                  onChange={(event) => updateDraft("duration", event.target.value)}
                  className="mt-1 h-9 rounded-xl"
                />
              </div>
              <div>
                <Label>Total marks</Label>
                <Input
                  type="number"
                  value={draft.marks}
                  onChange={(event) => updateDraft("marks", event.target.value)}
                  className="mt-1 h-9 rounded-xl"
                />
              </div>
              <div>
                <Label>Passing marks</Label>
                <Input
                  type="number"
                  value={draft.passingMarks}
                  onChange={(event) => updateDraft("passingMarks", event.target.value)}
                  className="mt-1 h-9 rounded-xl"
                />
              </div>
              <div>
                <Label>Difficulty</Label>
                <Select value={draft.difficulty} onValueChange={(value) => updateDraft("difficulty", value)}>
                  <SelectTrigger className="mt-1 h-9 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["easy", "medium", "hard"].map((difficulty) => (
                      <SelectItem key={difficulty} value={difficulty}>
                        {difficulty}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-muted/30 px-3 py-2 text-sm lg:col-span-2">
                <span>Shuffle questions</span>
                <Switch checked={draft.shuffle} onCheckedChange={(value) => updateDraft("shuffle", value)} />
              </div>
              <div className="flex items-center justify-between rounded-xl bg-muted/30 px-3 py-2 text-sm lg:col-span-2">
                <span>Show results to student</span>
                <Switch checked={draft.showResults} onCheckedChange={(value) => updateDraft("showResults", value)} />
              </div>
            </div>

            <div className="mt-3 grid gap-3 lg:grid-cols-[minmax(0,1fr)_340px]">
              <section className="min-w-0 rounded-xl border border-border/60 p-3" style={{ background: "#fffaf4" }}>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                      Question {activeQuestion + 1}
                    </div>
                    <div className="mt-1 text-sm font-medium text-muted-foreground">
                      {draft.questions.length} question{draft.questions.length === 1 ? "" : "s"} added
                    </div>
                  </div>
                  <Button size="sm" variant="outline" className="rounded-lg border-border/60" onClick={addQuestion}>
                    <Plus className="mr-1 h-3.5 w-3.5" /> Add question
                  </Button>
                </div>

                <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_120px_150px]">
                  <div>
                    <Label>Question type</Label>
                    <Select value={currentQuestion.type} onValueChange={(value) => updateQuestion({ type: value })}>
                      <SelectTrigger className="mt-1 h-9 rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {["single-choice", "multiple-choice", "true-false"].map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Marks</Label>
                    <Input
                      type="number"
                      value={currentQuestion.marks}
                      onChange={(event) => updateQuestion({ marks: event.target.value })}
                      className="mt-1 h-9 rounded-xl"
                    />
                  </div>
                  <div>
                    <Label>Correct answer</Label>
                    <Select value={currentQuestion.answer} onValueChange={(value) => updateQuestion({ answer: value })}>
                      <SelectTrigger className="mt-1 h-9 rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {currentQuestion.options.map((_, index) => {
                          const optionLabel = String.fromCharCode(65 + index);
                          return (
                            <SelectItem key={optionLabel} value={optionLabel}>
                              Option {optionLabel}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Textarea
                  value={currentQuestion.text}
                  onChange={(event) => updateQuestion({ text: event.target.value })}
                  rows={2}
                  placeholder="What is the purpose of a Provider?"
                  className="mt-2 rounded-xl"
                />

                <div className="mt-2 space-y-1.5">
                  {currentQuestion.options.map((option, index) => {
                    const optionLabel = String.fromCharCode(65 + index);
                    const isCorrectOption = currentQuestion.answer === optionLabel;
                    return (
                      <motion.div
                        key={`${currentQuestion.id}-${optionLabel}`}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.03 }}
                        style={{
                          display: "grid",
                          gridTemplateColumns: "34px minmax(0, 1fr) 34px",
                          alignItems: "center",
                          gap: "8px",
                          minHeight: "36px",
                          width: "100%",
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => updateQuestion({ answer: optionLabel })}
                          aria-label={`Set option ${optionLabel} as correct`}
                          title={`Option ${optionLabel}`}
                          style={{
                            width: "34px",
                            height: "34px",
                            borderRadius: "10px",
                            border: isCorrectOption ? "1px solid #fb923c" : "1px solid #e5e7eb",
                            background: isCorrectOption ? "#f59e0b" : "#ffffff",
                            color: isCorrectOption ? "#111827" : "#111827",
                            display: "grid",
                            placeItems: "center",
                            fontSize: "13px",
                            fontWeight: 700,
                            lineHeight: 1,
                            boxShadow: isCorrectOption ? "0 5px 12px rgba(245, 158, 11, 0.18)" : "0 1px 2px rgba(15, 23, 42, 0.06)",
                            cursor: "pointer",
                          }}
                        >
                          {optionLabel}
                        </button>
                        <Input
                          value={option}
                          onChange={(event) => updateOption(index, event.target.value)}
                          placeholder={`Option ${index + 1}`}
                          className="rounded-lg"
                          style={{
                            height: "36px",
                            minWidth: 0,
                            margin: 0,
                            borderRadius: "12px",
                            background: "#ffffff",
                          }}
                        />
                        <button
                          type="button"
                          aria-label={`Remove option ${optionLabel}`}
                          onClick={() => removeOption(index)}
                          style={{
                            width: "34px",
                            height: "34px",
                            border: 0,
                            borderRadius: "10px",
                            background: "transparent",
                            color: "#ef4444",
                            display: "grid",
                            placeItems: "center",
                            cursor: "pointer",
                          }}
                        >
                          <Trash2 className="h-3.5 w-3.5 text-destructive" />
                        </button>
                      </motion.div>
                    );
                  })}
                </div>
                <Button size="sm" variant="outline" className="mt-2 h-8 rounded-lg border-border/60" onClick={addOption}>
                  <Plus className="mr-1 h-3.5 w-3.5" /> Add option
                </Button>
              </section>

              <aside className="min-w-0 rounded-xl border border-border/60 p-3" style={{ background: "#ffffff" }}>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold">Added questions</div>
                    <div className="text-xs text-muted-foreground">Review text, options, and answer.</div>
                  </div>
                  <Badge variant="outline" className="border-border/60">
                    {draft.questions.length}
                  </Badge>
                </div>
                <div className="mt-2 space-y-2">
                  {draft.questions.map((question, questionIndex) => (
                    <button
                      type="button"
                      key={question.id}
                      onClick={() => setActiveQuestion(questionIndex)}
                      className={`w-full rounded-xl border p-2 text-left transition ${activeQuestion === questionIndex ? "border-primary/60 bg-primary/10" : "border-border/60 bg-muted/20 hover:border-primary/40"}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                            Question {questionIndex + 1}
                          </div>
                          <div className="mt-1 line-clamp-2 text-sm font-medium">
                            {question.text || "Untitled question"}
                          </div>
                        </div>
                        <span
                          role="button"
                          tabIndex={0}
                          onClick={(event) => {
                            event.stopPropagation();
                            removeQuestion(questionIndex);
                          }}
                          onKeyDown={(event) => {
                            if (event.key === "Enter" || event.key === " ") {
                              event.preventDefault();
                              event.stopPropagation();
                              removeQuestion(questionIndex);
                            }
                          }}
                          className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </span>
                      </div>
                      <div className="mt-2 space-y-1">
                        {question.options.map((option, optionIndex) => {
                          const optionLabel = String.fromCharCode(65 + optionIndex);
                          return (
                            <div key={`${question.id}-summary-${optionLabel}`} className="truncate text-xs text-muted-foreground">
                              <span className={question.answer === optionLabel ? "font-semibold text-primary" : "font-medium"}>
                                {optionLabel}.
                              </span>{" "}
                              {option || `Option ${optionIndex + 1}`}
                            </div>
                          );
                        })}
                      </div>
                    </button>
                  ))}
                </div>
              </aside>
            </div>
          </div>

          <DialogFooter className="shrink-0 border-t border-border/60 px-4 py-2 sm:px-6">
            <Button variant="ghost" className="rounded-xl" onClick={() => setBuild(false)}>
              Cancel
            </Button>
            <Button variant="outline" className="rounded-xl" onClick={() => saveQuiz("draft")} disabled={saving}>
              Save as draft
            </Button>
            <Button className="rounded-xl gradient-primary border-0 text-primary-foreground" onClick={() => saveQuiz("published")} disabled={saving}>
              <CheckCircle2 className="mr-2 h-4 w-4" /> Publish now
            </Button>
          </DialogFooter>
          </DialogPrimitive.Content>
        </DialogPortal>
      </Dialog>

    </div>
  );
}
