import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Edit3, LayoutGrid, List, Plus, Star } from "lucide-react";
import { LmsPageHeader } from "@/features/shared/components/PageHeader";
import { DataTable } from "@/features/shared/components/DataTable";
import { StatusBadge } from "@/features/shared/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { inr } from "@/features/shared/utils/format";
import { toast } from "sonner";
import { courseApi, mapCourse } from "@/services/courseApi";

export default function InstructorCourses() {
  const [view, setView] = useState("grid");
  const [status, setStatus] = useState("all");
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    courseApi.instructorCourses()
      .then((result) => {
        if (!mounted) return;
        setList((result.data || []).map(mapCourse));
      })
      .catch((error) => {
        if (!mounted) return;
        setList([]);
        toast.error(error.message || "Could not load live courses.");
      })
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  const rows = useMemo(() => list.filter((c) => status === "all" || c.status === status), [list, status]);
  const liveCount = list.filter((c) => c.status === "published").length;

  function previewCourse(course) {
    const isPublic = ["published", "approved"].includes(course.rawStatus);
    if (!isPublic) {
      toast.info("Preview will be available after this course is published.");
      return;
    }
    if (!course.slug) {
      toast.error("This course does not have a preview link yet.");
      return;
    }
    window.open(`/course/${encodeURIComponent(course.slug)}`, "_blank", "noopener,noreferrer");
  }

  const cols = [
    {
      key: "title",
      header: "Course",
      render: (r) => (
        <div className="flex items-center gap-3">
          <img src={r.cover} alt="" className="h-10 w-14 rounded-lg object-cover" />
          <div className="min-w-0">
            <div className="truncate text-sm font-medium">{r.title}</div>
            <div className="text-xs text-muted-foreground">{r.category}</div>
          </div>
        </div>
      ),
    },
    { key: "price", header: "Price", render: (r) => inr(Number(r.price || 0)) },
    {
      key: "enrollments",
      header: "Enrolments",
      sort: (a, b) => Number(a.enrollments || 0) - Number(b.enrollments || 0),
      render: (r) => Number(r.enrollments || 0).toLocaleString(),
    },
    {
      key: "rating",
      header: "Rating",
      render: (r) => (
        <span className="inline-flex items-center gap-1">
          <Star className="h-3 w-3 fill-current text-warning" /> {Number(r.rating || 0).toFixed(1)}
        </span>
      ),
    },
    {
      key: "completion",
      header: "Completion",
      render: (r) => (
        <div className="flex w-32 items-center gap-2">
          <Progress value={Number(r.completion || 0)} className="h-1.5" />
          <span className="text-xs">{Number(r.completion || 0)}%</span>
        </div>
      ),
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
        eyebrow="Teaching"
        title="My Courses"
        description={loading ? "Loading live courses..." : `${list.length} courses · ${liveCount} live`}
        actions={
          <>
            <Tabs value={view} onValueChange={setView}>
              <TabsList className="rounded-xl bg-muted/60 p-1">
                <TabsTrigger value="grid" className="rounded-lg">
                  <LayoutGrid className="h-3.5 w-3.5" />
                </TabsTrigger>
                <TabsTrigger value="table" className="rounded-lg">
                  <List className="h-3.5 w-3.5" />
                </TabsTrigger>
              </TabsList>
            </Tabs>
            <Link to="/instructor/dashboard/create">
              <Button className="rounded-xl gradient-primary border-0 text-primary-foreground">
                <Plus className="mr-1.5 h-4 w-4" /> New course
              </Button>
            </Link>
          </>
        }
      />

      <Tabs value={status} onValueChange={setStatus} className="mb-5">
        <TabsList className="h-auto flex-wrap rounded-xl bg-muted/60 p-1">
          {["all", "published", "draft", "pending", "approved", "rejected", "archived"].map((s) => (
            <TabsTrigger key={s} value={s} className="rounded-lg capitalize">
              {s}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {loading ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((item) => (
            <div key={item} className="h-80 animate-pulse rounded-2xl bg-muted/40" />
          ))}
        </div>
      ) : view === "grid" ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((c, i) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              whileHover={{ y: -4 }}
              className="group overflow-hidden rounded-2xl card-premium"
            >
              <div className="relative h-40 overflow-hidden">
                <img src={c.cover} alt="" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <Badge className="absolute left-3 top-3 border-0 bg-background/80 text-foreground">
                  {c.category}
                </Badge>
                <div className="absolute right-3 top-3">
                  <StatusBadge status={c.status} />
                </div>
              </div>
              <div className="p-4">
                <h3 className="line-clamp-1 font-display text-base font-semibold">{c.title}</h3>
                <div className="mt-3 flex items-center gap-3">
                  <Progress value={Number(c.completion || 0)} className="h-1.5 flex-1" />
                  <span className="text-xs text-muted-foreground">{Number(c.completion || 0)}%</span>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
                  <Mini label="Enrol" v={Number(c.enrollments || 0).toLocaleString()} />
                  <Mini label="Price" v={inr(Number(c.price || 0))} />
                  <Mini label="Rating" v={Number(c.rating || 0).toFixed(1)} />
                </div>
                <div className="mt-3 flex gap-2">
                  <Link to={`/instructor/dashboard/builder?course=${c.id}`} className="flex-1">
                    <Button size="sm" className="h-8 w-full rounded-lg gradient-primary border-0 text-xs text-primary-foreground">
                      <Edit3 className="mr-1 h-3.5 w-3.5" /> Manage
                    </Button>
                  </Link>
                  <Button size="sm" variant="outline" className="h-8 rounded-lg border-border/60 text-xs" onClick={() => previewCourse(c)}>
                    Preview
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <DataTable
          rows={rows}
          columns={cols}
          searchKeys={["title", "category", "status"]}
          actions={[
            { label: "Edit", onClick: (r) => window.location.assign(`/instructor/dashboard/builder?course=${r.id}`) },
            { label: "Preview", onClick: previewCourse },
          ]}
        />
      )}

      {!loading && rows.length === 0 && (
        <div className="mt-6 rounded-2xl border border-dashed border-border/60 p-8 text-center text-sm text-muted-foreground">
          No courses found for this status.
        </div>
      )}
    </div>
  );
}

function Mini({ label, v }) {
  return (
    <div className="rounded-lg bg-muted/30 p-1.5">
      <div className="font-semibold">{v}</div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
    </div>
  );
}
