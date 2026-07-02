import { useEffect, useState } from "react";
import { Copy, GripVertical, Plus, Save, Trash2 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { LmsPageHeader } from "@/features/shared/components/PageHeader";
import { apiRequest } from "@/services/api";
import { PageLoader } from "./LumaDynamicUtils";

const initialQuestion = {
  questionType: "single-choice",
  questionText: "",
  marks: 10,
  difficulty: "medium",
  topicTag: "",
  options: ["", "", "", ""],
  correctAnswer: "A",
  explanation: "",
};

export default function InstructorQuizBuilderPage() {
  const navigate = useNavigate();
  const { quizId } = useParams();
  const isEditing = Boolean(quizId);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [quiz, setQuiz] = useState({
    title: "",
    description: "",
    course: "",
    duration: 20,
    passingMarks: 50,
    totalMarks: 100,
    difficulty: "medium",
    attemptsAllowed: 2,
    negativeMarking: true,
    shuffleQuestions: true,
    showResultImmediately: true,
    lockUntilLectureComplete: false,
    status: "draft",
  });
  const [questions, setQuestions] = useState([{ ...initialQuestion }]);
  const updateQuiz = (key, value) => setQuiz((prev) => ({ ...prev, [key]: value }));
  const updateQuestion = (index, patch) => setQuestions((prev) => prev.map((q, i) => (i === index ? { ...q, ...patch } : q)));

  useEffect(() => {
    async function load() {
      try {
        const coursesResult = await apiRequest("/api/instructor/my-courses");
        const courseData = coursesResult.data || [];
        setCourses(courseData);
        if (!quizId) {
          setQuiz((current) => ({ ...current, course: current.course || courseData[0]?._id || "" }));
          return;
        }
        const result = await apiRequest(`/api/instructor/quizzes/${quizId}`);
        const data = result.data;
        if (!data) throw new Error("Quiz not found.");
        setQuiz({
          title: data.title || "",
          description: data.description || "",
          course: data.course?._id || data.course || "",
          duration: data.duration || data.durationMinutes || 20,
          passingMarks: data.passingMarks ?? 50,
          totalMarks: data.totalMarks ?? 100,
          difficulty: data.difficulty || "medium",
          attemptsAllowed: data.attemptsAllowed ?? 2,
          negativeMarking: Boolean(data.negativeMarking),
          shuffleQuestions: Boolean(data.shuffleQuestions),
          showResultImmediately: data.showResultImmediately !== false,
          lockUntilLectureComplete: Boolean(data.lockUntilLectureComplete),
          status: data.status || "draft",
        });
        setQuestions((data.questions || []).map((question) => ({
          _id: question._id,
          questionType: question.questionType || "single-choice",
          questionText: question.questionText || "",
          marks: question.marks ?? 1,
          difficulty: question.difficulty || "medium",
          topicTag: question.topicTag || "",
          options: (question.options || []).map((option) => (typeof option === "string" ? option : option.text)),
          correctAnswer: question.correctAnswer || question.options?.find((option) => option.isCorrect)?.label || "A",
          explanation: question.explanation || "",
        })));
      } catch (error) {
        toast.error(error.message || "Unable to load quiz");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [quizId]);

  async function saveQuiz() {
    try {
      setSaving(true);
      const payload = {
        ...quiz,
        duration: Number(quiz.duration),
        passingMarks: Number(quiz.passingMarks),
        totalMarks: Number(quiz.totalMarks),
        attemptsAllowed: Number(quiz.attemptsAllowed),
        questions: questions.map((question, index) => ({
          ...question,
          marks: Number(question.marks),
          order: index + 1,
          options: question.options.map((text, optionIndex) => ({
            label: String.fromCharCode(65 + optionIndex),
            text,
            isCorrect: String.fromCharCode(65 + optionIndex) === question.correctAnswer,
          })),
        })),
      };
      await apiRequest(isEditing ? `/api/instructor/quizzes/${quizId}` : "/api/instructor/quizzes", {
        method: isEditing ? "PATCH" : "POST",
        body: JSON.stringify(payload),
      });
      toast.success(isEditing ? "Quiz updated successfully." : "Quiz saved to the database.");
      navigate("/instructor/dashboard/quizzes");
    } catch (error) {
      toast.error(error.message || "Unable to save quiz");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <PageLoader label="Loading quiz builder" />;

  return (
    <div>
      <LmsPageHeader
        eyebrow="Assessment"
        title={isEditing ? "Edit quiz" : "Quiz builder"}
        description="Create secure assessments with marks, explanations, shuffle settings, and publish controls."
        actions={<Button onClick={saveQuiz} disabled={saving}><Save className="mr-2 h-4 w-4" />{saving ? "Saving..." : "Save quiz"}</Button>}
      />
      <div className="rounded-2xl card-premium p-6">
        <div className="grid gap-4 lg:grid-cols-2">
          <Field label="Quiz title"><Input value={quiz.title} onChange={(e) => updateQuiz("title", e.target.value)} placeholder="React Hooks Final Assessment" /></Field>
          <Field label="Course">
            <Select value={quiz.course} onValueChange={(value) => updateQuiz("course", value)}>
              <SelectTrigger><SelectValue placeholder="Select course" /></SelectTrigger>
              <SelectContent>{courses.map((course) => <SelectItem key={course._id} value={course._id}>{course.title}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
          <NumberField label="Duration (minutes)" value={quiz.duration} onChange={(value) => updateQuiz("duration", value)} />
          <NumberField label="Passing marks" value={quiz.passingMarks} onChange={(value) => updateQuiz("passingMarks", value)} />
          <NumberField label="Total marks" value={quiz.totalMarks} onChange={(value) => updateQuiz("totalMarks", value)} />
          <NumberField label="Attempts allowed" value={quiz.attemptsAllowed} onChange={(value) => updateQuiz("attemptsAllowed", value)} />
          <ChoiceField label="Difficulty" value={quiz.difficulty} onChange={(value) => updateQuiz("difficulty", value)} options={["easy", "medium", "hard"]} />
          <ChoiceField label="Status" value={quiz.status} onChange={(value) => updateQuiz("status", value)} options={["draft", "published", "archived"]} />
        </div>
        <Field label="Description" className="mt-4"><Textarea value={quiz.description} onChange={(e) => updateQuiz("description", e.target.value)} rows={4} /></Field>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {["negativeMarking", "shuffleQuestions", "showResultImmediately", "lockUntilLectureComplete"].map((key) => (
            <button key={key} type="button" onClick={() => updateQuiz(key, !quiz[key])} className={`rounded-xl border p-4 text-left text-sm font-medium capitalize ${quiz[key] ? "border-primary/50 bg-primary/10 text-primary" : "border-border bg-muted/20 text-muted-foreground"}`}>
              {key.replace(/([A-Z])/g, " $1")}
              <span className="mt-2 block text-xs">{quiz[key] ? "Enabled" : "Disabled"}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 rounded-2xl card-premium p-6">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">Question builder</h2>
          <Button type="button" onClick={() => setQuestions((prev) => [...prev, { ...initialQuestion }])}><Plus className="mr-2 h-4 w-4" />Add question</Button>
        </div>
        <div className="mt-5 space-y-4">
          {questions.map((question, index) => (
            <div key={index} className="rounded-xl border border-border/70 bg-muted/20 p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="inline-flex items-center gap-2 text-sm font-semibold"><GripVertical className="h-4 w-4" />Question {index + 1}</span>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" size="icon" onClick={() => setQuestions((prev) => [...prev, { ...question }])}><Copy className="h-4 w-4" /></Button>
                  <Button type="button" variant="ghost" size="icon" className="text-destructive" onClick={() => setQuestions((prev) => prev.filter((_, i) => i !== index))} disabled={questions.length === 1}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </div>
              <div className="grid gap-3 md:grid-cols-3">
                <ChoiceField label="Type" value={question.questionType} onChange={(value) => updateQuestion(index, { questionType: value })} options={["single-choice", "multiple-choice", "true-false", "fill-blank", "short-answer", "code"]} />
                <NumberField label="Marks" value={question.marks} onChange={(value) => updateQuestion(index, { marks: value })} />
                <Field label="Topic tag"><Input value={question.topicTag} onChange={(e) => updateQuestion(index, { topicTag: e.target.value })} /></Field>
              </div>
              <Field label="Question text" className="mt-3"><Textarea value={question.questionText} onChange={(e) => updateQuestion(index, { questionText: e.target.value })} rows={3} /></Field>
              <div className="mt-3 grid gap-2 md:grid-cols-2">
                {question.options.map((option, optionIndex) => (
                  <Field key={optionIndex} label={`Option ${String.fromCharCode(65 + optionIndex)}`}>
                    <Input value={option} onChange={(e) => {
                      const next = [...question.options];
                      next[optionIndex] = e.target.value;
                      updateQuestion(index, { options: next });
                    }} />
                  </Field>
                ))}
              </div>
              <Field label="Correct answer" className="mt-3"><Input value={question.correctAnswer} onChange={(e) => updateQuestion(index, { correctAnswer: e.target.value.toUpperCase() })} /></Field>
              <Field label="Explanation" className="mt-3"><Textarea value={question.explanation} onChange={(e) => updateQuestion(index, { explanation: e.target.value })} rows={2} /></Field>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Field({ label, children, className = "" }) {
  return <div className={className}><Label className="mb-2 block">{label}</Label>{children}</div>;
}

function NumberField({ label, value, onChange }) {
  return <Field label={label}><Input type="number" value={value} onChange={(e) => onChange(e.target.value)} /></Field>;
}

function ChoiceField({ label, value, onChange, options }) {
  return (
    <Field label={label}>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger><SelectValue /></SelectTrigger>
        <SelectContent>{options.map((option) => <SelectItem key={option} value={option}>{option}</SelectItem>)}</SelectContent>
      </Select>
    </Field>
  );
}
