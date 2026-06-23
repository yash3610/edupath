import { useState } from "react";
import { motion } from "framer-motion";
import { Check, ChevronRight, Image as ImageIcon, Save, Send, Video } from "lucide-react";
import { useForm } from "react-hook-form";
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
import { toast } from "sonner";
const STEPS = ["Basics", "Pricing", "Curriculum", "Outcomes", "Settings", "Review"];
export default function CreatePage() {
  const [step, setStep] = useState(0);
  const form = useForm({
    defaultValues: {
      title: "",
      subtitle: "",
      description: "",
      category: "frontend",
      level: "intermediate",
      language: "English",
      free: false,
      price: 4999,
      discount: 3999,
      certificate: true,
      visibility: "public",
    },
  });
  const next = () => setStep((s) => Math.min(STEPS.length - 1, s + 1));
  const prev = () => setStep((s) => Math.max(0, s - 1));
  const submit = () => toast.success("Course submitted for approval");
  const draft = () => toast("Draft saved");
  return (
    <div className="mx-auto max-w-[1200px]">
      <LmsPageHeader
        eyebrow="Teaching"
        title="Create a new course"
        description="A guided flow — save as you go."
      />

      {/* Stepper */}
      <div className="mb-6 overflow-x-auto rounded-2xl card-premium p-3">
        <div className="flex min-w-max gap-2">
          {STEPS.map((s, i) => {
            const done = i < step;
            const active = i === step;
            return (
              <button
                key={s}
                onClick={() => setStep(i)}
                className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition-all ${active ? "gradient-primary text-primary-foreground shadow-glow" : done ? "bg-success/15 text-success" : "bg-muted/40 text-muted-foreground hover:bg-muted/60"}`}
              >
                <span
                  className={`grid h-5 w-5 place-items-center rounded-full text-[11px] font-semibold ${active ? "bg-background/20" : done ? "bg-success/30" : "bg-background/40"}`}
                >
                  {done ? <Check className="h-3 w-3" /> : i + 1}
                </span>
                <span className="font-medium">{s}</span>
                {i < STEPS.length - 1 && <ChevronRight className="h-3 w-3 opacity-50" />}
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
            <div className="md:col-span-2">
              <Label>Course title</Label>
              <Input
                {...form.register("title")}
                placeholder="Advanced React & Design Systems"
                className="mt-1 rounded-xl"
              />
            </div>
            <div className="md:col-span-2">
              <Label>Subtitle</Label>
              <Input
                {...form.register("subtitle")}
                placeholder="Production patterns from real teams"
                className="mt-1 rounded-xl"
              />
            </div>
            <div className="md:col-span-2">
              <Label>Description</Label>
              <Textarea
                {...form.register("description")}
                rows={5}
                placeholder="What will students master by the end?"
                className="mt-1 rounded-xl"
              />
            </div>
            <div>
              <Label>Category</Label>
              <Select defaultValue="frontend">
                <SelectTrigger className="mt-1 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["frontend", "ai-ml", "design", "data", "devops", "business"].map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Level</Label>
              <Select defaultValue="intermediate">
                <SelectTrigger className="mt-1 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["beginner", "intermediate", "advanced"].map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Language</Label>
              <Input defaultValue="English" className="mt-1 rounded-xl" />
            </div>
            <div>
              <Label>Tags</Label>
              <Input placeholder="react, design-systems, typescript" className="mt-1 rounded-xl" />
            </div>
            <Uploader
              label="Thumbnail"
              icon={<ImageIcon className="h-5 w-5" />}
              hint="1920×1080 · JPG/PNG · 2MB max"
            />
            <Uploader
              label="Promo video"
              icon={<Video className="h-5 w-5" />}
              hint="MP4 · under 90 seconds"
            />
          </div>
        )}

        {step === 1 && (
          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2 flex items-center justify-between rounded-xl bg-muted/30 p-4">
              <div>
                <div className="font-medium">Free course</div>
                <div className="text-xs text-muted-foreground">
                  Make the entire course free to enroll.
                </div>
              </div>
              <Switch />
            </div>
            <div>
              <Label>Price (₹)</Label>
              <Input type="number" defaultValue={4999} className="mt-1 rounded-xl" />
            </div>
            <div>
              <Label>Discount price (₹)</Label>
              <Input type="number" defaultValue={3999} className="mt-1 rounded-xl" />
            </div>
            <div className="md:col-span-2 flex items-center justify-between rounded-xl bg-muted/30 p-4">
              <div>
                <div className="font-medium">Coupons allowed</div>
                <div className="text-xs text-muted-foreground">
                  Let admin-published coupons apply.
                </div>
              </div>
              <Switch defaultChecked />
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <div className="mb-4 text-sm text-muted-foreground">
              Add modules, lectures, quizzes and resources.
            </div>
            <div className="space-y-3">
              {["Introduction", "Foundations", "Patterns", "Capstone"].map((m, i) => (
                <details
                  key={m}
                  open={i === 0}
                  className="rounded-xl border border-border/60 bg-muted/20 p-3"
                >
                  <summary className="flex cursor-pointer items-center gap-2 font-medium">
                    <ChevronRight className="h-4 w-4 transition-transform group-open:rotate-90" />{" "}
                    {m}
                  </summary>
                  <div className="mt-2 space-y-1">
                    {["Lecture 1", "Lecture 2", "Lecture 3"].map((l) => (
                      <div
                        key={l}
                        className="flex items-center justify-between rounded-lg bg-background/40 px-3 py-2 text-sm"
                      >
                        <span>{l}</span>
                        <Badge variant="outline" className="border-border/60">
                          video · 12:24
                        </Badge>
                      </div>
                    ))}
                  </div>
                </details>
              ))}
            </div>
            <Button variant="outline" className="mt-4 rounded-xl border-border/60">
              + Add module
            </Button>
          </div>
        )}

        {step === 3 && (
          <div className="grid gap-4">
            <div>
              <Label>What will students learn? (one per line)</Label>
              <Textarea
                rows={4}
                className="mt-1 rounded-xl"
                placeholder={
                  "Build production-ready React apps\nMaster compound components\nDesign accessible UIs"
                }
              />
            </div>
            <div>
              <Label>Requirements</Label>
              <Textarea
                rows={3}
                className="mt-1 rounded-xl"
                placeholder={"Basic React knowledge\nFamiliarity with TypeScript"}
              />
            </div>
            <div>
              <Label>Who is this for?</Label>
              <Textarea rows={3} className="mt-1 rounded-xl" />
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-3">
            {[
              ["Issue certificate on completion", true],
              ["Public visibility", true],
              ["Drip-release content weekly", false],
              ["Discussion board enabled", true],
              ["Require quiz pass to complete", true],
            ].map(([k, v]) => (
              <div key={k} className="flex items-center justify-between rounded-xl bg-muted/30 p-4">
                <div>{k}</div>
                <Switch defaultChecked={v} />
              </div>
            ))}
          </div>
        )}

        {step === 5 && (
          <div className="space-y-3">
            <div className="rounded-xl bg-muted/30 p-4 text-sm">
              <div className="mb-2 font-medium">Checklist</div>
              <ul className="space-y-1.5">
                {[
                  ["Title and subtitle", true],
                  ["Description over 300 chars", true],
                  ["Thumbnail uploaded", true],
                  ["At least 10 lectures", false],
                  ["Pricing configured", true],
                ].map(([k, v]) => (
                  <li
                    key={k}
                    className={`flex items-center gap-2 text-sm ${v ? "" : "text-muted-foreground"}`}
                  >
                    <Check
                      className={`h-3.5 w-3.5 ${v ? "text-success" : "text-muted-foreground/40"}`}
                    />{" "}
                    {k}
                  </li>
                ))}
              </ul>
            </div>
            <div className="text-sm text-muted-foreground">
              Save a draft anytime or submit for admin review.
            </div>
          </div>
        )}

        <div className="mt-8 flex items-center justify-between">
          <Button variant="ghost" onClick={prev} disabled={step === 0} className="rounded-xl">
            Back
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={draft} className="rounded-xl border-border/60">
              <Save className="mr-1.5 h-4 w-4" /> Save draft
            </Button>
            {step < STEPS.length - 1 ? (
              <Button
                onClick={next}
                className="rounded-xl gradient-primary border-0 text-primary-foreground"
              >
                Next step
              </Button>
            ) : (
              <Button
                onClick={submit}
                className="rounded-xl gradient-primary border-0 text-primary-foreground"
              >
                <Send className="mr-1.5 h-4 w-4" /> Submit for review
              </Button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
function Uploader({ label, icon, hint }) {
  return (
    <div>
      <Label>{label}</Label>
      <label className="mt-1 flex h-32 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-border/60 bg-muted/20 transition hover:border-primary/40 hover:bg-primary/5">
        <div className="grid h-10 w-10 place-items-center rounded-lg gradient-primary shadow-glow text-primary-foreground">
          {icon}
        </div>
        <div className="text-sm font-medium">Drop file or click to upload</div>
        <div className="text-[11px] text-muted-foreground">{hint}</div>
        <input type="file" className="hidden" />
      </label>
    </div>
  );
}

