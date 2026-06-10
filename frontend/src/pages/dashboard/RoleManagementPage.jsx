import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { Icon, MotionCard, SectionHeading, SkeletonCard } from "../../components/dashboard/DashboardPrimitives.jsx";
import { rolePageConfig } from "../../data/roleDashboardData.js";
import { useToast } from "../../context/ToastContext.jsx";
import { apiRequest } from "../../services/api.js";

const liveConfig = {
  students: { endpoint: "/api/admin/students", columns: ["Name", "Email", "Role", "Status"], fields: ["name", "email", "role", "status"], status: true, remove: (item) => `/api/admin/users/${item._id}` },
  instructors: { endpoint: "/api/admin/instructors", columns: ["Name", "Email", "Role", "Status"], fields: ["name", "email", "role", "status"], status: true, remove: (item) => `/api/admin/users/${item._id}` },
  courses: { endpoint: "/api/admin/courses", columns: ["Course", "Category", "Level", "Status"], fields: ["title", "category", "level", "status"], remove: (item) => `/api/admin/courses/${item._id}` },
  approvals: { endpoint: "/api/admin/pending-approvals", columns: ["Course", "Instructor", "Created", "Status"], fields: ["title", "instructor.name", "createdAt", "status"], approval: true },
  categories: { endpoint: "/api/admin/categories", columns: ["Category", "Slug", "Description", "Status"], fields: ["name", "slug", "description", "active"], create: "/api/admin/categories", edit: (item) => `/api/admin/categories/${item._id}`, form: [["name", "Category name"], ["slug", "Slug"], ["description", "Description"]], remove: (item) => `/api/admin/categories/${item._id}` },
  orders: { endpoint: "/api/admin/orders", columns: ["Order", "Amount", "Status", "Created"], fields: ["invoiceNumber", "amount", "status", "createdAt"] },
  payments: { endpoint: "/api/admin/payments", columns: ["Payment", "Method", "Amount", "Status"], fields: ["razorpayPaymentId", "method", "amount", "status"] },
  refunds: { endpoint: "/api/admin/refunds", columns: ["Student", "Reason", "Status", "Created"], fields: ["user.name", "reason", "status", "createdAt"], refund: true },
  coupons: { endpoint: "/api/admin/coupons", columns: ["Code", "Type", "Value", "Status"], fields: ["code", "discountType", "value", "active"], create: "/api/admin/coupons", edit: (item) => `/api/admin/coupons/${item._id}`, form: [["code", "Coupon code"], ["discountType", "Discount type", "select", ["percent", "flat"]], ["value", "Value", "number"], ["expiresAt", "Expires at", "date"]], remove: (item) => `/api/admin/coupons/${item._id}` },
  assignments: { endpoint: ({ role }) => role === "admin" ? "/api/admin/assignments" : "/api/instructor/assignments", columns: ["Assignment", "Course", "Due date", "Marks"], fields: ["title", "course.title", "dueDate", "maxMarks"], create: ({ role, form }) => role === "instructor" ? `/api/instructor/courses/${form.courseId}/assignments` : null, form: [["courseId", "Course ID"], ["title", "Assignment title"], ["description", "Description"], ["dueDate", "Due date", "date"], ["maxMarks", "Maximum marks", "number"]], remove: (item, role) => role === "admin" ? `/api/admin/assignments/${item._id}` : `/api/instructor/assignments/${item._id}` },
  certificates: { endpoint: "/api/admin/certificates", columns: ["Certificate", "Student", "Course", "Issued"], fields: ["certificateCode", "student.name", "course.title", "issuedAt"], remove: (item) => `/api/admin/certificates/${item._id}` },
  reviews: { endpoint: ({ role }) => role === "admin" ? "/api/admin/reviews" : "/api/instructor/reviews", columns: ["Student", "Course", "Rating", "Comment"], fields: ["user.name", "course.title", "rating", "comment"], remove: (item, role) => role === "admin" ? `/api/admin/reviews/${item._id}` : null },
  moderation: { endpoint: "/api/admin/community", columns: ["Discussion", "Author", "Course", "Created"], fields: ["title", "user.name", "course.title", "createdAt"], remove: (item) => `/api/admin/community/${item._id}` },
  reports: { endpoint: "/api/admin/reports", objectRows: true },
  settings: { endpoint: "/api/settings", settings: true, create: "/api/settings", method: "PATCH", form: [["emailNotifications", "Email notifications"], ["communityMentions", "Community mentions"], ["theme", "Theme", "select", ["system", "light", "dark"]]] },
  builder: { endpoint: "/api/instructor/my-courses", columns: ["Course", "ID", "Status", "Updated"], fields: ["title", "_id", "status", "updatedAt"], moduleBuilder: true },
  studentsProgress: { endpoint: "/api/instructor/students-progress", columns: ["Student", "Course", "Progress", "Status"], fields: ["student.name", "course.title", "progress", "status"] },
  liveClasses: { endpoint: "/api/instructor/live-classes", columns: ["Class", "Course", "Starts", "Status"], fields: ["title", "course.title", "startAt", "status"], create: "/api/instructor/live-classes", edit: (item) => `/api/instructor/live-classes/${item._id}`, form: [["title", "Class title"], ["course", "Course ID"], ["meetingUrl", "Meeting URL"], ["startAt", "Start time", "datetime-local"], ["endAt", "End time", "datetime-local"], ["status", "Status", "select", ["scheduled", "live", "completed", "cancelled"]]], remove: (item) => `/api/instructor/live-classes/${item._id}` },
  doubts: { endpoint: "/api/instructor/doubts", columns: ["Question", "Student", "Course", "Created"], fields: ["title", "user.name", "course.title", "createdAt"], reply: true },
  earnings: { endpoint: "/api/instructor/earnings", columns: ["Course", "Sales", "Gross", "Your share"], custom: (item) => [item.course?.title, item.sales, money(item.gross), money(item.gross * 0.8)] },
  payouts: { endpoint: "/api/instructor/payouts", columns: ["Reference", "Period", "Amount", "Status"], fields: ["reference", "period", "amount", "status"] },
  analytics: { endpoint: "/api/instructor/student-engagement", columns: ["Course ID", "Watch time", "Completed lectures"], fields: ["_id", "watchTimeSeconds", "completedLectures"] },
  messages: { endpoint: "/api/messages/conversations", columns: ["Conversation", "Last message", "Updated"], custom: (item) => [item._id, item.lastMessage, formatValue(item.updatedAt)] },
  profile: { endpoint: "/api/profile/me", profile: true, create: "/api/profile/me", form: [["headline", "Headline"], ["bio", "Bio"], ["expertise", "Expertise (comma separated)"]] },
};

export default function RoleManagementPage({ type }) {
  const { role } = useOutletContext();
  const toast = useToast();
  const page = rolePageConfig[type] || rolePageConfig.settings;
  const config = liveConfig[type] || liveConfig.settings;
  const [title, description, icon] = page;
  const [records, setRecords] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);

  const endpoint = typeof config.endpoint === "function" ? config.endpoint({ role }) : config.endpoint;

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const result = await apiRequest(endpoint);
      let data = result.data || [];
      if (config.profile) data = data.profile ? [data.profile] : [];
      if (config.settings) data = Object.entries(data).map(([key, value]) => ({ _id: key, preference: key, value }));
      if (config.objectRows && !Array.isArray(data)) data = Object.entries(data).map(([key, value]) => ({ _id: key, metric: key, value }));
      setRecords(Array.isArray(data) ? data : []);
    } catch (requestError) {
      setError(requestError.message);
      setRecords([]);
    } finally {
      setLoading(false);
    }
  }, [config.objectRows, config.profile, config.settings, endpoint]);

  useEffect(() => { load(); }, [load]);

  const rows = useMemo(() => records.map((item) => ({ item, values: rowValues(item, config) })), [config, records]);
  const filtered = useMemo(() => rows.filter(({ values }) => values.join(" ").toLowerCase().includes(search.toLowerCase())), [rows, search]);
  const headers = config.columns || (config.settings ? ["Preference", "Value"] : config.objectRows ? ["Metric", "Value"] : ["Record"]);
  const canCreate = Boolean((config.create && !(typeof config.create === "function" && role === "admin")) || config.moduleBuilder);

  async function createRecord(event) {
    event.preventDefault();
    try {
      setSaving(true);
      const payload = normalizePayload(form);
      let createEndpoint = typeof config.create === "function" ? config.create({ role, form }) : config.create;
      if (config.moduleBuilder) {
        if (!form.courseId) throw new Error("Course ID is required");
        createEndpoint = `/api/instructor/courses/${form.courseId}/modules`;
      }
      const editEndpoint = form._id && config.edit ? config.edit(form) : null;
      await apiRequest(editEndpoint || createEndpoint, { method: editEndpoint ? "PATCH" : (config.method || (config.profile ? "PATCH" : "POST")), body: JSON.stringify(payload) });
      toast.success(`${title} saved successfully.`);
      setForm({});
      setFormOpen(false);
      await load();
    } catch (requestError) {
      toast.error(requestError.message);
    } finally {
      setSaving(false);
    }
  }

  async function removeRecord(item) {
    const removeEndpoint = config.remove?.(item, role);
    if (!removeEndpoint) return;
    try {
      await apiRequest(removeEndpoint, { method: "DELETE" });
      toast.success("Record removed.");
      await load();
    } catch (requestError) {
      toast.error(requestError.message);
    }
  }

  function editRecord(item) {
    const next = {};
    (config.form || []).forEach(([name]) => {
      const value = get(item, name);
      next[name] = Array.isArray(value) ? value.join(", ") : (value ?? "");
    });
    setForm({ ...next, _id: item._id });
    setFormOpen(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function updateStatus(item, status) {
    try {
      let updateEndpoint;
      let payload = { status };
      if (config.approval) updateEndpoint = `/api/admin/courses/${item._id}/${status}`;
      else if (config.refund) updateEndpoint = `/api/admin/refunds/${item._id}`;
      else updateEndpoint = `/api/admin/users/${item._id}/status`;
      await apiRequest(updateEndpoint, { method: "PATCH", body: JSON.stringify(payload) });
      toast.success("Status updated.");
      await load();
    } catch (requestError) {
      toast.error(requestError.message);
    }
  }

  async function replyToQuestion(item) {
    const body = window.prompt("Write your answer");
    if (!body) return;
    try {
      await apiRequest(`/api/community/questions/${item._id}/answers`, { method: "POST", body: JSON.stringify({ body }) });
      toast.success("Answer posted.");
    } catch (requestError) {
      toast.error(requestError.message);
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[26px] border border-[#f1e7db] bg-[#fff8ef] p-6 dark:border-white/10 dark:bg-[#1f1c35] sm:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#fec961] text-[#1f1c35]"><Icon name={icon} className="h-6 w-6" /></span>
            <div><p className="text-[11px] font-extrabold uppercase tracking-[.18em] text-[#ff723a]">Live workspace</p><h2 className="mt-1 text-2xl font-extrabold tracking-[-.03em] text-[#1f1c35] dark:text-white sm:text-3xl">{title}</h2><p className="mt-2 text-sm text-slate-500 dark:text-slate-300">{description}</p></div>
          </div>
          {canCreate && <button onClick={() => setFormOpen((value) => !value)} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#ff723a] px-5 py-3 text-sm font-extrabold text-white"><Icon name={formOpen ? "X" : "Plus"} className="h-4 w-4" /> {formOpen ? "Close" : "Add new"}</button>}
        </div>
      </section>

      {formOpen && <CreateForm config={config} form={form} setForm={setForm} onSubmit={createRecord} saving={saving} />}

      <MotionCard className="p-4">
        <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 dark:border-white/10 dark:bg-white/5">
          <Icon name="Search" className="h-4 w-4 text-slate-400" />
          <input value={search} onChange={(event) => setSearch(event.target.value)} className="dashboard-search-input min-w-0 flex-1 text-sm font-semibold" placeholder={`Search ${title.toLowerCase()}...`} />
          <button onClick={load} aria-label="Refresh"><Icon name="RefreshCcw" className="h-4 w-4 text-slate-400" /></button>
        </div>
      </MotionCard>

      {loading ? <div className="grid gap-4 md:grid-cols-2"><SkeletonCard /><SkeletonCard /></div> : error ? (
        <MotionCard className="text-center"><p className="font-extrabold text-rose-600">{error}</p><button onClick={load} className="mt-4 rounded-xl bg-[#1f1c35] px-4 py-2 text-sm font-extrabold text-white">Try again</button></MotionCard>
      ) : (
        <MotionCard className="overflow-hidden p-0">
          <div className="p-5 pb-2 sm:p-6 sm:pb-2"><SectionHeading eyebrow="Database" title={`${filtered.length} live records`} /></div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-400 dark:bg-white/5"><tr>{headers.map((head) => <th key={head} className="px-5 py-3 font-extrabold">{head}</th>)}<th className="px-5 py-3 text-right font-extrabold">Actions</th></tr></thead>
              <tbody>{filtered.map(({ item, values }) => (
                <tr key={item._id || values.join("-")} className="border-t border-slate-100 hover:bg-[#fffaf6] dark:border-white/10 dark:hover:bg-white/5">
                  {values.map((cell, index) => <td key={`${index}-${cell}`} className={`max-w-xs truncate px-5 py-4 ${index === 0 ? "font-extrabold text-[#1f1c35] dark:text-white" : "font-semibold text-slate-500"}`}>{cell}</td>)}
                  <td className="px-5 py-4"><div className="flex justify-end gap-2">
                    {config.status && <><button onClick={() => updateStatus(item, "active")} className="rounded-lg bg-emerald-50 px-2.5 py-1.5 text-xs font-extrabold text-emerald-700">Activate</button><button onClick={() => updateStatus(item, "blocked")} className="rounded-lg bg-amber-50 px-2.5 py-1.5 text-xs font-extrabold text-amber-700">Block</button></>}
                    {config.approval && <><button onClick={() => updateStatus(item, "approve")} className="rounded-lg bg-emerald-50 px-2.5 py-1.5 text-xs font-extrabold text-emerald-700">Approve</button><button onClick={() => updateStatus(item, "reject")} className="rounded-lg bg-rose-50 px-2.5 py-1.5 text-xs font-extrabold text-rose-700">Reject</button></>}
                    {config.refund && <><button onClick={() => updateStatus(item, "approved")} className="rounded-lg bg-emerald-50 px-2.5 py-1.5 text-xs font-extrabold text-emerald-700">Approve</button><button onClick={() => updateStatus(item, "rejected")} className="rounded-lg bg-rose-50 px-2.5 py-1.5 text-xs font-extrabold text-rose-700">Reject</button></>}
                    {config.reply && <button onClick={() => replyToQuestion(item)} className="rounded-lg bg-[#fff1e8] px-2.5 py-1.5 text-xs font-extrabold text-[#ff723a]">Answer</button>}
                    {config.edit && <button onClick={() => editRecord(item)} className="rounded-lg bg-amber-50 px-2.5 py-1.5 text-xs font-extrabold text-amber-700">Edit</button>}
                    {config.remove?.(item, role) && <button onClick={() => removeRecord(item)} className="rounded-lg bg-rose-50 px-2.5 py-1.5 text-xs font-extrabold text-rose-700">Delete</button>}
                  </div></td>
                </tr>
              ))}</tbody>
            </table>
            {!filtered.length && <div className="p-12 text-center text-sm font-bold text-slate-400">No records found in the database.</div>}
          </div>
        </MotionCard>
      )}
    </div>
  );
}

function CreateForm({ config, form, setForm, onSubmit, saving }) {
  const fields = config.moduleBuilder ? [["courseId", "Course ID"], ["title", "Module title"], ["order", "Order", "number"]] : config.form || [];
  return <MotionCard><form onSubmit={onSubmit}><div className="grid gap-4 md:grid-cols-2">{fields.map(([name, label, type = "text", options]) => <label key={name} className="text-sm font-extrabold">{label}{type === "select" ? <select value={form[name] || ""} onChange={(event) => setForm((current) => ({ ...current, [name]: event.target.value }))} className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 dark:border-white/10 dark:bg-slate-900"><option value="">Select</option>{options.map((option) => <option key={option}>{option}</option>)}</select> : <input required={["name", "slug", "code", "title", "courseId"].includes(name)} type={type} value={form[name] || ""} onChange={(event) => setForm((current) => ({ ...current, [name]: event.target.value }))} className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-[#ff723a] dark:border-white/10 dark:bg-slate-900" />}</label>)}</div><button disabled={saving} className="mt-5 rounded-xl bg-[#1f1c35] px-5 py-3 text-sm font-extrabold text-white disabled:opacity-50">{saving ? "Saving..." : "Save to database"}</button></form></MotionCard>;
}

function rowValues(item, config) {
  if (config.custom) return config.custom(item).map(formatValue);
  if (config.settings) return [item.preference, formatValue(item.value)];
  if (config.objectRows) return [humanize(item.metric), formatValue(item.value)];
  return (config.fields || ["_id"]).map((field) => formatValue(get(item, field)));
}

function get(object, path) {
  return path.split(".").reduce((value, key) => value?.[key], object);
}

function formatValue(value) {
  if (value === undefined || value === null || value === "") return "-";
  if (typeof value === "boolean") return value ? "Active" : "Inactive";
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "object") return value.name || value.title || JSON.stringify(value);
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}T/.test(value)) return new Date(value).toLocaleDateString();
  return String(value);
}

function normalizePayload(form) {
  const payload = { ...form };
  ["price", "value", "order", "maxMarks"].forEach((key) => { if (payload[key] !== undefined && payload[key] !== "") payload[key] = Number(payload[key]); });
  if (typeof payload.expertise === "string") payload.expertise = payload.expertise.split(",").map((item) => item.trim()).filter(Boolean);
  delete payload.courseId;
  delete payload._id;
  return payload;
}

function money(value) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(Number(value || 0));
}

function humanize(value) {
  return value.replace(/([A-Z])/g, " $1").replace(/^./, (letter) => letter.toUpperCase());
}
