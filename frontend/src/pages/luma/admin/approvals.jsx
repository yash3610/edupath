import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Eye, ShieldX, XCircle } from "lucide-react";
import { LmsPageHeader } from "@/features/shared/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { pendingApprovals } from "@/features/admin/data/admin";
import { toast } from "sonner";
const CHECKLIST = [
  "Title complete and descriptive",
  "Course description thorough",
  "Thumbnail uploaded and on-brand",
  "Minimum 10 lectures",
  "Pricing valid for category",
  "Instructor verified",
];
export default function ApprovalsPage() {
  const [list, setList] = useState(pendingApprovals);
  const [selected, setSelected] = useState(list[0] ?? null);
  const [reject, setReject] = useState(false);
  const [reason, setReason] = useState("");
  const approve = (r) => {
    toast.success(`${r.title} approved & published`);
    setList((l) => l.filter((x) => x.id !== r.id));
    setSelected((s) => (s?.id === r.id ? null : s));
  };
  const doReject = () => {
    if (!selected) return;
    toast.error(`Rejected — ${reason || "No reason"}`);
    setList((l) => l.filter((x) => x.id !== selected.id));
    setSelected(null);
    setReject(false);
    setReason("");
  };
  return (
    <div className="mx-auto max-w-[1500px]">
      <LmsPageHeader
        eyebrow="Catalog"
        title="Course Approvals"
        description={`${list.length} courses pending review · approve or send back with feedback.`}
      />

      <div className="grid gap-5 lg:grid-cols-[360px_1fr]">
        <div className="space-y-3">
          {list.map((c, i) => {
            const active = selected?.id === c.id;
            return (
              <motion.button
                key={c.id}
                type="button"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                onClick={() => setSelected(c)}
                className={`relative w-full overflow-hidden rounded-2xl border bg-card p-3 text-left transition-all ${active ? "border-primary/60 shadow-glow" : "border-border/60 hover:border-border"}`}
              >
                <div className="flex gap-3">
                  <img
                    src={c.cover}
                    alt=""
                    className="h-16 w-24 shrink-0 rounded-lg object-cover"
                  />
                  <div className="min-w-0">
                    <Badge className="border-0 bg-warning/15 text-warning text-[10px]">
                      Pending
                    </Badge>
                    <div className="mt-1 line-clamp-2 text-sm font-medium">{c.title}</div>
                    <div className="mt-0.5 text-[11px] text-muted-foreground">{c.instructor}</div>
                  </div>
                </div>
              </motion.button>
            );
          })}
          {list.length === 0 && (
            <div className="rounded-2xl border border-dashed border-border/60 p-8 text-center text-sm text-muted-foreground">
              <CheckCircle2 className="mx-auto mb-2 h-6 w-6 text-success" /> All clear — no
              approvals pending.
            </div>
          )}
        </div>

        {selected ? (
          <motion.div
            key={selected.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl card-premium overflow-hidden"
          >
            <div className="relative h-56 overflow-hidden">
              <img src={selected.cover} alt="" className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute bottom-4 left-5 right-5">
                <Badge className="border-0 bg-background/80 text-foreground">
                  {selected.category}
                </Badge>
                <h2 className="mt-2 font-display text-2xl font-semibold text-white">
                  {selected.title}
                </h2>
                <div className="mt-1 text-sm text-white/80">
                  By {selected.instructor} · submitted {selected.updated}
                </div>
              </div>
            </div>

            <div className="p-5">
              <div className="mb-2 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                Review checklist
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                {CHECKLIST.map((c, i) => (
                  <label
                    key={c}
                    className="flex items-center gap-2 rounded-lg border border-border/60 bg-muted/20 p-3 text-sm"
                  >
                    <Checkbox defaultChecked={i < 5} />
                    <span>{c}</span>
                  </label>
                ))}
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                <Button
                  className="rounded-xl gradient-primary border-0 text-primary-foreground"
                  onClick={() => approve(selected)}
                >
                  <CheckCircle2 className="mr-1.5 h-4 w-4" /> Approve & publish
                </Button>
                <Button variant="outline" className="rounded-xl border-border/60">
                  <Eye className="mr-1.5 h-4 w-4" /> Preview course
                </Button>
                <Button
                  variant="outline"
                  className="rounded-xl border-destructive/40 text-destructive hover:bg-destructive/10"
                  onClick={() => setReject(true)}
                >
                  <ShieldX className="mr-1.5 h-4 w-4" /> Reject
                </Button>
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="grid place-items-center rounded-2xl border border-dashed border-border/60 p-10 text-center text-sm text-muted-foreground">
            Select a course from the list to start reviewing.
          </div>
        )}
      </div>

      <Dialog open={reject} onOpenChange={setReject}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-display flex items-center gap-2">
              <XCircle className="h-5 w-5 text-destructive" /> Reject course
            </DialogTitle>
            <DialogDescription>
              Tell the instructor what to improve. They'll receive this feedback in their inbox.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            rows={5}
            placeholder="e.g. Module 2 is missing video lectures, pricing seems high for the duration…"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="rounded-xl"
          />
          <DialogFooter>
            <Button variant="ghost" onClick={() => setReject(false)} className="rounded-xl">
              Cancel
            </Button>
            <Button
              className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={doReject}
            >
              Send rejection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

