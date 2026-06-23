import { LmsPageHeader } from "@/features/shared/components/PageHeader";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { instructor } from "@/features/instructor/data/instructor";
import { toast } from "sonner";
export default function Page() {
  return (
    <div className="mx-auto max-w-[1100px]">
      <LmsPageHeader
        eyebrow="Account"
        title="Profile"
        description="How you appear to learners across the platform."
      />
      <div className="overflow-hidden rounded-2xl card-premium">
        <div className="relative h-44 overflow-hidden">
          <img src={instructor.cover} alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-card via-card/30 to-transparent" />
        </div>
        <div className="-mt-12 px-6 pb-6 md:px-8">
          <div className="flex items-end gap-4">
            <Avatar className="h-24 w-24 ring-4 ring-card">
              <AvatarImage src={instructor.avatar} />
              <AvatarFallback>{instructor.name[0]}</AvatarFallback>
            </Avatar>
            <div className="pb-1">
              <h2 className="font-display text-2xl font-semibold">{instructor.name}</h2>
              <div className="text-sm text-muted-foreground">{instructor.role}</div>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div>
              <Label>Full name</Label>
              <Input defaultValue={instructor.name} className="mt-1 rounded-xl" />
            </div>
            <div>
              <Label>Email</Label>
              <Input defaultValue="sara@luma.ai" className="mt-1 rounded-xl" />
            </div>
            <div>
              <Label>Phone</Label>
              <Input defaultValue="+91 98765 43210" className="mt-1 rounded-xl" />
            </div>
            <div>
              <Label>Website</Label>
              <Input defaultValue="https://saralin.dev" className="mt-1 rounded-xl" />
            </div>
            <div className="md:col-span-2">
              <Label>Bio</Label>
              <Textarea rows={4} defaultValue={instructor.bio} className="mt-1 rounded-xl" />
            </div>
            <div className="md:col-span-2">
              <Label>Expertise</Label>
              <div className="mt-2 flex flex-wrap gap-2">
                {instructor.expertise.map((e) => (
                  <Badge key={e} variant="outline" className="border-border/60">
                    {e}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <Button
            className="mt-6 rounded-xl gradient-primary border-0 text-primary-foreground"
            onClick={() => toast.success("Profile saved")}
          >
            Save changes
          </Button>
        </div>
      </div>
    </div>
  );
}

