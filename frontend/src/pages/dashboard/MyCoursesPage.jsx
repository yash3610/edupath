import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, Clock3, Search, Trophy } from "lucide-react";
import { MotionCard, ProgressBar, SectionHeading } from "../../components/dashboard/DashboardPrimitives.jsx";
import { learningApi } from "../../services/learningApi.js";

const filters = ["All", "In Progress", "Completed", "Not Started"];

export default function MyCoursesPage() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    learningApi.getMyCourses().then(setEnrollments).finally(() => setLoading(false));
  }, []);

  const courses = useMemo(() => enrollments.map(normalizeEnrollment), [enrollments]);
  const filtered = useMemo(
    () => courses.filter((course) => (filter === "All" || course.status === filter) && course.title.toLowerCase().includes(search.toLowerCase())),
    [filter, search, courses]
  );

  return (
    <div className="space-y-5">
      <SectionHeading eyebrow="My Courses" title="Your live enrolled courses" />

      <div className="grid gap-3 sm:grid-cols-3">
        <Stat icon={BookOpen} label="Enrolled" value={courses.length} />
        <Stat icon={Trophy} label="Completed" value={courses.filter((course) => course.status === "Completed").length} />
        <Stat icon={Clock3} label="In Progress" value={courses.filter((course) => course.status === "In Progress").length} />
      </div>

      <MotionCard className="p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {filters.map((item) => (
              <button
                key={item}
                onClick={() => setFilter(item)}
                className={`shrink-0 rounded-xl px-4 py-2 text-sm font-black ${filter === item ? "bg-[#ff6b35] text-white" : "bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-slate-200"}`}
              >
                {item}
              </button>
            ))}
          </div>
          <label className="flex w-full items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 dark:border-white/10 dark:bg-slate-800 lg:max-w-xs">
            <Search className="h-4 w-4 text-slate-400" />
            <input
              className="dashboard-search-input w-full bg-transparent text-sm font-bold outline-none"
              placeholder="Search courses..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </label>
        </div>
      </MotionCard>

      {loading ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3].map((item) => <div key={item} className="h-80 animate-pulse rounded-[28px] bg-slate-200 dark:bg-white/10" />)}
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((course) => (
            <MotionCard key={course.id} className="group overflow-hidden p-0 transition hover:-translate-y-1 hover:shadow-xl">
              <div className="relative h-48 overflow-hidden">
                <img src={course.thumbnail} alt={course.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-black uppercase text-[#ff6b35]">{course.status}</span>
                <p className="absolute bottom-4 left-4 right-4 text-sm font-black text-white">{course.currentLecture}</p>
              </div>
              <div className="p-5">
                <h3 className="line-clamp-2 text-lg font-black">{course.title}</h3>
                <p className="mt-1 text-sm font-bold text-slate-500 dark:text-slate-400">By {course.instructor}</p>
                <div className="mt-4">
                  <div className="mb-2 flex justify-between text-xs font-black text-slate-500"><span>Progress</span><span>{course.progress}%</span></div>
                  <ProgressBar value={course.progress} />
                </div>
                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs font-bold text-slate-500 dark:text-slate-400">
                  <span>{course.completedLectures}/{course.totalLectures} lectures</span>
                  <span>{course.duration}</span>
                </div>
                <button onClick={() => navigate(`/dashboard/learn/${course.id}`)} className="mt-5 w-full rounded-xl bg-slate-950 px-4 py-3 text-sm font-black text-white dark:bg-white dark:text-slate-950">
                  {course.progress > 0 ? "Continue Learning" : "Start Learning"}
                </button>
              </div>
            </MotionCard>
          ))}
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <MotionCard className="text-center">
          <h3 className="text-xl font-black">No courses found</h3>
          <p className="mt-2 text-slate-500">Try a different search or filter.</p>
        </MotionCard>
      )}
    </div>
  );
}

function normalizeEnrollment(enrollment) {
  const course = enrollment.course || enrollment;
  const progress = Number(enrollment.progress ?? course.progress ?? 0);
  return {
    id: course._id || course.id,
    title: course.title,
    instructor: course.instructor?.name || course.instructor || "EduPath Instructor",
    thumbnail: course.thumbnail || "/assets/images/course/course-1/1.png",
    progress,
    totalLectures: course.totalLectures || 0,
    completedLectures: course.completedLectures || 0,
    duration: course.duration || "Self paced",
    status: progress >= 100 || enrollment.status === "completed" ? "Completed" : progress > 0 ? "In Progress" : "Not Started",
    currentLecture: course.currentLecture || "Open next lesson",
  };
}

function Stat({ icon: Icon, label, value }) {
  return (
    <MotionCard className="p-5">
      <Icon className="h-5 w-5 text-[#ff6b35]" />
      <p className="mt-3 text-xs font-black uppercase tracking-[0.14em] text-slate-400">{label}</p>
      <p className="mt-1 text-2xl font-black">{value}</p>
    </MotionCard>
  );
}
