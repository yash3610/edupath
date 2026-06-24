import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { CalendarDays, CalendarPlus, Pencil, Play, StopCircle, Trash2, Video } from "lucide-react";
import { LmsPageHeader } from "@/features/shared/components/PageHeader";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/features/shared/components/StatusBadge";
import { liveClassApi } from "@/services/liveClassApi";
import { toast } from "sonner";

const statusGroups = {
  upcoming: ["draft", "pending-approval", "scheduled", "starting-soon", "live", "rejected"],
  completed: ["completed", "recording-available"],
  cancelled: ["cancelled"],
};

function formatDate(value) {
  if (!value) return "Not scheduled";
  return new Date(value).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function LivePage() {
  const [tab, setTab] = useState("upcoming");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const result = await liveClassApi.getInstructorLiveClasses();
      setRows(result.data || []);
    } catch (error) {
      toast.error(error.message || "Could not load live classes");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const statuses = statusGroups[tab] || [];
    return rows.filter((item) => statuses.includes(item.status));
  }, [rows, tab]);

  async function act(item, action) {
    try {
      if (action === "start") await liveClassApi.startLiveClass(item._id);
      if (action === "complete") await liveClassApi.completeLiveClass(item._id);
      if (action === "cancel") await liveClassApi.cancelLiveClass(item._id, window.prompt("Cancellation reason") || "Cancelled by instructor");
      if (action === "delete" && window.confirm(`Delete ${item.title}?`)) await liveClassApi.deleteLiveClass(item._id);
      toast.success("Live class updated");
      await load();
    } catch (error) {
      toast.error(error.message || "Action failed");
    }
  }

  return (
    <div className="mx-auto max-w-[1300px]">
      <LmsPageHeader
        eyebrow="Learners"
        title="Live Classes"
        description="Schedule, run, and review live sessions from live data."
        actions={
          <Button asChild className="rounded-xl gradient-primary border-0 text-primary-foreground">
            <Link to="/instructor/dashboard/live-classes/create">
              <CalendarPlus className="mr-1.5 h-4 w-4" /> Schedule live
            </Link>
          </Button>
        }
      />

      <Tabs value={tab} onValueChange={setTab} className="mb-5">
        <TabsList className="rounded-xl bg-muted/60 p-1">
          {["upcoming", "completed", "cancelled"].map((status) => (
            <TabsTrigger key={status} value={status} className="rounded-lg capitalize">
              {status}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {loading ? (
        <div className="rounded-2xl card-premium p-10 text-center text-sm text-muted-foreground">Loading live classes...</div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl card-premium p-10 text-center text-sm text-muted-foreground">No {tab} classes yet.</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((item, index) => (
            <motion.div
              key={item._id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04 }}
              className="rounded-2xl card-premium p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl gradient-primary shadow-glow">
                  <Video className="h-5 w-5 text-primary-foreground" />
                </div>
                <StatusBadge status={item.status} />
              </div>
              <h3 className="mt-3 line-clamp-2 font-display text-base font-semibold">{item.title}</h3>
              <Badge variant="outline" className="mt-1 max-w-full border-border/60">
                <span className="truncate">{item.course?.title || "Course"}</span>
              </Badge>
              <div className="mt-3 space-y-1.5 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <CalendarDays className="h-3.5 w-3.5" /> {formatDate(item.startAt)}
                </div>
                <div>{item.totalJoined || 0} joined - {item.averageAttendance || 0}% avg attendance</div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <Button asChild variant="outline" className="rounded-xl border-border/60">
                  <Link to={`/instructor/dashboard/live-classes/${item._id}`}>Details</Link>
                </Button>
                {["scheduled", "starting-soon"].includes(item.status) && (
                  <Button className="rounded-xl gradient-primary border-0 text-primary-foreground" onClick={() => act(item, "start")}>
                    <Play className="mr-1.5 h-4 w-4" /> Start
                  </Button>
                )}
                {item.status === "live" && (
                  <Button className="rounded-xl bg-emerald-600 text-white hover:bg-emerald-700" onClick={() => act(item, "complete")}>
                    <StopCircle className="mr-1.5 h-4 w-4" /> End
                  </Button>
                )}
                {["draft", "pending-approval", "scheduled", "rejected"].includes(item.status) && (
                  <Button asChild variant="outline" className="rounded-xl border-border/60">
                    <Link to={`/instructor/dashboard/live-classes/${item._id}/edit`}>
                      <Pencil className="mr-1.5 h-4 w-4" /> Edit
                    </Link>
                  </Button>
                )}
                {!["completed", "recording-available", "cancelled"].includes(item.status) && (
                  <Button variant="outline" className="rounded-xl border-border/60" onClick={() => act(item, "cancel")}>
                    Cancel
                  </Button>
                )}
                {item.status !== "live" && (
                  <Button variant="outline" className="rounded-xl border-border/60 text-destructive" onClick={() => act(item, "delete")}>
                    <Trash2 className="mr-1.5 h-4 w-4" /> Delete
                  </Button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
