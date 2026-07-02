import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle2, ChevronRight, FileText, HelpCircle, Image as ImageIcon, Plus, Save, Send, Trash2, Video } from "lucide-react";
import { LmsPageHeader } from "@/features/shared/components/PageHeader";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { StatusBadge } from "@/features/shared/components/StatusBadge";
import { courseApi, mapCourse, statusLabel } from "@/services/courseApi";
import { assetUrl } from "@/services/api";
import { toast } from "sonner";

const ICONS = { video: Video, pdf: FileText, article: FileText, resource: FileText, quiz: HelpCircle, assignment: HelpCircle, live: Video };
const LECTURE_TYPES = ["video", "pdf", "article", "resource", "assignment", "quiz", "live"];

export default function BuilderPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [courses, setCourses] = useState([]);
  const [courseId, setCourseId] = useState(searchParams.get("course") || "");
  const [courseDetails, setCourseDetails] = useState(null);
  const [completion, setCompletion] = useState(null);
  const [modules, setModules] = useState([]);
  const [lectures, setLectures] = useState({});
  const [moduleTitle, setModuleTitle] = useState("");
  const [starterModuleTitle, setStarterModuleTitle] = useState("Introduction");
  const [starterLectureTitle, setStarterLectureTitle] = useState("Welcome to the course");
  const [starterLectureUrl, setStarterLectureUrl] = useState("");
  const [thumbnailDraft, setThumbnailDraft] = useState("");
  const [lectureDrafts, setLectureDrafts] = useState({});
  const [loading, setLoading] = useState(true);
  const [savingCourse, setSavingCourse] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let mounted = true;
    courseApi.instructorCourses()
      .then((result) => {
        if (!mounted) return;
        const nextCourses = (result.data || []).map(mapCourse);
        setCourses(nextCourses);
        const nextId = searchParams.get("course") || nextCourses[0]?.id || "";
        setCourseId(nextId);
      })
      .catch((error) => toast.error(error.message || "Could not load courses."))
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!courseId) {
      setCourseDetails(null);
      setCompletion(null);
      setModules([]);
      setLectures({});
      return;
    }
    setSearchParams({ course: courseId }, { replace: true });
    loadCourse(courseId);
  }, [courseId]);

  async function loadCourse(id = courseId) {
    try {
      const [detailsResult, modulesResult] = await Promise.all([
        courseApi.instructorCourseDetails(id),
        courseApi.instructorModules(id),
      ]);
      const nextModules = modulesResult.data || [];
      const lectureEntries = await Promise.all(nextModules.map(async (module) => {
        const result = await courseApi.instructorLectures(module._id);
        return [module._id, result.data || []];
      }));
      setCourseDetails(detailsResult.data?.course || null);
      setThumbnailDraft(detailsResult.data?.course?.thumbnail || "");
      setCompletion(detailsResult.data?.completion || null);
      setModules(nextModules);
      setLectures(Object.fromEntries(lectureEntries));
    } catch (error) {
      toast.error(error.message || "Could not load course builder.");
    }
  }

  async function addModule() {
    if (!moduleTitle.trim()) return;
    try {
      await courseApi.createModule(courseId, { title: moduleTitle.trim(), order: modules.length + 1 });
      setModuleTitle("");
      await loadCourse();
      toast.success("Module added.");
    } catch (error) {
      toast.error(error.message);
    }
  }

  async function createStarterCurriculum() {
    if (!starterModuleTitle.trim() || !starterLectureTitle.trim()) {
      toast.error("Module title ani lecture title required aahe.");
      return;
    }
    try {
      const moduleResult = await courseApi.createModule(courseId, {
        title: starterModuleTitle.trim(),
        order: modules.length + 1,
      });
      await courseApi.createLecture(moduleResult.data._id, {
        title: starterLectureTitle.trim(),
        type: "video",
        videoUrl: starterLectureUrl.trim(),
        durationSeconds: 0,
        isPreview: false,
        order: 1,
      });
      setStarterModuleTitle("Introduction");
      setStarterLectureTitle("Welcome to the course");
      setStarterLectureUrl("");
      await loadCourse();
      toast.success("Starter module ani lecture added.");
    } catch (error) {
      toast.error(error.message || "Curriculum create zala nahi.");
    }
  }

  async function deleteModule(moduleId) {
    try {
      await courseApi.deleteModule(moduleId);
      await loadCourse();
      toast.success("Module deleted.");
    } catch (error) {
      toast.error(error.message);
    }
  }

  async function addLecture(moduleId) {
    const draft = lectureDrafts[moduleId] || {};
    if (!draft.title?.trim()) return;
    try {
      await courseApi.createLecture(moduleId, {
        title: draft.title.trim(),
        type: draft.type || "video",
        videoUrl: draft.videoUrl || "",
        durationSeconds: Number(draft.durationSeconds || 0),
        isPreview: Boolean(draft.isPreview),
        order: (lectures[moduleId]?.length || 0) + 1,
      });
      setLectureDrafts((current) => ({ ...current, [moduleId]: {} }));
      await loadCourse();
      toast.success("Lecture added.");
    } catch (error) {
      toast.error(error.message);
    }
  }

  async function deleteLecture(lectureId) {
    try {
      await courseApi.deleteLecture(lectureId);
      await loadCourse();
      toast.success("Lecture deleted.");
    } catch (error) {
      toast.error(error.message);
    }
  }

  async function saveThumbnail() {
    if (!courseId) return;
    if (!thumbnailDraft.trim()) {
      toast.error("Thumbnail URL is required before review.");
      return;
    }
    try {
      setSavingCourse(true);
      await courseApi.updateInstructorCourse(courseId, { thumbnail: thumbnailDraft.trim() });
      await loadCourse(courseId);
      toast.success("Thumbnail saved.");
    } catch (error) {
      toast.error(error.message || "Could not save thumbnail.");
    } finally {
      setSavingCourse(false);
    }
  }

  async function submitForReview() {
    const checks = completion?.checks || {};
    const missingRequired = [
      ["basicInfo", "basic info"],
      ["thumbnail", "thumbnail"],
      ["modules", "module"],
      ["lectures", "lecture"],
    ].filter(([key]) => !checks[key]).map(([, label]) => label);

    if (missingRequired.length) {
      toast.error(`Complete before review: ${missingRequired.join(", ")}`);
      return;
    }

    try {
      setSubmitting(true);
      const result = await courseApi.submitForReview(courseId);
      setCourseDetails(result.data?.course || courseDetails);
      setCompletion(result.data?.completion || completion);
      await loadCourse();
      toast.success("Course submitted for admin review.");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  }

  const canSubmit = useMemo(() => ["assigned", "content_in_progress", "changes_requested"].includes(courseDetails?.status), [courseDetails]);

  return (
    <div className="mx-auto max-w-[1400px]">
      <LmsPageHeader
        eyebrow="Teaching"
        title="Course Builder"
        description="Build modules and lectures, then submit the course for admin approval."
        actions={
          <Button className="rounded-xl gradient-primary border-0 text-primary-foreground" onClick={addModule} disabled={!courseId || !moduleTitle.trim()}>
            <Plus className="mr-1.5 h-4 w-4" /> Add module
          </Button>
        }
      />

      <div className="mb-5 grid gap-3 lg:grid-cols-[minmax(260px,420px)_1fr]">
        <Select value={courseId} onValueChange={setCourseId}>
          <SelectTrigger className="h-11 rounded-xl">
            <SelectValue placeholder={loading ? "Loading courses..." : "Select course"} />
          </SelectTrigger>
          <SelectContent>
            {courses.map((c) => (
              <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex gap-2">
          <Input value={moduleTitle} onChange={(event) => setModuleTitle(event.target.value)} placeholder="New module title" className="h-11 rounded-xl" />
          <Button variant="outline" className="h-11 rounded-xl border-border/60" onClick={addModule} disabled={!moduleTitle.trim()}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {courseDetails && (
        <div className="mb-5 rounded-2xl card-premium p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge status={mapCourse(courseDetails).status} />
                <Badge variant="outline" className="border-border/60">{statusLabel(courseDetails.status)}</Badge>
                <Badge className="border-0 bg-primary/15 text-primary">{completion?.percentage || 0}% complete</Badge>
              </div>
              <h2 className="mt-2 font-display text-xl font-semibold">{courseDetails.title}</h2>
              {courseDetails.reviewFeedback && <p className="mt-2 text-sm text-warning">Admin feedback: {courseDetails.reviewFeedback}</p>}
            </div>
            <Button className="rounded-xl gradient-primary border-0 text-primary-foreground" onClick={submitForReview} disabled={!canSubmit || submitting}>
              <Send className="mr-1.5 h-4 w-4" /> {submitting ? "Submitting..." : "Submit for review"}
            </Button>
          </div>
          <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {Object.entries(completion?.checks || {}).map(([key, done]) => (
              <div key={key} className={`flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium ${done ? "bg-success/10 text-success" : "bg-muted/30 text-muted-foreground"}`}>
                <CheckCircle2 className="h-3.5 w-3.5" /> {statusLabel(key)}
              </div>
            ))}
          </div>
          <div className="mt-5 grid gap-4 rounded-xl border border-border/60 bg-muted/15 p-4 lg:grid-cols-[180px_1fr_auto] lg:items-end">
            <div className="overflow-hidden rounded-xl border border-border/60 bg-background">
              {thumbnailDraft ? (
                <img src={assetUrl(thumbnailDraft)} alt="Course thumbnail preview" className="aspect-video w-full object-cover" />
              ) : (
                <div className="grid aspect-video place-items-center text-muted-foreground">
                  <ImageIcon className="h-8 w-8" />
                </div>
              )}
            </div>
            <div>
              <div className="mb-1 text-sm font-medium">Course thumbnail URL <span className="text-destructive">*</span></div>
              <Input
                value={thumbnailDraft}
                onChange={(event) => setThumbnailDraft(event.target.value)}
                placeholder="https://example.com/course-thumbnail.jpg"
                className="rounded-xl"
              />
              <p className="mt-1 text-xs text-muted-foreground">Admin review sathi thumbnail required aahe. Image URL paste करून save करा.</p>
            </div>
            <Button variant="outline" className="rounded-xl border-border/60" onClick={saveThumbnail} disabled={savingCourse || !courseId}>
              <Save className="mr-1.5 h-4 w-4" /> {savingCourse ? "Saving..." : "Save thumbnail"}
            </Button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {!loading && courseDetails && modules.length === 0 && (
          <div className="rounded-2xl border border-dashed border-primary/40 bg-primary/5 p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
              <div className="flex-1">
                <div className="text-sm font-semibold">Add required curriculum</div>
                <div className="mt-1 text-xs text-muted-foreground">
                  Admin review sathi at least one module ani one lecture required aahe.
                </div>
                <div className="mt-4 grid gap-2 md:grid-cols-3">
                  <Input
                    value={starterModuleTitle}
                    onChange={(event) => setStarterModuleTitle(event.target.value)}
                    placeholder="Module title"
                    className="rounded-xl"
                  />
                  <Input
                    value={starterLectureTitle}
                    onChange={(event) => setStarterLectureTitle(event.target.value)}
                    placeholder="Lecture title"
                    className="rounded-xl"
                  />
                  <Input
                    value={starterLectureUrl}
                    onChange={(event) => setStarterLectureUrl(event.target.value)}
                    placeholder="Lecture URL optional"
                    className="rounded-xl"
                  />
                </div>
              </div>
              <Button
                className="rounded-xl gradient-primary border-0 text-primary-foreground"
                onClick={createStarterCurriculum}
                disabled={!courseId || !starterModuleTitle.trim() || !starterLectureTitle.trim()}
              >
                <Plus className="mr-1.5 h-4 w-4" /> Add module & lecture
              </Button>
            </div>
          </div>
        )}

        {modules.map((m, i) => (
          <motion.details key={m._id} open initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} className="group rounded-2xl card-premium overflow-hidden">
            <summary className="flex cursor-pointer items-center justify-between gap-3 p-5">
              <div className="flex min-w-0 items-center gap-3">
                <ChevronRight className="h-4 w-4 shrink-0 transition-transform group-open:rotate-90" />
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg gradient-primary shadow-glow font-mono text-sm font-bold text-primary-foreground">{i + 1}</div>
                <div className="min-w-0">
                  <div className="truncate font-display text-base font-semibold">{m.title}</div>
                  <div className="text-xs text-muted-foreground">{lectures[m._id]?.length || 0} lectures</div>
                </div>
              </div>
              <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg text-destructive" onClick={(event) => { event.preventDefault(); deleteModule(m._id); }}>
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </summary>
            <div className="space-y-2 border-t border-border/60 bg-muted/10 p-3">
              {(lectures[m._id] || []).map((l) => {
                const Icon = ICONS[l.type] || FileText;
                return (
                  <div key={l._id} className="flex items-center gap-3 rounded-xl px-3 py-2 hover:bg-muted/30">
                    <Icon className="h-4 w-4 shrink-0 text-primary" />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium">{l.title}</div>
                      <div className="truncate text-xs text-muted-foreground">{l.videoUrl || l.description || "Lesson content"}</div>
                    </div>
                    <Badge variant="outline" className="border-border/60 capitalize">{l.type || "video"}</Badge>
                    {l.isPreview && <Badge className="border-0 bg-success/15 text-success">Preview</Badge>}
                    <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg" onClick={() => deleteLecture(l._id)}>
                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                    </Button>
                  </div>
                );
              })}
              <div className="grid gap-2 rounded-xl border border-dashed border-border/60 p-3 md:grid-cols-[1fr_130px_120px_auto]">
                <Input value={lectureDrafts[m._id]?.title || ""} onChange={(event) => setLectureDrafts((current) => ({ ...current, [m._id]: { ...current[m._id], title: event.target.value } }))} placeholder="New lecture title" className="rounded-lg" />
                <Select value={lectureDrafts[m._id]?.type || "video"} onValueChange={(value) => setLectureDrafts((current) => ({ ...current, [m._id]: { ...current[m._id], type: value } }))}>
                  <SelectTrigger className="rounded-lg"><SelectValue /></SelectTrigger>
                  <SelectContent>{LECTURE_TYPES.map((type) => <SelectItem key={type} value={type}>{type}</SelectItem>)}</SelectContent>
                </Select>
                <Input type="number" value={lectureDrafts[m._id]?.durationSeconds || ""} onChange={(event) => setLectureDrafts((current) => ({ ...current, [m._id]: { ...current[m._id], durationSeconds: event.target.value } }))} placeholder="Seconds" className="rounded-lg" />
                <Button className="rounded-lg gradient-primary border-0 text-primary-foreground" onClick={() => addLecture(m._id)} disabled={!lectureDrafts[m._id]?.title?.trim()}>
                  <Plus className="h-4 w-4" />
                </Button>
                <Textarea value={lectureDrafts[m._id]?.videoUrl || ""} onChange={(event) => setLectureDrafts((current) => ({ ...current, [m._id]: { ...current[m._id], videoUrl: event.target.value } }))} placeholder="Content URL or notes" className="rounded-lg md:col-span-3" />
                <label className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Switch checked={Boolean(lectureDrafts[m._id]?.isPreview)} onCheckedChange={(checked) => setLectureDrafts((current) => ({ ...current, [m._id]: { ...current[m._id], isPreview: checked } }))} /> Preview
                </label>
              </div>
            </div>
          </motion.details>
        ))}
      </div>

      {!loading && !courses.length && (
        <div className="rounded-2xl border border-dashed border-border/60 p-8 text-center text-sm text-muted-foreground">
          Create a course first, then build its curriculum here.
        </div>
      )}
    </div>
  );
}
