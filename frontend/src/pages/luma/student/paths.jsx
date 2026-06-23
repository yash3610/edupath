import { motion } from "framer-motion";
import { useState } from "react";
import {
  ArrowRight,
  Check,
  Circle,
  Code,
  LineChart,
  Lock,
  Palette,
  PlayCircle,
  Server,
  Sparkles,
  Target,
} from "lucide-react";
import { PageHeader } from "@/features/student/components/PageHeader";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { learningPathProgress } from "@/features/student/data/mock";
import usePersistedDashboardState from "@/hooks/usePersistedDashboardState";
const INITIAL_PATHS = [
  {
    id: "p1",
    title: "Full-Stack Engineer",
    icon: Code,
    weeks: 16,
    progress: 62,
    color: "from-primary/30 to-primary/0",
    tagline: "Ship end-to-end products with React, Node, and Postgres.",
    outcomes: [
      "Build production React apps",
      "Design REST & tRPC APIs",
      "Model relational data",
      "Deploy to the edge",
    ],
    milestones: [
      { title: "JavaScript & TypeScript Essentials", weeks: 2 },
      { title: "Advanced React & Design Systems", weeks: 4 },
      { title: "Node, APIs & Databases", weeks: 4 },
      { title: "Auth, Payments & Realtime", weeks: 3 },
      { title: "Capstone: SaaS Product", weeks: 3 },
    ],
  },
  {
    id: "p2",
    title: "AI / ML Practitioner",
    icon: LineChart,
    weeks: 20,
    progress: 38,
    color: "from-accent/30 to-accent/0",
    tagline: "From linear models to production LLM apps.",
    outcomes: [
      "Train classical ML models",
      "Build neural networks",
      "Fine-tune LLMs",
      "Ship RAG applications",
    ],
    milestones: [
      { title: "Math for ML", weeks: 3 },
      { title: "Supervised & Unsupervised Learning", weeks: 4 },
      { title: "Deep Learning with PyTorch", weeks: 5 },
      { title: "LLMs, Embeddings & RAG", weeks: 4 },
      { title: "Capstone: AI Product", weeks: 4 },
    ],
  },
  {
    id: "p3",
    title: "Product Designer",
    icon: Palette,
    weeks: 12,
    progress: 14,
    color: "from-warning/30 to-warning/0",
    tagline: "Craft taste-driven, system-thinking product design.",
    outcomes: [
      "Run user research",
      "Build design systems",
      "Master Figma & motion",
      "Hand-off to engineering",
    ],
    milestones: [
      { title: "Design Fundamentals", weeks: 2 },
      { title: "Typography, Color & Layout", weeks: 2 },
      { title: "Design Systems in Figma", weeks: 3 },
      { title: "Interaction & Motion", weeks: 2 },
      { title: "Capstone: Product Redesign", weeks: 3 },
    ],
  },
  {
    id: "p4",
    title: "Cloud / DevOps",
    icon: Server,
    weeks: 18,
    progress: 0,
    color: "from-success/30 to-success/0",
    tagline: "Run reliable systems at scale on any cloud.",
    outcomes: [
      "Containerize anything",
      "Orchestrate with Kubernetes",
      "Automate CI/CD",
      "Observe & secure",
    ],
    milestones: [
      { title: "Linux & Networking", weeks: 3 },
      { title: "Docker & Containers", weeks: 3 },
      { title: "Kubernetes in Production", weeks: 5 },
      { title: "CI/CD & IaC", weeks: 4 },
      { title: "Capstone: Multi-region Deploy", weeks: 3 },
    ],
  },
];
export default function PathsPage() {
  const [progressById, setProgressById] = usePersistedDashboardState(
    "student",
    "learningPathProgress",
    learningPathProgress,
  );
  const paths = INITIAL_PATHS.map((path) => ({ ...path, progress: progressById[path.id] ?? path.progress }));
  const setPaths = (updater) => {
    const next = typeof updater === "function" ? updater(paths) : updater;
    setProgressById(Object.fromEntries(next.map((path) => [path.id, path.progress])));
  };
  const [open, setOpen] = useState(null);
  const onStart = (id) => {
    setPaths((p) => p.map((x) => (x.id === id ? { ...x, progress: Math.max(x.progress, 5) } : x)));
    const p = paths.find((x) => x.id === id);
    toast.success(p?.progress ? `Resuming ${p.title}` : `Started ${p?.title}`, {
      description: "Your next lecture is queued in Continue Learning.",
    });
    setOpen(null);
  };
  return (
    <div className="mx-auto max-w-[1300px]">
      <PageHeader
        eyebrow="Roadmaps"
        title="Learning Paths"
        description="Curated journeys from beginner to professional, AI-personalized."
        actions={
          <Button variant="outline" className="rounded-xl border-border/60">
            <Sparkles className="mr-2 h-4 w-4 text-primary" /> Generate with AI
          </Button>
        }
      />

      <div className="grid gap-6 md:grid-cols-2">
        {paths.map((p, i) => (
          <motion.button
            key={p.id}
            type="button"
            onClick={() => setOpen(p)}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            whileHover={{ y: -4 }}
            className="group relative overflow-hidden rounded-2xl card-premium p-6 text-left"
          >
            <div
              className={`pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-gradient-to-br ${p.color} blur-2xl`}
            />
            <div className="relative flex items-start gap-4">
              <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl gradient-primary shadow-glow">
                <p.icon className="h-6 w-6 text-primary-foreground" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-display text-xl font-semibold">{p.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{p.tagline}</p>
                <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                  <Badge variant="outline" className="border-border/60">
                    {p.milestones.length} milestones
                  </Badge>
                  <Badge variant="outline" className="border-border/60">
                    {p.weeks} weeks
                  </Badge>
                </div>
                <div className="mt-4 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-semibold text-primary">{p.progress}%</span>
                  </div>
                  <Progress value={p.progress} className="h-1.5" />
                </div>
              </div>
            </div>
            <div className="mt-5 flex items-center gap-2">
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  onStart(p.id);
                }}
                className="rounded-xl gradient-primary border-0 text-primary-foreground"
              >
                {p.progress > 0 ? "Continue path" : "Start path"}{" "}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  setOpen(p);
                }}
                variant="ghost"
                className="rounded-xl"
              >
                View roadmap
              </Button>
            </div>
          </motion.button>
        ))}
      </div>

      <Dialog open={!!open} onOpenChange={(o) => !o && setOpen(null)}>
        <DialogContent className="max-w-2xl rounded-2xl border-border/60 bg-card">
          {open && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3">
                  <div className="grid h-12 w-12 place-items-center rounded-xl gradient-primary shadow-glow">
                    <open.icon className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <div>
                    <DialogTitle className="font-display text-2xl">{open.title}</DialogTitle>
                    <DialogDescription className="mt-0.5">{open.tagline}</DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="mt-2 grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl bg-muted/40 p-4">
                  <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
                    <Target className="h-3.5 w-3.5" /> Outcomes
                  </div>
                  <ul className="space-y-1.5 text-sm">
                    {open.outcomes.map((o) => (
                      <li key={o} className="flex items-start gap-2">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" /> {o}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-xl bg-muted/40 p-4">
                  <div className="mb-2 flex items-center justify-between text-xs uppercase tracking-wider text-muted-foreground">
                    <span>Progress</span>
                    <span className="text-primary">{open.progress}%</span>
                  </div>
                  <Progress value={open.progress} className="h-1.5" />
                  <div className="mt-3 text-xs text-muted-foreground">
                    {open.weeks} weeks · {open.milestones.length} milestones
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <div className="mb-3 text-xs uppercase tracking-wider text-muted-foreground">
                  Roadmap
                </div>
                <ol className="space-y-2">
                  {open.milestones.map((m, idx) => {
                    const pct = ((idx + 1) / open.milestones.length) * 100;
                    const done = open.progress >= pct;
                    const active = !done && open.progress >= (idx / open.milestones.length) * 100;
                    return (
                      <li
                        key={m.title}
                        className="flex items-center gap-3 rounded-xl border border-border/60 bg-background/60 p-3"
                      >
                        <div
                          className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${done ? "bg-success/20 text-success" : active ? "gradient-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
                        >
                          {done ? (
                            <Check className="h-4 w-4" />
                          ) : active ? (
                            <PlayCircle className="h-4 w-4" />
                          ) : (
                            <Lock className="h-3.5 w-3.5" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-sm font-medium">{m.title}</div>
                          <div className="text-xs text-muted-foreground">{m.weeks} weeks</div>
                        </div>
                        <Circle
                          className={`h-2 w-2 fill-current ${done ? "text-success" : active ? "text-primary" : "text-muted-foreground/40"}`}
                        />
                      </li>
                    );
                  })}
                </ol>
              </div>

              <div className="mt-4 flex justify-end gap-2">
                <Button variant="ghost" onClick={() => setOpen(null)} className="rounded-xl">
                  Close
                </Button>
                <Button
                  onClick={() => onStart(open.id)}
                  className="rounded-xl gradient-primary border-0 text-primary-foreground"
                >
                  {open.progress > 0 ? "Continue path" : "Start path"}{" "}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

