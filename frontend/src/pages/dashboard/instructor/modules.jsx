import { LmsPageHeader } from "@/features/shared/components/PageHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { toast } from "sonner";
export default function Page() {
  return (
    <div className="mx-auto max-w-[1100px]">
      <LmsPageHeader
        eyebrow="Teaching"
        title="Lecture Editor"
        description="Configure a single lecture — video, resources, preview and publish settings."
      />
      <Tabs defaultValue="video">
        <TabsList className="rounded-xl bg-muted/60 p-1">
          {["video", "pdf", "text", "live", "link"].map((t) => (
            <TabsTrigger key={t} value={t} className="rounded-lg capitalize">
              {t}
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value="video" className="mt-5 rounded-2xl card-premium p-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <Label>Lecture title</Label>
              <Input defaultValue="Compound components in practice" className="mt-1 rounded-xl" />
            </div>
            <div className="md:col-span-2">
              <Label>Description</Label>
              <Textarea rows={3} className="mt-1 rounded-xl" />
            </div>
            <div>
              <Label>Duration</Label>
              <Input defaultValue="22:45" className="mt-1 rounded-xl" />
            </div>
            <div className="md:col-span-2">
              <Label>Video</Label>
              <label className="mt-1 flex h-40 cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-border/60 bg-muted/20 hover:border-primary/40 hover:bg-primary/5">
                <div className="grid h-10 w-10 place-items-center rounded-lg gradient-primary shadow-glow">
                  <Upload className="h-4 w-4 text-primary-foreground" />
                </div>
                <div className="text-sm font-medium">Drop video or click to upload</div>
                <div className="text-xs text-muted-foreground">
                  MP4 · up to 4 GB · 1080p recommended
                </div>
                <input type="file" className="hidden" />
              </label>
            </div>
            <div className="md:col-span-2">
              <Label>Resources</Label>
              <label className="mt-1 flex h-24 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-border/60 bg-muted/20 hover:border-primary/40 hover:bg-primary/5">
                <div className="text-sm font-medium">Add PDFs, slides, code samples</div>
                <div className="text-xs text-muted-foreground">Multiple files supported</div>
                <input type="file" multiple className="hidden" />
              </label>
            </div>
            <div className="md:col-span-2 flex items-center justify-between rounded-xl bg-muted/30 p-4">
              <span>Free preview</span>
              <Switch />
            </div>
            <div className="md:col-span-2 flex items-center justify-between rounded-xl bg-muted/30 p-4">
              <span>Published</span>
              <Switch defaultChecked />
            </div>
          </div>
          <div className="mt-5 flex gap-2">
            <Button
              className="rounded-xl gradient-primary border-0 text-primary-foreground"
              onClick={() => toast.success("Lecture saved")}
            >
              Save lecture
            </Button>
            <Button
              variant="outline"
              className="rounded-xl border-border/60"
              onClick={() => toast("Opening preview…")}
            >
              Preview
            </Button>
          </div>
        </TabsContent>
        {["pdf", "text", "live", "link"].map((t) => (
          <TabsContent
            key={t}
            value={t}
            className="mt-5 rounded-2xl card-premium p-10 text-center text-sm text-muted-foreground"
          >
            {t.toUpperCase()} editor lives here.
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

