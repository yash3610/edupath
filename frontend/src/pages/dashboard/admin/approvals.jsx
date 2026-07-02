import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle2, Eye, Loader2, ShieldX, XCircle } from "lucide-react";
import { LmsPageHeader } from "@/features/shared/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { courseApi, mapCourse } from "@/services/courseApi";
import { toast } from "sonner";

const CHECKLIST = [
  ["basicInfo", "Title, category, and description complete"],
  ["thumbnail", "Thumbnail uploaded"],
  ["modules", "At least one module"],
  ["lectures", "At least one lecture"],
  ["promoVideo", "Promo video added"],
  ["resources", "Resources attached"],
  ["quiz", "Quiz configured"],
  ["assignment", "Assignment configured"],
];

export default function ApprovalsPage() {
  const [list, setList] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [selectedDetails, setSelectedDetails] = useState(null);
  const [reject, setReject] = useState(false);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    loadApprovals();
  }, []);

  useEffect(() => {
    if (!selectedId) {
      setSelectedDetails(null);
      return;
    }
    loadDetails(selectedId);
  }, [selectedId]);

  async function loadApprovals() {
    try {
      setLoading(true);
      const result = await courseApi.pendingApprovals();
      const rows = (result.data || []).map(mapCourse);
      setList(rows);
      setSelectedId((current) => current || rows[0]?.id || "");
    } catch (error) {
      setList([]);
      setSelectedId("");
      toast.error(error.message || "Could not load live approvals.");
    } finally {
      setLoading(false);
    }
  }

  async function loadDetails(courseId) {
    try {
      const result = await courseApi.adminCourseDetails(courseId).catch(() => null);
      if (result?.data) setSelectedDetails(result.data);
    } catch {
      setSelectedDetails(null);
    }
  }

  const selected = useMemo(() => list.find((item) => item.id === selectedId) || null, [list, selectedId]);
  const checks = selectedDetails?.completion?.checks || {};

  async function approve(course) {
    try {
      setBusy(true);
      await courseApi.approveCourse(course.id);
      await courseApi.publishCourse(course.id);
      setList((current) => current.filter((item) => item.id !== course.id));
      setSelectedId((current) => (current === course.id ? "" : current));
      toast.success(`${course.title} approved and published.`);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setBusy(false);
    }
  }

  async function doReject() {
    if (!selected) return;
    if (!reason.trim()) {
      toast.error("Feedback is required.");
      return;
    }
    try {
      setBusy(true);
      await courseApi.rejectCourse(selected.id, reason.trim());
      setList((current) => current.filter((item) => item.id !== selected.id));
      setSelectedId("");
      setReject(false);
      setReason("");
      toast.success("Feedback sent to instructor.");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-[1500px]">
      <LmsPageHeader
        eyebrow="Catalog"
        title="Course Approvals"
        description={loading ? "Loading live approvals..." : `${list.length} courses pending review`}
      />

      <div className="grid gap-5 lg:grid-cols-[360px_1fr]">
        <div className="space-y-3">
          {loading ? (
            [1, 2, 3].map((item) => <div key={item} className="h-24 animate-pulse rounded-2xl bg-muted/40" />)
          ) : list.map((c, i) => {
            const active = selected?.id === c.id;
            return (
              <motion.button
                key={c.id}
                type="button"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                onClick={() => setSelectedId(c.id)}
                className={`relative w-full overflow-hidden rounded-2xl border bg-card p-3 text-left transition-all ${active ? "border-primary/60 shadow-glow" : "border-border/60 hover:border-border"}`}
              >
                <div className="flex gap-3">
                  <img src={c.cover} alt="" className="h-16 w-24 shrink-0 rounded-lg object-cover" />
                  <div className="min-w-0">
                    <Badge className="border-0 bg-warning/15 text-warning text-[10px]">Pending</Badge>
                    <div className="mt-1 line-clamp-2 text-sm font-medium">{c.title}</div>
                    <div className="mt-0.5 text-[11px] text-muted-foreground">{c.instructor}</div>
                  </div>
                </div>
              </motion.button>
            );
          })}
          {!loading && list.length === 0 && (
            <div className="rounded-2xl border border-dashed border-border/60 p-8 text-center text-sm text-muted-foreground">
              <CheckCircle2 className="mx-auto mb-2 h-6 w-6 text-success" /> All clear - no approvals pending.
            </div>
          )}
        </div>

        {selected ? (
          <motion.div key={selected.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl card-premium overflow-hidden">
            <div className="relative h-56 overflow-hidden">
              <img src={selected.cover} alt="" className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute bottom-4 left-5 right-5">
                <Badge className="border-0 bg-background/80 text-foreground">{selected.category}</Badge>
                <h2 className="mt-2 font-display text-2xl font-semibold text-white">{selected.title}</h2>
                <div className="mt-1 text-sm text-white/80">By {selected.instructor} · submitted {selected.updated}</div>
              </div>
            </div>

            <div className="p-5">
              <div className="mb-2 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Review checklist</div>
              <div className="grid gap-2 sm:grid-cols-2">
                {CHECKLIST.map(([key, label]) => (
                  <label key={key} className="flex items-center gap-2 rounded-lg border border-border/60 bg-muted/20 p-3 text-sm">
                    <Checkbox checked={Boolean(checks[key])} readOnly />
                    <span>{label}</span>
                  </label>
                ))}
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                <Button className="rounded-xl gradient-primary border-0 text-primary-foreground" onClick={() => approve(selected)} disabled={busy}>
                  {busy ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-1.5 h-4 w-4" />} Approve & publish
                </Button>
                <Link to={`/admin/dashboard/courses/${selected.id}/edit`}>
                  <Button variant="outline" className="rounded-xl border-border/60">
                    <Eye className="mr-1.5 h-4 w-4" /> Review details
                  </Button>
                </Link>
                <Button variant="outline" className="rounded-xl border-destructive/40 text-destructive hover:bg-destructive/10" onClick={() => setReject(true)} disabled={busy}>
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
            <DialogDescription>Tell the instructor what to improve. This feedback appears in their builder.</DialogDescription>
          </DialogHeader>
          <Textarea rows={5} placeholder="e.g. Module 2 is missing video lectures, and the description needs clearer outcomes." value={reason} onChange={(e) => setReason(e.target.value)} className="rounded-xl" />
          <DialogFooter>
            <Button variant="ghost" onClick={() => setReject(false)} className="rounded-xl">Cancel</Button>
            <Button className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={doReject} disabled={busy}>
              Send rejection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
