import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { PageHeader } from "@/features/student/components/PageHeader";
import { CourseCard } from "@/features/student/components/CourseCard";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { assetUrl } from "@/services/api";
import { learningApi } from "@/services/learningApi";

const mapEnrollment = (item) => {
  const course = item.course || {};
  const progress = Number(item.progress || 0);
  return {
    id: course._id || course.id || item._id,
    title: course.title || "Course",
    cover: assetUrl(course.thumbnail) || course.cover || "/assets/images/course/course-1/1.png",
    category: course.category || "Learning",
    rating: Number(course.rating || 0).toFixed(1),
    instructor: course.instructor?.name || course.instructor || "Instructor",
    completed: Number(course.completedLectures || 0),
    lectures: Number(course.totalLectures || course.lectures || 0),
    duration: course.duration || course.currentLecture || "Self-paced",
    progress,
    status: item.status === "completed" || progress >= 100 ? "completed" : progress > 0 ? "in-progress" : "not-started",
  };
};

export default function CoursesPage() {
  const [q, setQ] = useState("");
  const [tab, setTab] = useState("all");
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    learningApi.getMyCourses()
      .then((items) => {
        if (mounted) setList((items || []).map(mapEnrollment));
      })
      .catch(() => {
        if (mounted) setList([]);
      })
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  const filtered = useMemo(() => {
    return list.filter((c) => {
      const matchTab = tab === "all" || c.status === tab;
      const matchQ =
        !q ||
        c.title.toLowerCase().includes(q.toLowerCase()) ||
        c.instructor.toLowerCase().includes(q.toLowerCase());
      return matchTab && matchQ;
    });
  }, [list, q, tab]);
  return (
    <div className="mx-auto max-w-[1400px]">
      <PageHeader
        eyebrow="Library"
        title="My Courses"
        description="Everything you're learning, in one cinematic shelf."
      />

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search courses or instructors…"
            className="h-10 rounded-xl pl-9"
          />
        </div>
        <Tabs value={tab} onValueChange={(v) => setTab(v)}>
          <TabsList className="rounded-xl bg-muted/60 p-1">
            <TabsTrigger value="all" className="rounded-lg">
              All
            </TabsTrigger>
            <TabsTrigger value="in-progress" className="rounded-lg">
              In Progress
            </TabsTrigger>
            <TabsTrigger value="completed" className="rounded-lg">
              Completed
            </TabsTrigger>
            <TabsTrigger value="not-started" className="rounded-lg">
              Not Started
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {loading ? (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3].map((item) => <div key={item} className="h-80 animate-pulse rounded-2xl bg-muted/40" />)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((c, i) => (
            <CourseCard key={c.id} course={c} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
function EmptyState() {
  return (
    <div className="rounded-2xl card-premium p-16 text-center">
      <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-2xl gradient-primary shadow-glow">
        <Search className="h-7 w-7 text-primary-foreground" />
      </div>
      <h3 className="font-display text-xl font-semibold">No courses match</h3>
      <p className="mt-2 text-sm text-muted-foreground">Try a different filter or search term.</p>
    </div>
  );
}

