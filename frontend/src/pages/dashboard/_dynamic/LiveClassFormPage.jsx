import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { LmsPageHeader } from "@/features/shared/components/PageHeader";
import { apiRequest } from "@/services/api";
import { liveClassApi } from "@/services/liveClassApi";

const initial = {
  title: "",
  course: "",
  module: "",
  description: "",
  startAt: "",
  duration: 60,
  meetingPlatform: "google-meet",
  meetingLink: "",
  maxStudents: 0,
  accessType: "enrolled",
  enableRecording: true,
  enableChat: true,
  enableQA: true,
  enableAttendanceTracking: true,
  reminderSettings: { before24Hours: true, before1Hour: true, before10Minutes: true },
};

export default function LiveClassFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(initial);
  const [courses, setCourses] = useState([]);
  const [modules, setModules] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([apiRequest("/api/instructor/my-courses"), id ? liveClassApi.getInstructorLiveClass(id) : Promise.resolve(null)])
      .then(([courseResult, classResult]) => {
        const list = courseResult.data || [];
        setCourses(list);
        const item = classResult?.data?.liveClass;
        if (item) setForm({ ...initial, ...item, course: item.course?._id || item.course, module: item.module?._id || item.module || "", startAt: toLocalDateTime(item.startAt) });
        else if (list[0]) setForm((current) => ({ ...current, course: list[0]._id }));
      })
      .catch((error) => toast.error(error.message || "Unable to load live class form"));
  }, [id]);

  useEffect(() => {
    if (!form.course) {
      setModules([]);
      return;
    }
    apiRequest(`/api/instructor/courses/${form.course}/modules`).then(({ data }) => setModules(data || [])).catch(() => setModules([]));
  }, [form.course]);

  function update(name, value) { setForm((current) => ({ ...current, [name]: value })); }
  async function submit(event) {
    event.preventDefault();
    try {
      setSaving(true);
      const payload = { ...form, duration: Number(form.duration), maxStudents: Number(form.maxStudents), module: form.module === "general" ? undefined : form.module || undefined };
      if (id) await liveClassApi.updateLiveClass(id, payload);
      else await liveClassApi.createLiveClass(payload);
      toast.success(id ? "Live class updated." : "Live class sent for approval.");
      navigate("/instructor/dashboard/live-classes");
    } catch (error) {
      toast.error(error.message || "Unable to save live class");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <LmsPageHeader
        eyebrow="Live Class Studio"
        title={id ? "Edit live class" : "Schedule live class"}
        description="Set the session details, platform, access rules, reminders, and approval-ready options."
      />
      <form onSubmit={submit} className="rounded-2xl card-premium p-6">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Class title"><Input required value={form.title} onChange={(e) => update("title", e.target.value)} /></Field>
          <Choice label="Course" value={form.course} onChange={(value) => update("course", value)} items={courses.map((course) => [course._id, course.title])} />
          <Choice label="Module / Topic" value={form.module || "general"} onChange={(value) => update("module", value === "general" ? "" : value)} items={[["general", "General session"], ...modules.map((module) => [module._id, module.title])]} />
          <Field label="Date and start time"><Input required type="datetime-local" value={form.startAt || ""} onChange={(e) => update("startAt", e.target.value)} /></Field>
          <Field label="Duration (minutes)"><Input required type="number" value={form.duration} onChange={(e) => update("duration", e.target.value)} /></Field>
          <Choice label="Meeting platform" value={form.meetingPlatform} onChange={(value) => update("meetingPlatform", value)} items={["zoom", "google-meet", "built-in", "other"].map((value) => [value, value.replace("-", " ")])} />
          <Field label="Meeting link"><Input value={form.meetingLink || ""} onChange={(e) => update("meetingLink", e.target.value)} /></Field>
          <Field label="Maximum students (0 = unlimited)"><Input type="number" value={form.maxStudents} onChange={(e) => update("maxStudents", e.target.value)} /></Field>
          <Choice label="Access type" value={form.accessType} onChange={(value) => update("accessType", value)} items={["enrolled", "free-preview", "paid-only"].map((value) => [value, value.replace("-", " ")])} />
          <Field label="Description" className="md:col-span-2"><Textarea rows={4} value={form.description || ""} onChange={(e) => update("description", e.target.value)} /></Field>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[["enableRecording", "Recording"], ["enableChat", "Chat"], ["enableQA", "Q&A"], ["enableAttendanceTracking", "Attendance"]].map(([name, label]) => <Toggle key={name} label={label} checked={form[name]} onChange={(value) => update(name, value)} />)}
        </div>
        <div className="mt-5 rounded-xl bg-muted/30 p-4">
          <p className="text-sm font-semibold">Reminders</p>
          <div className="mt-3 flex flex-wrap gap-3">
            {[["before24Hours", "24 hours"], ["before1Hour", "1 hour"], ["before10Minutes", "10 minutes"]].map(([name, label]) => (
              <Toggle key={name} label={label} checked={form.reminderSettings[name]} onChange={(value) => setForm((current) => ({ ...current, reminderSettings: { ...current.reminderSettings, [name]: value } }))} compact />
            ))}
          </div>
        </div>
        <Button disabled={saving} className="mt-6">{saving ? "Saving..." : id ? "Save changes" : "Submit for approval"}</Button>
      </form>
    </div>
  );
}

function Field({ label, children, className = "" }) {
  return <div className={className}><Label className="mb-2 block">{label}</Label>{children}</div>;
}
function Choice({ label, value, onChange, items }) {
  return (
    <Field label={label}>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger><SelectValue /></SelectTrigger>
        <SelectContent>{items.map(([itemValue, itemLabel]) => <SelectItem key={itemValue} value={itemValue}>{itemLabel}</SelectItem>)}</SelectContent>
      </Select>
    </Field>
  );
}
function Toggle({ label, checked, onChange, compact = false }) {
  return (
    <label className={`flex items-center justify-between gap-3 rounded-xl border border-border/70 bg-muted/20 ${compact ? "px-3 py-2 text-xs" : "p-4 text-sm"}`}>
      <span className="font-medium">{label}</span>
      <Switch checked={Boolean(checked)} onCheckedChange={onChange} />
    </label>
  );
}
function toLocalDateTime(value) {
  if (!value) return "";
  const date = new Date(value);
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60000).toISOString().slice(0, 16);
}
