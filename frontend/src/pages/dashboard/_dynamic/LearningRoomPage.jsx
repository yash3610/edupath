import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Bookmark, BookOpen, CheckCircle2, ChevronLeft, ChevronRight, Download, ExternalLink, FileText, Lock, MessageCircle, PlayCircle, RotateCcw, StickyNote } from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/features/student/components/PageHeader";
import { assetUrl } from "@/services/api";
import { learningApi } from "@/services/learningApi";
import { EmptyPanel, PageLoader } from "./LumaDynamicUtils";

export default function LearningRoomPage() {
  const { courseId, lectureId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [selectedLectureId, setSelectedLectureId] = useState(lectureId || "");
  const [completed, setCompleted] = useState(new Set());
  const [bookmarked, setBookmarked] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      try {
        const firstEnrollment = courseId ? null : await learningApi.getContinueLearning();
        const activeCourseId = courseId || firstEnrollment?.course?._id || firstEnrollment?.course?.id || firstEnrollment?.course;
        const resumeLectureId = !courseId ? firstEnrollment?.lastLecture?._id || firstEnrollment?.lastLecture : "";
        if (!activeCourseId) {
          setCourse(null);
          setModules([]);
          setCompleted(new Set());
          setBookmarked(new Set());
          return;
        }
        const [courseData, moduleData, progressData] = await Promise.all([
          learningApi.getCourse(activeCourseId),
          learningApi.getCourseModules(activeCourseId),
          learningApi.getProgress(activeCourseId),
        ]);
        if (!mounted) return;
        const normalizedModules = normalizeModules(moduleData, progressData);
        const firstLecture = normalizedModules.flatMap((module) => module.lectures)[0];
        setCourse(courseData?.course || courseData);
        setModules(normalizedModules);
        setCompleted(new Set((progressData || []).filter((item) => item.completed).map((item) => String(item.lecture?._id || item.lecture))));
        setBookmarked(new Set((progressData || []).filter((item) => item.bookmarked).map((item) => String(item.lecture?._id || item.lecture))));
        const resumeLectureExists = normalizedModules.some((module) => module.lectures.some((lecture) => String(lecture._id) === String(resumeLectureId)));
        setSelectedLectureId(lectureId || (resumeLectureExists ? String(resumeLectureId) : "") || firstLecture?._id || "");
      } catch (error) {
        toast.error(error.message || "Unable to load learning room");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, [courseId, lectureId]);

  const lectures = useMemo(() => modules.flatMap((module) => module.lectures.map((lecture) => ({ ...lecture, moduleTitle: module.title }))), [modules]);
  const currentIndex = lectures.findIndex((lecture) => String(lecture._id) === String(selectedLectureId));
  const currentLecture = lectures[currentIndex] || lectures[0];
  const progress = lectures.length ? Math.round((completed.size / lectures.length) * 100) : 0;
  const previousLecture = findPlayable(lectures, currentIndex, -1);
  const nextLecture = findPlayable(lectures, currentIndex, 1);
  const instructorName = course?.instructor?.name || course?.instructor || "EduPath Instructor";
  const instructorId = course?.instructor?._id || course?.instructor?.id || "";
  const instructorAvatar = assetUrl(course?.instructor?.avatar || "");

  function selectLecture(id) {
    const selected = lectures.find((lecture) => String(lecture._id) === String(id));
    if (selected?.locked) {
      toast.info(selected.unlockDate ? `This lesson unlocks on ${new Date(selected.unlockDate).toLocaleDateString()}.` : "Complete the previous lesson first.");
      return;
    }
    setSelectedLectureId(id);
    if (course?._id || course?.id) navigate(`/dashboard/learn/${course._id || course.id}/${id}`, { replace: true });
  }

  async function markComplete() {
    if (!currentLecture) return;
    setSaving(true);
    try {
      await learningApi.completeLecture(currentLecture._id);
      setCompleted((prev) => new Set([...prev, String(currentLecture._id)]));
      toast.success("Lecture progress saved.");
    } catch (error) {
      toast.error(error.message || "Progress failed");
    } finally {
      setSaving(false);
    }
  }

  async function saveVideoProgress(event) {
    const video = event.currentTarget;
    if (!video.duration || !currentLecture) return;
    await learningApi.saveProgress(currentLecture._id, {
      watchedPercentage: Math.round((video.currentTime / video.duration) * 100),
      lastPositionSeconds: Math.round(video.currentTime),
      watchTimeSeconds: Math.round(video.currentTime),
    });
  }
  async function toggleBookmark() {
    if (!currentLecture) return;
    const lectureKey = String(currentLecture._id);
    const nextValue = !bookmarked.has(lectureKey);
    try {
      await learningApi.bookmarkLecture(currentLecture._id, { bookmarked: nextValue });
      setBookmarked((previous) => {
        const next = new Set(previous);
        if (nextValue) next.add(lectureKey); else next.delete(lectureKey);
        return next;
      });
      toast.success(nextValue ? "Lecture bookmarked." : "Bookmark removed.");
    } catch (error) { toast.error(error.message || "Bookmark failed"); }
  }
  async function markIncomplete() {
    if (!currentLecture) return;
    setSaving(true);
    try {
      await learningApi.saveProgress(currentLecture._id, { completed: false });
      setCompleted((previous) => {
        const next = new Set(previous);
        next.delete(String(currentLecture._id));
        return next;
      });
      toast.success("Lecture marked incomplete.");
    } catch (error) {
      toast.error(error.message || "Progress failed");
    } finally {
      setSaving(false);
    }
  }
  if (loading) return <PageLoader label="Loading learning room" />;
  if (!course) return <EmptyPanel title="No course selected" description="Open My Courses and start a course to enter the learning room." />;

  return (
    <div className="mx-auto max-w-[1500px]">
      <PageHeader eyebrow="Resume" title="Continue Learning" description={course?.title || "Course"} />
      {!lectures.length ? (
        <EmptyPanel title="No lectures available" description="This course is enrolled, but the instructor has not published any lectures yet." />
      ) : (
      <div className="grid gap-6 lg:grid-cols-[300px_1fr_320px]">
        <aside className="rounded-2xl card-premium p-4 lg:sticky lg:top-20 lg:h-fit">
          <h3 className="px-2 pb-2 font-display text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Course Content
          </h3>
          <div className="space-y-4">
            {modules.map((module) => (
              <div key={module._id || module.title}>
                <div className="px-2 text-xs font-semibold text-foreground/90">{module.title}</div>
                <ul className="mt-2 space-y-1">
                  {module.lectures.map((lecture) => {
                    const done = completed.has(String(lecture._id)) || lecture.completed;
                    const active = String(currentLecture?._id) === String(lecture._id);
                    return (
                      <li key={lecture._id}>
                        <button
                          onClick={() => selectLecture(lecture._id)}
                          disabled={lecture.locked}
                          className={`flex w-full items-start gap-2 rounded-xl p-2 text-left text-sm transition-all ${active ? "bg-primary/10 ring-1 ring-primary/30" : "hover:bg-muted/60"} ${lecture.locked ? "cursor-not-allowed opacity-50" : ""}`}
                        >
                          <span className="mt-0.5 shrink-0">
                            {lecture.locked ? <Lock className="h-4 w-4 text-muted-foreground" /> : done ? <CheckCircle2 className="h-4 w-4 text-success" /> : <PlayCircle className={`h-4 w-4 ${active ? "text-primary" : "text-muted-foreground"}`} />}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate">{lecture.title}</span>
                            <span className="text-[11px] text-muted-foreground">{formatDuration(lecture.duration || lecture.durationSeconds)}</span>
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </aside>

        <main className="min-w-0 space-y-4">
          <motion.div
            key={currentLecture?._id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative aspect-video overflow-hidden rounded-2xl bg-black shadow-elegant"
          >
            <LecturePlayer lecture={currentLecture} course={course} onPause={saveVideoProgress} onEnded={markComplete} />
          </motion.div>

          <div className="rounded-2xl card-premium p-6">
            <Badge className="border-0 bg-accent/15 text-accent">
              {completed.has(String(currentLecture?._id)) ? "Completed" : "Now learning"}
            </Badge>
            <h2 className="mt-2 font-display text-2xl font-semibold">{currentLecture?.title || "Select a lecture"}</h2>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <span>{currentLecture?.moduleTitle}</span>
              <span>-</span>
              <span>{formatDuration(currentLecture?.duration || currentLecture?.durationSeconds)}</span>
            </div>

            <Tabs defaultValue="desc" className="mt-6">
              <TabsList className="grid h-auto w-full grid-cols-4 gap-0.5 rounded-xl bg-muted/60 p-1">
                <TabsTrigger value="desc" className="min-w-0 rounded-lg px-1 text-[11px] sm:text-xs">Description</TabsTrigger>
                <TabsTrigger value="notes" className="min-w-0 rounded-lg px-1 text-[11px] sm:text-xs">Notes</TabsTrigger>
                <TabsTrigger value="res" className="min-w-0 rounded-lg px-1 text-[11px] sm:text-xs">Resources</TabsTrigger>
                <TabsTrigger value="dl" className="min-w-0 rounded-lg px-1 text-[11px] sm:text-xs">Downloads</TabsTrigger>
              </TabsList>
              <TabsContent value="desc" className="mt-4 text-sm text-muted-foreground">
                <AnimatePresence mode="wait">
                  <motion.p key={currentLecture?._id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                    {currentLecture?.description || "No description has been added for this lecture yet."}
                  </motion.p>
                </AnimatePresence>
              </TabsContent>
              <TabsContent value="notes" className="mt-4">
                <textarea className="h-32 w-full rounded-xl border border-border bg-muted/30 p-3 text-sm" placeholder="Type your notes..." />
              </TabsContent>
              <TabsContent value="res" className="mt-4 space-y-2 text-sm">
                {resourceList(currentLecture).map((resource) => <Resource key={`${resource.title}-${resource.url || "empty"}`} resource={resource} />)}
              </TabsContent>
              <TabsContent value="dl" className="mt-4 space-y-2 text-sm">
                {downloadList(currentLecture).map((resource) => <Resource key={`${resource.title}-${resource.url || "empty"}`} resource={resource} />)}
              </TabsContent>
            </Tabs>

            <div
              className="mt-6 w-full items-center gap-2"
              style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1.45fr) minmax(0, 1fr)" }}
            >
              <Button onClick={() => previousLecture && selectLecture(previousLecture._id)} disabled={!previousLecture} variant="outline" className="min-w-0 whitespace-nowrap rounded-xl px-2 text-xs disabled:opacity-40 sm:px-3 sm:text-sm">
                <ChevronLeft className="mr-0.5 h-4 w-4 sm:mr-1" /> Previous
              </Button>

              {completed.has(String(currentLecture?._id)) ? (
                <Button onClick={markIncomplete} disabled={saving} variant="outline" className="min-w-0 whitespace-nowrap rounded-xl px-1 text-xs sm:px-3 sm:text-sm">
                  <RotateCcw className="mr-1 h-4 w-4 sm:mr-2" /> Mark incomplete
                </Button>
              ) : (
                <Button onClick={markComplete} disabled={saving} className="min-w-0 whitespace-nowrap rounded-xl gradient-primary border-0 px-1 text-xs text-primary-foreground sm:px-3 sm:text-sm">
                  <CheckCircle2 className="mr-1 h-4 w-4 sm:mr-2" /> {saving ? "Saving..." : "Mark complete"}
                </Button>
              )}

              <Button onClick={() => nextLecture && selectLecture(nextLecture._id)} disabled={!nextLecture} variant="outline" className="min-w-0 whitespace-nowrap rounded-xl px-2 text-xs disabled:opacity-40 sm:px-3 sm:text-sm">
                Next <ChevronRight className="ml-0.5 h-4 w-4 sm:ml-1" />
              </Button>
            </div>
          </div>
        </main>

        <aside className="space-y-4 lg:sticky lg:top-20 lg:h-fit">
          <div className="rounded-2xl card-premium p-5">
            <h3 className="font-display text-base font-semibold">Course Progress</h3>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="font-display text-3xl font-semibold text-gradient">{progress}%</span>
              <span className="text-xs text-muted-foreground">{completed.size}/{lectures.length} lectures</span>
            </div>
            <Progress value={progress} className="mt-2 h-2" />
          </div>

          <div
            className={`rounded-2xl card-premium p-5 ${instructorId ? "cursor-pointer transition-all hover:-translate-y-0.5 hover:ring-1 hover:ring-primary/30" : ""}`}
            onClick={() => instructorId && navigate(`/dashboard/messages?contact=${encodeURIComponent(instructorId)}`)}
            onKeyDown={(event) => { if (instructorId && (event.key === "Enter" || event.key === " ")) navigate(`/dashboard/messages?contact=${encodeURIComponent(instructorId)}`); }}
            role={instructorId ? "button" : undefined}
            tabIndex={instructorId ? 0 : undefined}
          >
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-display text-base font-semibold">Instructor</h3>
              <MessageCircle className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12 ring-2 ring-primary/30">
                <AvatarImage src={instructorAvatar} alt={instructorName} />
                <AvatarFallback>{initials(instructorName)}</AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium">{instructorName}</div>
                <div className="text-xs text-muted-foreground">Course instructor</div>
              </div>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">{course?.description || "Follow the modules and complete each lecture to update your progress."}</p>
            {instructorId && <p className="mt-2 text-[11px] font-medium text-primary">Click to message instructor</p>}
          </div>

          <div className="rounded-2xl card-premium p-5">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-display text-base font-semibold">Bookmarks</h3>
              <StickyNote className="h-4 w-4 text-muted-foreground" />
            </div>
            <Button variant="outline" className="w-full rounded-xl" onClick={toggleBookmark}>
              <Bookmark className={`mr-2 h-4 w-4 ${bookmarked.has(String(currentLecture?._id)) ? "fill-current text-primary" : ""}`} />
              {bookmarked.has(String(currentLecture?._id)) ? "Remove bookmark" : "Bookmark current lecture"}
            </Button>
            {bookmarked.size > 0 && (
              <div className="mt-3 space-y-1 border-t border-border/60 pt-3">
                {lectures.filter((lecture) => bookmarked.has(String(lecture._id))).map((lecture) => (
                  <button key={lecture._id} onClick={() => selectLecture(lecture._id)} className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-xs hover:bg-muted/60">
                    <Bookmark className="h-3.5 w-3.5 shrink-0 fill-current text-primary" />
                    <span className="truncate">{lecture.title}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-2xl card-premium p-5 text-center">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-primary/10 text-primary">
              <BookOpen className="h-5 w-5" />
            </div>
            <div className="mt-2 text-sm font-medium">{course?.title}</div>
            <div className="text-xs text-muted-foreground">{currentLecture?.title}</div>
          </div>
        </aside>
      </div>
      )}
    </div>
  );
}

function normalizeModules(modules, progress = []) {
  const done = new Set((progress || []).filter((item) => item.completed).map((item) => String(item.lecture?._id || item.lecture)));
  return (modules || []).map((module) => ({ ...module, lectures: (module.lectures || []).map((lecture) => ({ ...lecture, completed: lecture.completed || done.has(String(lecture._id)) })) }));
}
function LecturePlayer({ lecture, course, onPause, onEnded }) {
  const source = assetUrl(lecture?.videoUrl || lecture?.contentUrl || lecture?.url || "");
  const embedUrl = toEmbedUrl(source);

  if (source && isDirectVideo(source)) {
    return <video src={source} controls playsInline onPause={onPause} onEnded={onEnded} className="h-full w-full bg-black" />;
  }

  if (embedUrl) {
    return (
      <iframe
        src={embedUrl}
        title={lecture?.title || "Lecture video"}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        className="h-full w-full border-0 bg-black"
      />
    );
  }

  if (source) {
    return (
      <div className="relative flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-primary/50 text-white">
        <div className="max-w-md px-6 text-center">
          <PlayCircle className="mx-auto h-16 w-16 text-white/80" />
          <h2 className="mt-4 text-2xl font-semibold">{lecture?.title}</h2>
          <p className="mt-2 text-sm text-white/70">This video link is not a direct playable file. Open it in a new tab.</p>
          <Button asChild className="mt-5 rounded-xl gradient-primary border-0 text-primary-foreground">
            <a href={source} target="_blank" rel="noreferrer"><ExternalLink className="mr-2 h-4 w-4" />Open video</a>
          </Button>
        </div>
      </div>
    );
  }

  if (lecture?.type === "article") {
    return <div className="h-full overflow-y-auto p-8 text-left text-white"><p className="whitespace-pre-wrap text-sm leading-7 text-white/85">{lecture.articleContent || lecture.description}</p></div>;
  }

  return (
    <div className="relative h-full w-full overflow-hidden">
      {course?.thumbnail ? (
        <img src={assetUrl(course.thumbnail)} alt="" className="absolute inset-0 h-full w-full object-cover" />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-primary/50" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-black/15" />
      <div className="absolute inset-x-0 bottom-0 z-10 p-5 text-white sm:p-6">
        <div className="mb-4 grid h-12 w-12 place-items-center rounded-full border border-white/40 bg-white/15 shadow-lg backdrop-blur-sm sm:h-14 sm:w-14">
          <PlayCircle className="h-8 w-8 text-white drop-shadow-sm sm:h-9 sm:w-9" />
        </div>
        <p className="line-clamp-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/75">
          {lecture?.moduleTitle || "Lesson"}
        </p>
        <h2 className="mt-1 line-clamp-2 max-w-[92%] font-display text-xl font-semibold leading-tight text-white drop-shadow-sm sm:text-2xl">
          {lecture?.title || "Select a lecture"}
        </h2>
      </div>
    </div>
  );
}
function Resource({ resource }) {
  if (!resource?.url) {
    return <div className="rounded-xl border border-border/60 bg-muted/30 p-3 text-sm text-muted-foreground">{resource?.title || "No resources added"}</div>;
  }
  const href = assetUrl(resource.url);
  const Icon = String(resource.type || "").toUpperCase() === "ZIP" ? Download : FileText;
  return (
    <a href={href} target="_blank" rel="noreferrer" className="flex items-center gap-3 rounded-xl border border-border/60 bg-muted/30 p-3 text-sm transition-all hover:bg-muted/60">
      <Icon className="h-4 w-4 text-primary" />
      <span className="flex-1 truncate">{resource.title || "Resource"}</span>
      <Download className="h-4 w-4 text-muted-foreground" />
    </a>
  );
}
function findPlayable(lectures, index, direction) {
  let next = index + direction;
  while (next >= 0 && next < lectures.length) {
    if (!lectures[next]?.locked) return lectures[next];
    next += direction;
  }
  return null;
}
function isDirectVideo(value) {
  return /\.(mp4|webm|ogg|mov|m3u8)(\?.*)?$/i.test(String(value || ""));
}
function toEmbedUrl(value) {
  if (!value) return "";
  try {
    const url = new URL(value);
    if (url.hostname.includes("youtube.com")) {
      const id = url.searchParams.get("v") || url.pathname.split("/").filter(Boolean).pop();
      return id ? `https://www.youtube.com/embed/${id}` : "";
    }
    if (url.hostname.includes("youtu.be")) {
      const id = url.pathname.split("/").filter(Boolean)[0];
      return id ? `https://www.youtube.com/embed/${id}` : "";
    }
    if (url.hostname.includes("vimeo.com")) {
      const id = url.pathname.split("/").filter(Boolean).pop();
      return id ? `https://player.vimeo.com/video/${id}` : "";
    }
  } catch {
    return "";
  }
  return "";
}
function initials(name) {
  return String(name || "I")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase() || "I";
}
function formatDuration(value) {
  if (!value) return "0:00";
  if (typeof value === "string") return value;
  const minutes = Math.floor(value / 60);
  const seconds = String(value % 60).padStart(2, "0");
  return `${minutes}:${seconds}`;
}
function resourceList(lecture) {
  if (!lecture) return [];
  const resources = [...(lecture.resources || [])];
  if (lecture.notesPdfUrl) resources.unshift({ title: "Lecture Notes", type: "PDF", url: lecture.notesPdfUrl });
  if (lecture.captionsUrl) resources.push({ title: "Captions", type: "VTT", url: lecture.captionsUrl });
  return resources.length ? resources : [{ title: "No resources added", type: "Resource", url: "" }];
}
function downloadList(lecture) {
  const downloads = resourceList(lecture).filter((resource) => resource.url);
  return downloads.length ? downloads : [{ title: "No downloads added", type: "Download", url: "" }];
}
