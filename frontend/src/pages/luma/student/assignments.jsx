import { motion, AnimatePresence } from "framer-motion";
import { useMemo, useRef, useState } from "react";
import {
  Calendar,
  CheckCircle2,
  FileArchive,
  FileImage,
  FileText,
  Loader2,
  MessageSquareQuote,
  Paperclip,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { PageHeader } from "@/features/student/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { assignments as seed } from "@/features/student/data/mock";
const seedFeedback = {
  as2: "Solid work on the gradient descent derivation. Try vectorizing the update step for ~3× speedup. Nicely structured notebook.",
  as4: "Manifest is clean. Add resource limits and a readiness probe before promoting to prod.",
};
const statusStyle = {
  pending: "bg-warning/15 text-warning-foreground",
  submitted: "bg-accent/15 text-accent",
  graded: "bg-success/15 text-success",
};
const ACCEPT = ".pdf,.zip,.png,.jpg,.jpeg,.webp,.gif,application/pdf,application/zip,image/*";
const MAX_BYTES = 50 * 1024 * 1024;
function iconFor(type, name) {
  if (type.startsWith("image/")) return FileImage;
  if (type === "application/zip" || name.toLowerCase().endsWith(".zip")) return FileArchive;
  return FileText;
}
function isAllowed(f) {
  const n = f.name.toLowerCase();
  if (f.type.startsWith("image/")) return true;
  if (f.type === "application/pdf" || n.endsWith(".pdf")) return true;
  if (f.type === "application/zip" || n.endsWith(".zip")) return true;
  return false;
}
function fmtBytes(n) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}
export default function AssignmentsPage() {
  const [items, setItems] = useState(() =>
    seed.map((a) => ({
      ...a,
      feedback: seedFeedback[a.id],
      submission:
        a.status === "submitted" || a.status === "graded"
          ? {
              files: [
                {
                  id: "seed",
                  name: "submission.pdf",
                  size: 1.2 * 1024 * 1024,
                  type: "application/pdf",
                },
              ],
              submittedAt: "Jun 09, 2026",
            }
          : undefined,
    })),
  );
  const [activeId, setActiveId] = useState(items[0]?.id ?? "");
  const active = items.find((a) => a.id === activeId) ?? items[0];
  const update = (id, patch) =>
    setItems((xs) => xs.map((a) => (a.id === id ? { ...a, ...patch } : a)));
  return (
    <div className="mx-auto max-w-[1400px]">
      <PageHeader
        eyebrow="Practice"
        title="Assignments"
        description="Upload, submit, and track instructor feedback."
      />

      <div className="mb-8 grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="space-y-4">
          {items.map((a, i) => (
            <motion.div
              key={a.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ y: -2 }}
              onClick={() => setActiveId(a.id)}
              className={`cursor-pointer rounded-2xl card-premium p-5 transition-all ${active?.id === a.id ? "ring-2 ring-primary/50" : ""}`}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <Badge className={`border-0 ${statusStyle[a.status]}`}>{a.status}</Badge>
                  <h3 className="mt-2 font-display text-lg font-semibold">{a.title}</h3>
                  <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    <span>{a.course}</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" /> Due {a.due}
                    </span>
                    {a.submission && (
                      <span className="flex items-center gap-1 text-success">
                        <CheckCircle2 className="h-3 w-3" /> {a.submission.files.length} file
                        {a.submission.files.length === 1 ? "" : "s"}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {a.grade !== null && (
                    <div className="text-right">
                      <div className="text-xs text-muted-foreground">Grade</div>
                      <div className="font-display text-2xl font-semibold text-gradient">
                        {a.grade}
                      </div>
                    </div>
                  )}
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveId(a.id);
                    }}
                    className="rounded-xl gradient-primary border-0 text-primary-foreground"
                  >
                    {a.status === "graded"
                      ? "View feedback"
                      : a.status === "submitted"
                        ? "View submission"
                        : "Upload"}
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {active && (
          <SubmissionPanel
            key={active.id}
            assignment={active}
            onChange={(p) => update(active.id, p)}
          />
        )}
      </div>
    </div>
  );
}
function SubmissionPanel({ assignment, onChange }) {
  const [staged, setStaged] = useState([]);
  const [note, setNote] = useState("");
  const [dragging, setDragging] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);
  const totalBytes = useMemo(() => staged.reduce((s, x) => s + x.file.size, 0), [staged]);
  const overLimit = totalBytes > MAX_BYTES;
  const addFiles = (files) => {
    setError(null);
    const arr = Array.from(files);
    const bad = arr.find((f) => !isAllowed(f));
    if (bad) {
      setError(`${bad.name} isn't a PDF, ZIP, or image.`);
      return;
    }
    setStaged((cur) => [
      ...cur,
      ...arr.map((file) => ({
        file,
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      })),
    ]);
  };
  const submit = async () => {
    if (!staged.length || overLimit) return;
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 900));
    const files = staged.map((s) => ({
      id: s.id,
      name: s.file.name,
      size: s.file.size,
      type: s.file.type,
    }));
    onChange({
      status: "submitted",
      submission: {
        files,
        submittedAt: new Date().toLocaleDateString(undefined, {
          month: "short",
          day: "2-digit",
          year: "numeric",
        }),
        note: note || undefined,
      },
    });
    setStaged([]);
    setNote("");
    setSubmitting(false);
  };
  const reopen = () => onChange({ status: "pending", submission: undefined, grade: null });
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4 lg:sticky lg:top-20 lg:h-fit"
    >
      <div className="rounded-2xl card-premium p-6">
        <Badge className={`border-0 ${statusStyle[assignment.status]}`}>{assignment.status}</Badge>
        <h3 className="mt-2 font-display text-lg font-semibold">{assignment.title}</h3>
        <p className="text-xs text-muted-foreground">
          {assignment.course} · Due {assignment.due}
        </p>

        {assignment.status === "pending" ? (
          <>
            <p className="mt-4 text-xs text-muted-foreground">
              PDF, ZIP, or images. Up to 50 MB total.
            </p>

            <label
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragging(false);
                if (e.dataTransfer.files) addFiles(e.dataTransfer.files);
              }}
              className={`mt-3 grid cursor-pointer place-items-center rounded-2xl border-2 border-dashed p-7 text-center transition-all ${dragging ? "border-primary bg-primary/10" : "border-border bg-muted/30 hover:border-primary/60 hover:bg-primary/5"}`}
            >
              <div className="grid h-12 w-12 place-items-center rounded-2xl gradient-primary shadow-glow">
                <Upload className="h-5 w-5 text-primary-foreground" />
              </div>
              <div className="mt-3 text-sm font-medium">Drop files here</div>
              <div className="text-xs text-muted-foreground">or click to browse</div>
              <input
                ref={inputRef}
                type="file"
                multiple
                accept={ACCEPT}
                className="hidden"
                onChange={(e) => e.target.files && addFiles(e.target.files)}
              />
            </label>

            <AnimatePresence>
              {staged.length > 0 && (
                <motion.ul
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="mt-4 space-y-2"
                >
                  {staged.map(({ file, id }) => {
                    const Icon = iconFor(file.type, file.name);
                    return (
                      <li
                        key={id}
                        className="flex items-center gap-3 rounded-xl border border-border/60 bg-muted/30 p-3"
                      >
                        <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary/10 text-primary">
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-sm font-medium">{file.name}</div>
                          <div className="text-[11px] text-muted-foreground">
                            {fmtBytes(file.size)}
                          </div>
                        </div>
                        <button
                          onClick={() => setStaged((cur) => cur.filter((x) => x.id !== id))}
                          className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                          aria-label="Remove file"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </li>
                    );
                  })}
                </motion.ul>
              )}
            </AnimatePresence>

            {staged.length > 0 && (
              <div className="mt-3 flex items-center justify-between text-xs">
                <span className={overLimit ? "text-destructive" : "text-muted-foreground"}>
                  {fmtBytes(totalBytes)} of 50 MB
                </span>
                <span className="text-muted-foreground">
                  {staged.length} file{staged.length === 1 ? "" : "s"}
                </span>
              </div>
            )}
            {staged.length > 0 && (
              <Progress
                value={Math.min(100, (totalBytes / MAX_BYTES) * 100)}
                className="mt-1 h-1"
              />
            )}

            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Note to instructor (optional)…"
              className="mt-4 h-20 w-full rounded-xl border border-border bg-muted/30 p-3 text-sm outline-none transition-all focus:border-primary/60"
            />

            {error && <div className="mt-2 text-xs text-destructive">{error}</div>}

            <Button
              onClick={submit}
              disabled={!staged.length || overLimit || submitting}
              className="mt-4 w-full rounded-xl gradient-primary border-0 text-primary-foreground disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting…
                </>
              ) : (
                <>
                  <Paperclip className="mr-2 h-4 w-4" /> Submit assignment
                </>
              )}
            </Button>
          </>
        ) : (
          <>
            <div className="mt-4 rounded-xl bg-success/10 p-3 text-sm text-success flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
              <div>
                Submitted on {assignment.submission?.submittedAt}.
                {assignment.status === "graded" && assignment.grade !== null && (
                  <>
                    {" "}
                    Graded <span className="font-semibold">{assignment.grade}/100</span>.
                  </>
                )}
              </div>
            </div>

            <ul className="mt-3 space-y-2">
              {assignment.submission?.files.map((f) => {
                const Icon = iconFor(f.type, f.name);
                return (
                  <li
                    key={f.id}
                    className="flex items-center gap-3 rounded-xl border border-border/60 bg-muted/30 p-3"
                  >
                    <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary/10 text-primary">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium">{f.name}</div>
                      <div className="text-[11px] text-muted-foreground">{fmtBytes(f.size)}</div>
                    </div>
                  </li>
                );
              })}
            </ul>

            {assignment.submission?.note && (
              <div className="mt-3 rounded-xl border border-border/60 bg-muted/30 p-3 text-xs">
                <div className="mb-1 text-muted-foreground">Your note</div>
                {assignment.submission.note}
              </div>
            )}

            {assignment.status === "graded" && assignment.feedback && (
              <div className="mt-4 rounded-xl border border-accent/30 bg-accent/10 p-4">
                <div className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-accent">
                  <MessageSquareQuote className="h-3.5 w-3.5" /> Instructor feedback
                </div>
                <p className="text-sm leading-relaxed">{assignment.feedback}</p>
              </div>
            )}

            <Button onClick={reopen} variant="outline" className="mt-4 w-full rounded-xl">
              <Trash2 className="mr-2 h-4 w-4" /> Withdraw &amp; resubmit
            </Button>
          </>
        )}
      </div>
    </motion.div>
  );
}

