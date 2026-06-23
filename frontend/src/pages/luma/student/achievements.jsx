import { motion } from "framer-motion";
import { Brain, Crown, Flame, Gem, Moon, Sparkles, Trophy, Users, Lock } from "lucide-react";
import { PageHeader } from "@/features/student/components/PageHeader";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { achievements, leaderboard, student } from "@/features/student/data/mock";
const icons = { Sparkles, Flame, Trophy, Crown, Moon, Brain, Users, Gem };
const tierStyle = {
  bronze: "from-amber-700 to-amber-500",
  silver: "from-slate-300 to-slate-500",
  gold: "from-amber-300 to-amber-500",
  platinum: "from-violet-300 via-fuchsia-300 to-sky-300",
};
export default function AchievementsPage() {
  const earned = achievements.filter((a) => a.earned).length;
  return (
    <div className="mx-auto max-w-[1400px]">
      <PageHeader
        eyebrow="Gamification"
        title="Achievements"
        description="Badges, milestones, and bragging rights."
      />

      <div className="mb-8 rounded-3xl border border-border bg-card p-6 shadow-elegant md:p-8">
        <div className="grid gap-6 md:grid-cols-3">
          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground">
              Total earned
            </div>
            <div className="font-display text-4xl font-semibold text-gradient">
              {earned} / {achievements.length}
            </div>
            <Progress value={(earned / achievements.length) * 100} className="mt-3 h-2" />
          </div>
          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground">
              Current streak
            </div>
            <div className="font-display text-4xl font-semibold">
              {student.streak} <span className="text-base text-muted-foreground">days</span>
            </div>
            <div className="mt-2 text-xs text-success">
              <Flame className="inline h-3 w-3" /> Personal best
            </div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Rank</div>
            <div className="font-display text-4xl font-semibold">{student.rank}</div>
            <div className="mt-2 text-xs text-muted-foreground">
              Level {student.level} · {student.xp.toLocaleString()} XP
            </div>
          </div>
        </div>
      </div>

      <h2 className="mb-4 font-display text-xl font-semibold">Badges</h2>
      <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
        {achievements.map((a, i) => {
          const Icon = icons[a.icon] ?? Sparkles;
          return (
            <motion.div
              key={a.id}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.04 }}
              whileHover={{ y: -4 }}
              className={`relative overflow-hidden rounded-2xl card-premium p-6 text-center ${!a.earned ? "opacity-60" : ""}`}
            >
              <div
                className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${tierStyle[a.tier]} opacity-10`}
              />
              <div
                className={`relative mx-auto mb-3 grid h-20 w-20 place-items-center rounded-2xl bg-gradient-to-br ${tierStyle[a.tier]} ${a.earned ? "shadow-glow" : "grayscale"}`}
              >
                {a.earned ? (
                  <Icon className="h-10 w-10 text-background" />
                ) : (
                  <Lock className="h-8 w-8 text-background/80" />
                )}
              </div>
              <div className="font-display text-base font-semibold">{a.name}</div>
              <div className="mt-1 text-xs text-muted-foreground">{a.desc}</div>
              <Badge
                variant="outline"
                className="mt-3 border-border/60 text-[10px] uppercase tracking-wider"
              >
                {a.tier}
              </Badge>
            </motion.div>
          );
        })}
      </div>

      <h2 className="mt-10 mb-4 font-display text-xl font-semibold">Leaderboard</h2>
      <div className="rounded-2xl card-premium p-2 md:p-4">
        <ul className="divide-y divide-border/60">
          {leaderboard.map((l) => (
            <li
              key={l.rank}
              className={`flex items-center gap-4 rounded-xl p-3 ${l.name === student.name ? "bg-primary/10 ring-1 ring-primary/30" : ""}`}
            >
              <div
                className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl text-sm font-bold ${l.rank === 1 ? "gradient-primary text-primary-foreground" : l.rank === 2 ? "bg-secondary text-secondary-foreground" : l.rank === 3 ? "bg-warning/30 text-warning-foreground" : "bg-muted text-foreground"}`}
              >
                {l.rank}
              </div>
              <Avatar className="h-10 w-10">
                <AvatarImage src={l.avatar} alt={l.name} />
                <AvatarFallback>{l.name[0]}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="truncate font-medium">{l.name}</div>
                <div className="text-xs text-muted-foreground">{l.xp.toLocaleString()} XP</div>
              </div>
              {l.rank === 1 && <Crown className="h-5 w-5 text-primary" />}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

