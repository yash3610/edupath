import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { CalendarDays, List, Video } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LmsPageHeader } from "@/features/shared/components/PageHeader";
import { StatusBadge } from "@/features/shared/components/StatusBadge";
import { liveClassApi } from "@/services/liveClassApi";
import { EmptyPanel, PageLoader, formatDateTime } from "./LumaDynamicUtils";

export default function StudentLiveClassesPage({ recordingsOnly = false }) {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("list");
  const [tab, setTab] = useState(recordingsOnly ? "recordings" : "upcoming");

  useEffect(() => {
    const request = recordingsOnly ? liveClassApi.getLiveClassRecordings() : liveClassApi.getStudentLiveClasses();
    request.then(({ data }) => setClasses(data || [])).catch((error) => toast.error(error.message || "Unable to load live classes")).finally(() => setLoading(false));
  }, [recordingsOnly]);

  const now = Date.now();
  const filtered = useMemo(() => classes.filter((item) => {
    if (tab === "recordings") return item.status === "recording-available" || item.recordingUrl;
    if (tab === "today") return new Date(item.startAt).toDateString() === new Date().toDateString();
    if (tab === "missed") return new Date(item.endAt || item.startAt).getTime() < now && !item.recordingUrl;
    return new Date(item.endAt || item.startAt).getTime() >= now && !["cancelled", "rejected"].includes(item.status);
  }), [classes, now, tab]);

  if (loading) return <PageLoader label="Loading live classes" />;

  return (
    <div>
      <LmsPageHeader
        eyebrow="Live Learning"
        title={recordingsOnly ? "Class recordings" : "Live classes"}
        description="Join upcoming sessions, track attendance, and revisit completed class recordings."
        actions={!recordingsOnly && <div className="flex gap-2"><Button variant={view === "list" ? "default" : "outline"} size="icon" onClick={() => setView("list")}><List className="h-4 w-4" /></Button><Button variant={view === "calendar" ? "default" : "outline"} size="icon" onClick={() => setView("calendar")}><CalendarDays className="h-4 w-4" /></Button></div>}
      />
      {!recordingsOnly && (
        <Tabs value={tab} onValueChange={setTab} className="mb-6">
          <TabsList>{["upcoming", "today", "recordings", "missed"].map((value) => <TabsTrigger key={value} value={value} className="capitalize">{value}</TabsTrigger>)}</TabsList>
        </Tabs>
      )}
      {filtered.length ? (
        view === "list" ? <div className="grid gap-4 lg:grid-cols-2">{filtered.map((item) => <LiveClassCard key={item._id} item={item} />)}</div> : (
          <div className="rounded-2xl card-premium p-4">
            <div className="space-y-2">{filtered.map((item) => <div key={item._id} className="flex items-center justify-between rounded-xl bg-muted/25 p-3"><span className="font-medium">{item.title}</span><span className="text-xs text-muted-foreground">{formatDateTime(item.startAt)}</span></div>)}</div>
          </div>
        )
      ) : <EmptyPanel title="Nothing here yet" description="Live classes will appear when an instructor schedules them." />}
    </div>
  );
}

function LiveClassCard({ item }) {
  return (
    <div className="rounded-2xl card-premium p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <StatusBadge status={item.status || "upcoming"} />
          <h2 className="mt-3 text-lg font-semibold">{item.title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{item.course?.title || "Course"} • {formatDateTime(item.startAt)}</p>
        </div>
      </div>
      <p className="mt-4 line-clamp-2 text-sm text-muted-foreground">{item.description || "Live learning session"}</p>
      <div className="mt-5 flex flex-wrap gap-2">
        <Button asChild variant="outline"><Link to={`/dashboard/live-classes/${item._id}`}>Details</Link></Button>
        {item.recordingUrl && <Button asChild><a href={item.recordingUrl} target="_blank" rel="noreferrer"><Video className="mr-2 h-4 w-4" />Recording</a></Button>}
      </div>
    </div>
  );
}
