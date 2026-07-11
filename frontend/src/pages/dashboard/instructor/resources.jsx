import { useEffect, useMemo, useRef, useState } from "react";
import { Download, ExternalLink, FileText, Link2, Loader2, RefreshCw, Upload } from "lucide-react";
import { LmsPageHeader } from "@/features/shared/components/PageHeader";
import { DataTable } from "@/features/shared/components/DataTable";
import { StatusBadge } from "@/features/shared/components/StatusBadge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { courseApi, mapCourse } from "@/services/courseApi";
import { resourceApi, mapInstructorResource } from "@/services/resourceApi";
import { toast } from "sonner";

const typeLabel = {
  pdf: "PDF",
  link: "Link",
  resource: "Resource",
};

export default function ResourcesPage() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState("all");
  const [uploadOpen, setUploadOpen] = useState(false);
  const [coursesList, setCoursesList] = useState([]);
  const [modules, setModules] = useState([]);
  const [lectures, setLectures] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [loadingModules, setLoadingModules] = useState(false);
  const [loadingLectures, setLoadingLectures] = useState(false);
  const [replaceTarget, setReplaceTarget] = useState(null);
  const [replacing, setReplacing] = useState(false);
  const [deletingId, setDeletingId] = useState("");
  const replaceInputRef = useRef(null);
  const [uploadDraft, setUploadDraft] = useState({
    courseId: "",
    moduleId: "",
    lectureId: "",
    title: "",
    type: "resource",
    file: null,
  });

  const loadResources = async () => {
    setLoading(true);
    try {
      const result = await resourceApi.instructorResources();
      setResources((result.data || []).map(mapInstructorResource));
    } catch (error) {
      toast.error(error.message || "Unable to load resources.");
      setResources([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResources();
  }, []);

  const setDraft = (updates) => setUploadDraft((current) => ({ ...current, ...updates }));

  const loadLecturesForModule = async (moduleId) => {
    if (!moduleId) {
      setLectures([]);
      setDraft({ lectureId: "" });
      return;
    }
    setLoadingLectures(true);
    try {
      const result = await courseApi.instructorLectures(moduleId);
      const nextLectures = result.data || [];
      setLectures(nextLectures);
      setDraft({ lectureId: nextLectures[0]?._id || nextLectures[0]?.id || "" });
    } catch (error) {
      toast.error(error.message || "Unable to load lectures.");
      setLectures([]);
      setDraft({ lectureId: "" });
    } finally {
      setLoadingLectures(false);
    }
  };

  const loadModulesForCourse = async (courseId) => {
    if (!courseId) {
      setModules([]);
      setLectures([]);
      setDraft({ moduleId: "", lectureId: "" });
      return;
    }
    setLoadingModules(true);
    try {
      const result = await courseApi.instructorModules(courseId);
      const nextModules = result.data || [];
      const firstModuleId = nextModules[0]?._id || nextModules[0]?.id || "";
      setModules(nextModules);
      setDraft({ moduleId: firstModuleId, lectureId: "" });
      await loadLecturesForModule(firstModuleId);
    } catch (error) {
      toast.error(error.message || "Unable to load course modules.");
      setModules([]);
      setLectures([]);
      setDraft({ moduleId: "", lectureId: "" });
    } finally {
      setLoadingModules(false);
    }
  };

  const openUploadDialog = async () => {
    setUploadOpen(true);
    if (coursesList.length) return;

    setLoadingCourses(true);
    try {
      const result = await courseApi.instructorCourses();
      const nextCourses = (result.data || []).map(mapCourse);
      const firstCourseId = nextCourses[0]?._id || nextCourses[0]?.id || "";
      setCoursesList(nextCourses);
      setDraft({ courseId: firstCourseId, moduleId: "", lectureId: "", title: "", type: "resource", file: null });
      await loadModulesForCourse(firstCourseId);
    } catch (error) {
      toast.error(error.message || "Unable to load your courses.");
      setCoursesList([]);
      setModules([]);
      setLectures([]);
    } finally {
      setLoadingCourses(false);
    }
  };

  const submitUpload = async (event) => {
    event.preventDefault();
    if (!uploadDraft.lectureId) {
      toast.error("Please select a lecture before uploading a resource.");
      return;
    }
    if (!uploadDraft.file) {
      toast.error("Please choose a file to upload.");
      return;
    }

    const formData = new FormData();
    formData.append("file", uploadDraft.file);
    formData.append("title", uploadDraft.title.trim() || uploadDraft.file.name);
    formData.append("type", uploadDraft.type);

    setUploading(true);
    try {
      await resourceApi.uploadLectureResource(uploadDraft.lectureId, formData);
      toast.success("Resource uploaded successfully.");
      setUploadOpen(false);
      setDraft({ title: "", type: "resource", file: null });
      await loadResources();
    } catch (error) {
      toast.error(error.message || "Unable to upload resource.");
    } finally {
      setUploading(false);
    }
  };

  const courses = useMemo(
    () => Array.from(new Set(resources.map((item) => item.course).filter(Boolean))).sort(),
    [resources],
  );
  const filtered = useMemo(
    () => resources.filter((item) => course === "all" || item.course === course),
    [resources, course],
  );
  const totals = useMemo(
    () => ({
      all: resources.length,
      pdf: resources.filter((item) => String(item.type).toLowerCase().includes("pdf")).length,
      links: resources.filter((item) => item.type === "link").length,
      courses: courses.length,
    }),
    [resources, courses.length],
  );

  const openResource = (resource) => {
    if (!resource.url) {
      toast.error("This resource does not have a file URL.");
      return;
    }
    window.open(resource.url, "_blank", "noopener,noreferrer");
  };

  const canEditResource = (row) => {
    if (!row.editableResource || row.resourceIndex === undefined || row.resourceIndex === null) {
      toast.error("Only uploaded lecture resources can be replaced or deleted from this page.");
      return false;
    }
    return true;
  };

  const startReplaceResource = (row) => {
    if (!canEditResource(row)) return;
    setReplaceTarget(row);
    if (replaceInputRef.current) {
      replaceInputRef.current.value = "";
      replaceInputRef.current.click();
    }
  };

  const replaceResource = async (event) => {
    const file = event.target.files?.[0];
    if (!file || !replaceTarget) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", replaceTarget.name || file.name);
    formData.append("type", replaceTarget.type || "resource");

    setReplacing(true);
    try {
      await resourceApi.replaceLectureResource(replaceTarget.lectureId, replaceTarget.resourceIndex, formData);
      toast.success("Resource replaced successfully.");
      setReplaceTarget(null);
      await loadResources();
    } catch (error) {
      toast.error(error.message || "Unable to replace resource.");
    } finally {
      setReplacing(false);
    }
  };

  const deleteResource = async (row) => {
    if (!canEditResource(row)) return;
    if (!window.confirm(`Delete "${row.name}"?`)) return;

    setDeletingId(row.id);
    try {
      await resourceApi.deleteLectureResource(row.lectureId, row.resourceIndex);
      toast.success("Resource deleted successfully.");
      await loadResources();
    } catch (error) {
      toast.error(error.message || "Unable to delete resource.");
    } finally {
      setDeletingId("");
    }
  };

  const columns = [
    {
      key: "name",
      header: "Resource",
      sort: (a, b) => a.name.localeCompare(b.name),
      render: (row) => (
        <div className="flex min-w-[220px] items-center gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
            {row.type === "link" ? <Link2 className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
          </div>
          <div className="min-w-0">
            <div className="truncate text-sm font-medium">{row.name}</div>
            <div className="text-xs text-muted-foreground">{row.source}</div>
          </div>
        </div>
      ),
    },
    {
      key: "course",
      header: "Course",
      render: (row) => <span className="text-sm text-muted-foreground">{row.course}</span>,
    },
    {
      key: "module",
      header: "Module",
      render: (row) => <span className="text-sm text-muted-foreground">{row.module}</span>,
    },
    { key: "lecture", header: "Lecture", render: (row) => row.lecture },
    {
      key: "type",
      header: "Type",
      render: (row) => <StatusBadge status={typeLabel[row.type] || row.type || "resource"} />,
    },
    {
      key: "uploaded",
      header: "Updated",
      render: (row) => <span className="text-sm text-muted-foreground">{row.uploaded}</span>,
    },
  ];

  return (
    <div className="mx-auto max-w-[1500px]">
      <LmsPageHeader
        eyebrow="Teaching"
        title="Resources"
        description="Live lecture resources and course assets from your content library."
        actions={
          <>
            <Button variant="outline" className="rounded-xl border-border/60" onClick={loadResources}>
              <RefreshCw className="mr-1.5 h-4 w-4" /> Refresh
            </Button>
            <Button
              className="rounded-xl gradient-primary border-0 text-primary-foreground"
              onClick={openUploadDialog}
            >
              <Upload className="mr-1.5 h-4 w-4" /> Upload
            </Button>
          </>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Summary label="Resources" value={totals.all} icon={FileText} />
        <Summary label="PDF / files" value={totals.pdf} icon={Download} />
        <Summary label="Links" value={totals.links} icon={Link2} />
        <Summary label="Courses" value={totals.courses} icon={ExternalLink} />
      </div>

      {loading ? (
        <div className="grid h-72 place-items-center rounded-2xl card-premium">
          <Loader2 className="h-7 w-7 animate-spin text-primary" />
        </div>
      ) : (
        <DataTable
          rows={filtered}
          columns={columns}
          searchKeys={["name", "course", "module", "lecture", "type", "source"]}
          pageSize={8}
          filters={
            <select
              value={course}
              onChange={(event) => setCourse(event.target.value)}
              className="h-10 rounded-xl border border-border/60 bg-background px-3 text-sm"
            >
              <option value="all">All courses</option>
              {courses.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          }
          emptyTitle="No resources found"
          emptyDesc="Add PDFs, links, or lecture resources from Course Builder."
          actions={[
            { label: "Open", onClick: openResource },
            { label: "Download", onClick: openResource },
            { label: replacing ? "Replacing..." : "Replace", onClick: startReplaceResource },
            { label: deletingId ? "Deleting..." : "Delete", onClick: deleteResource, danger: true },
          ]}
        />
      )}

      <input ref={replaceInputRef} type="file" className="hidden" onChange={replaceResource} />

      <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
        <DialogContent className="max-w-2xl rounded-2xl">
          <form onSubmit={submitUpload} className="space-y-5">
            <DialogHeader>
              <DialogTitle>Upload resource</DialogTitle>
              <DialogDescription>
                Add a file to a lecture. It will appear in the resources list after upload.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Course</Label>
                <Select
                  value={uploadDraft.courseId}
                  onValueChange={(value) => {
                    setDraft({ courseId: value, moduleId: "", lectureId: "" });
                    loadModulesForCourse(value);
                  }}
                  disabled={loadingCourses || uploading || !coursesList.length}
                >
                  <SelectTrigger className="h-10 rounded-xl">
                    <SelectValue placeholder={loadingCourses ? "Loading courses..." : "Select course"} />
                  </SelectTrigger>
                  <SelectContent>
                    {coursesList.map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Module</Label>
                <Select
                  value={uploadDraft.moduleId}
                  onValueChange={(value) => {
                    setDraft({ moduleId: value, lectureId: "" });
                    loadLecturesForModule(value);
                  }}
                  disabled={loadingModules || uploading || !modules.length}
                >
                  <SelectTrigger className="h-10 rounded-xl">
                    <SelectValue placeholder={loadingModules ? "Loading modules..." : "Select module"} />
                  </SelectTrigger>
                  <SelectContent>
                    {modules.map((item) => (
                      <SelectItem key={item._id || item.id} value={item._id || item.id}>
                        {item.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Lecture</Label>
                <Select
                  value={uploadDraft.lectureId}
                  onValueChange={(value) => setDraft({ lectureId: value })}
                  disabled={loadingLectures || uploading || !lectures.length}
                >
                  <SelectTrigger className="h-10 rounded-xl">
                    <SelectValue placeholder={loadingLectures ? "Loading lectures..." : "Select lecture"} />
                  </SelectTrigger>
                  <SelectContent>
                    {lectures.map((item) => (
                      <SelectItem key={item._id || item.id} value={item._id || item.id}>
                        {item.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={uploadDraft.type} onValueChange={(value) => setDraft({ type: value })} disabled={uploading}>
                  <SelectTrigger className="h-10 rounded-xl">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="resource">Resource</SelectItem>
                    <SelectItem value="pdf">PDF</SelectItem>
                    <SelectItem value="document">Document</SelectItem>
                    <SelectItem value="video">Video</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="resource-title">Resource title</Label>
              <Input
                id="resource-title"
                value={uploadDraft.title}
                onChange={(event) => setDraft({ title: event.target.value })}
                placeholder="Example: Chapter 1 notes"
                className="h-10 rounded-xl"
                disabled={uploading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="resource-file">File</Label>
              <Input
                id="resource-file"
                type="file"
                onChange={(event) => setDraft({ file: event.target.files?.[0] || null })}
                className="h-10 rounded-xl"
                disabled={uploading}
              />
              {!coursesList.length && !loadingCourses ? (
                <p className="text-xs text-muted-foreground">Create a course with modules and lectures before uploading resources.</p>
              ) : null}
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" className="rounded-xl" onClick={() => setUploadOpen(false)} disabled={uploading}>
                Cancel
              </Button>
              <Button
                type="submit"
                className="rounded-xl gradient-primary border-0 text-primary-foreground"
                disabled={uploading || !uploadDraft.lectureId || !uploadDraft.file}
              >
                {uploading ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Upload className="mr-1.5 h-4 w-4" />}
                Upload resource
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Summary({ label, value, icon: Icon }) {
  return (
    <div className="rounded-2xl card-premium p-5">
      <div className="grid h-10 w-10 place-items-center rounded-xl gradient-primary shadow-glow">
        <Icon className="h-[18px] w-[18px] text-primary-foreground" />
      </div>
      <div className="mt-4 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">{label}</div>
      <div className="mt-1 font-display text-3xl font-semibold">{value}</div>
    </div>
  );
}
