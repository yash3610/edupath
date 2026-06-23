import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Download, FileArchive, FileText, FileVideo, Trash2 } from "lucide-react";
import { PageHeader } from "@/features/student/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
const INITIAL = [
  {
    id: "f1",
    name: "React Patterns — Cheatsheet",
    course: "Advanced React",
    size: "1.4 MB",
    type: "pdf",
  },
  {
    id: "f2",
    name: "ML Notebook Pack",
    course: "ML Foundations",
    size: "82 MB",
    type: "zip",
  },
  {
    id: "f3",
    name: "Lecture 12 — Video (720p)",
    course: "Advanced React",
    size: "412 MB",
    type: "video",
  },
  {
    id: "f4",
    name: "Design Tokens Starter",
    course: "Modern Design",
    size: "260 KB",
    type: "zip",
  },
];
const iconFor = { pdf: FileText, zip: FileArchive, video: FileVideo };
export default function DownloadsPage() {
  const [list, setList] = useState(INITIAL);
  const [done, setDone] = useState({});
  const [progress, setProgress] = useState({});
  const download = (id, name) => {
    if (progress[id] !== undefined) return;
    setProgress((p) => ({ ...p, [id]: 0 }));
    let pct = 0;
    const t = setInterval(() => {
      pct += 12 + Math.random() * 18;
      if (pct >= 100) {
        clearInterval(t);
        setProgress((p) => {
          const n = { ...p };
          delete n[id];
          return n;
        });
        setDone((d) => ({ ...d, [id]: true }));
        toast.success(`${name} downloaded`);
      } else {
        setProgress((p) => ({ ...p, [id]: Math.min(99, pct) }));
      }
    }, 220);
  };
  const remove = (id) => {
    setList((l) => l.filter((x) => x.id !== id));
    toast("File removed");
  };
  return (
    <div className="mx-auto max-w-[1100px]">
      <PageHeader
        eyebrow="Offline"
        title="Downloads"
        description="Saved files and offline lectures."
      />
      {list.length === 0 ? (
        <div className="rounded-2xl card-premium p-16 text-center text-sm text-muted-foreground">
          No saved files yet.
        </div>
      ) : (
        <div className="rounded-2xl card-premium overflow-hidden">
          {list.map((f, i) => {
            const Icon = iconFor[f.type];
            const pct = progress[f.id];
            const isDone = done[f.id];
            return (
              <motion.div
                key={f.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="flex items-center gap-4 border-b border-border/60 p-4 last:border-0 hover:bg-muted/30"
              >
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl gradient-primary shadow-soft">
                  <Icon className="h-5 w-5 text-primary-foreground" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-medium">{f.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {f.course} · {f.size}
                  </div>
                  {pct !== undefined && <Progress value={pct} className="mt-2 h-1.5" />}
                </div>
                {isDone ? (
                  <Button
                    variant="outline"
                    className="rounded-xl border-success/40 text-success"
                    disabled
                  >
                    <Check className="mr-2 h-4 w-4" /> Downloaded
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    className="rounded-xl"
                    disabled={pct !== undefined}
                    onClick={() => download(f.id, f.name)}
                  >
                    <Download className="mr-2 h-4 w-4" />{" "}
                    {pct !== undefined ? `${Math.round(pct)}%` : "Download"}
                  </Button>
                )}
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-9 w-9 rounded-lg text-destructive"
                  onClick={() => remove(f.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

