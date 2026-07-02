import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { LmsPageHeader } from "@/features/shared/components/PageHeader";
import { apiFormRequest, apiRequest, assetUrl } from "@/services/api";
import { PageLoader } from "./LumaDynamicUtils";

const initialForm = {
  title: "",
  subtitle: "",
  slug: "",
  instructor: "unassigned",
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
      setInstructors(instructorResult.data || []);
      if (courseResult?.data?.course) {
        const course = courseResult.data.course;
        setForm({
          ...initialForm,
          ...course,
          instructor: course.instructor?._id || course.instructor || "unassigned",
          learningOutcomes: join(course.learningOutcomes),
          requirements: join(course.requirements),
          targetAudience: join(course.targetAudience),
          tags: join(course.tags),
        });
      }
    }).catch((error) => toast.error(error.message || "Unable to load course editor")).finally(() => setLoading(false));
  }, [courseId]);

  const ready = useMemo(() => Boolean(form.title && form.slug && form.category && form.description), [form]);
  function update(name, value) { setForm((current) => ({ ...current, [name]: value })); }
  function updateTitle(value) {
    setForm((current) => ({ ...current, title: value, slug: courseId ? current.slug : value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") }));
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
        instructor: form.instructor === "unassigned" ? "" : form.instructor,
        price: Number(form.price || 0),
        discountPrice: Number(form.discountPrice || 0),
      }).forEach(([key, value]) => body.append(key, value ?? ""));
      if (thumbnailFile) body.append("thumbnailFile", thumbnailFile);
      await apiFormRequest(courseId ? `/api/admin/courses/${courseId}` : "/api/admin/courses", body, { method: courseId ? "PATCH" : "POST" });
      toast.success(courseId ? "Course and instructor assignment updated." : "Course created and assigned to instructor.");
      navigate("/admin/dashboard/courses");
    } catch (error) {
      toast.error(error.message || "Unable to save course");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <PageLoader label="Loading course editor" />;

  return (
    <div>
      <LmsPageHeader
        eyebrow="Course Administration"
        title={courseId ? "Edit course" : "Create and assign course"}
        description="Admin controls the catalog and assigns one instructor to teach and manage the curriculum."
      />
      <form onSubmit={submit} className="rounded-2xl card-premium p-6">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Course title"><Input value={form.title} onChange={(e) => updateTitle(e.target.value)} /></Field>
          <Field label="Subtitle"><Input value={form.subtitle} onChange={(e) => update("subtitle", e.target.value)} /></Field>
          <Field label="Course slug"><Input value={form.slug} onChange={(e) => update("slug", e.target.value)} /></Field>
          <Choice label="Assigned instructor" value={form.instructor} onChange={(value) => update("instructor", value)} items={[["unassigned", "Keep as unassigned draft"], ...instructors.map((instructor) => [instructor._id, `${instructor.name} (${instructor.email})`])]} />
          <Field label="Category"><Input value={form.category} onChange={(e) => update("category", e.target.value)} /></Field>
          <Field label="Subcategory"><Input value={form.subcategory} onChange={(e) => update("subcategory", e.target.value)} /></Field>
          <Choice label="Level" value={form.level} onChange={(value) => update("level", value)} items={["beginner", "intermediate", "advanced"].map((value) => [value, value])} />
          <Field label="Language"><Input value={form.language} onChange={(e) => update("language", e.target.value)} /></Field>
          <ThumbnailField currentUrl={form.thumbnail} previewUrl={thumbnailPreview} onFile={setThumbnailFile} />
          <Field label="Promo video URL"><Input type="url" value={form.promoVideoUrl} onChange={(e) => update("promoVideoUrl", e.target.value)} /></Field>
          <Field label="Card description"><Textarea rows={4} value={form.shortDescription} onChange={(e) => update("shortDescription", e.target.value)} /></Field>
          <Field label="Full course description"><Textarea rows={4} value={form.description} onChange={(e) => update("description", e.target.value)} /></Field>
          <Field label="Learning outcomes (one per line)"><Textarea rows={4} value={form.learningOutcomes} onChange={(e) => update("learningOutcomes", e.target.value)} /></Field>
          <Field label="Requirements (one per line)"><Textarea rows={4} value={form.requirements} onChange={(e) => update("requirements", e.target.value)} /></Field>
          <Field label="Target audience (one per line)"><Textarea rows={4} value={form.targetAudience} onChange={(e) => update("targetAudience", e.target.value)} /></Field>
          <Field label="Tags (one per line)"><Textarea rows={4} value={form.tags} onChange={(e) => update("tags", e.target.value)} /></Field>
          <Choice label="Pricing" value={form.pricingType} onChange={(value) => update("pricingType", value)} items={["paid", "free"].map((value) => [value, value])} />
          <Choice label="Currency" value={form.currency} onChange={(value) => update("currency", value)} items={["INR", "USD", "EUR", "GBP"].map((value) => [value, value])} />
          <Field label="Price"><Input type="number" disabled={form.pricingType === "free"} value={form.price} onChange={(e) => update("price", e.target.value)} /></Field>
          <Field label="Discount price"><Input type="number" disabled={form.pricingType === "free"} value={form.discountPrice} onChange={(e) => update("discountPrice", e.target.value)} /></Field>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          <Toggle label="Feature this course" checked={form.featured} onChange={(value) => update("featured", value)} />
          <Toggle label="Enable course certificate" checked={form.certificateEnabled} onChange={(value) => update("certificateEnabled", value)} />
          <Toggle label="Hide course from the website" checked={form.disabled} onChange={(value) => update("disabled", value)} />
        </div>
        <div className="mt-6 flex justify-end">
          <Button disabled={saving || !ready}><Save className="mr-2 h-4 w-4" />{saving ? "Saving..." : courseId ? "Save changes" : "Create and assign"}</Button>
        </div>
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
function Toggle({ label, checked, onChange }) {
  return <label className="flex items-center justify-between gap-3 rounded-xl border border-border/70 bg-muted/20 p-4 text-sm font-medium">{label}<Switch checked={Boolean(checked)} onCheckedChange={onChange} /></label>;
}
function ThumbnailField({ currentUrl, previewUrl, onFile }) {
  const imageUrl = previewUrl || assetUrl(currentUrl);
  return (
    <div className="space-y-3">
      <Label>Course thumbnail</Label>
      <Input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => onFile(event.target.files?.[0] || null)} />
      {imageUrl && <img src={imageUrl} alt="Course thumbnail preview" className="h-40 w-full rounded-xl border border-border object-cover" />}
      <Input type="text" value={currentUrl || ""} readOnly placeholder="Saved thumbnail id" />
    </div>
  );
}
function join(value) {
  return Array.isArray(value) ? value.join("\n") : value || "";
}
