import React, { useState } from "react";
import { Icon, MotionCard, SectionHeading } from "../../components/dashboard/DashboardPrimitives.jsx";

const conversations = [
  ["Jenny Wilson", "React Instructor", "/assets/images/team/team-1/1.png", "Online"],
  ["Robert Fox", "AI Mentor", "/assets/images/team/team-1/2.png", "Online"],
  ["Study Group", "Community", "/assets/images/course/details/student-1.png", "Offline"],
];

const chat = [
  ["them", "Your dashboard structure is much cleaner now."],
  ["me", "I fixed mobile sidebar and internal page UI."],
  ["them", "Great. Add notes from this conversation to your project checklist."],
];

export default function MessagesPage() {
  const [active, setActive] = useState(conversations[0]);

  return (
    <div className="space-y-5">
      <SectionHeading eyebrow="Messages" title="Instructor conversations" />

      <div className="grid gap-5 xl:grid-cols-[340px_1fr]">
        <MotionCard className="p-4">
          <div className="mb-4 flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 dark:border-white/10">
            <Icon name="Search" className="h-4 w-4 text-slate-400" />
            <input className="w-full bg-transparent text-sm font-bold outline-none" placeholder="Search conversations" />
          </div>
          <div className="space-y-2">
            {conversations.map((item) => (
              <button key={item[0]} onClick={() => setActive(item)} className={`flex w-full items-center gap-3 rounded-2xl p-3 text-left ${active[0] === item[0] ? "bg-orange-50 dark:bg-white/10" : "hover:bg-slate-100 dark:hover:bg-white/10"}`}>
                <img src={item[2]} alt={item[0]} className="h-11 w-11 rounded-xl object-cover" />
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-sm font-black">{item[0]}</h3>
                  <p className="truncate text-xs text-slate-500">{item[1]}</p>
                </div>
                <span className={`h-2.5 w-2.5 rounded-full ${item[3] === "Online" ? "bg-emerald-500" : "bg-slate-300"}`} />
              </button>
            ))}
          </div>
        </MotionCard>

        <MotionCard className="flex min-h-[560px] flex-col p-0">
          <div className="flex items-center gap-3 border-b border-slate-200 p-4 dark:border-white/10">
            <img src={active[2]} alt={active[0]} className="h-11 w-11 rounded-xl object-cover" />
            <div>
              <h3 className="font-black">{active[0]}</h3>
              <p className="text-xs text-slate-500">{active[3]}</p>
            </div>
          </div>
          <div className="flex-1 space-y-3 p-4">
            {chat.map(([type, text], index) => (
              <div key={index} className={`flex ${type === "me" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[82%] rounded-2xl px-4 py-3 text-sm font-bold leading-6 ${type === "me" ? "bg-[#ff6b35] text-white" : "bg-slate-100 dark:bg-white/10"}`}>
                  {text}
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-2 border-t border-slate-200 p-4 dark:border-white/10">
            <button className="rounded-xl border border-slate-200 p-3 dark:border-white/10"><Icon name="UploadCloud" /></button>
            <input className="min-w-0 flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold outline-none dark:border-white/10 dark:bg-slate-800" placeholder="Type message..." />
            <button className="rounded-xl bg-[#ff6b35] px-4 py-3 text-white"><Icon name="Send" /></button>
          </div>
        </MotionCard>
      </div>
    </div>
  );
}
