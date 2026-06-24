import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { CalendarDays, CheckCircle2, Trash2, Video, XCircle } from "lucide-react";
import { LmsPageHeader } from "@/features/shared/components/PageHeader";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/features/shared/components/StatusBadge";
import { liveClassApi } from "@/services/liveClassApi";
import { toast } from "sonner";

const statusGroups = {
  upcoming: ["pending-approval", "scheduled", "starting-soon", "live"],
  completed: ["completed", "recording-available"],
  cancelled: ["cancelled", "rejected"],
  all: [],
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
      const result = await liveClassApi.getAdminLiveClasses();
      setRows(result.data?.classes || result.data || []);
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
    return statuses.length ? rows.filter((item) => statuses.includes(item.status)) : rows;
  }, [rows, tab]);

  async function act(item, action) {
    try {
      if (action === "approve") await liveClassApi.approveLiveClass(item._id);
      if (action === "reject") await liveClassApi.rejectLiveClass(item._id, window.prompt("Rejection reason") || "Changes required");
      if (action === "cancel") await liveClassApi.cancelAdminLiveClass(item._id, window.prompt("Cancellation reason") || "Cancelled by admin");
      if (action === "delete" && window.confirm(`Delete ${item.title}?`)) await liveClassApi.deleteAdminLiveClass(item._id);
      toast.success("Live class updated");
      await load();
    } catch (error) {
      toast.error(error.message || "Action failed");
    }
  }

  return (
    <div className="mx-auto max-w-[1400px]">
      <LmsPageHeader eyebrow="Catalog" title="Live Classes" description="Scheduled sessions across all courses." />
      <Tabs value={tab} onValueChange={setTab} className="mb-5">
        <TabsList className="rounded-xl bg-muted/60 p-1">
          {["upcoming", "completed", "cancelled", "all"].map((status) => (
            <TabsTrigger key={status} value={status} className="rounded-lg capitalize">
              {status}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {loading ? (
        <div className="rounded-2xl card-premium p-10 text-center text-sm text-muted-foreground">Loading live classes...</div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl card-premium p-10 text-center text-sm text-muted-foreground">No {tab} live classes found.</div>
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
                <div>
                  By {item.instructor?.name || "Instructor"} - {item.totalJoined || 0} joined
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <Button asChild variant="outline" className="rounded-xl border-border/60">
                  <Link to={`/admin/dashboard/live-classes/${item._id}`}>Details</Link>
                </Button>
                {["pending-approval", "rejected"].includes(item.status) && (
                  <Button className="rounded-xl bg-emerald-600 text-white hover:bg-emerald-700" onClick={() => act(item, "approve")}>
                    <CheckCircle2 className="mr-1.5 h-4 w-4" /> Approve
                  </Button>
                )}
                {item.status === "pending-approval" && (
                  <Button variant="outline" className="rounded-xl border-border/60 text-amber-700" onClick={() => act(item, "reject")}>
                    <XCircle className="mr-1.5 h-4 w-4" /> Reject
                  </Button>
                )}
                {!["completed", "recording-available", "cancelled", "rejected"].includes(item.status) && (
                  <Button variant="outline" className="rounded-xl border-border/60" onClick={() => act(item, "cancel")}>
                    Cancel
                  </Button>
                )}
                <Button variant="outline" className="rounded-xl border-border/60 text-destructive" onClick={() => act(item, "delete")}>
                  <Trash2 className="mr-1.5 h-4 w-4" /> Delete
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
