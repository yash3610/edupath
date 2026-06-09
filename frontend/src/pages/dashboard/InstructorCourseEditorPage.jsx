import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CheckCircle2, ChevronLeft, ChevronRight, Save, Send } from "lucide-react";
import { MotionCard } from "../../components/dashboard/DashboardPrimitives.jsx";
import { apiFormRequest, apiRequest } from "../../services/api.js";
import { useToast } from "../../context/ToastContext.jsx";

const steps = ["Basic", "Outcomes", "Pricing", "Rules", "Landing"];
const initial = {
  title: "", subtitle: "", slug: "", shortDescription: "", description: "", category: "", subcategory: "",
  language: "English", level: "beginner", thumbnail: "", promoVideoUrl: "", tags: "",
  learningOutcomes: "", objectives: "", skills: "", requirements: "", prerequisites: "", targetAudience: "",
  pricingType: "paid", price: 0, discountPrice: 0, currency: "USD", couponEnabled: true, subscriptionAccess: false,
  sequentialLearning: false, certificateEnabled: true, requireFullProgress: true, requireQuizzes: false,
  requireAssignments: false, heroBanner: "", instructorBio: "",
};

export default function InstructorCourseEditorPage() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(Boolean(courseId));

  useEffect(() => {
    if (!courseId) return;
    apiRequest(`/api/instructor/courses/${courseId}`).then(({ data }) => {
      setForm({
        ...initial,
        ...data,
        tags: join(data.tags),
        learningOutcomes: join(data.learningOutcomes),
        objectives: join(data.objectives),
        skills: join(data.skills),
        requirements: join(data.requirements),
        prerequisites: join(data.prerequisites),
        targetAudience: join(data.targetAudience),
        requireFullProgress: data.certificateRules?.requireFullProgress ?? true,
        requireQuizzes: data.certificateRules?.requireQuizzes ?? false,
        requireAssignments: data.certificateRules?.requireAssignments ?? false,
        heroBanner: data.landingPage?.heroBanner || "",
        instructorBio: data.landingPage?.instructorBio || "",
      });
    }).catch((error) => toast.error(error.message)).finally(() => setLoading(false));
  }, [courseId, toast]);

  const completion = useMemo(() => {
    const required = [form.title, form.slug, form.description, form.category, form.learningOutcomes];
    return Math.round((required.filter(Boolean).length / required.length) * 100);
  }, [form]);

  function update(name, value) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  function slugFromTitle(value) {
    update("title", value);
    if (!courseId) update("slug", value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""));
  }

  async function save(submit = false) {
    if (!form.title || !form.slug) return toast.error("Course title and slug are required.");
    try {
      setSaving(true);
      const payload = {
        ...form,
        price: Number(form.price || 0),
        discountPrice: Number(form.discountPrice || 0),
        certificateRules: {
          requireFullProgress: form.requireFullProgress,
          requireQuizzes: form.requireQuizzes,
          requireAssignments: form.requireAssignments,
        },
        landingPage: { heroBanner: form.heroBanner, instructorBio: form.instructorBio },
      };
      const result = await apiRequest(courseId ? `/api/instructor/courses/${courseId}` : "/api/instructor/courses", {
        method: courseId ? "PATCH" : "POST",
        body: JSON.stringify(payload),
      });
      const id = courseId || result.data?._id;
      if (submit) await apiRequest(`/api/instructor/courses/${id}/submit`, { method: "PATCH" });
      toast.success(submit ? "Course submitted for admin review." : "Course draft saved.");
      navigate(submit ? "/instructor/dashboard/my-courses" : `/instructor/dashboard/courses/${id}/edit`, { replace: true });
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  }

  async function uploadAsset(file, field) {
    if (!courseId) return toast.info("Save the course draft before uploading assets.");
    try {
      setSaving(true);
      const body = new FormData();
      body.append("file", file);
      const result = await apiFormRequest(`/api/instructor/courses/${courseId}/assets`, body);
      update(field, result.data?.url || "");
      toast.success("Asset uploaded. Save the course to keep this URL.");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="h-96 animate-pulse rounded-[28px] bg-slate-200 dark:bg-white/10" />;

  return (
    <div className="space-y-5">
      <section className="overflow-hidden rounded-[28px] bg-[#1f1c35] p-6 text-white sm:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div><p className="text-xs font-extrabold uppercase tracking-[.18em] text-[#fec961]">Course Studio</p><h2 className="mt-2 text-3xl font-extrabold">{courseId ? "Edit course" : "Create a new course"}</h2><p className="mt-2 max-w-2xl text-sm text-white/65">Build the course details once and keep the instructor, admin review, catalog, and student experience synchronized.</p></div>
          <div className="min-w-56"><div className="mb-2 flex justify-between text-xs font-bold"><span>Course readiness</span><span>{completion}%</span></div><div className="h-2 overflow-hidden rounded-full bg-white/15"><div className="h-full rounded-full bg-[#fec961]" style={{ width: `${completion}%` }} /></div></div>
        </div>
      </section>

      <div className="grid gap-5 xl:grid-cols-[230px_1fr]">
        <MotionCard className="h-fit p-3">
          {steps.map((label, index) => <button key={label} onClick={() => setStep(index)} className={`mb-1 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-extrabold ${step === index ? "bg-[#ff723a] text-white" : "hover:bg-[#fff5ef] dark:hover:bg-white/5"}`}><span className={`flex h-7 w-7 items-center justify-center rounded-lg text-xs ${step === index ? "bg-white/20" : "bg-slate-100 dark:bg-white/10"}`}>{index + 1}</span>{label}</button>)}
        </MotionCard>

        <MotionCard>
          <div className="mb-6"><p className="text-xs font-extrabold uppercase tracking-[.16em] text-[#ff723a]">Step {step + 1} of {steps.length}</p><h3 className="mt-1 text-2xl font-extrabold">{steps[step]} information</h3></div>
          {step === 0 && <BasicFields form={form} update={update} slugFromTitle={slugFromTitle} uploadAsset={uploadAsset} canUpload={Boolean(courseId)} />}
          {step === 1 && <OutcomeFields form={form} update={update} />}
          {step === 2 && <PricingFields form={form} update={update} />}
          {step === 3 && <RuleFields form={form} update={update} />}
          {step === 4 && <LandingFields form={form} update={update} />}
          <div className="mt-7 flex flex-col gap-3 border-t border-slate-100 pt-5 dark:border-white/10 sm:flex-row sm:justify-between">
            <button disabled={step === 0} onClick={() => setStep((value) => value - 1)} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-5 py-3 text-sm font-extrabold disabled:opacity-40 dark:border-white/10"><ChevronLeft className="h-4 w-4" /> Previous</button>
            <div className="flex flex-col gap-2 sm:flex-row">
              <button disabled={saving} onClick={() => save(false)} className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-100 px-5 py-3 text-sm font-extrabold dark:bg-white/10"><Save className="h-4 w-4" /> Save draft</button>
              {step < steps.length - 1 ? <button onClick={() => setStep((value) => value + 1)} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#ff723a] px-5 py-3 text-sm font-extrabold text-white">Continue <ChevronRight className="h-4 w-4" /></button> : <button disabled={saving} onClick={() => save(true)} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#ff723a] px-5 py-3 text-sm font-extrabold text-white"><Send className="h-4 w-4" /> Submit for review</button>}
            </div>
          </div>
        </MotionCard>
      </div>
    </div>
  );
}

function BasicFields({ form, update, slugFromTitle, uploadAsset, canUpload }) {
  return <div className="grid gap-4 md:grid-cols-2"><Field label="Course title" value={form.title} onChange={slugFromTitle} /><Field label="Subtitle" value={form.subtitle} onChange={(v) => update("subtitle", v)} /><Field label="Course slug" value={form.slug} onChange={(v) => update("slug", v)} /><Field label="Category" value={form.category} onChange={(v) => update("category", v)} /><Field label="Subcategory" value={form.subcategory} onChange={(v) => update("subcategory", v)} /><Select label="Level" value={form.level} onChange={(v) => update("level", v)} options={["beginner", "intermediate", "advanced"]} /><Field label="Language" value={form.language} onChange={(v) => update("language", v)} /><Field label="Tags (comma separated)" value={form.tags} onChange={(v) => update("tags", v)} /><AssetField label="Course thumbnail" accept="image/*" value={form.thumbnail} field="thumbnail" uploadAsset={uploadAsset} canUpload={canUpload} /><AssetField label="Promotional video" accept="video/mp4,video/quicktime,video/x-matroska" value={form.promoVideoUrl} field="promoVideoUrl" uploadAsset={uploadAsset} canUpload={canUpload} /><Area label="Short description" value={form.shortDescription} onChange={(v) => update("shortDescription", v)} /><Area label="Full description" value={form.description} onChange={(v) => update("description", v)} /></div>;
}
function OutcomeFields({ form, update }) {
  return <div className="grid gap-4 md:grid-cols-2">{[["learningOutcomes", "What students will learn"], ["objectives", "Course objectives"], ["skills", "Skills covered"], ["requirements", "Requirements"], ["prerequisites", "Prerequisites"], ["targetAudience", "Target audience"]].map(([name, label]) => <Area key={name} label={`${label} (one per line)`} value={form[name]} onChange={(v) => update(name, v)} />)}</div>;
}
function PricingFields({ form, update }) {
  return <div className="grid gap-4 md:grid-cols-2"><Select label="Pricing type" value={form.pricingType} onChange={(v) => update("pricingType", v)} options={["free", "paid"]} /><Select label="Currency" value={form.currency} onChange={(v) => update("currency", v)} options={["USD", "INR", "EUR", "GBP"]} /><Field label="Price" type="number" disabled={form.pricingType === "free"} value={form.price} onChange={(v) => update("price", v)} /><Field label="Discount price" type="number" disabled={form.pricingType === "free"} value={form.discountPrice} onChange={(v) => update("discountPrice", v)} /><Toggle label="Allow coupons" value={form.couponEnabled} onChange={(v) => update("couponEnabled", v)} /><Toggle label="Subscription access" value={form.subscriptionAccess} onChange={(v) => update("subscriptionAccess", v)} /></div>;
}
function RuleFields({ form, update }) {
  return <div className="grid gap-4 md:grid-cols-2"><Toggle label="Require previous lecture completion" value={form.sequentialLearning} onChange={(v) => update("sequentialLearning", v)} /><Toggle label="Enable certificate" value={form.certificateEnabled} onChange={(v) => update("certificateEnabled", v)} /><Toggle label="Require 100% progress" value={form.requireFullProgress} onChange={(v) => update("requireFullProgress", v)} /><Toggle label="Require quiz completion" value={form.requireQuizzes} onChange={(v) => update("requireQuizzes", v)} /><Toggle label="Require assignments" value={form.requireAssignments} onChange={(v) => update("requireAssignments", v)} /></div>;
}
function LandingFields({ form, update }) {
  return <div className="grid gap-4 md:grid-cols-2"><Field label="Hero banner URL" value={form.heroBanner} onChange={(v) => update("heroBanner", v)} /><Area label="Instructor bio" value={form.instructorBio} onChange={(v) => update("instructorBio", v)} /><div className="rounded-2xl bg-[#fff8ef] p-5 md:col-span-2 dark:bg-white/5"><CheckCircle2 className="h-6 w-6 text-[#ff723a]" /><h4 className="mt-3 font-extrabold">Curriculum comes next</h4><p className="mt-1 text-sm text-slate-500">Save this course, then open Course Builder to add modules, lectures, resources, quizzes, assignments, drip schedules, and previews.</p></div></div>;
}
function Field({ label, value, onChange, type = "text", disabled = false }) {
  return <label className="text-sm font-extrabold">{label}<input disabled={disabled} type={type} value={value ?? ""} onChange={(e) => onChange(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-[#ff723a] disabled:bg-slate-100 dark:border-white/10 dark:bg-slate-900" /></label>;
}
function Area({ label, value, onChange }) {
  return <label className="text-sm font-extrabold">{label}<textarea rows={4} value={value || ""} onChange={(e) => onChange(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-[#ff723a] dark:border-white/10 dark:bg-slate-900" /></label>;
}
function Select({ label, value, onChange, options }) {
  return <label className="text-sm font-extrabold">{label}<select value={value} onChange={(e) => onChange(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 dark:border-white/10 dark:bg-slate-900">{options.map((option) => <option key={option}>{option}</option>)}</select></label>;
}
function Toggle({ label, value, onChange }) {
  return <button type="button" onClick={() => onChange(!value)} className={`flex items-center justify-between rounded-2xl border p-4 text-left text-sm font-extrabold ${value ? "border-[#ff723a] bg-[#fff5ef] text-[#ff723a] dark:bg-orange-500/10" : "border-slate-200 dark:border-white/10"}`}><span>{label}</span><span className={`h-6 w-11 rounded-full p-1 ${value ? "bg-[#ff723a]" : "bg-slate-200 dark:bg-slate-700"}`}><span className={`block h-4 w-4 rounded-full bg-white transition ${value ? "translate-x-5" : ""}`} /></span></button>;
}
function AssetField({ label, accept, value, field, uploadAsset, canUpload }) {
  return <label className="rounded-2xl border border-dashed border-slate-300 p-4 text-sm font-extrabold dark:border-white/15">{label}<input disabled={!canUpload} type="file" accept={accept} onChange={(event) => event.target.files?.[0] && uploadAsset(event.target.files[0], field)} className="mt-3 block w-full text-xs font-semibold disabled:opacity-50" /><span className="mt-2 block truncate text-xs font-semibold text-slate-400">{canUpload ? value || "Choose a file to upload" : "Save draft first to enable uploads"}</span></label>;
}
function join(value) {
  return Array.isArray(value) ? value.join("\n") : value || "";
}
