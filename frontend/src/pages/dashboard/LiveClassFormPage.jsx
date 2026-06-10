import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { MotionCard } from "../../components/dashboard/DashboardPrimitives.jsx";
import { useToast } from "../../context/ToastContext.jsx";
import { apiRequest } from "../../services/api.js";
import { liveClassApi } from "../../services/liveClassApi.js";

const initial = { title: "", course: "", module: "", description: "", startAt: "", duration: 60, meetingPlatform: "google-meet", meetingLink: "", maxStudents: 0, accessType: "enrolled", enableRecording: true, enableChat: true, enableQA: true, enableAttendanceTracking: true, reminderSettings: { before24Hours: true, before1Hour: true, before10Minutes: true } };

export default function LiveClassFormPage() {
  const { id } = useParams();
  const toast = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState(initial);
  const [courses, setCourses] = useState([]);
  const [modules, setModules] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([apiRequest("/api/instructor/my-courses"), id ? liveClassApi.getInstructorLiveClass(id) : Promise.resolve(null)]).then(([courseResult, classResult]) => {
      const list = courseResult.data || [];
      setCourses(list);
      const item = classResult?.data?.liveClass;
      if (item) setForm({ ...initial, ...item, course: item.course?._id || item.course, module: item.module?._id || item.module || "", startAt: toLocalDateTime(item.startAt) });
      else if (list[0]) setForm((current) => ({ ...current, course: list[0]._id }));
    }).catch((error) => toast.error(error.message));
  }, [id, toast]);

  useEffect(() => {
    if (!form.course) return setModules([]);
    apiRequest(`/api/instructor/courses/${form.course}/modules`).then(({ data }) => setModules(data || [])).catch(() => setModules([]));
  }, [form.course]);

  function update(name, value) { setForm((current) => ({ ...current, [name]: value })); }
  async function submit(event) {
    event.preventDefault();
    try {
      setSaving(true);
      const payload = { ...form, duration: Number(form.duration), maxStudents: Number(form.maxStudents), module: form.module || undefined };
      if (id) await liveClassApi.updateLiveClass(id, payload); else await liveClassApi.createLiveClass(payload);
      toast.success(id ? "Live class updated." : "Live class sent for approval.");
      navigate("/instructor/dashboard/live-classes");
    } catch (error) { toast.error(error.message); } finally { setSaving(false); }
  }

  return <div className="space-y-5"><section className="rounded-[28px] bg-[#1f1c35] p-7 text-white"><p className="text-xs font-extrabold uppercase tracking-[.18em] text-[#fec961]">Live Class Studio</p><h2 className="mt-2 text-3xl font-extrabold">{id ? "Edit live class" : "Schedule live class"}</h2></section><MotionCard><form onSubmit={submit} className="grid gap-4 md:grid-cols-2">
    <Field label="Class title" value={form.title} onChange={(value) => update("title", value)} required />
    <Select label="Course" value={form.course} onChange={(value) => update("course", value)}>{courses.map((course) => <option key={course._id} value={course._id}>{course.title}</option>)}</Select>
    <Select label="Module / Topic" value={form.module} onChange={(value) => update("module", value)}><option value="">General session</option>{modules.map((module) => <option key={module._id} value={module._id}>{module.title}</option>)}</Select>
    <Field label="Date and start time" type="datetime-local" value={form.startAt} onChange={(value) => update("startAt", value)} required />
    <Field label="Duration (minutes)" type="number" value={form.duration} onChange={(value) => update("duration", value)} required />
    <Select label="Meeting platform" value={form.meetingPlatform} onChange={(value) => update("meetingPlatform", value)}>{["zoom", "google-meet", "built-in", "other"].map(option)}</Select>
    <Field label="Meeting link" value={form.meetingLink} onChange={(value) => update("meetingLink", value)} />
    <Field label="Maximum students (0 = unlimited)" type="number" value={form.maxStudents} onChange={(value) => update("maxStudents", value)} />
    <Select label="Access type" value={form.accessType} onChange={(value) => update("accessType", value)}>{["enrolled", "free-preview", "paid-only"].map(option)}</Select>
    <Area label="Description" value={form.description} onChange={(value) => update("description", value)} />
    <div className="grid gap-2 md:col-span-2 sm:grid-cols-2 lg:grid-cols-4">{[["enableRecording", "Enable recording"], ["enableChat", "Enable chat"], ["enableQA", "Enable Q&A"], ["enableAttendanceTracking", "Track attendance"]].map(([name, label]) => <Toggle key={name} label={label} checked={form[name]} onChange={(value) => update(name, value)} />)}</div>
    <div className="rounded-2xl bg-[#fff8ef] p-4 md:col-span-2 dark:bg-white/5"><p className="text-sm font-extrabold">Reminders</p><div className="mt-3 flex flex-wrap gap-3">{[["before24Hours", "24 hours"], ["before1Hour", "1 hour"], ["before10Minutes", "10 minutes"]].map(([name, label]) => <Toggle key={name} label={label} checked={form.reminderSettings[name]} onChange={(value) => setForm((current) => ({ ...current, reminderSettings: { ...current.reminderSettings, [name]: value } }))} />)}</div></div>
    <button disabled={saving} className="rounded-xl bg-[#ff723a] px-6 py-3 text-sm font-extrabold text-white md:col-span-2">{saving ? "Saving..." : id ? "Save changes" : "Submit for approval"}</button>
  </form></MotionCard></div>;
}

const inputClass = "mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-[#ff723a] dark:border-white/10 dark:bg-slate-900";
function Field({ label, value, onChange, type = "text", required }) { return <label className="text-sm font-extrabold">{label}<input required={required} type={type} value={value || ""} onChange={(event) => onChange(event.target.value)} className={inputClass} /></label>; }
function Area({ label, value, onChange }) { return <label className="text-sm font-extrabold md:col-span-2">{label}<textarea rows={4} value={value || ""} onChange={(event) => onChange(event.target.value)} className={inputClass} /></label>; }
function Select({ label, value, onChange, children }) { return <label className="text-sm font-extrabold">{label}<select value={value} onChange={(event) => onChange(event.target.value)} className={inputClass}>{children}</select></label>; }
function Toggle({ label, checked, onChange }) { return <label className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold dark:border-white/10"><input type="checkbox" checked={Boolean(checked)} onChange={(event) => onChange(event.target.checked)} /> {label}</label>; }
function option(value) { return <option key={value} value={value}>{value.replace("-", " ")}</option>; }
function toLocalDateTime(value) { const date = new Date(value); const offset = date.getTimezoneOffset(); return new Date(date.getTime() - offset * 60000).toISOString().slice(0, 16); }
