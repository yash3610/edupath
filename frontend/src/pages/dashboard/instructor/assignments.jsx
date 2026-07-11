import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  ExternalLink,
  FileText,
  Loader2,
  Plus,
  RefreshCw,
  Upload,
  Users,
} from "lucide-react";
import { LmsPageHeader } from "@/features/shared/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/features/shared/components/StatusBadge";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { courseApi, mapCourse } from "@/services/courseApi";
import { assignmentApi, mapAssignment, mapSubmission } from "@/services/assignmentApi";
import { toast } from "sonner";

const emptyDraft = {
  courseId: "",
  title: "",
  description: "",
  dueDate: "",
  maxMarks: 50,
};

export default function AssignmentsPage() {
  const [assignments, setAssignments] = useState([]);
  const [submissionsByAssignment, setSubmissionsByAssignment] = useState({});
  const [courses, setCourses] = useState([]);
  const [active, setActive] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submissionsLoading, setSubmissionsLoading] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [savingCreate, setSavingCreate] = useState(false);
  const [draft, setDraft] = useState(emptyDraft);
  const [grading, setGrading] = useState({});

  const loadData = async () => {
    setLoading(true);
    try {
      const [assignmentResult, courseResult] = await Promise.all([
        assignmentApi.instructorAssignments(),
        courseApi.instructorCourses(),
      ]);
      const rawAssignments = assignmentResult.data || [];
      const normalizedCourses = (courseResult.data || []).map(mapCourse);
      const submissionPairs = await Promise.all(
        rawAssignments.map(async (assignment) => {
          const id = assignment._id || assignment.id;
          try {
            const result = await assignmentApi.instructorSubmissions(id);
            return [id, (result.data || []).map(mapSubmission)];
          } catch {
            return [id, []];
          }
        }),
      );
      const submissionMap = Object.fromEntries(submissionPairs);
      setSubmissionsByAssignment(submissionMap);
      setAssignments(
        rawAssignments.map((assignment) =>
          mapAssignment(assignment, submissionMap[assignment._id || assignment.id] || []),
        ),
      );
      setCourses(normalizedCourses);
      setDraft((current) => ({
        ...current,
        courseId: current.courseId || normalizedCourses[0]?.id || "",
      }));
    } catch (error) {
      toast.error(error.message || "Unable to load assignments.");
      setAssignments([]);
      setSubmissionsByAssignment({});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const totals = useMemo(
    () => ({
      assignments: assignments.length,
      submitted: assignments.reduce((sum, item) => sum + item.submissions, 0),
      pending: assignments.reduce((sum, item) => sum + item.pending, 0),
      graded: assignments.reduce((sum, item) => sum + item.graded, 0),
    }),
    [assignments],
  );

  const openAssignment = async (assignment) => {
    setActive(assignment);
    const existing = submissionsByAssignment[assignment.id];
    if (existing) return;
    setSubmissionsLoading(true);
    try {
      const result = await assignmentApi.instructorSubmissions(assignment.id);
      const submissions = (result.data || []).map(mapSubmission);
      setSubmissionsByAssignment((current) => ({ ...current, [assignment.id]: submissions }));
      setAssignments((items) =>
        items.map((item) => (item.id === assignment.id ? mapAssignment(item, submissions) : item)),
      );
    } catch (error) {
      toast.error(error.message || "Unable to load submissions.");
    } finally {
      setSubmissionsLoading(false);
    }
  };

  const submitCreate = async (event) => {
    event.preventDefault();
    if (!draft.courseId || !draft.title.trim()) {
      toast.error("Please select a course and enter an assignment title.");
      return;
    }
    setSavingCreate(true);
    try {
      await assignmentApi.createInstructorAssignment(draft.courseId, {
        title: draft.title.trim(),
        description: draft.description.trim(),
        dueDate: draft.dueDate || undefined,
        maxMarks: Number(draft.maxMarks || 50),
      });
      toast.success("Assignment created successfully.");
      setCreateOpen(false);
      setDraft({ ...emptyDraft, courseId: courses[0]?.id || "" });
      await loadData();
    } catch (error) {
      toast.error(error.message || "Unable to create assignment.");
    } finally {
      setSavingCreate(false);
    }
  };

  const saveGrade = async (submission) => {
    const values = grading[submission.id] || {};
    const grade = values.grade ?? submission.grade;
    const feedback = values.feedback ?? submission.feedback;
    if (grade === "" || grade === undefined || grade === null) {
      toast.error("Please enter marks before saving.");
      return;
    }
    setGrading((current) => ({ ...current, [submission.id]: { ...values, saving: true } }));
    try {
      const result = await assignmentApi.gradeSubmission(submission.id, { grade, feedback });
      const updated = mapSubmission(result.data || {});
      setSubmissionsByAssignment((current) => {
        const rows = current[active.id] || [];
        return {
          ...current,
          [active.id]: rows.map((row) => (row.id === updated.id ? updated : row)),
        };
      });
      setAssignments((items) =>
        items.map((item) =>
          item.id === active.id
            ? mapAssignment(
                item,
                (submissionsByAssignment[active.id] || []).map((row) =>
                  row.id === updated.id ? updated : row,
                ),
              )
            : item,
        ),
      );
      toast.success("Submission graded successfully.");
    } catch (error) {
      toast.error(error.message || "Unable to save grade.");
    } finally {
      setGrading((current) => ({ ...current, [submission.id]: { ...current[submission.id], saving: false } }));
    }
  };

  const activeSubmissions = active ? submissionsByAssignment[active.id] || [] : [];

  return (
    <div className="mx-auto max-w-[1500px]">
      <LmsPageHeader
        eyebrow="Learners"
        title="Assignments"
        description="Assignment submissions, files, grading, and feedback."
        actions={
          <>
            <Button variant="outline" className="rounded-xl border-border/60" onClick={loadData}>
              <RefreshCw className="mr-1.5 h-4 w-4" /> Refresh
            </Button>
            <Button
              className="rounded-xl gradient-primary border-0 text-primary-foreground"
              onClick={() => setCreateOpen(true)}
            >
              <Plus className="mr-1.5 h-4 w-4" /> New assignment
            </Button>
          </>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryBox icon={FileText} label="Assignments" value={totals.assignments} />
        <SummaryBox icon={Upload} label="Submitted" value={totals.submitted} />
        <SummaryBox icon={Users} label="Pending grade" value={totals.pending} tone="text-warning" />
        <SummaryBox icon={CheckCircle2} label="Graded" value={totals.graded} tone="text-success" />
      </div>

      {loading ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <div key={item} className="h-56 animate-pulse rounded-2xl bg-muted/40" />
          ))}
        </div>
      ) : assignments.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border/60 p-10 text-center">
          <div className="font-display text-xl font-semibold">No assignments yet</div>
          <p className="mt-1 text-sm text-muted-foreground">
            Create an assignment from the button above. Student submissions will appear here.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {assignments.map((assignment, index) => (
            <div key={assignment.id}>
                  <AssignmentCard
                    key={assignment.id}
                    assignment={assignment}
                    index={index}
                    onOpen={() => openAssignment(assignment)}
                  />
              </div>
          ))}
        </div>
      )}

      <Sheet open={!!active} onOpenChange={(open) => !open && setActive(null)}>
        <SheetContent
          overlayClassName="bg-black/10"
          className="!w-[96vw] !max-w-none overflow-y-auto sm:!w-[calc(100vw-300px)] xl:!w-[calc(100vw-320px)]"
        >
          {active && (
            <>
              <SheetHeader>
                <SheetTitle className="font-display">{active.title}</SheetTitle>
              </SheetHeader>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <Badge variant="outline" className="border-border/60">
                  {active.course}
                </Badge>
                <span>Due {active.deadline}</span>
                <span>{active.maxMarks} marks</span>
              </div>
              {active.description && (
                <p className="mt-4 rounded-xl border border-border/60 bg-muted/20 p-3 text-sm text-muted-foreground">
                  {active.description}
                </p>
              )}

              <div className="mt-6 space-y-4">
                {submissionsLoading ? (
                  <div className="grid h-48 place-items-center rounded-2xl border border-border/60">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : activeSubmissions.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-border/60 p-8 text-center text-sm text-muted-foreground">
                    No student has submitted this assignment yet.
                  </div>
                ) : (
                  activeSubmissions.map((submission) => (
                    <SubmissionCard
                      key={submission.id}
                      assignment={active}
                      submission={submission}
                      values={grading[submission.id] || {}}
                      onChange={(patch) =>
                        setGrading((current) => ({
                          ...current,
                          [submission.id]: { ...current[submission.id], ...patch },
                        }))
                      }
                      onSave={() => saveGrade(submission)}
                    />
                  ))
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Create assignment</DialogTitle>
            <DialogDescription>Select the course and add assignment details.</DialogDescription>
          </DialogHeader>
          <form onSubmit={submitCreate} className="space-y-4">
            <div>
              <Label>Course</Label>
              <select
                value={draft.courseId}
                onChange={(event) => setDraft((current) => ({ ...current, courseId: event.target.value }))}
                className="mt-1 h-10 w-full rounded-xl border border-border/60 bg-background px-3 text-sm"
              >
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.title}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label>Title</Label>
              <Input
                value={draft.title}
                onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))}
                className="mt-1 rounded-xl"
                placeholder="Build a component library"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Due date</Label>
                <Input
                  type="date"
                  value={draft.dueDate}
                  onChange={(event) => setDraft((current) => ({ ...current, dueDate: event.target.value }))}
                  className="mt-1 rounded-xl"
                />
              </div>
              <div>
                <Label>Max marks</Label>
                <Input
                  type="number"
                  min="1"
                  value={draft.maxMarks}
                  onChange={(event) => setDraft((current) => ({ ...current, maxMarks: event.target.value }))}
                  className="mt-1 rounded-xl"
                />
              </div>
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={draft.description}
                onChange={(event) => setDraft((current) => ({ ...current, description: event.target.value }))}
                rows={4}
                className="mt-1 rounded-xl"
                placeholder="Explain what students need to submit."
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" className="rounded-xl" onClick={() => setCreateOpen(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={savingCreate}
                className="rounded-xl gradient-primary border-0 text-primary-foreground"
              >
                {savingCreate ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Plus className="mr-1.5 h-4 w-4" />}
                Create
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function SummaryBox({ icon: Icon, label, value, tone = "text-foreground" }) {
  return (
    <div className="rounded-2xl card-premium p-5">
      <div className="grid h-10 w-10 place-items-center rounded-xl gradient-primary shadow-glow">
        <Icon className="h-[18px] w-[18px] text-primary-foreground" />
      </div>
      <div className="mt-4 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">{label}</div>
      <div className={`mt-1 font-display text-3xl font-semibold ${tone}`}>{value}</div>
    </div>
  );
}

function AssignmentCard({ assignment, index, onOpen }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className="rounded-2xl card-premium p-5"
    >
      <div className="flex items-start justify-between gap-3">
        <Badge variant="outline" className="border-border/60">
          {assignment.maxMarks} marks
        </Badge>
        <StatusBadge status={assignment.status} />
      </div>
      <h3 className="mt-3 line-clamp-2 font-display text-base font-semibold">{assignment.title}</h3>
      <div className="mt-1 text-xs text-muted-foreground">Due {assignment.deadline}</div>
      {assignment.description && (
        <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">{assignment.description}</p>
      )}
      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
        <Mini label="Submitted" value={assignment.submissions} />
        <Mini label="Pending" value={assignment.pending} tone="text-warning" />
        <Mini label="Graded" value={assignment.graded} tone="text-success" />
      </div>
      <Button className="mt-4 w-full rounded-xl gradient-primary border-0 text-primary-foreground" onClick={onOpen}>
        View submissions
      </Button>
    </motion.div>
  );
}

function Mini({ label, value, tone = "text-foreground" }) {
  return (
    <div className="rounded-lg bg-muted/30 p-2">
      <div className={`font-display text-lg font-semibold ${tone}`}>{value}</div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
    </div>
  );
}

function SubmissionCard({ assignment, submission, values, onChange, onSave }) {
  const grade = values.grade ?? submission.grade ?? "";
  const feedback = values.feedback ?? submission.feedback ?? "";
  return (
    <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="font-medium">{submission.studentName}</div>
            <StatusBadge status={submission.status} />
          </div>
          <div className="text-xs text-muted-foreground">
            {submission.studentEmail || "No email"} · Submitted {submission.submittedAt}
          </div>
        </div>
        {submission.status === "graded" && (
          <Badge className="w-fit border-0 bg-success/15 text-success">
            {submission.grade}/{assignment.maxMarks}
          </Badge>
        )}
      </div>

      <div className="mt-4 flex items-center gap-3 rounded-xl border border-border/60 bg-background/60 p-3">
        <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary">
          <FileText className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-medium">{submission.fileName}</div>
          <div className="text-[11px] text-muted-foreground">Submitted file</div>
        </div>
        {submission.fileUrl && (
          <a href={submission.fileUrl} target="_blank" rel="noreferrer">
            <Button variant="outline" size="sm" className="rounded-lg border-border/60">
              <ExternalLink className="mr-1 h-3.5 w-3.5" /> Open
            </Button>
          </a>
        )}
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-[140px_1fr]">
        <div>
          <Label>Marks</Label>
          <Input
            type="number"
            min="0"
            max={assignment.maxMarks}
            value={grade}
            onChange={(event) => onChange({ grade: event.target.value })}
            className="mt-1 rounded-xl"
          />
        </div>
        <div>
          <Label>Feedback</Label>
          <Textarea
            rows={3}
            value={feedback}
            onChange={(event) => onChange({ feedback: event.target.value })}
            placeholder="Write feedback for the student."
            className="mt-1 rounded-xl"
          />
        </div>
      </div>

      <Button
        className="mt-4 rounded-xl gradient-primary border-0 text-primary-foreground"
        onClick={onSave}
        disabled={values.saving}
      >
        {values.saving ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-1.5 h-4 w-4" />}
        Save grade
      </Button>
    </div>
  );
}
