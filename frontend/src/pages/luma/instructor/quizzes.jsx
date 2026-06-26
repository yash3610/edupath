import { useEffect, useRef, useState } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { motion } from "framer-motion";
import { Plus, Trash2, X } from "lucide-react";
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
import { instructorQuizzes } from "@/features/instructor/data/instructor";
import { toast } from "sonner";
import usePersistedDashboardState from "@/hooks/usePersistedDashboardState";

const courseOptions = ["Advanced React", "Modern Design", "TypeScript Pro"];

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

export default function QuizzesPage() {
  const [build, setBuild] = useState(false);
  const [draft, setDraft] = useState(createDraft);
  const [activeQuestion, setActiveQuestion] = useState(0);
  const quizBuilderScrollRef = useRef(null);
  const [list, setList] = usePersistedDashboardState("instructor", "instructorQuizzes", instructorQuizzes);
  const currentQuestion = draft.questions[activeQuestion] || draft.questions[0];

  useEffect(() => {
    if (!build) return;
    window.requestAnimationFrame(() => {
      quizBuilderScrollRef.current?.scrollTo({ top: 0, left: 0 });
    });
  }, [build]);

  const openBuilder = () => {
    setDraft(createDraft());
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

  const saveDraft = () => {
    const title = draft.title.trim();
    if (!title) {
      toast.error("Quiz title is required.");
      return;
    }
    if (!draft.course) {
      toast.error("Please pick a course.");
      return;
    }
    if (draft.questions.some((question) => !question.text.trim())) {
      toast.error("Please add text for every question.");
      return;
    }

    setList((items) => [
      {
        id: `Q-${Date.now()}`,
        title,
        course: draft.course,
        questions: draft.questions.length,
        questionDetails: draft.questions,
        marks: Number(draft.marks) || 0,
        attempts: 0,
        pass: 0,
        difficulty: draft.difficulty,
        status: "draft",
      },
      ...items,
    ]);
    toast.success("Quiz saved as draft");
    setBuild(false);
  };

  const cols = [
    {
      key: "title",
      header: "Quiz",
      render: (r) => <span className="font-medium">{r.title}</span>,
    },
    {
      key: "course",
      header: "Course",
      render: (r) => <span className="text-sm text-muted-foreground">{r.course}</span>,
    },
    { key: "questions", header: "Q", render: (r) => r.questions },
    {
      key: "attempts",
      header: "Attempts",
      render: (r) => r.attempts.toLocaleString(),
    },
    {
      key: "pass",
      header: "Pass",
      render: (r) => <span className="text-success font-medium">{r.pass}%</span>,
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
        eyebrow="Learners"
        title="Quiz Builder"
        description="Create assessments with multiple question types."
        actions={
          <Button
            className="rounded-xl gradient-primary border-0 text-primary-foreground"
            onClick={openBuilder}
          >
            <Plus className="mr-1.5 h-4 w-4" /> New quiz
          </Button>
        }
      />
      <DataTable
        rows={list}
        columns={cols}
        searchKeys={["title", "course"]}
        actions={[
          { label: "Edit questions", onClick: openBuilder },
          {
            label: "View analytics",
            onClick: () => toast("Opening analytics..."),
          },
          {
            label: "Duplicate",
            onClick: (r) => {
              setList((items) => [{ ...r, id: `Q-${Date.now()}`, title: `${r.title} Copy`, status: "draft", attempts: 0 }, ...items]);
              toast.success(`Duplicated ${r.title}`);
            },
          },
          {
            label: "Delete",
            onClick: (r) => {
              setList((items) => items.filter((item) => item.id !== r.id));
              toast.error(`Deleted ${r.title}`);
            },
            danger: true,
          },
        ]}
      />

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
            <DialogTitle className="font-display">New quiz</DialogTitle>
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
                    {courseOptions.map((course) => (
                      <SelectItem key={course} value={course}>
                        {course}
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
            <Button className="rounded-xl gradient-primary border-0 text-primary-foreground" onClick={saveDraft}>
              Save {draft.questions.length} question{draft.questions.length === 1 ? "" : "s"}
            </Button>
          </DialogFooter>
          </DialogPrimitive.Content>
        </DialogPortal>
      </Dialog>
    </div>
  );
}
