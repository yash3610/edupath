import React from "react";
import { motion } from "framer-motion";
import {
  Award,
  BadgeHelp,
  Bell,
  BookOpen,
  Brain,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  Circle,
  Clock3,
  Compass,
  Download,
  Flame,
  Gauge,
  Heart,
  LayoutDashboard,
  LineChart,
  Lock,
  MessageCircle,
  MessagesSquare,
  Menu,
  Moon,
  NotebookPen,
  Play,
  PlayCircle,
  ReceiptText,
  Route,
  ScanSearch,
  Search,
  Send,
  Settings,
  Sparkles,
  Sun,
  Trophy,
  UploadCloud,
  UserRound,
  X,
  Zap,
} from "lucide-react";

const icons = {
  Award,
  BadgeHelp,
  Bell,
  BookOpen,
  Brain,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  Circle,
  Clock3,
  Compass,
  Download,
  Flame,
  Gauge,
  Heart,
  LayoutDashboard,
  LineChart,
  Lock,
  MessageCircle,
  MessagesSquare,
  Menu,
  Moon,
  NotebookPen,
  Play,
  PlayCircle,
  ReceiptText,
  Route,
  ScanSearch,
  Search,
  Send,
  Settings,
  Sparkles,
  Sun,
  Trophy,
  UploadCloud,
  UserRound,
  X,
  Zap,
};

export function Icon({ name, className = "h-5 w-5" }) {
  const LucideIcon = icons[name] || icons.Circle;
  return <LucideIcon className={className} />;
}

export function MotionCard({ children, className = "", delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, delay, ease: "easeOut" }}
      className={`rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-slate-900 ${className}`}
    >
      {children}
    </motion.div>
  );
}

export function SectionHeading({ eyebrow, title, action }) {
  return (
    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.16em] text-[#ff6b35]">{eyebrow}</p>
        <h2 className="mt-1 text-xl font-black leading-tight text-slate-950 dark:text-white sm:text-2xl">{title}</h2>
      </div>
      {action}
    </div>
  );
}

export function ProgressBar({ value, color = "from-[#ff6b35] to-[#7c3aed]" }) {
  return (
    <div className="h-2.5 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
      <motion.div initial={{ width: 0 }} animate={{ width: `${value}%` }} transition={{ duration: 0.4, ease: "easeOut" }} className={`h-full rounded-full bg-gradient-to-r ${color}`} />
    </div>
  );
}

export function SkeletonCard() {
  return <div className="h-48 animate-pulse rounded-[28px] bg-gradient-to-r from-slate-200 via-white to-slate-200 dark:from-slate-800 dark:via-slate-700 dark:to-slate-800" />;
}
