import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Trash2 } from "lucide-react";
import { LmsPageHeader } from "@/features/shared/components/PageHeader";
import { DataTable } from "@/features/shared/components/DataTable";
import { StatusBadge } from "@/features/shared/components/StatusBadge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { instructorQuizzes } from "@/features/instructor/data/instructor";
import { toast } from "sonner";
import usePersistedDashboardState from "@/hooks/usePersistedDashboardState";
export default function QuizzesPage() {
  const [build, setBuild] = useState(false);
  const [list, setList] = usePersistedDashboardState("instructor", "instructorQuizzes", instructorQuizzes);
  const cols = [
    {
      key: "title",
      header: "Quiz",
      render: (r) => <span className="font-medium">{r.title}</span>,
    },
    {
      key: "course",
      header: "Course",
      render: (r) => <span className="text-sm text-muted-foreground">{r.course}</span>,
    },
    { key: "questions", header: "Q", render: (r) => r.questions },
    {
      key: "attempts",
      header: "Attempts",
      render: (r) => r.attempts.toLocaleString(),
    },
    {
      key: "pass",
      header: "Pass",
      render: (r) => <span className="text-success font-medium">{r.pass}%</span>,
    },
    {
      key: "difficulty",
      header: "Difficulty",
      render: (r) => <StatusBadge status={r.difficulty} />,
    },
    {
      key: "status",
      header: "Status",
      render: (r) => <StatusBadge status={r.status} />,
    },
  ];
  return (
    <div className="mx-auto max-w-[1500px]">
      <LmsPageHeader
        eyebrow="Learners"
        title="Quiz Builder"
        description="Create assessments with multiple question types."
        actions={
          <Button
            className="rounded-xl gradient-primary border-0 text-primary-foreground"
            onClick={() => setBuild(true)}
          >
            <Plus className="mr-1.5 h-4 w-4" /> New quiz
          </Button>
        }
      />
      <DataTable
        rows={list}
        columns={cols}
        searchKeys={["title", "course"]}
        actions={[
          { label: "Edit questions", onClick: () => setBuild(true) },
          {
            label: "View analytics",
            onClick: () => toast("Opening analytics…"),
          },
          {
            label: "Duplicate",
            onClick: (r) => {
              setList((items) => [{ ...r, id: `Q-${Date.now()}`, title: `${r.title} Copy`, status: "draft", attempts: 0 }, ...items]);
              toast.success(`Duplicated ${r.title}`);
            },
          },
          {
            label: "Delete",
            onClick: (r) => {
              setList((items) => items.filter((item) => item.id !== r.id));
              toast.error(`Deleted ${r.title}`);
            },
            danger: true,
          },
        ]}
      />

      <Dialog open={build} onOpenChange={setBuild}>
        <DialogContent className="max-w-3xl rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-display">New quiz</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label>Title</Label>
              <Input placeholder="React Hooks Deep Dive" className="mt-1 rounded-xl" />
            </div>
            <div>
              <Label>Course</Label>
              <Select>
                <SelectTrigger className="mt-1 rounded-xl">
                  <SelectValue placeholder="Pick a course" />
                </SelectTrigger>
                <SelectContent>
                  {["Advanced React", "Modern Design"].map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Duration (min)</Label>
              <Input type="number" defaultValue={20} className="mt-1 rounded-xl" />
            </div>
            <div>
              <Label>Total marks</Label>
              <Input type="number" defaultValue={50} className="mt-1 rounded-xl" />
            </div>
            <div>
              <Label>Passing marks</Label>
              <Input type="number" defaultValue={35} className="mt-1 rounded-xl" />
            </div>
            <div>
              <Label>Difficulty</Label>
              <Select defaultValue="medium">
                <SelectTrigger className="mt-1 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["easy", "medium", "hard"].map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="sm:col-span-2 flex items-center justify-between rounded-xl bg-muted/30 p-3 text-sm">
              <span>Shuffle questions</span>
              <Switch defaultChecked />
            </div>
            <div className="sm:col-span-2 flex items-center justify-between rounded-xl bg-muted/30 p-3 text-sm">
              <span>Show results to student</span>
              <Switch defaultChecked />
            </div>
          </div>

          <div className="mt-4">
            <div className="mb-2 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              Question 1
            </div>
            <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
              <Textarea
                rows={2}
                placeholder="What is the purpose of a Provider?"
                className="rounded-xl"
              />
              <div className="mt-3 space-y-2">
                {[0, 1, 2, 3].map((i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="flex items-center gap-2"
                  >
                    <Badge variant="outline" className="border-border/60">
                      {String.fromCharCode(65 + i)}
                    </Badge>
                    <Input placeholder={`Option ${i + 1}`} className="rounded-lg" />
                    <Button size="icon" variant="ghost" className="h-9 w-9 rounded-lg">
                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                    </Button>
                  </motion.div>
                ))}
              </div>
              <Button size="sm" variant="outline" className="mt-3 rounded-lg border-border/60">
                <Plus className="mr-1 h-3.5 w-3.5" /> Add option
              </Button>
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" className="rounded-xl" onClick={() => setBuild(false)}>
              Cancel
            </Button>
            <Button
              className="rounded-xl gradient-primary border-0 text-primary-foreground"
              onClick={() => {
                toast.success("Quiz saved as draft");
                setBuild(false);
              }}
            >
              Save draft
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

