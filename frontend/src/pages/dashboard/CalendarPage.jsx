import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Icon, MotionCard, SectionHeading } from "../../components/dashboard/DashboardPrimitives.jsx";
import { apiRequest } from "../../services/api.js";
import { useToast } from "../../context/ToastContext.jsx";

const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const eventTypes = ["study", "live-class", "quiz", "assignment", "workshop", "deadline", "personal"];
const emptyForm = { title: "", description: "", location: "", type: "study", startAt: "", endAt: "" };

export default function CalendarPage() {
  const toast = useToast();
  const [month, setMonth] = useState(() => startOfMonth(new Date()));
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const result = await apiRequest(`/api/calendar/events?month=${monthKey(month)}`);
      setEvents(result.data || []);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }, [month, toast]);

  useEffect(() => { load(); }, [load]);

  const cells = useMemo(() => calendarCells(month), [month]);
  const eventsByDay = useMemo(() => events.reduce((map, event) => {
    const key = localDateKey(new Date(event.startAt));
    if (!map[key]) map[key] = [];
    map[key].push(event);
    return map;
  }, {}), [events]);
  const upcoming = useMemo(() => events.filter((event) => new Date(event.endAt || event.startAt) >= new Date()).slice(0, 6), [events]);
  function openCreate(date = new Date()) {
    const start = new Date(date);
    start.setHours(10, 0, 0, 0);
    const end = new Date(start.getTime() + 60 * 60 * 1000);
    setEditing(null);
    setForm({ ...emptyForm, startAt: toLocalInput(start), endAt: toLocalInput(end) });
    setFormOpen(true);
  }

  function openEdit(event) {
    setEditing(event);
    setForm({
      title: event.title || "",
      description: event.description || "",
      location: event.location || "",
      type: event.type || "study",
      startAt: toLocalInput(new Date(event.startAt)),
      endAt: event.endAt ? toLocalInput(new Date(event.endAt)) : "",
    });
    setFormOpen(true);
  }

  async function save(event) {
    event.preventDefault();
    try {
      setSaving(true);
      await apiRequest(editing ? `/api/calendar/events/${editing._id}` : "/api/calendar/events", {
        method: editing ? "PATCH" : "POST",
        body: JSON.stringify({
          ...form,
          startAt: new Date(form.startAt).toISOString(),
          endAt: form.endAt ? new Date(form.endAt).toISOString() : undefined,
        }),
      });
      toast.success(editing ? "Event updated." : "Event added.");
      setFormOpen(false);
      await load();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!editing || !window.confirm(`Delete ${editing.title}?`)) return;
    try {
      await apiRequest(`/api/calendar/events/${editing._id}`, { method: "DELETE" });
      toast.success("Event deleted.");
      setFormOpen(false);
      await load();
    } catch (error) {
      toast.error(error.message);
    }
  }

  return (
    <div className="space-y-5">
      <SectionHeading
        eyebrow="Calendar"
        title="Learning schedule"
        action={<button onClick={() => openCreate()} className="inline-flex items-center gap-2 rounded-xl bg-[#ff723a] px-4 py-2.5 text-sm font-extrabold text-white"><Icon name="Plus" className="h-4 w-4" /> Add event</button>}
      />

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_280px]">
        <MotionCard>
          <div className="mb-5 flex items-center justify-between">
            <h3 className="text-xl font-black">{month.toLocaleDateString([], { month: "long", year: "numeric" })}</h3>
            <div className="flex gap-2">
              <button onClick={() => setMonth(addMonths(month, -1))} className="rounded-xl bg-slate-100 px-3 py-2 text-sm font-black dark:bg-white/10">Prev</button>
              <button onClick={() => setMonth(startOfMonth(new Date()))} className="rounded-xl bg-[#ff6b35] px-3 py-2 text-sm font-black text-white">Today</button>
              <button onClick={() => setMonth(addMonths(month, 1))} className="rounded-xl bg-slate-100 px-3 py-2 text-sm font-black dark:bg-white/10">Next</button>
            </div>
          </div>

          <div className="overflow-x-auto pb-2">
            <div className="min-w-[620px]">
              <div className="grid grid-cols-7 gap-2 text-center text-xs font-black text-slate-500">
                {weekDays.map((day) => <div key={day}>{day}</div>)}
              </div>
              {loading ? <div className="mt-3 h-[520px] animate-pulse rounded-2xl bg-slate-100 dark:bg-white/5" /> : (
                <div className="mt-3 grid grid-cols-7 gap-2">
              {cells.map(({ date, currentMonth }) => {
                const dayEvents = eventsByDay[localDateKey(date)] || [];
                const today = localDateKey(date) === localDateKey(new Date());
                return (
                  <button key={date.toISOString()} onClick={() => openCreate(date)} className={`min-h-20 overflow-hidden rounded-2xl border p-2 text-left text-sm font-black transition ${currentMonth ? "border-slate-200 bg-white hover:border-[#ff6b35] dark:border-white/10 dark:bg-slate-800" : "border-slate-100 bg-slate-50 text-slate-300 dark:border-white/5 dark:bg-white/[.02]"} ${today ? "border-[#ff6b35] bg-orange-50 text-[#ff6b35] dark:bg-white/10" : ""}`}>
                    <span>{date.getDate()}</span>
                    <span className="block">
                      {dayEvents.slice(0, 2).map((item) => <span key={item._id} onClick={(click) => { click.stopPropagation(); openEdit(item); }} className={`mt-2 block truncate rounded-lg px-2 py-1 text-[11px] ${typeStyle(item.type)}`}>{item.title}</span>)}
                      {dayEvents.length > 2 && <span className="mt-1 block text-[9px] text-slate-400">+{dayEvents.length - 2} more</span>}
                    </span>
                  </button>
                );
              })}
                </div>
              )}
            </div>
          </div>
        </MotionCard>

        <aside>
          <MotionCard>
            <SectionHeading eyebrow="Upcoming" title="This month" />
            <div className="space-y-3">
              {upcoming.map((event) => (
                <button key={event._id} onClick={() => openEdit(event)} className="w-full rounded-2xl bg-slate-100 p-4 text-left transition hover:bg-orange-50 dark:bg-white/10">
                  <span className="flex items-center gap-2 text-sm font-black text-[#ff6b35]"><Icon name={typeIcon(event.type)} className="h-4 w-4" />{label(event.type)}</span>
                  <span className="mt-2 block truncate font-black">{event.title}</span>
                  <span className="block text-sm text-slate-500 dark:text-slate-300">{formatEventDate(event.startAt)}</span>
                </button>
              ))}
              {!upcoming.length && <p className="py-6 text-center text-xs font-bold text-slate-400">No upcoming events this month.</p>}
            </div>
          </MotionCard>
        </aside>
      </div>

      {formOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/50 p-4">
          <form onSubmit={save} className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-[24px] bg-white p-5 shadow-2xl dark:bg-slate-900 sm:p-6">
            <div className="flex items-center justify-between"><div><p className="text-[10px] font-extrabold uppercase tracking-[.16em] text-[#ff723a]">Calendar event</p><h3 className="mt-1 text-xl font-extrabold">{editing ? "Edit event" : "Add event"}</h3></div><button type="button" onClick={() => setFormOpen(false)} className="rounded-xl bg-slate-100 p-2 dark:bg-white/10"><Icon name="X" /></button></div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <Field label="Title" required value={form.title} onChange={(value) => setFormValue(setForm, "title", value)} className="sm:col-span-2" />
              <Select label="Type" value={form.type} onChange={(value) => setFormValue(setForm, "type", value)}>{eventTypes.map((type) => <option key={type} value={type}>{label(type)}</option>)}</Select>
              <Field label="Location" value={form.location} onChange={(value) => setFormValue(setForm, "location", value)} />
              <Field label="Starts" required type="datetime-local" value={form.startAt} onChange={(value) => setFormValue(setForm, "startAt", value)} />
              <Field label="Ends" type="datetime-local" value={form.endAt} onChange={(value) => setFormValue(setForm, "endAt", value)} />
              <label className="text-sm font-extrabold sm:col-span-2">Description<textarea rows={3} value={form.description} onChange={(event) => setFormValue(setForm, "description", event.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-[#ff723a] dark:border-white/10 dark:bg-slate-800" /></label>
            </div>
            <div className="mt-5 flex items-center justify-between gap-3">
              {editing ? <button type="button" onClick={remove} className="rounded-xl bg-rose-50 px-4 py-2.5 text-sm font-extrabold text-rose-700">Delete</button> : <span />}
              <button disabled={saving} className="rounded-xl bg-[#ff723a] px-5 py-2.5 text-sm font-extrabold text-white disabled:opacity-50">{saving ? "Saving..." : "Save event"}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

function Field({ label: title, value, onChange, type = "text", required = false, className = "" }) {
  return <label className={`text-sm font-extrabold ${className}`}>{title}<input required={required} type={type} value={value} onChange={(event) => onChange(event.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-[#ff723a] dark:border-white/10 dark:bg-slate-800" /></label>;
}

function Select({ label: title, value, onChange, children }) {
  return <label className="text-sm font-extrabold">{title}<select value={value} onChange={(event) => onChange(event.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 dark:border-white/10 dark:bg-slate-800">{children}</select></label>;
}

function setFormValue(setter, key, value) { setter((current) => ({ ...current, [key]: value })); }
function startOfMonth(date) { return new Date(date.getFullYear(), date.getMonth(), 1); }
function addMonths(date, amount) { return new Date(date.getFullYear(), date.getMonth() + amount, 1); }
function monthKey(date) { return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`; }
function localDateKey(date) { return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`; }
function toLocalInput(date) { const shifted = new Date(date.getTime() - date.getTimezoneOffset() * 60000); return shifted.toISOString().slice(0, 16); }
function label(value) { return value.split("-").map((part) => part[0].toUpperCase() + part.slice(1)).join(" "); }
function formatEventDate(value) { return new Date(value).toLocaleString([], { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }); }
function calendarCells(month) {
  const first = startOfMonth(month);
  const mondayOffset = (first.getDay() + 6) % 7;
  const start = new Date(first);
  start.setDate(first.getDate() - mondayOffset);
  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    return { date, currentMonth: date.getMonth() === month.getMonth() };
  });
}
function typeIcon(type) { return ({ "live-class": "Video", quiz: "BadgeHelp", assignment: "FileCheck2", workshop: "Users", deadline: "Clock3", personal: "UserRound" })[type] || "BookOpen"; }
function typeStyle(type) {
  return ({ "live-class": "bg-violet-50 text-violet-700", quiz: "bg-cyan-50 text-cyan-700", assignment: "bg-amber-50 text-amber-700", workshop: "bg-emerald-50 text-emerald-700", deadline: "bg-rose-50 text-rose-700", personal: "bg-slate-100 text-slate-700" })[type] || "bg-orange-50 text-[#ff723a]";
}
