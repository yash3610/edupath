import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Download, ExternalLink, FileUp, Radio, Send, Video } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LmsPageHeader } from "@/features/shared/components/PageHeader";
import { DataTable } from "@/features/shared/components/DataTable";
import { StatusBadge } from "@/features/shared/components/StatusBadge";
import { liveClassApi } from "@/services/liveClassApi";
import { promptText } from "@/utils/sweetAlert";
import { EmptyPanel, PageLoader, formatDateTime } from "./LumaDynamicUtils";

export default function LiveClassDetailPage({ role }) {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [question, setQuestion] = useState("");

  const load = useCallback(() => {
    const request = role === "admin" ? liveClassApi.getAdminLiveClass(id) : role === "instructor" ? liveClassApi.getInstructorLiveClass(id) : liveClassApi.getStudentLiveClass(id);
    return request.then(({ data: result }) => setData(result)).catch((error) => toast.error(error.message || "Unable to load live class"));
  }, [id, role]);
  useEffect(() => { load(); }, [load]);

  if (!data?.liveClass) return <PageLoader label="Loading live class" />;
  const item = data.liveClass;

  async function act(action) {
    try {
      let reason = "";
      if (["cancel", "reject"].includes(action)) {
        const result = await promptText({
          title: action === "cancel" ? "Cancel live class?" : "Reject live class?",
          text: item.title,
          inputLabel: "Reason",
          defaultValue: action === "cancel" ? "Cancelled by instructor" : "Changes required",
          confirmButtonText: action === "cancel" ? "Cancel class" : "Reject class",
        });
        if (!result.confirmed) return;
        reason = result.value || (action === "cancel" ? "Cancelled by instructor" : "Changes required");
      }
      if (action === "start") await liveClassApi.startLiveClass(id);
      if (action === "complete") await liveClassApi.completeLiveClass(id);
      if (action === "cancel") await liveClassApi.cancelLiveClass(id, reason);
      if (action === "approve") await liveClassApi.approveLiveClass(id);
      if (action === "reject") await liveClassApi.rejectLiveClass(id, reason);
      toast.success("Live class updated.");
      await load();
    } catch (error) {
      toast.error(error.message || "Unable to update live class");
    }
  }

  async function join() {
    try {
      const result = await liveClassApi.joinLiveClass(id);
      if (result.data?.meetingLink) window.open(result.data.meetingLink, "_blank", "noopener,noreferrer");
      toast.success("Attendance marked. Opening class...");
      await load();
    } catch (error) { toast.error(error.message || "Unable to join live class"); }
  }

  async function upload(kind, file) {
    const body = new FormData();
    body.append("file", file);
    try {
      if (kind === "recording") await liveClassApi.uploadRecording(id, body);
      else await liveClassApi.uploadResources(id, body);
      toast.success(`${kind} uploaded.`);
      await load();
    } catch (error) { toast.error(error.message || "Upload failed"); }
  }

  async function exportCsv() {
    try {
      const blob = await liveClassApi.exportAttendance(id);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${item.slug || item._id}-attendance.csv`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) { toast.error(error.message || "Export failed"); }
  }

  async function ask(event) {
    event.preventDefault();
    try {
      await liveClassApi.askQuestion(id, question);
      setQuestion("");
      toast.success("Question submitted.");
      await load();
    } catch (error) { toast.error(error.message || "Unable to submit question"); }
  }

  return (
    <div>
      <LmsPageHeader
        eyebrow="Live Class"
        title={item.title}
        description={`${item.course?.title || "Course"} • ${item.instructor?.name || "Instructor"} • ${formatDateTime(item.startAt)}`}
        actions={<StatusBadge status={item.status || "scheduled"} />}
      />
      <div className="grid gap-5 xl:grid-cols-[1fr_340px]">
        <div className="rounded-2xl card-premium p-6">
          <h2 className="text-lg font-semibold">Class information</h2>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">{item.description || "No description provided."}</p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <Info label="Date and time" value={formatDateTime(item.startAt)} />
            <Info label="Duration" value={`${item.duration || 0} minutes`} />
            <Info label="Platform" value={item.meetingPlatform || "-"} />
            <Info label="Access" value={item.accessType || "-"} />
            <Info label="Joined students" value={item.totalJoined || 0} />
            <Info label="Average attendance" value={`${item.averageAttendance || 0}%`} />
          </div>
          {item.rejectionReason && <p className="mt-4 rounded-xl bg-destructive/10 p-3 text-sm font-medium text-destructive">{item.rejectionReason}</p>}
          {item.cancellationReason && <p className="mt-4 rounded-xl bg-muted p-3 text-sm font-medium">{item.cancellationReason}</p>}
        </div>
        <div className="rounded-2xl card-premium p-5">
          <h2 className="font-semibold">Actions</h2>
          <div className="mt-4 grid gap-2">
            {role === "student" && ["scheduled", "starting-soon", "live"].includes(item.status) && <Button onClick={join}><ExternalLink className="mr-2 h-4 w-4" />Join live class</Button>}
            {role === "student" && item.recordingUrl && <Button asChild><a href={item.recordingUrl} target="_blank" rel="noreferrer"><Video className="mr-2 h-4 w-4" />Watch recording</a></Button>}
            {role === "admin" && item.recordingUrl && <Button asChild><a href={item.recordingUrl} target="_blank" rel="noreferrer"><Video className="mr-2 h-4 w-4" />View recording</a></Button>}
            {role === "instructor" && ["pending-approval", "scheduled", "rejected"].includes(item.status) && <Button asChild variant="outline"><Link to={`/instructor/dashboard/live-classes/${id}/edit`}>Edit schedule</Link></Button>}
            {role === "instructor" && ["scheduled", "starting-soon"].includes(item.status) && <Button onClick={() => act("start")}><Radio className="mr-2 h-4 w-4" />Start class</Button>}
            {role === "instructor" && item.status === "live" && <Button onClick={() => act("complete")}>Complete class</Button>}
            {role === "instructor" && !["completed", "recording-available", "cancelled"].includes(item.status) && <Button variant="outline" className="text-destructive" onClick={() => act("cancel")}>Cancel class</Button>}
            {role === "instructor" && ["completed", "recording-available"].includes(item.status) && <UploadButton label="Upload recording" accept="video/*" onFile={(file) => upload("recording", file)} />}
            {role === "instructor" && <UploadButton label="Upload resource" onFile={(file) => upload("resource", file)} />}
            {role === "instructor" && <Button variant="outline" onClick={exportCsv}><Download className="mr-2 h-4 w-4" />Export attendance CSV</Button>}
            {role === "admin" && item.status === "pending-approval" && <><Button onClick={() => act("approve")}>Approve class</Button><Button variant="outline" className="text-destructive" onClick={() => act("reject")}>Reject class</Button></>}
          </div>
        </div>
      </div>
      {(role === "admin" || role === "instructor") && (
        <div className="mt-6">
          <DataTable
            rows={(data.attendance?.rows || []).map((row, index) => ({ ...row, id: row._id || index }))}
            emptyTitle="No attendance yet"
            columns={[
              { key: "student", header: "Student", render: (row) => row.student?.name || row.name || "Student" },
              { key: "joinedAt", header: "Joined", render: (row) => formatDateTime(row.joinedAt) },
              { key: "duration", header: "Duration", render: (row) => `${Math.round((row.durationSeconds || 0) / 60)}m` },
              { key: "status", header: "Status", render: (row) => <StatusBadge status={row.status || "active"} /> },
            ]}
          />
        </div>
      )}
      {item.resources?.length > 0 && <div className="mt-6 rounded-2xl card-premium p-6"><h2 className="text-lg font-semibold">Resources</h2><div className="mt-3 grid gap-2 sm:grid-cols-2">{item.resources.map((resource) => <a key={resource._id || resource.url} href={resource.url} target="_blank" rel="noreferrer" className="rounded-xl bg-muted/25 p-3 text-sm font-medium text-primary">{resource.title}</a>)}</div></div>}
      {role === "student" && item.enableQA && <div className="mt-6 rounded-2xl card-premium p-6"><h2 className="text-lg font-semibold">Ask a question</h2><form onSubmit={ask} className="mt-3 flex gap-2"><Input required value={question} onChange={(event) => setQuestion(event.target.value)} placeholder="Type your doubt..." /><Button><Send className="mr-2 h-4 w-4" />Send</Button></form></div>}
    </div>
  );
}

function Info({ label, value }) {
  return <div className="rounded-xl bg-muted/25 p-3"><p className="text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground">{label}</p><p className="mt-1 text-sm font-semibold capitalize">{value}</p></div>;
}
function UploadButton({ label, accept, onFile }) {
  return <label className="inline-flex cursor-pointer items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium"><FileUp className="mr-2 h-4 w-4" />{label}<input type="file" accept={accept} className="hidden" onChange={(event) => event.target.files?.[0] && onFile(event.target.files[0])} /></label>;
}
