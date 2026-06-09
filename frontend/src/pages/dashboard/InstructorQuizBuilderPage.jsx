import React, { useEffect, useState } from "react";
import { Copy, GripVertical, Plus, Save, Trash2 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { MotionCard } from "../../components/dashboard/DashboardPrimitives.jsx";
import { QuizHero } from "../../components/dashboard/quiz/QuizShell.jsx";
import { apiRequest } from "../../services/api.js";
import { useToast } from "../../context/ToastContext.jsx";

const initialQuestion = { questionType: "single-choice", questionText: "", marks: 10, difficulty: "medium", topicTag: "", options: ["", "", "", ""], correctAnswer: "A", explanation: "" };

export default function InstructorQuizBuilderPage() {
  const toast = useToast();
  const navigate = useNavigate();
  const { quizId } = useParams();
  const isEditing = Boolean(quizId);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [quiz, setQuiz] = useState({ title: "", description: "", course: "", duration: 20, passingMarks: 50, totalMarks: 100, difficulty: "medium", attemptsAllowed: 2, negativeMarking: true, shuffleQuestions: true, showResultImmediately: true, lockUntilLectureComplete: false, status: "draft" });
  const [questions, setQuestions] = useState([{ ...initialQuestion, questionText: "Which hook memoizes expensive derived values?", options: ["useMemo", "useEffect", "useRef", "useId"], correctAnswer: "A", topicTag: "Hooks" }]);
  const updateQuiz = (key, value) => setQuiz((prev) => ({ ...prev, [key]: value }));
  const updateQuestion = (index, patch) => setQuestions((prev) => prev.map((q, i) => i === index ? { ...q, ...patch } : q));

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
          options: (question.options || []).map((option) => typeof option === "string" ? option : option.text),
          correctAnswer: question.correctAnswer || question.options?.find((option) => option.isCorrect)?.label || "A",
          explanation: question.explanation || "",
        })));
      } catch (error) {
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [quizId, toast]);

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
          options: question.options.map((text, optionIndex) => ({ label: String.fromCharCode(65 + optionIndex), text, isCorrect: String.fromCharCode(65 + optionIndex) === question.correctAnswer })),
        })),
      };
      await apiRequest(isEditing ? `/api/instructor/quizzes/${quizId}` : "/api/instructor/quizzes", { method: isEditing ? "PATCH" : "POST", body: JSON.stringify(payload) });
      toast.success(isEditing ? "Quiz updated successfully." : "Quiz saved to the database.");
      navigate("/instructor/dashboard/quizzes");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <MotionCard className="text-center text-sm font-bold text-slate-400">Loading quiz...</MotionCard>;

  return (
    <div className="space-y-6">
      <QuizHero title={isEditing ? "Edit Quiz" : "Instructor Quiz Builder"} subtitle={isEditing ? "Update quiz details, settings, questions, answers, and explanations." : "Create secure assessments with marks, explanations, shuffle settings, and publish controls."} action={<button onClick={saveQuiz} disabled={saving} className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-black text-slate-950 disabled:opacity-60"><Save className="h-4 w-4" /> {saving ? "Saving..." : isEditing ? "Update Quiz" : "Save Quiz"}</button>} />
      <MotionCard>
        <div className="grid gap-4 lg:grid-cols-2">
          <Input label="Quiz title" value={quiz.title} onChange={(value) => updateQuiz("title", value)} placeholder="React Hooks Final Assessment" />
          <label className="block text-sm font-black">Course<select value={quiz.course} onChange={(event) => updateQuiz("course", event.target.value)} className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold dark:border-white/10 dark:bg-slate-900"><option value="">Select course</option>{courses.map((course) => <option key={course._id} value={course._id}>{course.title}</option>)}</select></label>
          <Input label="Duration (minutes)" type="number" value={quiz.duration} onChange={(value) => updateQuiz("duration", value)} />
          <Input label="Passing marks" type="number" value={quiz.passingMarks} onChange={(value) => updateQuiz("passingMarks", value)} />
          <Input label="Total marks" type="number" value={quiz.totalMarks} onChange={(value) => updateQuiz("totalMarks", value)} />
          <Input label="Attempts allowed" type="number" value={quiz.attemptsAllowed} onChange={(value) => updateQuiz("attemptsAllowed", value)} />
          <Select label="Difficulty" value={quiz.difficulty} onChange={(value) => updateQuiz("difficulty", value)} options={["easy", "medium", "hard"]} />
          <Select label="Status" value={quiz.status} onChange={(value) => updateQuiz("status", value)} options={["draft", "published", "archived"]} />
        </div>
        <textarea value={quiz.description} onChange={(event) => updateQuiz("description", event.target.value)} placeholder="Quiz description..." className="mt-4 w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-bold outline-none dark:border-white/10 dark:bg-white/5" rows={4} />
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {["negativeMarking", "shuffleQuestions", "showResultImmediately", "lockUntilLectureComplete"].map((key) => <Toggle key={key} label={key.replace(/([A-Z])/g, " $1")} checked={quiz[key]} onChange={() => updateQuiz(key, !quiz[key])} />)}
        </div>
      </MotionCard>
      <MotionCard>
        <div className="flex items-center justify-between gap-3"><h3 className="text-xl font-black">Question Builder</h3><button onClick={() => setQuestions((prev) => [...prev, initialQuestion])} className="inline-flex items-center gap-2 rounded-2xl bg-[#ff6b35] px-4 py-3 text-sm font-black text-white"><Plus className="h-4 w-4" /> Add question</button></div>
        <div className="mt-5 space-y-4">
          {questions.map((question, index) => (
            <div key={index} className="rounded-[24px] border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5">
              <div className="mb-3 flex items-center justify-between"><span className="inline-flex items-center gap-2 text-sm font-black"><GripVertical className="h-4 w-4" /> Question {index + 1}</span><div className="flex gap-2"><button onClick={() => setQuestions((prev) => [...prev, question])} className="rounded-xl border p-2 dark:border-white/10"><Copy className="h-4 w-4" /></button><button onClick={() => setQuestions((prev) => prev.filter((_, i) => i !== index))} className="rounded-xl border p-2 text-rose-500 dark:border-white/10"><Trash2 className="h-4 w-4" /></button></div></div>
              <div className="grid gap-3 md:grid-cols-3"><Select label="Type" value={question.questionType} onChange={(value) => updateQuestion(index, { questionType: value })} options={["single-choice", "multiple-choice", "true-false", "fill-blank", "short-answer", "code"]} /><Input label="Marks" type="number" value={question.marks} onChange={(value) => updateQuestion(index, { marks: value })} /><Input label="Topic tag" value={question.topicTag} onChange={(value) => updateQuestion(index, { topicTag: value })} /></div>
              <textarea value={question.questionText} onChange={(event) => updateQuestion(index, { questionText: event.target.value })} className="mt-3 w-full rounded-2xl border border-slate-200 bg-white p-4 text-sm font-bold outline-none dark:border-white/10 dark:bg-slate-900" rows={3} placeholder="Question text" />
              <div className="mt-3 grid gap-2 md:grid-cols-2">{question.options.map((option, optionIndex) => <Input key={optionIndex} label={`Option ${String.fromCharCode(65 + optionIndex)}`} value={option} onChange={(value) => { const next = [...question.options]; next[optionIndex] = value; updateQuestion(index, { options: next }); }} />)}</div>
              <Input label="Correct answer" value={question.correctAnswer} onChange={(value) => updateQuestion(index, { correctAnswer: value })} />
              <textarea value={question.explanation} onChange={(event) => updateQuestion(index, { explanation: event.target.value })} className="mt-3 w-full rounded-2xl border border-slate-200 bg-white p-4 text-sm font-bold outline-none dark:border-white/10 dark:bg-slate-900" rows={2} placeholder="Explanation shown after result" />
            </div>
          ))}
        </div>
      </MotionCard>
    </div>
  );
}

function Input({ label, value, onChange, type = "text", placeholder }) {
  return <label className="block text-sm font-black">{label}<input type={type} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold outline-none focus:border-[#ff6b35] dark:border-white/10 dark:bg-slate-900" /></label>;
}
function Select({ label, value, onChange, options }) {
  return <label className="block text-sm font-black">{label}<select value={value} onChange={(event) => onChange(event.target.value)} className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold outline-none dark:border-white/10 dark:bg-slate-900">{options.map((option) => <option key={option} value={option}>{option}</option>)}</select></label>;
}
function Toggle({ label, checked, onChange }) {
  return <button onClick={onChange} className={`rounded-2xl border p-4 text-left text-sm font-black capitalize ${checked ? "border-[#ff6b35] bg-orange-50 text-[#ff6b35] dark:bg-orange-500/10" : "border-slate-200 bg-white dark:border-white/10 dark:bg-slate-900"}`}>{label}<span className="mt-2 block text-xs text-slate-500">{checked ? "Enabled" : "Disabled"}</span></button>;
}
