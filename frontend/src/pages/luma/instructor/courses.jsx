import { Link } from "react-router-dom";
import { useState } from "react";
import { motion } from "framer-motion";
import { Edit3, LayoutGrid, List, Plus, Star } from "lucide-react";
import { LmsPageHeader } from "@/features/shared/components/PageHeader";
import { DataTable } from "@/features/shared/components/DataTable";
import { StatusBadge } from "@/features/shared/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { instructorCourses } from "@/features/instructor/data/instructor";
import { inr } from "@/features/shared/utils/format";
import { toast } from "sonner";

export default function InstructorCourses() {
  const [view, setView] = useState("grid");
  const [status, setStatus] = useState("all");
  const rows = instructorCourses.filter((c) => status === "all" || c.status === status);
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
    { key: "price", header: "Price", render: (r) => inr(r.price) },
    {
      key: "enrollments",
      header: "Enrolments",
      sort: (a, b) => a.enrollments - b.enrollments,
      render: (r) => r.enrollments.toLocaleString(),
    },
    {
      key: "rating",
      header: "Rating",
      render: (r) => (
        <span className="inline-flex items-center gap-1">
          <Star className="h-3 w-3 fill-current text-warning" /> {r.rating.toFixed(1)}
        </span>
      ),
    },
    {
      key: "revenue",
      header: "Revenue",
      sort: (a, b) => a.revenue - b.revenue,
      render: (r) => <span className="font-medium">{inr(r.revenue)}</span>,
    },
    {
      key: "completion",
      header: "Completion",
      render: (r) => (
        <div className="flex items-center gap-2 w-32">
          <Progress value={r.completion} className="h-1.5" />
          <span className="text-xs">{r.completion}%</span>
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
        description={`${instructorCourses.length} courses · ${instructorCourses.filter((c) => c.status === "published").length} live`}
        actions={
          <>
            <Tabs value={view} onValueChange={(v) => setView(v)}>
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
        <TabsList className="rounded-xl bg-muted/60 p-1 flex-wrap h-auto">
          {["all", "published", "draft", "pending", "archived"].map((s) => (
            <TabsTrigger key={s} value={s} className="rounded-lg capitalize">
              {s}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {view === "grid" ? (
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
                <img
                  src={c.cover}
                  alt=""
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
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
                  <Progress value={c.completion} className="h-1.5 flex-1" />
                  <span className="text-xs text-muted-foreground">{c.completion}%</span>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
                  <Mini label="Enrol" v={c.enrollments.toLocaleString()} />
                  <Mini label="Rev" v={inr(c.revenue)} />
                  <Mini label="★" v={c.rating.toFixed(1)} />
                </div>
                <div className="mt-3 flex gap-2">
                  <Link to="/instructor/dashboard/builder" className="flex-1">
                    <Button
                      size="sm"
                      className="h-8 w-full rounded-lg gradient-primary border-0 text-primary-foreground text-xs"
                    >
                      <Edit3 className="mr-1 h-3.5 w-3.5" /> Manage
                    </Button>
                  </Link>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 rounded-lg border-border/60 text-xs"
                    onClick={() => toast("Preview opened")}
                  >
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
          searchKeys={["title", "category"]}
          actions={[
            { label: "Edit", onClick: () => toast("Opening editor…") },
            {
              label: "Duplicate",
              onClick: (r) => toast.success(`Duplicated ${r.title}`),
            },
            {
              label: "Archive",
              onClick: (r) => toast(`Archived ${r.title}`),
            },
            {
              label: "Delete",
              onClick: (r) => toast.error(`Deleted ${r.title}`),
              danger: true,
            },
          ]}
        />
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

