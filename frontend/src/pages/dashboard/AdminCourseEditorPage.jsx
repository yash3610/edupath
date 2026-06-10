import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Save } from "lucide-react";
import { MotionCard } from "../../components/dashboard/DashboardPrimitives.jsx";
import { useToast } from "../../context/ToastContext.jsx";
import { apiFormRequest, apiRequest } from "../../services/api.js";

const initialForm = {
  title: "",
  subtitle: "",
  slug: "",
  instructor: "",
  category: "",
  subcategory: "",
  language: "English",
  level: "beginner",
  thumbnail: "",
  promoVideoUrl: "",
  shortDescription: "",
  description: "",
  learningOutcomes: "",
  requirements: "",
  targetAudience: "",
  tags: "",
  pricingType: "paid",
  price: 0,
  discountPrice: 0,
  currency: "INR",
  featured: false,
  disabled: false,
  certificateEnabled: true,
};

export default function AdminCourseEditorPage() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [form, setForm] = useState(initialForm);
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState("");

  useEffect(() => {
    if (!thumbnailFile) {
      setThumbnailPreview("");
      return undefined;
    }
    const previewUrl = URL.createObjectURL(thumbnailFile);
    setThumbnailPreview(previewUrl);
    return () => URL.revokeObjectURL(previewUrl);
  }, [thumbnailFile]);

  useEffect(() => {
    Promise.all([
      apiRequest("/api/admin/instructors"),
      courseId ? apiRequest(`/api/admin/courses/${courseId}`) : Promise.resolve(null),
    ]).then(([instructorResult, courseResult]) => {
      const instructorList = instructorResult.data || [];
      setInstructors(instructorList);
      if (courseResult?.data?.course) {
        const course = courseResult.data.course;
        setForm({
          ...initialForm,
          ...course,
          instructor: course.instructor?._id || course.instructor || "",
          learningOutcomes: join(course.learningOutcomes),
          requirements: join(course.requirements),
          targetAudience: join(course.targetAudience),
          tags: join(course.tags),
        });
      }
    }).catch((error) => toast.error(error.message)).finally(() => setLoading(false));
  }, [courseId, toast]);

  const ready = useMemo(
    () => Boolean(form.title && form.slug && form.category && form.description),
    [form]
  );

  function update(name, value) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  function updateTitle(value) {
    setForm((current) => ({
      ...current,
      title: value,
      slug: courseId ? current.slug : value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
    }));
  }

  async function submit(event) {
    event.preventDefault();
    if (!ready) return toast.error("Title, slug, category and description are required.");
    try {
      setSaving(true);
      const body = new FormData();
      const { status: _status, ...editableForm } = form;
      Object.entries({
        ...editableForm,
        price: Number(form.price || 0),
        discountPrice: Number(form.discountPrice || 0),
      }).forEach(([key, value]) => body.append(key, value ?? ""));
      if (thumbnailFile) body.append("thumbnailFile", thumbnailFile);

      await apiFormRequest(courseId ? `/api/admin/courses/${courseId}` : "/api/admin/courses", body, {
        method: courseId ? "PATCH" : "POST",
      });
      toast.success(courseId ? "Course and instructor assignment updated." : "Course created and assigned to instructor.");
      navigate("/admin/dashboard/courses");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="h-96 animate-pulse rounded-[28px] bg-slate-200 dark:bg-white/10" />;

  return (
    <div className="space-y-5">
      <section className="rounded-[28px] bg-[#1f1c35] p-7 text-white">
        <p className="text-xs font-extrabold uppercase tracking-[.18em] text-[#fec961]">Course Administration</p>
        <h2 className="mt-2 text-3xl font-extrabold">{courseId ? "Edit course" : "Create and assign course"}</h2>
        <p className="mt-2 text-sm text-white/65">Admin controls the catalog and assigns one instructor to teach and manage the curriculum.</p>
      </section>

      <MotionCard>
        <form onSubmit={submit} className="grid gap-4 md:grid-cols-2">
          <Field label="Course title" value={form.title} onChange={updateTitle} />
          <Field label="Subtitle" value={form.subtitle} onChange={(value) => update("subtitle", value)} />
          <Field label="Course slug" value={form.slug} onChange={(value) => update("slug", value)} />
          <Select label="Assigned instructor (optional)" value={form.instructor} onChange={(value) => update("instructor", value)}>
            <option value="">Keep as unassigned draft</option>
            {instructors.map((instructor) => <option key={instructor._id} value={instructor._id}>{instructor.name} ({instructor.email})</option>)}
          </Select>
          <Field label="Category" value={form.category} onChange={(value) => update("category", value)} />
          <Field label="Subcategory" value={form.subcategory} onChange={(value) => update("subcategory", value)} />
          <Select label="Level" value={form.level} onChange={(value) => update("level", value)}>{["beginner", "intermediate", "advanced"].map(option)}</Select>
          <Field label="Language" value={form.language} onChange={(value) => update("language", value)} />
          <ThumbnailField
            currentUrl={form.thumbnail}
            previewUrl={thumbnailPreview}
            onFile={setThumbnailFile}
            onUrlChange={(value) => update("thumbnail", value)}
          />
          <Field label="Promo video URL" type="url" value={form.promoVideoUrl} onChange={(value) => update("promoVideoUrl", value)} />
          <Area label="Card description" value={form.shortDescription} onChange={(value) => update("shortDescription", value)} />
          <Area label="Full course description" value={form.description} onChange={(value) => update("description", value)} />
          <Area label="Learning outcomes (one per line)" value={form.learningOutcomes} onChange={(value) => update("learningOutcomes", value)} />
          <Area label="Requirements (one per line)" value={form.requirements} onChange={(value) => update("requirements", value)} />
          <Area label="Target audience (one per line)" value={form.targetAudience} onChange={(value) => update("targetAudience", value)} />
          <Area label="Tags (one per line)" value={form.tags} onChange={(value) => update("tags", value)} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Select label="Pricing" value={form.pricingType} onChange={(value) => update("pricingType", value)}>{["paid", "free"].map(option)}</Select>
            <Select label="Currency" value={form.currency} onChange={(value) => update("currency", value)}>{["INR", "USD", "EUR", "GBP"].map(option)}</Select>
            <Field label="Price" type="number" disabled={form.pricingType === "free"} value={form.price} onChange={(value) => update("price", value)} />
            <Field label="Discount price" type="number" disabled={form.pricingType === "free"} value={form.discountPrice} onChange={(value) => update("discountPrice", value)} />
          </div>
          <label className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 text-sm font-extrabold dark:border-white/10">
            <input type="checkbox" checked={form.featured} onChange={(event) => update("featured", event.target.checked)} />
            Feature this course
          </label>
          <label className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 text-sm font-extrabold dark:border-white/10">
            <input type="checkbox" checked={form.certificateEnabled} onChange={(event) => update("certificateEnabled", event.target.checked)} />
            Enable course certificate
          </label>
          <label className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 text-sm font-extrabold dark:border-white/10">
            <input type="checkbox" checked={form.disabled} onChange={(event) => update("disabled", event.target.checked)} />
            Hide course from the website
          </label>
          <div className="flex items-end justify-end md:col-span-2">
            <button disabled={saving || !ready} className="inline-flex items-center gap-2 rounded-xl bg-[#ff723a] px-6 py-3 text-sm font-extrabold text-white disabled:opacity-50">
              <Save className="h-4 w-4" /> {saving ? "Saving..." : courseId ? "Save changes" : "Create and assign"}
            </button>
          </div>
        </form>
      </MotionCard>
    </div>
  );
}

function Field({ label, value, onChange, type = "text", disabled = false }) {
  return <label className="text-sm font-extrabold">{label}<input disabled={disabled} type={type} value={value ?? ""} onChange={(event) => onChange(event.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-[#ff723a] disabled:bg-slate-100 dark:border-white/10 dark:bg-slate-900" /></label>;
}

function Area({ label, value, onChange }) {
  return <label className="text-sm font-extrabold">{label}<textarea rows={4} value={value || ""} onChange={(event) => onChange(event.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-[#ff723a] dark:border-white/10 dark:bg-slate-900" /></label>;
}

function ThumbnailField({ currentUrl, previewUrl, onFile, onUrlChange }) {
  const imageUrl = previewUrl || currentUrl;
  return (
    <div className="space-y-3">
      <label className="block text-sm font-extrabold">
        Course thumbnail
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={(event) => onFile(event.target.files?.[0] || null)}
          className="mt-2 block w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm dark:border-white/10 dark:bg-slate-900"
        />
      </label>
      {imageUrl && (
        <img
          src={imageUrl}
          alt="Course thumbnail preview"
          className="h-40 w-full rounded-2xl border border-slate-200 object-cover dark:border-white/10"
        />
      )}
      <label className="block text-xs font-bold text-slate-500">
        Or use an image URL
        <input
          type="url"
          value={currentUrl || ""}
          onChange={(event) => onUrlChange(event.target.value)}
          className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-[#ff723a] dark:border-white/10 dark:bg-slate-900 dark:text-white"
        />
      </label>
    </div>
  );
}

function Select({ label, value, onChange, children }) {
  return <label className="text-sm font-extrabold">{label}<select value={value} onChange={(event) => onChange(event.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 dark:border-white/10 dark:bg-slate-900">{children}</select></label>;
}

function option(value) {
  return <option key={value} value={value}>{value}</option>;
}

function join(value) {
  return Array.isArray(value) ? value.join("\n") : value || "";
}
