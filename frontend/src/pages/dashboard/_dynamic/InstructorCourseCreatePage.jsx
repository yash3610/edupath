import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Check, ChevronRight, FileText, Image as ImageIcon, Plus, Save, Send, Trash2, Video } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { LmsPageHeader } from "@/features/shared/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { apiFormRequest, apiRequest, assetUrl } from "@/services/api";
import { toast } from "sonner";

const STEPS = ["Basics", "Pricing", "Curriculum", "Outcomes", "Settings", "Review"];
const CATEGORIES = ["frontend", "ai-ml", "design", "data", "devops", "business"];
const LEVELS = ["beginner", "intermediate", "advanced"];
const LECTURE_TYPES = ["video", "pdf", "article", "resource", "assignment", "quiz", "live"];

const emptyLecture = () => ({
  id: crypto.randomUUID(),
  title: "",
  type: "video",
  videoUrl: "",
  durationSeconds: "",
  isPreview: false,
});

const emptyModule = () => ({
  id: crypto.randomUUID(),
  title: "Introduction",
  description: "",
  lectures: [{ ...emptyLecture(), title: "Welcome to the course" }],
});

export default function CreatePage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState("");
  const [modules, setModules] = useState([emptyModule()]);
  const form = useForm({
    defaultValues: {
      title: "",
      subtitle: "",
      description: "",
      shortDescription: "",
      category: "frontend",
      level: "intermediate",
      language: "English",
      tags: "",
      thumbnail: "",
      promoVideoUrl: "",
      pricingType: "paid",
      price: 4999,
      discountPrice: 3999,
      couponEnabled: true,
      certificateEnabled: true,
      visibility: "public",
      sequentialLearning: false,
      learningOutcomes: "",
      requirements: "",
      targetAudience: "",
    },
  });

  const pricingType = form.watch("pricingType");
  const values = form.watch();
  const checks = useMemo(() => {
    const lectureCount = modules.reduce((sum, module) => sum + module.lectures.filter((lecture) => lecture.title.trim()).length, 0);
    return [
      ["Title", Boolean(values.title.trim())],
      ["Description", Boolean(values.description.trim())],
      ["Thumbnail", Boolean(thumbnailFile || values.thumbnail.trim())],
      ["Module", modules.some((module) => module.title.trim())],
      ["Lecture", lectureCount > 0],
      ["Outcomes", Boolean(values.learningOutcomes.trim())],
    ];
  }, [modules, thumbnailFile, values]);

  useEffect(() => {
    if (!thumbnailFile) {
      setThumbnailPreview("");
      return undefined;
    }
    const previewUrl = URL.createObjectURL(thumbnailFile);
    setThumbnailPreview(previewUrl);
    return () => URL.revokeObjectURL(previewUrl);
  }, [thumbnailFile]);

  const next = async () => {
    const fields = step === 0 ? ["title", "description", "category", "level"] : [];
    const valid = fields.length ? await form.trigger(fields) : true;
    if (valid) setStep((current) => Math.min(STEPS.length - 1, current + 1));
  };
  const prev = () => setStep((current) => Math.max(0, current - 1));

  function updateModule(moduleId, patch) {
    setModules((current) => current.map((module) => (module.id === moduleId ? { ...module, ...patch } : module)));
  }

  function updateLecture(moduleId, lectureId, patch) {
    setModules((current) => current.map((module) => (
      module.id === moduleId
        ? { ...module, lectures: module.lectures.map((lecture) => (lecture.id === lectureId ? { ...lecture, ...patch } : lecture)) }
        : module
    )));
  }

  function addModule() {
    setModules((current) => [...current, { ...emptyModule(), title: `Module ${current.length + 1}`, lectures: [] }]);
  }

  function addLecture(moduleId) {
    setModules((current) => current.map((module) => (
      module.id === moduleId ? { ...module, lectures: [...module.lectures, emptyLecture()] } : module
    )));
  }

  async function persistCourse(status) {
    const valid = await form.trigger(["title", "description", "category", "level"]);
    if (!valid) {
      setStep(0);
      return;
    }

    const values = form.getValues();
    const payload = {
      ...values,
      price: Number(values.price || 0),
      discountPrice: Number(values.discountPrice || 0),
      disabled: values.visibility === "private",
    };

    try {
      setSaving(true);
      const body = new FormData();
      Object.entries(payload).forEach(([key, value]) => body.append(key, value ?? ""));
      if (thumbnailFile) body.append("thumbnailFile", thumbnailFile);
      const courseResult = await apiFormRequest("/api/instructor/courses", body);
      const course = courseResult.data;

      for (const [moduleIndex, module] of modules.entries()) {
        if (!module.title.trim()) continue;
        const moduleResult = await apiRequest(`/api/instructor/courses/${course._id}/modules`, {
          method: "POST",
          body: JSON.stringify({
            title: module.title.trim(),
            description: module.description,
            order: moduleIndex + 1,
          }),
        });
        for (const [lectureIndex, lecture] of module.lectures.entries()) {
          if (!lecture.title.trim()) continue;
          await apiRequest(`/api/instructor/modules/${moduleResult.data._id}/lectures`, {
            method: "POST",
            body: JSON.stringify({
              title: lecture.title.trim(),
              type: lecture.type,
              videoUrl: lecture.videoUrl,
              durationSeconds: Number(lecture.durationSeconds || 0),
              isPreview: Boolean(lecture.isPreview),
              order: lectureIndex + 1,
            }),
          });
        }
      }

      if (status === "review") {
        try {
          await apiRequest(`/api/instructor/courses/${course._id}/submit-review`, {
            method: "PATCH",
            body: JSON.stringify({}),
          });
          toast.success("Course submitted for admin review.");
        } catch (error) {
          toast.error(error.message);
          toast.success("Course draft saved. Complete the missing items in builder.");
        }
      } else {
        toast.success("Course draft saved.");
      }
      navigate(`/instructor/dashboard/builder?course=${course._id}`);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-[1200px]">
      <LmsPageHeader
        eyebrow="Teaching"
        title="Create a new course"
        description="Build the course, save it to your dashboard, then continue in the builder."
      />

      <div className="mb-6 overflow-x-auto rounded-2xl card-premium p-3">
        <div className="flex min-w-max gap-2">
          {STEPS.map((label, index) => {
            const done = index < step;
            const active = index === step;
            return (
              <button
                type="button"
                key={label}
                onClick={() => setStep(index)}
                className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition-all ${active ? "gradient-primary text-primary-foreground shadow-glow" : done ? "bg-success/15 text-success" : "bg-muted/40 text-muted-foreground hover:bg-muted/60"}`}
              >
                <span className={`grid h-5 w-5 place-items-center rounded-full text-[11px] font-semibold ${active ? "bg-background/20" : done ? "bg-success/30" : "bg-background/40"}`}>
                  {done ? <Check className="h-3 w-3" /> : index + 1}
                </span>
                <span className="font-medium">{label}</span>
                {index < STEPS.length - 1 && <ChevronRight className="h-3 w-3 opacity-50" />}
              </button>
            );
          })}
        </div>
      </div>

      <motion.div
        key={step}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl card-premium p-6 md:p-8"
      >
        {step === 0 && (
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Course title" required error={form.formState.errors.title?.message} className="md:col-span-2">
              <Input {...form.register("title", { required: "Course title is required" })} placeholder="Advanced React and Design Systems" className="mt-1 rounded-xl" />
            </Field>
            <Field label="Subtitle" className="md:col-span-2">
              <Input {...form.register("subtitle")} placeholder="Production patterns from real teams" className="mt-1 rounded-xl" />
            </Field>
            <Field label="Short description" className="md:col-span-2">
              <Input {...form.register("shortDescription")} placeholder="A crisp one-line promise for students" className="mt-1 rounded-xl" />
            </Field>
            <Field label="Description" required error={form.formState.errors.description?.message} className="md:col-span-2">
              <Textarea {...form.register("description", { required: "Description is required" })} rows={5} placeholder="What will students master by the end?" className="mt-1 rounded-xl" />
            </Field>
            <SelectField control={form.control} name="category" label="Category" options={CATEGORIES} />
            <SelectField control={form.control} name="level" label="Level" options={LEVELS} />
            <Field label="Language">
              <Input {...form.register("language")} className="mt-1 rounded-xl" />
            </Field>
            <Field label="Tags">
              <Input {...form.register("tags")} placeholder="react, design-systems, typescript" className="mt-1 rounded-xl" />
            </Field>
            <Field label="Thumbnail" required>
              <div className="mt-1 grid gap-3 rounded-xl border border-border/60 bg-muted/20 p-3 sm:grid-cols-[140px_1fr] sm:items-center">
                <div className="overflow-hidden rounded-lg border border-border bg-background">
                  {thumbnailPreview || form.watch("thumbnail") ? (
                    <img src={thumbnailPreview || assetUrl(form.watch("thumbnail"))} alt="Course thumbnail preview" className="aspect-video w-full object-cover" />
                  ) : (
                    <div className="grid aspect-video place-items-center text-muted-foreground">
                      <ImageIcon className="h-7 w-7" />
                    </div>
                  )}
                </div>
                <div>
                  <Input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => setThumbnailFile(event.target.files?.[0] || null)} className="rounded-xl" />
                  <Input {...form.register("thumbnail")} readOnly placeholder="Saved thumbnail id" className="mt-2 rounded-xl" />
                  <p className="mt-1 text-xs text-muted-foreground">Image upload kara. Course madhe fakt uploaded image id save hoil.</p>
                </div>
              </div>
            </Field>
            <UrlField register={form.register} name="promoVideoUrl" label="Promo video URL" icon={<Video className="h-5 w-5" />} hint="YouTube, Vimeo, or hosted MP4 URL." />
          </div>
        )}

        {step === 1 && (
          <div className="grid gap-4 md:grid-cols-2">
            <Controller
              control={form.control}
              name="pricingType"
              render={({ field }) => (
                <div className="md:col-span-2 flex items-center justify-between rounded-xl bg-muted/30 p-4">
                  <div>
                    <div className="font-medium">Free course</div>
                    <div className="text-xs text-muted-foreground">Make the entire course free to enroll.</div>
                  </div>
                  <Switch checked={field.value === "free"} onCheckedChange={(checked) => field.onChange(checked ? "free" : "paid")} />
                </div>
              )}
            />
            <Field label="Price">
              <Input type="number" {...form.register("price")} disabled={pricingType === "free"} className="mt-1 rounded-xl" />
            </Field>
            <Field label="Discount price">
              <Input type="number" {...form.register("discountPrice")} disabled={pricingType === "free"} className="mt-1 rounded-xl" />
            </Field>
            <SwitchField control={form.control} name="couponEnabled" label="Coupons allowed" hint="Let admin-published coupons apply." />
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            {modules.map((module, moduleIndex) => (
              <div key={module.id} className="rounded-xl border border-border/60 bg-muted/20 p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-center">
                  <Input value={module.title} onChange={(event) => updateModule(module.id, { title: event.target.value })} placeholder={`Module ${moduleIndex + 1} title`} className="rounded-xl font-semibold" />
                  <Button type="button" variant="outline" className="rounded-xl border-border/60" onClick={() => addLecture(module.id)}>
                    <Plus className="h-4 w-4" /> Lecture
                  </Button>
                  <Button type="button" variant="ghost" className="rounded-xl text-destructive" onClick={() => setModules((current) => current.filter((item) => item.id !== module.id))} disabled={modules.length === 1}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <Textarea value={module.description} onChange={(event) => updateModule(module.id, { description: event.target.value })} placeholder="Module description" className="mt-3 rounded-xl" />
                <div className="mt-3 space-y-2">
                  {module.lectures.map((lecture) => (
                    <div key={lecture.id} className="grid gap-2 rounded-lg bg-background/60 p-3 md:grid-cols-[1fr_150px_140px_auto]">
                      <Input value={lecture.title} onChange={(event) => updateLecture(module.id, lecture.id, { title: event.target.value })} placeholder="Lecture title" className="rounded-lg" />
                      <Select value={lecture.type} onValueChange={(value) => updateLecture(module.id, lecture.id, { type: value })}>
                        <SelectTrigger className="rounded-lg"><SelectValue /></SelectTrigger>
                        <SelectContent>{LECTURE_TYPES.map((type) => <SelectItem key={type} value={type}>{type}</SelectItem>)}</SelectContent>
                      </Select>
                      <Input type="number" value={lecture.durationSeconds} onChange={(event) => updateLecture(module.id, lecture.id, { durationSeconds: event.target.value })} placeholder="Seconds" className="rounded-lg" />
                      <Button type="button" variant="ghost" size="icon" className="rounded-lg text-destructive" onClick={() => updateModule(module.id, { lectures: module.lectures.filter((item) => item.id !== lecture.id) })}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <Input value={lecture.videoUrl} onChange={(event) => updateLecture(module.id, lecture.id, { videoUrl: event.target.value })} placeholder="Content URL" className="md:col-span-3 rounded-lg" />
                      <label className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                        <Switch checked={lecture.isPreview} onCheckedChange={(checked) => updateLecture(module.id, lecture.id, { isPreview: checked })} /> Preview
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            <Button type="button" variant="outline" className="rounded-xl border-border/60" onClick={addModule}>
              <Plus className="h-4 w-4" /> Add module
            </Button>
          </div>
        )}

        {step === 3 && (
          <div className="grid gap-4">
            <Field label="What will students learn?">
              <Textarea {...form.register("learningOutcomes")} rows={4} className="mt-1 rounded-xl" placeholder={"Build production-ready React apps\nMaster compound components\nDesign accessible UIs"} />
            </Field>
            <Field label="Requirements">
              <Textarea {...form.register("requirements")} rows={3} className="mt-1 rounded-xl" placeholder={"Basic React knowledge\nFamiliarity with TypeScript"} />
            </Field>
            <Field label="Who is this for?">
              <Textarea {...form.register("targetAudience")} rows={3} className="mt-1 rounded-xl" />
            </Field>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-3">
            <SwitchField control={form.control} name="certificateEnabled" label="Issue certificate on completion" />
            <SwitchField control={form.control} name="sequentialLearning" label="Require sequential learning" />
            <Controller
              control={form.control}
              name="visibility"
              render={({ field }) => (
                <div>
                  <Label>Visibility</Label>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="mt-1 rounded-xl"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Public after approval</SelectItem>
                      <SelectItem value="private">Private draft</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            />
          </div>
        )}

        {step === 5 && (
          <div className="space-y-3">
            <div className="rounded-xl bg-muted/30 p-4 text-sm">
              <div className="mb-2 font-medium">Checklist</div>
              <ul className="space-y-1.5">
                {checks.map(([label, done]) => (
                  <li key={label} className={`flex items-center gap-2 text-sm ${done ? "" : "text-muted-foreground"}`}>
                    <Check className={`h-3.5 w-3.5 ${done ? "text-success" : "text-muted-foreground/40"}`} /> {label}
                  </li>
                ))}
              </ul>
            </div>
            <div className="text-sm text-muted-foreground">Save as draft anytime. Submit for review after the required items are complete.</div>
          </div>
        )}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Button type="button" variant="ghost" onClick={prev} disabled={step === 0 || saving} className="rounded-xl">Back</Button>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button type="button" variant="outline" onClick={() => persistCourse("draft")} disabled={saving} className="rounded-xl border-border/60">
              <Save className="h-4 w-4" /> {saving ? "Saving..." : "Save draft"}
            </Button>
            {step < STEPS.length - 1 ? (
              <Button type="button" onClick={next} disabled={saving} className="rounded-xl gradient-primary border-0 text-primary-foreground">Next step</Button>
            ) : (
              <Button type="button" onClick={() => persistCourse("review")} disabled={saving} className="rounded-xl gradient-primary border-0 text-primary-foreground">
                <Send className="h-4 w-4" /> Submit for review
              </Button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function Field({ label, children, className = "", required = false, error }) {
  return (
    <div className={className}>
      <Label>{label}{required && <span className="text-destructive"> *</span>}</Label>
      {children}
      {error && <p className="mt-1 text-xs font-medium text-destructive">{error}</p>}
    </div>
  );
}

function SelectField({ control, name, label, options }) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <div>
          <Label>{label}</Label>
          <Select value={field.value} onValueChange={field.onChange}>
            <SelectTrigger className="mt-1 rounded-xl"><SelectValue /></SelectTrigger>
            <SelectContent>{options.map((option) => <SelectItem key={option} value={option}>{option}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      )}
    />
  );
}

function SwitchField({ control, name, label, hint }) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <div className="flex items-center justify-between rounded-xl bg-muted/30 p-4">
          <div>
            <div className="font-medium">{label}</div>
            {hint && <div className="text-xs text-muted-foreground">{hint}</div>}
          </div>
          <Switch checked={Boolean(field.value)} onCheckedChange={field.onChange} />
        </div>
      )}
    />
  );
}

function UrlField({ register, name, label, icon, hint }) {
  return (
    <div>
      <Label>{label}</Label>
      <div className="mt-1 rounded-xl border border-border/60 bg-muted/20 p-3">
        <div className="mb-2 flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-lg gradient-primary text-primary-foreground shadow-glow">{icon || <FileText className="h-5 w-5" />}</span>
          <Badge variant="outline" className="border-border/60">{hint}</Badge>
        </div>
        <Input {...register(name)} placeholder="https://..." className="rounded-lg" />
      </div>
    </div>
  );
}
