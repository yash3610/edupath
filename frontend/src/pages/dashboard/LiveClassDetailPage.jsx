import React, { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Download, ExternalLink, FileUp, Radio, Send, Video } from "lucide-react";
import { MotionCard } from "../../components/dashboard/DashboardPrimitives.jsx";
import { AttendanceTable, CountdownTimer, LiveClassStatusBadge, formatDate } from "../../components/dashboard/live/LiveClassComponents.jsx";
import { useToast } from "../../context/ToastContext.jsx";
import { liveClassApi } from "../../services/liveClassApi.js";

export default function LiveClassDetailPage({ role }) {
  const { id } = useParams();
  const toast = useToast();
  const [data, setData] = useState(null);
  const [question, setQuestion] = useState("");

  const load = useCallback(() => {
    const request = role === "admin" ? liveClassApi.getAdminLiveClass(id) : role === "instructor" ? liveClassApi.getInstructorLiveClass(id) : liveClassApi.getStudentLiveClass(id);
    return request.then(({ data: result }) => setData(result)).catch((error) => toast.error(error.message));
  }, [id, role, toast]);
  useEffect(() => { load(); }, [load]);

  if (!data?.liveClass) return <div className="h-96 animate-pulse rounded-[28px] bg-slate-200 dark:bg-white/10" />;
  const item = data.liveClass;

  async function act(action) {
    try {
      if (action === "start") await liveClassApi.startLiveClass(id);
      if (action === "complete") await liveClassApi.completeLiveClass(id);
      if (action === "cancel") await liveClassApi.cancelLiveClass(id, window.prompt("Cancellation reason") || "Cancelled by instructor");
      if (action === "approve") await liveClassApi.approveLiveClass(id);
      if (action === "reject") await liveClassApi.rejectLiveClass(id, window.prompt("Rejection reason") || "Changes required");
      toast.success("Live class updated.");
      await load();
    } catch (error) { toast.error(error.message); }
  }

  async function join() {
    try {
      const result = await liveClassApi.joinLiveClass(id);
      if (result.data?.meetingLink) window.open(result.data.meetingLink, "_blank", "noopener,noreferrer");
      toast.success("Attendance marked. Opening class...");
      await load();
    } catch (error) { toast.error(error.message); }
  }

  async function upload(kind, file) {
    const body = new FormData(); body.append("file", file);
    try {
      if (kind === "recording") await liveClassApi.uploadRecording(id, body); else await liveClassApi.uploadResources(id, body);
      toast.success(`${kind} uploaded.`);
      await load();
    } catch (error) { toast.error(error.message); }
  }

  async function exportCsv() {
    try {
      const blob = await liveClassApi.exportAttendance(id);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a"); link.href = url; link.download = `${item.slug}-attendance.csv`; link.click();
      URL.revokeObjectURL(url);
    } catch (error) { toast.error(error.message); }
  }

  async function ask(event) {
    event.preventDefault();
    try { await liveClassApi.askQuestion(id, question); setQuestion(""); toast.success("Question submitted."); await load(); } catch (error) { toast.error(error.message); }
  }

  return <div className="space-y-5">
    <section className="rounded-[28px] bg-[#1f1c35] p-7 text-white"><div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between"><div><LiveClassStatusBadge status={item.status} /><h2 className="mt-3 text-3xl font-extrabold">{item.title}</h2><p className="mt-2 text-sm text-white/65">{item.course?.title} · {item.instructor?.name}</p></div>{["scheduled", "starting-soon"].includes(item.status) && <CountdownTimer startAt={item.startAt} />}</div></section>
    <div className="grid gap-5 xl:grid-cols-[1fr_340px]"><MotionCard><h3 className="text-xl font-extrabold">Class information</h3><p className="mt-3 text-sm leading-6 text-slate-500">{item.description || "No description provided."}</p><div className="mt-5 grid gap-3 sm:grid-cols-2"><Info label="Date and time" value={formatDate(item.startAt)} /><Info label="Duration" value={`${item.duration} minutes`} /><Info label="Platform" value={item.meetingPlatform} /><Info label="Access" value={item.accessType} /><Info label="Joined students" value={item.totalJoined || 0} /><Info label="Average attendance" value={`${item.averageAttendance || 0}%`} /></div>{item.rejectionReason && <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm font-bold text-red-700">{item.rejectionReason}</p>}{item.cancellationReason && <p className="mt-4 rounded-xl bg-slate-100 p-3 text-sm font-bold">{item.cancellationReason}</p>}</MotionCard>
      <MotionCard><h3 className="font-extrabold">Actions</h3><div className="mt-4 grid gap-2">
        {role === "student" && ["scheduled", "starting-soon", "live"].includes(item.status) && <button onClick={join} className="primary"><ExternalLink className="h-4 w-4" /> Join live class</button>}
        {role === "student" && item.recordingUrl && <a href={item.recordingUrl} target="_blank" rel="noreferrer" className="primary bg-violet-600"><Video className="h-4 w-4" /> Watch recording</a>}
        {role === "admin" && item.recordingUrl && <a href={item.recordingUrl} target="_blank" rel="noreferrer" className="primary bg-violet-600"><Video className="h-4 w-4" /> View recording</a>}
        {role === "instructor" && ["pending-approval", "scheduled", "rejected"].includes(item.status) && <Link to={`/instructor/dashboard/live-classes/${id}/edit`} className="secondary">Edit schedule</Link>}
        {role === "instructor" && ["scheduled", "starting-soon"].includes(item.status) && <button onClick={() => act("start")} className="primary"><Radio className="h-4 w-4" /> Start class</button>}
        {role === "instructor" && item.status === "live" && <button onClick={() => act("complete")} className="primary">Complete class</button>}
        {role === "instructor" && !["completed", "recording-available", "cancelled"].includes(item.status) && <button onClick={() => act("cancel")} className="secondary text-rose-600">Cancel class</button>}
        {role === "instructor" && ["completed", "recording-available"].includes(item.status) && <UploadButton label="Upload recording" accept="video/*" onFile={(file) => upload("recording", file)} />}
        {role === "instructor" && <UploadButton label="Upload resource" onFile={(file) => upload("resource", file)} />}
        {role === "instructor" && <button onClick={exportCsv} className="secondary"><Download className="h-4 w-4" /> Export attendance CSV</button>}
        {role === "admin" && item.status === "pending-approval" && <><button onClick={() => act("approve")} className="primary">Approve class</button><button onClick={() => act("reject")} className="secondary text-rose-600">Reject class</button></>}
      </div></MotionCard></div>
    {(role === "admin" || role === "instructor") && <MotionCard><h3 className="mb-4 text-xl font-extrabold">Attendance report</h3><AttendanceTable rows={data.attendance?.rows || []} /></MotionCard>}
    {item.resources?.length > 0 && <MotionCard><h3 className="text-xl font-extrabold">Resources</h3><div className="mt-3 grid gap-2 sm:grid-cols-2">{item.resources.map((resource) => <a key={resource._id || resource.url} href={resource.url} target="_blank" rel="noreferrer" className="rounded-xl bg-slate-50 p-3 text-sm font-bold text-[#ff723a] dark:bg-white/5">{resource.title}</a>)}</div></MotionCard>}
    {role === "student" && item.enableQA && <MotionCard><h3 className="text-xl font-extrabold">Ask a question</h3><form onSubmit={ask} className="mt-3 flex gap-2"><input required value={question} onChange={(event) => setQuestion(event.target.value)} className="min-w-0 flex-1 rounded-xl border border-slate-200 px-4 py-3 dark:border-white/10 dark:bg-slate-900" placeholder="Type your doubt..." /><button className="primary"><Send className="h-4 w-4" /> Send</button></form></MotionCard>}
    <style>{`.primary,.secondary{display:flex;align-items:center;justify-content:center;gap:.5rem;border-radius:.75rem;padding:.75rem 1rem;font-size:.8rem;font-weight:800}.primary{background:#ff723a;color:white}.secondary{background:#f1f5f9}.dark .secondary{background:rgba(255,255,255,.08)}`}</style>
  </div>;
}

function Info({ label, value }) { return <div className="rounded-xl bg-slate-50 p-3 dark:bg-white/5"><p className="text-[10px] font-extrabold uppercase text-slate-400">{label}</p><p className="mt-1 text-sm font-bold capitalize">{value}</p></div>; }
function UploadButton({ label, accept, onFile }) { return <label className="secondary cursor-pointer"><FileUp className="h-4 w-4" /> {label}<input type="file" accept={accept} className="hidden" onChange={(event) => event.target.files?.[0] && onFile(event.target.files[0])} /></label>; }
