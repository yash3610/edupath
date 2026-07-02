import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Upload } from "lucide-react";
import { LmsPageHeader } from "@/features/shared/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/features/shared/components/StatusBadge";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { instructorAssignments } from "@/features/instructor/data/instructor";
import { toast } from "sonner";
import usePersistedDashboardState from "@/hooks/usePersistedDashboardState";
export default function AssignmentsPage() {
  const [grade, setGrade] = useState(null);
  const [list, setList] = usePersistedDashboardState("instructor", "instructorAssignments", instructorAssignments);
  return (
    <div className="mx-auto max-w-[1400px]">
      <LmsPageHeader
        eyebrow="Learners"
        title="Assignments"
        description="Create assignments and grade submissions."
        actions={
          <Button className="rounded-xl gradient-primary border-0 text-primary-foreground">
            <Plus className="mr-1.5 h-4 w-4" /> New assignment
          </Button>
        }
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {list.map((a, i) => (
          <motion.div
            key={a.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className="rounded-2xl card-premium p-5"
          >
            <div className="flex items-start justify-between">
              <Badge variant="outline" className="border-border/60">
                {a.course}
              </Badge>
              <StatusBadge status={a.status} />
            </div>
            <h3 className="mt-3 font-display text-base font-semibold">{a.title}</h3>
            <div className="mt-1 text-xs text-muted-foreground">Due {a.deadline}</div>
            <div className="mt-4 grid grid-cols-2 gap-2 text-center">
              <div className="rounded-lg bg-muted/30 p-2">
                <div className="font-display text-lg font-semibold">{a.submissions}</div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  Submitted
                </div>
              </div>
              <div className="rounded-lg bg-muted/30 p-2">
                <div className="font-display text-lg font-semibold text-warning">{a.pending}</div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  Pending
                </div>
              </div>
            </div>
            <Button
              className="mt-4 w-full rounded-xl gradient-primary border-0 text-primary-foreground"
              onClick={() => setGrade(a)}
            >
              Grade submissions
            </Button>
          </motion.div>
        ))}
      </div>

      <Sheet open={!!grade} onOpenChange={(o) => !o && setGrade(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
          {grade && (
            <>
              <SheetHeader>
                <SheetTitle className="font-display">{grade.title}</SheetTitle>
              </SheetHeader>
              <div className="mt-2 text-xs text-muted-foreground">
                {grade.course} · {grade.pending} pending grade
              </div>

              <div className="mt-6 rounded-xl border border-border/60 bg-muted/20 p-4">
                <div className="text-sm font-medium">Priya Sharma</div>
                <div className="text-xs text-muted-foreground">Submitted 2h ago</div>
                <div className="mt-3 flex items-center gap-2 rounded-lg bg-background/50 p-3 text-sm">
                  <Upload className="h-4 w-4 text-primary" />
                  <span className="flex-1 font-mono text-xs">component-library.zip</span>
                  <Badge variant="outline" className="border-border/60">
                    2.4 MB
                  </Badge>
                </div>
                <div className="mt-4 grid gap-3">
                  <div>
                    <Label>Marks (out of 50)</Label>
                    <Input type="number" defaultValue={42} className="mt-1 rounded-xl" />
                  </div>
                  <div>
                    <Label>Feedback</Label>
                    <Textarea
                      rows={4}
                      placeholder="What worked well, what to improve…"
                      className="mt-1 rounded-xl"
                    />
                  </div>
                </div>
                <Button
                  className="mt-4 w-full rounded-xl gradient-primary border-0 text-primary-foreground"
                  onClick={() => {
                    setList((items) => items.map((item) => item.id === grade.id ? { ...item, pending: Math.max(0, item.pending - 1) } : item));
                    toast.success("Submission graded");
                    setGrade(null);
                  }}
                >
                  Submit grade
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

