import React from "react";
import { motion } from "framer-motion";
import { AlertTriangle, CheckCircle2, Clock3, Lock, Search, ShieldCheck, Trophy } from "lucide-react";

export function StatusPill({ status }) {
  const styles = {
    Passed: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-200",
    Failed: "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-200",
    Locked: "bg-slate-200 text-slate-600 dark:bg-white/10 dark:text-slate-300",
    "In Progress": "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-200",
  };
  return <span className={`rounded-full px-3 py-1 text-xs font-black ${styles[status] || "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-200"}`}>{status}</span>;
}

export function QuizMetric({ icon: Icon = Trophy, label, value }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm dark:border-white/10 dark:bg-white/5">
      <Icon className="mb-3 h-5 w-5 text-[#ff6b35]" />
      <p className="text-xs font-black uppercase tracking-[0.12em] text-slate-400">{label}</p>
      <p className="mt-1 text-lg font-black text-slate-950 dark:text-white">{value}</p>
    </div>
  );
}

export function QuizHero({ title, subtitle, action }) {
  return (
    <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="overflow-hidden rounded-[28px] bg-gradient-to-br from-slate-950 via-[#181438] to-[#ff6b35] p-6 text-white shadow-xl sm:p-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-orange-200">Premium Quiz System</p>
          <h2 className="mt-3 max-w-3xl text-3xl font-black leading-tight sm:text-4xl">{title}</h2>
          <p className="mt-3 max-w-2xl text-sm font-bold text-white/75 sm:text-base">{subtitle}</p>
        </div>
        {action}
      </div>
    </motion.section>
  );
}

export function SearchBox({ value, onChange, placeholder = "Search quiz..." }) {
  return (
    <label className="flex min-w-0 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 dark:border-white/10 dark:bg-slate-900">
      <Search className="h-4 w-4 text-slate-400" />
      <input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="w-full bg-transparent text-sm font-bold outline-none" />
    </label>
  );
}

export function EmptyState({ title = "No quizzes found", text = "Try changing filters or search terms." }) {
  return (
    <div className="rounded-[28px] border border-dashed border-slate-300 bg-white p-10 text-center dark:border-white/10 dark:bg-slate-900">
      <AlertTriangle className="mx-auto h-10 w-10 text-[#ff6b35]" />
      <h3 className="mt-4 text-xl font-black">{title}</h3>
      <p className="mt-2 text-sm font-bold text-slate-500 dark:text-slate-300">{text}</p>
    </div>
  );
}

export function RuleCard({ children }) {
  return (
    <div className="flex gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-sm font-bold text-slate-600 shadow-sm dark:border-white/10 dark:bg-slate-900 dark:text-slate-300">
      <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#ff6b35]" />
      <span>{children}</span>
    </div>
  );
}

export const quizIcons = { CheckCircle2, Clock3, Lock, Trophy };
