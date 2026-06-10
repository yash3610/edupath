import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  Award,
  BadgeHelp,
  Bell,
  BookOpen,
  Brain,
  BriefcaseBusiness,
  CalendarDays,
  ChartNoAxesCombined,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  Circle,
  Clock3,
  Compass,
  CreditCard,
  Download,
  FileCheck2,
  FileText,
  FolderKanban,
  Ellipsis,
  Flame,
  Gauge,
  GraduationCap,
  Heart,
  Image,
  LayoutDashboard,
  LineChart,
  ListChecks,
  Lock,
  Megaphone,
  MessageCircle,
  MessagesSquare,
  Menu,
  Moon,
  NotebookPen,
  PackageCheck,
  PanelTop,
  Play,
  PlayCircle,
  Plus,
  ReceiptText,
  Radio,
  RefreshCcw,
  Route,
  ScanSearch,
  Search,
  Send,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Star,
  Sun,
  ThumbsUp,
  Trophy,
  UploadCloud,
  UserRound,
  UserRoundCheck,
  Users,
  Video,
  WalletCards,
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
  ChartNoAxesCombined,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  Circle,
  Clock3,
  Compass,
  CreditCard,
  Download,
  FileCheck2,
  FileText,
  FolderKanban,
  Ellipsis,
  Flame,
  Gauge,
  GraduationCap,
  Heart,
  Image,
  LayoutDashboard,
  LineChart,
  ListChecks,
  Lock,
  Megaphone,
  MessageCircle,
  MessagesSquare,
  Menu,
  Moon,
  NotebookPen,
  PackageCheck,
  PanelTop,
  Play,
  PlayCircle,
  Plus,
  ReceiptText,
  Radio,
  RefreshCcw,
  Route,
  ScanSearch,
  Search,
  Send,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Star,
  Sun,
  ThumbsUp,
  Trophy,
  UploadCloud,
  UserRound,
  UserRoundCheck,
  Users,
  Video,
  WalletCards,
  X,
  Zap,
};

export function Icon({ name, className = "h-5 w-5" }) {
  const LucideIcon = icons[name] || icons.Circle;
  return <LucideIcon className={className} />;
}

export function MotionCard({ children, className = "", delay = 0 }) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 14, scale: 0.992 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={reduceMotion ? undefined : { y: -3 }}
      transition={{ duration: 0.32, delay, ease: [0.22, 1, 0.36, 1] }}
      className={`dashboard-motion-card min-w-0 rounded-[18px] border border-slate-200/80 bg-white p-4 shadow-[0_8px_30px_rgba(15,23,42,0.04)] dark:border-white/10 dark:bg-slate-900 sm:rounded-[22px] sm:p-6 ${className}`}
    >
      {children}
    </motion.div>
  );
}

export function SectionHeading({ eyebrow, title, action }) {
  return (
    <div className="dashboard-section-heading mb-4 flex min-w-0 flex-col gap-3 sm:mb-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#ff723a]">{eyebrow}</p>
        <h2 className="mt-1.5 text-xl font-extrabold leading-tight tracking-[-0.02em] text-slate-950 dark:text-white sm:text-2xl">{title}</h2>
      </div>
      {action}
    </div>
  );
}

export function ProgressBar({ value, color = "from-[#ff723a] to-[#fec961]" }) {
  return (
    <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
      <motion.div initial={{ width: 0 }} animate={{ width: `${value}%` }} transition={{ duration: 0.4, ease: "easeOut" }} className={`h-full rounded-full bg-gradient-to-r ${color}`} />
    </div>
  );
}

export function SkeletonCard() {
  return <div className="h-48 animate-pulse rounded-[28px] bg-gradient-to-r from-slate-200 via-white to-slate-200 dark:from-slate-800 dark:via-slate-700 dark:to-slate-800" />;
}
