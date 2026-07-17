import { useEffect, useState } from "react";
import { LmsPageHeader } from "@/features/shared/components/PageHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload } from "lucide-react";
import { toast } from "sonner";
import { courseApi, mapCourse } from "@/services/courseApi";

const TYPES = ["video", "pdf", "article", "live", "link"];
const EMPTY_FORM = {
  title: "", description: "", type: "video", videoUrl: "", articleContent: "",
  notesPdfUrl: "", isPreview: false, published: true, downloadable: true,
};

export default function Page() {
  const [courses, setCourses] = useState([]);
  const [modules, setModules] = useState([]);
  const [lectures, setLectures] = useState([]);
  const [courseId, setCourseId] = useState("");
  const [moduleId, setModuleId] = useState("");
  const [lectureId, setLectureId] = useState("");
  const [form, setForm] = useState(EMPTY_FORM);
  const [videoFile, setVideoFile] = useState(null);
  const [resourceFiles, setResourceFiles] = useState([]);
  const [durationSeconds, setDurationSeconds] = useState(0);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    courseApi.instructorCourses()
      .then(({ data }) => {
        const next = (data || []).map(mapCourse);
        setCourses(next);
        setCourseId(next[0]?.id || "");
      })
      .catch((error) => toast.error(error.message || "Unable to load courses."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    setModules([]);
    setModuleId("");
    setLectures([]);
    setLectureId("");
    setForm(EMPTY_FORM);
    if (!courseId) return;
    courseApi.instructorModules(courseId)
      .then(({ data }) => {
        const next = data || [];
        setModules(next);
        setModuleId(next[0]?._id || "");
      })
      .catch((error) => toast.error(error.message || "Unable to load modules."));
  }, [courseId]);

  useEffect(() => {
    setLectures([]);
    setLectureId("");
    setForm(EMPTY_FORM);
    if (!moduleId) return;
    courseApi.instructorLectures(moduleId)
      .then(({ data }) => {
        const next = data || [];
        setLectures(next);
        setLectureId(next[0]?._id || "");
      })
      .catch((error) => toast.error(error.message || "Unable to load lectures."));
  }, [moduleId]);

  useEffect(() => {
    const lecture = lectures.find((item) => item._id === lectureId);
    setVideoFile(null);
    setResourceFiles([]);
    setDurationSeconds(Number(lecture?.durationSeconds || 0));
    setForm(lecture ? {
      ...EMPTY_FORM,
      ...lecture,
      type: TYPES.includes(lecture.type) ? lecture.type : lecture.type === "resource" ? "pdf" : "article",
    } : EMPTY_FORM);
  }, [lectureId, lectures]);

  function update(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function chooseVideo(file) {
    setVideoFile(file || null);
    setDurationSeconds(0);
    if (!file) return;
    toast.info(`${file.name} selected. Click Save lecture to upload it.`);
    const url = URL.createObjectURL(file);
    const video = document.createElement("video");
    video.preload = "metadata";
    video.onloadedmetadata = () => {
      setDurationSeconds(Number.isFinite(video.duration) ? Math.round(video.duration) : 0);
      URL.revokeObjectURL(url);
    };
    video.onerror = () => URL.revokeObjectURL(url);
    video.src = url;
  }

  async function saveLecture() {
    if (!moduleId || !form.title.trim()) {
      toast.error("Select a module and enter the lecture title.");
      return;
    }
    try {
      setSaving(true);
      const payload = {
        title: form.title.trim(),
        description: form.description,
        type: form.type === "link" ? "resource" : form.type,
        videoUrl: form.videoUrl,
        articleContent: form.articleContent,
        notesPdfUrl: form.notesPdfUrl,
        isPreview: form.isPreview,
        published: form.published,
        downloadable: form.downloadable,
        durationSeconds,
      };
      let targetLectureId = lectureId;
      if (targetLectureId) {
        await courseApi.updateLecture(targetLectureId, payload);
      } else {
        const created = await courseApi.createLecture(moduleId, {
          ...payload,
          order: lectures.length + 1,
        });
        targetLectureId = created.data._id;
      }

      if (videoFile) {
        const body = new FormData();
        body.append("file", videoFile);
        body.append("durationSeconds", String(durationSeconds));
        await courseApi.uploadLectureVideo(targetLectureId, body);
      }
      for (const file of resourceFiles) {
        const body = new FormData();
        body.append("file", file);
        body.append("title", file.name);
        await courseApi.uploadLectureResource(targetLectureId, body);
      }
      const { data } = await courseApi.instructorLectures(moduleId);
      setLectures(data || []);
      setLectureId(targetLectureId);
      setVideoFile(null);
      setResourceFiles([]);
      toast.success(videoFile ? "Lecture saved and video uploaded successfully." : "Lecture saved successfully.");
    } catch (error) {
      toast.error(error.message || "Unable to save lecture.");
    } finally {
      setSaving(false);
    }
  }

  function previewLecture() {
    const url = videoFile ? URL.createObjectURL(videoFile) : form.videoUrl;
    if (!url) {
      toast.info("Add a video or content URL before previewing.");
      return;
    }
    window.open(url, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="mx-auto max-w-[1100px]">
      <LmsPageHeader
        eyebrow="Teaching"
        title="Lecture Editor"
        description="Configure a single lecture — video, resources, preview and publish settings."
      />

      <div className="mb-5 grid gap-3 rounded-2xl card-premium p-4 md:grid-cols-3">
        <Picker label="Course" value={courseId} onChange={setCourseId} placeholder={loading ? "Loading courses..." : "Select course"} items={courses.map((item) => [item.id, item.title])} />
        <Picker label="Module" value={moduleId} onChange={setModuleId} placeholder="Select module" items={modules.map((item) => [item._id, item.title])} />
        <Picker label="Lecture" value={lectureId} onChange={setLectureId} placeholder="Select lecture" items={lectures.map((item) => [item._id, item.title])} />
      </div>

      {!loading && (!courses.length || !modules.length || !lectures.length) && (
        <div className="mb-5 rounded-xl border border-dashed border-border/60 p-4 text-sm text-muted-foreground">
          {!courses.length ? "Create a course first." : !modules.length ? "Add a module in Course Builder first." : "Add a lecture in Course Builder first."}
        </div>
      )}

      <Tabs value={form.type} onValueChange={(value) => update("type", value)}>
        <TabsList className="rounded-xl bg-muted/60 p-1">
          {TYPES.map((type) => <TabsTrigger key={type} value={type} className="rounded-lg capitalize">{type === "article" ? "Text" : type}</TabsTrigger>)}
        </TabsList>
        {TYPES.map((type) => (
          <TabsContent key={type} value={type} className="mt-5 rounded-2xl card-premium p-6">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Lecture title" wide><Input value={form.title} onChange={(event) => update("title", event.target.value)} className="mt-1 rounded-xl" /></Field>
              <Field label="Description" wide><Textarea value={form.description} onChange={(event) => update("description", event.target.value)} rows={3} className="mt-1 rounded-xl" /></Field>

              {type === "video" && <>
                <Field label="Video URL" wide><Input value={form.videoUrl || ""} onChange={(event) => update("videoUrl", event.target.value)} placeholder="YouTube, Drive, Vimeo or direct video URL" className="mt-1 rounded-xl" /></Field>
                <div className="md:col-span-2">
                  <Label>Video file</Label>
                  <label className="mt-1 flex h-40 cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-border/60 bg-muted/20 hover:border-primary/40 hover:bg-primary/5">
                    <div className="grid h-10 w-10 place-items-center rounded-lg gradient-primary shadow-glow"><Upload className="h-4 w-4 text-primary-foreground" /></div>
                    <div className="text-sm font-medium">{videoFile?.name || "Drop video or click to upload"}</div>
                    <div className="text-xs text-muted-foreground">MP4, MOV or MKV · up to 250 MB {durationSeconds ? `· ${formatDuration(durationSeconds)}` : ""}</div>
                    <input type="file" accept="video/mp4,video/quicktime,video/x-matroska" className="hidden" onChange={(event) => chooseVideo(event.target.files?.[0])} />
                  </label>
                </div>
              </>}

              {type === "pdf" && <Field label="PDF URL" wide><Input value={form.notesPdfUrl || ""} onChange={(event) => update("notesPdfUrl", event.target.value)} placeholder="Existing PDF URL (optional)" className="mt-1 rounded-xl" /></Field>}
              {type === "article" && <Field label="Article content" wide><Textarea value={form.articleContent || ""} onChange={(event) => update("articleContent", event.target.value)} rows={8} className="mt-1 rounded-xl" /></Field>}
              {type === "live" && <Field label="Live session URL" wide><Input value={form.videoUrl || ""} onChange={(event) => update("videoUrl", event.target.value)} placeholder="Meeting or live stream URL" className="mt-1 rounded-xl" /></Field>}
              {type === "link" && <Field label="External content URL" wide><Input value={form.videoUrl || ""} onChange={(event) => update("videoUrl", event.target.value)} placeholder="https://..." className="mt-1 rounded-xl" /></Field>}

              <div className="md:col-span-2">
                <Label>Resources</Label>
                <label className="mt-1 flex h-24 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-border/60 bg-muted/20 hover:border-primary/40 hover:bg-primary/5">
                  <div className="text-sm font-medium">{resourceFiles.length ? `${resourceFiles.length} file(s) selected` : "Add PDFs, slides, code samples"}</div>
                  <div className="text-xs text-muted-foreground">PDF, ZIP or DOCX · multiple files supported</div>
                  <input type="file" accept=".pdf,.zip,.docx" multiple className="hidden" onChange={(event) => setResourceFiles(Array.from(event.target.files || []))} />
                </label>
              </div>
              <Toggle label="Free preview" checked={form.isPreview} onChange={(value) => update("isPreview", value)} />
              <Toggle label="Published" checked={form.published} onChange={(value) => update("published", value)} />
              <Toggle label="Resources downloadable" checked={form.downloadable} onChange={(value) => update("downloadable", value)} />
            </div>
            <div className="mt-5 flex gap-2">
              <Button className="rounded-xl gradient-primary border-0 text-primary-foreground" onClick={saveLecture} disabled={!moduleId || !form.title.trim() || saving}>{saving ? (videoFile ? "Uploading..." : "Saving...") : "Save lecture"}</Button>
              <Button variant="outline" className="rounded-xl border-border/60" onClick={previewLecture} disabled={!lectureId}>Preview</Button>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

function Picker({ label, value, onChange, placeholder, items }) {
  return <div><Label>{label}</Label><Select value={value} onValueChange={onChange} disabled={!items.length}><SelectTrigger className="mt-1 rounded-xl"><SelectValue placeholder={placeholder} /></SelectTrigger><SelectContent>{items.map(([id, title]) => <SelectItem key={id} value={id}>{title}</SelectItem>)}</SelectContent></Select></div>;
}
function Field({ label, wide, children }) { return <div className={wide ? "md:col-span-2" : ""}><Label>{label}</Label>{children}</div>; }
function Toggle({ label, checked, onChange }) { return <div className="md:col-span-2 flex items-center justify-between rounded-xl bg-muted/30 p-4"><span>{label}</span><Switch checked={Boolean(checked)} onCheckedChange={onChange} /></div>; }
function formatDuration(seconds) { const minutes = Math.floor(seconds / 60); return `${minutes}:${String(seconds % 60).padStart(2, "0")}`; }
