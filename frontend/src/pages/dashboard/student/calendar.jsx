import { motion } from "framer-motion";
import { PageHeader } from "@/features/student/components/PageHeader";
import { Badge } from "@/components/ui/badge";
import { upcoming } from "@/features/student/data/mock";
const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const today = 12;
const events = {
  12: ["Live: Server Components Q&A"],
  13: ["Quiz: Generics"],
  18: ["Due: Component Library"],
  20: ["Cohort Call"],
  24: ["Live: ML Workshop"],
};
export default function CalendarPage() {
  const cells = Array.from({ length: 35 }, (_, i) => i - 2); // Jun starts on Wed-ish
  return (
    <div className="mx-auto max-w-[1400px]">
      <PageHeader
        eyebrow="Schedule"
        title="Calendar"
        description="Live classes, quizzes, deadlines — one premium grid."
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl card-premium p-5"
        >
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-xl font-semibold">June 2026</h2>
            <div className="flex gap-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-primary" /> Live
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-accent" /> Quiz
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-warning" /> Deadline
              </span>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-2 text-center text-xs font-medium text-muted-foreground">
            {days.map((d) => (
              <div key={d} className="pb-2">
                {d}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-2">
            {cells.map((day, i) => {
              const valid = day > 0 && day <= 30;
              const isToday = day === today;
              const ev = events[day];
              return (
                <div
                  key={i}
                  className={`aspect-square rounded-xl border p-1.5 text-left text-xs transition-all ${valid ? "border-border bg-muted/20 hover:bg-muted/40" : "border-transparent"} ${isToday ? "ring-2 ring-primary border-primary" : ""}`}
                >
                  {valid && (
                    <>
                      <div className={`font-semibold ${isToday ? "text-primary" : ""}`}>{day}</div>
                      {ev?.map((e) => (
                        <div
                          key={e}
                          className="mt-1 truncate rounded-md bg-primary/15 px-1 py-0.5 text-[10px] text-primary"
                        >
                          {e}
                        </div>
                      ))}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </motion.div>

        <div className="rounded-2xl card-premium p-5">
          <h2 className="font-display text-lg font-semibold">Upcoming</h2>
          <ul className="mt-3 space-y-3">
            {upcoming.map((u) => (
              <li key={u.id} className="rounded-xl border border-border/60 bg-muted/30 p-3">
                <Badge className="border-0 bg-primary/15 text-primary text-[10px]">{u.type}</Badge>
                <div className="mt-2 text-sm font-medium">{u.title}</div>
                <div className="text-xs text-muted-foreground">{u.date}</div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

