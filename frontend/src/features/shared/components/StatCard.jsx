import { motion } from "framer-motion";
import { Area, AreaChart, ResponsiveContainer } from "recharts";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import * as Icons from "lucide-react";
function formatValue(v, prefix, decimals) {
  if (typeof v === "string") return v;
  if (decimals) return `${prefix ?? ""}${v.toFixed(decimals)}`;
  if (v >= 100000) return `${prefix ?? ""}${(v / 100000).toFixed(2)}L`;
  if (v >= 1000) return `${prefix ?? ""}${(v / 1000).toFixed(1)}k`;
  return `${prefix ?? ""}${v.toLocaleString()}`;
}
export function StatCard({
  label,
  value,
  prefix,
  decimals,
  delta = 0,
  trend = "up",
  icon = "Sparkles",
  spark,
  index = 0,
}) {
  const Icon = Icons[icon] ?? Icons.Sparkles;
  const data = (spark ?? [4, 6, 5, 8, 7, 10, 9, 12]).map((v, i) => ({ i, v }));
  const positive = trend === "up";
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: index * 0.04,
        duration: 0.45,
        ease: [0.22, 1, 0.36, 1],
      }}
      whileHover={{ y: -3 }}
      className="group relative overflow-hidden rounded-2xl card-premium p-5"
    >
      <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full gradient-aurora opacity-25 blur-2xl transition-opacity group-hover:opacity-40" />
      <div className="relative flex items-start justify-between gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-xl gradient-primary shadow-glow">
          <Icon className="h-[18px] w-[18px] text-primary-foreground" />
        </div>
        {delta !== 0 && (
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${positive ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive"}`}
          >
            {positive ? (
              <ArrowUpRight className="h-3 w-3" />
            ) : (
              <ArrowDownRight className="h-3 w-3" />
            )}
            {Math.abs(delta).toFixed(1)}%
          </span>
        )}
      </div>
      <div className="relative mt-4">
        <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">{label}</div>
        <div className="mt-1 font-display text-3xl font-semibold tracking-tight">
          {formatValue(value, prefix, decimals)}
        </div>
      </div>
      <div className="relative -mx-2 mt-3 h-10">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id={`spark-${label}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="oklch(0.78 0.16 70)" stopOpacity={0.55} />
                <stop offset="100%" stopColor="oklch(0.78 0.16 70)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="v"
              stroke="oklch(0.78 0.16 70)"
              strokeWidth={2}
              fill={`url(#spark-${label})`}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
