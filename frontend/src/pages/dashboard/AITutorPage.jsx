import React, { useEffect, useMemo, useRef, useState } from "react";
import { courses as fallbackCourses } from "../../data/dashboardData.js";
import { Icon, MotionCard, SectionHeading } from "../../components/dashboard/DashboardPrimitives.jsx";
import { useToast } from "../../context/ToastContext.jsx";
import { apiRequest } from "../../services/api.js";
import { learningApi } from "../../services/learningApi.js";

const quickPrompts = ["Explain this lecture", "Create examples", "Give interview questions", "Summarize topic"];

export default function AITutorPage() {
  const toast = useToast();
  const messagesEndRef = useRef(null);
  const [courses, setCourses] = useState(fallbackCourses);
  const [courseId, setCourseId] = useState(String(fallbackCourses[0]?.id || ""));
  const [messages, setMessages] = useState([]);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([
      learningApi.getMyCourses(),
      apiRequest("/api/ai/chat-history").catch(() => ({ data: [] })),
    ])
      .then(([enrollments, historyResult]) => {
        const enrolledCourses = (enrollments || []).map((item) => item.course || item).filter(Boolean);
        if (enrolledCourses.length) {
          setCourses(enrolledCourses);
          setCourseId(String(enrolledCourses[0]._id || enrolledCourses[0].id || ""));
        }
        setMessages(
          (historyResult.data || []).reverse().flatMap((item) => [
            { id: `${item._id}-question`, type: "student", text: item.question },
            { id: `${item._id}-answer`, type: "ai", text: item.answer },
          ]),
        );
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [messages, sending]);

  const selectedCourse = useMemo(
    () => courses.find((item) => String(item._id || item.id) === courseId),
    [courseId, courses],
  );
  const latestAnswer = [...messages].reverse().find((item) => item.type === "ai");

  async function askTutor(event, prompt = question) {
    event?.preventDefault();
    const cleanQuestion = prompt.trim();
    if (!cleanQuestion || sending) return;

    const temporaryId = `student-${Date.now()}`;
    setMessages((current) => [...current, { id: temporaryId, type: "student", text: cleanQuestion }]);
    setQuestion("");
    setSending(true);

    try {
      const payload = {
        question: cleanQuestion,
        context: selectedCourse
          ? `${selectedCourse.title}. Current lesson: ${selectedCourse.currentLecture || "course content"}`
          : "General learning help",
      };
      const selectedId = selectedCourse?._id || selectedCourse?.id;
      if (/^[a-f\d]{24}$/i.test(String(selectedId || ""))) payload.courseId = selectedId;

      const result = await apiRequest("/api/ai/ask-doubt", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      setMessages((current) => [
        ...current,
        { id: `${result.data?._id || Date.now()}-answer`, type: "ai", text: result.data?.answer || "I could not generate an answer." },
      ]);
    } catch (error) {
      setMessages((current) => current.filter((item) => item.id !== temporaryId));
      setQuestion(cleanQuestion);
      toast.error(error.message || "Could not contact AI Tutor.");
    } finally {
      setSending(false);
    }
  }

  async function saveLatestAnswer() {
    if (!latestAnswer) {
      toast.info("Ask the tutor a question first.");
      return;
    }

    try {
      setSaving(true);
      await apiRequest("/api/ai/save-answer-to-notes", {
        method: "POST",
        body: JSON.stringify({
          title: selectedCourse ? `AI Tutor - ${selectedCourse.title}` : "AI Tutor Answer",
          answer: latestAnswer.text,
        }),
      });
      toast.success("Answer saved to Notes.");
    } catch (error) {
      toast.error(error.message || "Could not save the answer.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[1fr_320px]">
      <MotionCard className="flex min-h-[620px] min-w-0 flex-col">
        <SectionHeading eyebrow="AI Tutor" title="Ask doubts and save answers" />

        <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
          {quickPrompts.map((item) => (
            <button key={item} type="button" onClick={() => askTutor(null, item)} disabled={sending} className="shrink-0 rounded-xl bg-slate-100 px-3 py-2 text-sm font-bold hover:bg-orange-50 hover:text-[#ff6b35] disabled:opacity-50 dark:bg-white/10">
              {item}
            </button>
          ))}
        </div>

        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto py-2">
          {!loading && messages.length === 0 && (
            <div className="flex min-h-72 flex-col items-center justify-center text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-50 text-[#ff6b35]"><Icon name="Brain" className="h-7 w-7" /></span>
              <p className="mt-3 text-sm font-bold text-slate-500">Ask your first question or select a prompt above.</p>
            </div>
          )}
          {loading && <p className="py-20 text-center text-sm font-bold text-slate-400">Loading conversation...</p>}
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.type === "student" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[82%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm font-bold leading-6 ${message.type === "student" ? "bg-[#ff6b35] text-white" : "bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-slate-200"}`}>
                {message.text}
              </div>
            </div>
          ))}
          {sending && (
            <div className="flex justify-start">
              <div className="rounded-2xl bg-slate-100 px-4 py-3 text-sm font-bold text-slate-400 dark:bg-white/10">Thinking...</div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={askTutor} className="mt-5 flex gap-2 rounded-2xl border border-slate-200 bg-white p-2 focus-within:border-[#ff6b35] dark:border-white/10 dark:bg-slate-900">
          <button type="button" className="rounded-xl p-2 text-slate-500" aria-label="Attach file"><Icon name="UploadCloud" /></button>
          <input
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            className="dashboard-search-input min-w-0 flex-1 text-sm font-bold text-[#1f1c35] placeholder:text-slate-400 dark:text-white"
            placeholder="Ask your doubt..."
            autoComplete="off"
          />
          <button type="submit" disabled={!question.trim() || sending} className="rounded-xl bg-[#ff6b35] px-4 py-2 text-white disabled:opacity-40" aria-label="Send question"><Icon name="Send" /></button>
        </form>
      </MotionCard>

      <MotionCard className="h-fit">
        <SectionHeading eyebrow="Context" title="Course selector" />
        <select value={courseId} onChange={(event) => setCourseId(event.target.value)} className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm font-bold outline-none focus:border-[#ff6b35] dark:border-white/10 dark:bg-slate-800">
          {courses.map((item) => <option key={item._id || item.id} value={item._id || item.id}>{item.title}</option>)}
        </select>
        <div className="mt-5 rounded-2xl bg-orange-50 p-4 text-sm font-bold text-[#ff6b35] dark:bg-white/10">
          AI answers can be saved to Notes from here.
        </div>
        <button type="button" onClick={saveLatestAnswer} disabled={!latestAnswer || saving} className="mt-4 w-full rounded-xl bg-slate-950 px-4 py-3 text-sm font-black text-white disabled:opacity-40 dark:bg-white dark:text-slate-950">
          {saving ? "Saving..." : "Save answer to notes"}
        </button>
      </MotionCard>
    </div>
  );
}
