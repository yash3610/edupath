import { LmsPageHeader } from "@/features/shared/components/PageHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
export default function Page() {
  return (
    <div className="mx-auto max-w-[1100px]">
      <LmsPageHeader
        eyebrow="Engagement"
        title="CMS / Landing Pages"
        description="Edit hero, featured courses, testimonials, FAQs and SEO."
      />
      <Tabs defaultValue="hero">
        <TabsList className="rounded-xl bg-muted/60 p-1 flex-wrap h-auto">
          {["hero", "featured", "testimonials", "faqs", "banners", "blog", "seo"].map((t) => (
            <TabsTrigger key={t} value={t} className="rounded-lg capitalize">
              {t}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="hero" className="mt-5 rounded-2xl card-premium p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label>Headline</Label>
              <Input
                defaultValue="Learn the craft. Become the standard."
                className="mt-1 rounded-xl"
              />
            </div>
            <div className="sm:col-span-2">
              <Label>Subheadline</Label>
              <Textarea
                defaultValue="A premium AI-powered learning platform for builders, designers, and the curious."
                className="mt-1 rounded-xl"
              />
            </div>
            <div>
              <Label>Primary CTA</Label>
              <Input defaultValue="Start learning free" className="mt-1 rounded-xl" />
            </div>
            <div>
              <Label>Secondary CTA</Label>
              <Input defaultValue="Browse courses" className="mt-1 rounded-xl" />
            </div>
          </div>
          <Button
            className="mt-5 rounded-xl gradient-primary border-0 text-primary-foreground"
            onClick={() => toast.success("Hero saved")}
          >
            Save changes
          </Button>
        </TabsContent>

        <TabsContent value="seo" className="mt-5 rounded-2xl card-premium p-6">
          <div className="grid gap-4">
            <div>
              <Label>Title tag</Label>
              <Input
                defaultValue="Luma — Premium Learning Platform"
                className="mt-1 rounded-xl"
              />
            </div>
            <div>
              <Label>Meta description</Label>
              <Textarea
                defaultValue="Master the future of work with premium, AI-personalized courses from top instructors."
                className="mt-1 rounded-xl"
              />
            </div>
          </div>
          <Button
            className="mt-5 rounded-xl gradient-primary border-0 text-primary-foreground"
            onClick={() => toast.success("SEO saved")}
          >
            Save SEO
          </Button>
        </TabsContent>

        {["featured", "testimonials", "faqs", "banners", "blog"].map((t) => (
          <TabsContent key={t} value={t} className="mt-5 rounded-2xl card-premium p-10 text-center">
            <div className="font-display text-lg font-semibold capitalize">{t} editor</div>
            <p className="mt-1 text-sm text-muted-foreground">
              A premium drag-and-drop editor lives here in production.
            </p>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

