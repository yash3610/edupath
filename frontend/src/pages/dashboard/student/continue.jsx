import { motion, AnimatePresence } from "framer-motion";
import { useMemo, useState } from "react";
import {
  Bookmark,
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Download,
  FileText,
  Lock,
  Pause,
  Play,
  PlayCircle,
  RotateCcw,
  StickyNote,
} from "lucide-react";
import { PageHeader } from "@/features/student/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { continueLearning, student } from "@/features/student/data/mock";
const PLAYLIST = [
  {
    id: "l1",
    title: "Course welcome",
    duration: "4 min",
    durationSec: 240,
    module: "Module 1 · Foundations",
    chapter: "Chapter 1",
    description: "Set the stage for the course and meet your instructor.",
  },
  {
    id: "l2",
    title: "Mental models",
    duration: "12 min",
    durationSec: 720,
    module: "Module 1 · Foundations",
    chapter: "Chapter 2",
    description: "The three mental models that separate good React engineers from great ones.",
  },
  {
    id: "l3",
    title: "Compound Components",
    duration: "18 min",
    durationSec: 1080,
    module: "Module 5 · Patterns",
    chapter: "Chapter 2",
    description:
      "Compose flexible, expressive APIs by letting parents and children talk implicitly.",
  },
  {
    id: "l4",
    title: "Compound Components & the Provider Pattern",
    duration: "42 min",
    durationSec: 2520,
    module: "Module 5 · Patterns",
    chapter: "Chapter 3",
    description:
      "Build a fully accessible Tabs primitive from scratch, then evolve it with a Provider for clean state management.",
  },
  {
    id: "l5",
    title: "Render Props in 2026",
    duration: "22 min",
    durationSec: 1320,
    module: "Module 5 · Patterns",
    chapter: "Chapter 4",
    description:
      "When render props are still the right tool — and when hooks have replaced them.",
  },
  {
    id: "l6",
    title: "Headless UI primitives",
    duration: "26 min",
    durationSec: 1560,
    module: "Module 5 · Patterns",
    chapter: "Chapter 5",
    description: "Ship a headless library other teams will actually adopt.",
  },
  {
    id: "l7",
    title: "Profiler in depth",
    duration: "20 min",
    durationSec: 1200,
    module: "Module 6 · Performance",
    chapter: "Chapter 1",
    description: "Read flame graphs like a pro and find the real bottleneck.",
    locked: true,
  },
  {
    id: "l8",
    title: "Memoization done right",
    duration: "16 min",
    durationSec: 960,
    module: "Module 6 · Performance",
    chapter: "Chapter 2",
    description:
      "Stop over-memoizing. A pragmatic guide to when memo / useMemo / useCallback actually help.",
    locked: true,
  },
];
export default function ContinuePage() {
  const { course } = continueLearning;
  const [completed, setCompleted] = useState({ l1: true, l2: true, l3: true });
  const [activeId, setActiveId] = useState("l4");
  const [progressSec, setProgressSec] = useState(1058); // ~42% into l4
  const [playing, setPlaying] = useState(false);
  const active = PLAYLIST.find((l) => l.id === activeId);
  const activeIndex = PLAYLIST.findIndex((l) => l.id === activeId);
  // playable neighbours skip locked
  const findNext = (dir) => {
    let i = activeIndex + dir;
    while (i >= 0 && i < PLAYLIST.length) {
      if (!PLAYLIST[i].locked) return PLAYLIST[i];
      i += dir;
    }
    return null;
  };
  const prev = findNext(-1);
  const next = findNext(1);
  const totalDone = PLAYLIST.filter((l) => completed[l.id]).length;
  const overallProgress = Math.round((totalDone / PLAYLIST.length) * 100);
  const watchedPct = Math.round((progressSec / active.durationSec) * 100);
  const goTo = (l) => {
    if (l.locked) return;
    setActiveId(l.id);
    setProgressSec(0);
    setPlaying(false);
  };
  const markComplete = () => {
    setCompleted((c) => ({ ...c, [active.id]: true }));
    setProgressSec(active.durationSec);
    setPlaying(false);
    if (next) {
      setTimeout(() => {
        setActiveId(next.id);
        setProgressSec(0);
      }, 400);
    }
  };
  // group playlist into modules
  const modules = useMemo(() => {
    const map = new Map();
    PLAYLIST.forEach((l) => {
      if (!map.has(l.module)) map.set(l.module, []);
      map.get(l.module).push(l);
    });
    return Array.from(map.entries()).map(([name, lectures]) => ({
      name,
      lectures,
    }));
  }, []);
  const fmt = (s) => {
    const m = Math.floor(s / 60)
      .toString()
      .padStart(2, "0");
    const ss = Math.floor(s % 60)
      .toString()
      .padStart(2, "0");
    return `${m}:${ss}`;
  };
  return (
    <div className="mx-auto max-w-[1500px]">
      <PageHeader eyebrow="Resume" title="Continue Learning" description={course.title} />

      <div className="grid gap-6 lg:grid-cols-[300px_1fr_320px]">
        {/* Left: course content */}
        <aside className="rounded-2xl card-premium p-4 lg:sticky lg:top-20 lg:h-fit">
          <h3 className="px-2 pb-2 font-display text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Course Content
          </h3>
          <div className="space-y-4">
            {modules.map((m) => (
              <div key={m.name}>
                <div className="px-2 text-xs font-semibold text-foreground/90">{m.name}</div>
                <ul className="mt-2 space-y-1">
                  {m.lectures.map((l) => {
                    const isActive = l.id === activeId;
                    const isDone = !!completed[l.id];
                    return (
                      <li key={l.id}>
                        <button
                          onClick={() => goTo(l)}
                          disabled={l.locked}
                          className={`flex w-full items-start gap-2 rounded-xl p-2 text-left text-sm transition-all ${isActive ? "bg-primary/10 ring-1 ring-primary/30" : "hover:bg-muted/60"} ${l.locked ? "opacity-50 cursor-not-allowed" : ""}`}
                        >
                          <div className="mt-0.5 shrink-0">
                            {l.locked ? (
                              <Lock className="h-4 w-4 text-muted-foreground" />
                            ) : isDone ? (
                              <CheckCircle2 className="h-4 w-4 text-success" />
                            ) : (
                              <PlayCircle
                                className={`h-4 w-4 ${isActive ? "text-primary" : "text-muted-foreground"}`}
                              />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="truncate">{l.title}</div>
                            <div className="text-[11px] text-muted-foreground">{l.duration}</div>
                          </div>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </aside>

        {/* Center: player */}
        <section className="space-y-4">
          <motion.div
            key={active.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative aspect-video overflow-hidden rounded-2xl bg-black shadow-elegant"
          >
            <img
              src={course.cover}
              alt=""
              className="absolute inset-0 h-full w-full object-cover opacity-60"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
            <button
              onClick={() => setPlaying((p) => !p)}
              className="absolute inset-0 grid place-items-center"
              aria-label={playing ? "Pause" : "Play"}
            >
              <motion.span
                key={playing ? "p" : "play"}
                initial={{ scale: 0.85, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="grid h-20 w-20 place-items-center rounded-full gradient-primary shadow-glow"
              >
                {playing ? (
                  <Pause className="h-9 w-9 text-primary-foreground" />
                ) : (
                  <Play className="h-9 w-9 text-primary-foreground" />
                )}
              </motion.span>
            </button>
            <div className="absolute bottom-3 left-4 right-4 space-y-1.5">
              <div className="flex items-center justify-between text-[11px] text-white/80">
                <span>{fmt(progressSec)}</span>
                <span>{fmt(active.durationSec)}</span>
              </div>
              <Progress value={watchedPct} className="h-1" />
            </div>
          </motion.div>

          <div className="rounded-2xl card-premium p-6">
            <Badge className="border-0 bg-accent/15 text-accent">
              {completed[active.id] ? "Completed" : playing ? "Now playing" : "Up next"}
            </Badge>
            <h2 className="mt-2 font-display text-2xl font-semibold">{active.title}</h2>
            <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
              <span>
                {active.module} · {active.chapter}
              </span>
              <span>·</span>
              <span>{active.duration}</span>
            </div>

            <Tabs defaultValue="desc" className="mt-6">
              <TabsList className="rounded-xl bg-muted/60">
                <TabsTrigger value="desc" className="rounded-lg">
                  Description
                </TabsTrigger>
                <TabsTrigger value="notes" className="rounded-lg">
                  Notes
                </TabsTrigger>
                <TabsTrigger value="res" className="rounded-lg">
                  Resources
                </TabsTrigger>
                <TabsTrigger value="dl" className="rounded-lg">
                  Downloads
                </TabsTrigger>
              </TabsList>
              <TabsContent value="desc" className="mt-4 text-sm text-muted-foreground">
                <AnimatePresence mode="wait">
                  <motion.p
                    key={active.id}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                  >
                    {active.description}
                  </motion.p>
                </AnimatePresence>
              </TabsContent>
              <TabsContent value="notes" className="mt-4">
                <textarea
                  className="h-32 w-full rounded-xl border border-border bg-muted/30 p-3 text-sm"
                  placeholder="Type your notes…"
                />
              </TabsContent>
              <TabsContent value="res" className="mt-4 space-y-2 text-sm">
                <Resource icon={FileText} name="Cheatsheet.pdf" />
                <Resource icon={FileText} name="Source Code.zip" />
              </TabsContent>
              <TabsContent value="dl" className="mt-4 space-y-2 text-sm">
                <Resource icon={Download} name="Lecture video (720p) — 412 MB" />
                <Resource icon={Download} name="Transcript (PDF)" />
              </TabsContent>
            </Tabs>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
              <Button
                onClick={() => prev && goTo(prev)}
                disabled={!prev}
                variant="outline"
                className="rounded-xl disabled:opacity-40"
              >
                <ChevronLeft className="mr-1 h-4 w-4" /> Previous
              </Button>

              {completed[active.id] ? (
                <Button
                  onClick={() => {
                    setCompleted((c) => ({ ...c, [active.id]: false }));
                    setProgressSec(0);
                  }}
                  variant="outline"
                  className="rounded-xl"
                >
                  <RotateCcw className="mr-2 h-4 w-4" /> Mark incomplete
                </Button>
              ) : (
                <Button
                  onClick={markComplete}
                  className="rounded-xl gradient-primary border-0 text-primary-foreground"
                >
                  <CheckCircle2 className="mr-2 h-4 w-4" /> Mark complete
                </Button>
              )}

              <Button
                onClick={() => next && goTo(next)}
                disabled={!next}
                variant="outline"
                className="rounded-xl disabled:opacity-40"
              >
                Next <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </div>
        </section>

        {/* Right */}
        <aside className="space-y-4 lg:sticky lg:top-20 lg:h-fit">
          <div className="rounded-2xl card-premium p-5">
            <h3 className="font-display text-base font-semibold">Course Progress</h3>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="font-display text-3xl font-semibold text-gradient">
                {overallProgress}%
              </span>
              <span className="text-xs text-muted-foreground">
                {totalDone}/{PLAYLIST.length} lectures
              </span>
            </div>
            <Progress value={overallProgress} className="mt-2 h-2" />
          </div>

          <div className="rounded-2xl card-premium p-5">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-display text-base font-semibold">Instructor</h3>
              <Bookmark className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12 ring-2 ring-primary/30">
                <AvatarImage src="https://i.pravatar.cc/80?img=44" alt="Sara Lin" />
                <AvatarFallback>SL</AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium">Sara Lin</div>
                <div className="text-xs text-muted-foreground">
                  Principal Engineer · ex-Vercel
                </div>
              </div>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              Sara has shipped design systems used by 200M+ users. Her courses focus on craft and
              pragmatism.
            </p>
          </div>

          <div className="rounded-2xl card-premium p-5">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-display text-base font-semibold">Bookmarks</h3>
              <StickyNote className="h-4 w-4 text-muted-foreground" />
            </div>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center justify-between">
                <span>Hook composition tip</span>
                <span className="text-xs text-muted-foreground">12:04</span>
              </li>
              <li className="flex items-center justify-between">
                <span>Provider boundary</span>
                <span className="text-xs text-muted-foreground">19:42</span>
              </li>
              <li className="flex items-center justify-between">
                <span>Accessibility note</span>
                <span className="text-xs text-muted-foreground">28:11</span>
              </li>
            </ul>
          </div>

          <div className="rounded-2xl card-premium p-5 text-center">
            <Avatar className="mx-auto h-12 w-12 ring-2 ring-primary/40">
              <AvatarImage src={student.avatar} alt={student.name} />
              <AvatarFallback>{student.name[0]}</AvatarFallback>
            </Avatar>
            <div className="mt-2 text-sm font-medium">{student.name}</div>
            <div className="text-xs text-muted-foreground">
              <BookOpen className="inline h-3 w-3 mr-1" />
              Lv {student.level} · {student.rank}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
function Resource({ icon: Icon, name }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-muted/30 p-3 transition-all hover:bg-muted/60">
      <Icon className="h-4 w-4 text-primary" />
      <span className="flex-1 truncate">{name}</span>
      <Button size="sm" variant="ghost" className="rounded-lg">
        <Download className="h-4 w-4" />
      </Button>
    </div>
  );
}

