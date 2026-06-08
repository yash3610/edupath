import React, { useState } from "react";
import { Copy, GripVertical, Plus, Save, Trash2 } from "lucide-react";
import { MotionCard } from "../../components/dashboard/DashboardPrimitives.jsx";
import { QuizHero } from "../../components/dashboard/quiz/QuizShell.jsx";

const initialQuestion = { questionType: "single-choice", questionText: "", marks: 10, difficulty: "medium", topicTag: "", options: ["", "", "", ""], correctAnswer: "A", explanation: "" };

export default function InstructorQuizBuilderPage() {
  const [quiz, setQuiz] = useState({ title: "", description: "", course: "react-mastery", duration: 20, passingMarks: 50, totalMarks: 100, difficulty: "medium", attemptsAllowed: 2, negativeMarking: true, shuffleQuestions: true, showResultImmediately: true, lockUntilLectureComplete: false, status: "draft" });
  const [questions, setQuestions] = useState([{ ...initialQuestion, questionText: "Which hook memoizes expensive derived values?", options: ["useMemo", "useEffect", "useRef", "useId"], correctAnswer: "A", topicTag: "Hooks" }]);
  const updateQuiz = (key, value) => setQuiz((prev) => ({ ...prev, [key]: value }));
  const updateQuestion = (index, patch) => setQuestions((prev) => prev.map((q, i) => i === index ? { ...q, ...patch } : q));

  return (
    <div className="space-y-6">
      <QuizHero title="Instructor Quiz Builder" subtitle="Create secure assessments with marks, explanations, shuffle settings, and publish controls." action={<button className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-black text-slate-950"><Save className="h-4 w-4" /> Save Draft</button>} />
      <MotionCard>
        <div className="grid gap-4 lg:grid-cols-2">
          <Input label="Quiz title" value={quiz.title} onChange={(value) => updateQuiz("title", value)} placeholder="React Hooks Final Assessment" />
          <Input label="Course" value={quiz.course} onChange={(value) => updateQuiz("course", value)} />
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
