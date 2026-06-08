import React, { useState } from "react";
import { courses } from "../../data/dashboardData.js";
import { Icon, MotionCard, SectionHeading } from "../../components/dashboard/DashboardPrimitives.jsx";

const messages = [
  ["student", "Explain React protected routes in simple words."],
  ["ai", "A protected route checks whether a user is logged in before showing private content. If not, it redirects the user to login."],
];

export default function AITutorPage() {
  const [course, setCourse] = useState(courses[0].id);

  return (
    <div className="grid gap-5 xl:grid-cols-[1fr_320px]">
      <MotionCard className="min-h-[620px]">
        <SectionHeading eyebrow="AI Tutor" title="Ask doubts and save answers" />
        <div className="mb-4 flex flex-wrap gap-2">
          {["Explain this lecture", "Create examples", "Give interview questions", "Summarize topic"].map((item) => (
            <button key={item} className="rounded-xl bg-slate-100 px-3 py-2 text-sm font-bold dark:bg-white/10">{item}</button>
          ))}
        </div>
        <div className="space-y-3">
          {messages.map(([type, text], index) => (
            <div key={index} className={`flex ${type === "student" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[82%] rounded-2xl px-4 py-3 text-sm font-bold leading-6 ${type === "student" ? "bg-[#ff6b35] text-white" : "bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-slate-200"}`}>
                {text}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-5 flex gap-2 rounded-2xl border border-slate-200 p-2 dark:border-white/10">
          <button className="rounded-xl p-2 text-slate-500"><Icon name="UploadCloud" /></button>
          <input className="min-w-0 flex-1 bg-transparent text-sm font-bold outline-none" placeholder="Ask your doubt..." />
          <button className="rounded-xl bg-[#ff6b35] px-4 py-2 text-white"><Icon name="Send" /></button>
        </div>
      </MotionCard>

      <MotionCard>
        <SectionHeading eyebrow="Context" title="Course selector" />
        <select value={course} onChange={(event) => setCourse(event.target.value)} className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm font-bold dark:border-white/10 dark:bg-slate-800">
          {courses.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}
        </select>
        <div className="mt-5 rounded-2xl bg-orange-50 p-4 text-sm font-bold text-[#ff6b35] dark:bg-white/10">
          AI answers can be saved to Notes from here.
        </div>
        <button className="mt-4 w-full rounded-xl bg-slate-950 px-4 py-3 text-sm font-black text-white dark:bg-white dark:text-slate-950">
          Save answer to notes
        </button>
      </MotionCard>
    </div>
  );
}
