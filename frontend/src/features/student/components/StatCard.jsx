import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect } from "react";
import { cn } from "@/lib/utils";
export function AnimatedNumber({ value, decimals = 0 }) {
  const mv = useMotionValue(0);
  const rounded = useTransform(mv, (v) => v.toFixed(decimals));
  useEffect(() => {
    const c = animate(mv, value, { duration: 1.2, ease: [0.22, 1, 0.36, 1] });
    return () => c.stop();
  }, [value, mv]);
  return <motion.span>{rounded}</motion.span>;
}
export function StatCard({
  label,
  value,
  icon: Icon,
  suffix,
  accent = "primary",
  delay = 0,
  hint,
}) {
  const ring = {
    primary: "from-primary/30 to-primary/0",
    accent: "from-accent/30 to-accent/0",
    success: "from-success/30 to-success/0",
    warning: "from-warning/30 to-warning/0",
  }[accent];
  const iconBg = {
    primary: "gradient-primary text-primary-foreground",
    accent: "gradient-accent text-accent-foreground",
    success: "bg-success/15 text-success",
    warning: "bg-warning/15 text-warning-foreground",
  }[accent];
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
      className="group relative overflow-hidden rounded-2xl card-premium hover-lift"
    >
      <div
        className={cn(
          "pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br blur-2xl opacity-70",
          ring,
        )}
      />
      <div className="relative flex items-start justify-between p-5">
        <div className="min-w-0">
          <div className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
            {label}
          </div>
          <div className="mt-2 font-display text-3xl font-semibold tracking-tight">
            <AnimatedNumber value={value} />
            {suffix && <span className="text-base text-muted-foreground"> {suffix}</span>}
          </div>
          {hint && <div className="mt-1 text-xs text-success">{hint}</div>}
        </div>
        <div
          className={cn(
            "grid h-11 w-11 shrink-0 place-items-center rounded-xl shadow-soft",
            iconBg,
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </motion.div>
  );
}
