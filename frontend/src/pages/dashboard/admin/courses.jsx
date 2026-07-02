import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Archive, Edit3, LayoutGrid, List, Plus, Star, Trash2 } from "lucide-react";
import { LmsPageHeader } from "@/features/shared/components/PageHeader";
import { DataTable } from "@/features/shared/components/DataTable";
import { StatusBadge } from "@/features/shared/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { courseApi, mapCourse } from "@/services/courseApi";
import { inr } from "@/features/shared/utils/format";
import { toast } from "sonner";

export default function CoursesPage() {
  const [view, setView] = useState("grid");
  const [status, setStatus] = useState("all");
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const result = await courseApi.adminCourses();
      setList((result.data || []).map(mapCourse));
    } catch (error) {
      toast.error(error.message || "Courses could not be loaded.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const rows = useMemo(() => list.filter((course) => status === "all" || course.status === status), [list, status]);

  async function act(course, action) {
    try {
      if (action === "publish") await courseApi.publishCourse(course.id);
      if (action === "unpublish") await courseApi.unpublishCourse(course.id);
      if (action === "archive") await courseApi.archiveCourse(course.id);
      if (action === "delete") await courseApi.deleteCourse(course.id);
      toast.success(`${course.title} ${action}d.`);
      await load();
    } catch (error) {
      toast.error(error.message);
    }
  }

  const columns = [
    {
      key: "title",
      header: "Course",
      render: (course) => (
        <div className="flex items-center gap-3">
          <img src={course.cover} alt="" className="h-10 w-14 rounded-lg object-cover" />
          <div className="min-w-0">
            <div className="truncate text-sm font-medium">{course.title}</div>
            <div className="text-xs text-muted-foreground">{course.instructor}</div>
          </div>
        </div>
      ),
    },
    { key: "category", header: "Category" },
    { key: "price", header: "Price", render: (course) => inr(Number(course.price || 0)) },
    { key: "enrollments", header: "Enrollments", render: (course) => Number(course.enrollments || 0).toLocaleString() },
    { key: "status", header: "Status", render: (course) => <StatusBadge status={course.status} /> },
  ];

  return (
    <div className="mx-auto max-w-[1500px]">
      <LmsPageHeader
        eyebrow="Catalog"
        title="Courses"
        description={`${list.length} live database courses`}
        actions={
          <>
            <Tabs value={view} onValueChange={setView}>
              <TabsList className="rounded-xl bg-muted/60 p-1">
                <TabsTrigger value="grid" className="rounded-lg"><LayoutGrid className="h-3.5 w-3.5" /></TabsTrigger>
                <TabsTrigger value="table" className="rounded-lg"><List className="h-3.5 w-3.5" /></TabsTrigger>
              </TabsList>
            </Tabs>
            <Button asChild className="rounded-xl gradient-primary border-0 text-primary-foreground">
              <Link to="/admin/dashboard/courses/new"><Plus className="mr-1.5 h-4 w-4" /> New course</Link>
            </Button>
          </>
        }
      />

      <Tabs value={status} onValueChange={setStatus} className="mb-5">
        <TabsList className="h-auto flex-wrap rounded-xl bg-muted/60 p-1">
          {["all", "published", "draft", "pending", "approved", "rejected", "archived"].map((item) => (
            <TabsTrigger key={item} value={item} className="rounded-lg capitalize">{item}</TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {loading ? (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3].map((item) => <div key={item} className="h-80 animate-pulse rounded-2xl bg-muted/40" />)}
        </div>
      ) : view === "table" ? (
        <DataTable
          rows={rows}
          columns={columns}
          searchKeys={["title", "category", "instructor", "status"]}
          actions={[
            { label: "Edit", onClick: (course) => window.location.assign(`/admin/dashboard/courses/${course.id}/edit`) },
            { label: "Publish", onClick: (course) => act(course, "publish") },
            { label: "Unpublish", onClick: (course) => act(course, "unpublish") },
            { label: "Archive", onClick: (course) => act(course, "archive") },
            { label: "Delete", onClick: (course) => act(course, "delete"), danger: true },
          ]}
        />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {rows.map((course, index) => (
            <motion.div key={course.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }} className="overflow-hidden rounded-2xl card-premium">
              <div className="relative h-40 overflow-hidden">
                <img src={course.cover} alt="" className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/65 to-transparent" />
                <Badge className="absolute left-3 top-3 border-0 bg-background/80 text-foreground">{course.category}</Badge>
                <div className="absolute right-3 top-3"><StatusBadge status={course.status} /></div>
              </div>
              <div className="p-4">
                <h3 className="line-clamp-1 font-display text-base font-semibold">{course.title}</h3>
                <p className="mt-1 text-xs text-muted-foreground">By {course.instructor}</p>
                <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
                  <Mini label="Price" value={inr(Number(course.price || 0))} />
                  <Mini label="Enroll" value={Number(course.enrollments || 0).toLocaleString()} />
                  <Mini label="Rating" value={<span className="inline-flex items-center gap-1"><Star className="h-3 w-3 fill-current text-warning" /> {Number(course.rating || 0).toFixed(1)}</span>} />
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <Button asChild size="sm" className="rounded-lg gradient-primary border-0 text-primary-foreground">
                    <Link to={`/admin/dashboard/courses/${course.id}/edit`}><Edit3 className="mr-1 h-3.5 w-3.5" /> Edit</Link>
                  </Button>
                  <Button size="sm" variant="outline" className="rounded-lg border-border/60" onClick={() => act(course, course.status === "published" ? "unpublish" : "publish")}>
                    {course.status === "published" ? "Unpublish" : "Publish"}
                  </Button>
                  <Button size="sm" variant="outline" className="rounded-lg border-border/60" onClick={() => act(course, "archive")}>
                    <Archive className="mr-1 h-3.5 w-3.5" /> Archive
                  </Button>
                  <Button size="sm" variant="outline" className="rounded-lg border-destructive/40 text-destructive" onClick={() => act(course, "delete")}>
                    <Trash2 className="mr-1 h-3.5 w-3.5" /> Delete
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {!loading && rows.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border/60 p-8 text-center text-sm text-muted-foreground">No courses found.</div>
      )}
    </div>
  );
}

function Mini({ label, value }) {
  return (
    <div className="rounded-lg bg-muted/30 p-1.5">
      <div className="font-semibold">{value}</div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
    </div>
  );
}
