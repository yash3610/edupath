import { LmsPageHeader } from "@/features/shared/components/PageHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
export default function Page() {
  return (
    <div className="mx-auto max-w-[1100px]">
      <LmsPageHeader
        eyebrow="Account"
        title="Settings"
        description="Account, notifications, privacy and payouts."
      />
      <Tabs defaultValue="account">
        <TabsList className="rounded-xl bg-muted/60 p-1 flex-wrap h-auto">
          {["account", "notifications", "privacy", "payouts", "theme", "password"].map((t) => (
            <TabsTrigger key={t} value={t} className="rounded-lg capitalize">
              {t}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="account" className="mt-5 rounded-2xl card-premium p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Display name</Label>
              <Input defaultValue="Sara Lin" className="mt-1 rounded-xl" />
            </div>
            <div>
              <Label>Email</Label>
              <Input defaultValue="sara@luma.ai" className="mt-1 rounded-xl" />
            </div>
            <div>
              <Label>Timezone</Label>
              <Input defaultValue="Asia/Kolkata" className="mt-1 rounded-xl" />
            </div>
            <div>
              <Label>Language</Label>
              <Input defaultValue="English" className="mt-1 rounded-xl" />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="notifications" className="mt-5 rounded-2xl card-premium p-6 space-y-3">
          {[
            "Email me when a student asks a question",
            "Email me when a course is approved",
            "Push notifications on new reviews",
            "Weekly performance digest",
          ].map((s, i) => (
            <div key={s} className="flex items-center justify-between rounded-xl bg-muted/30 p-4">
              <span className="text-sm">{s}</span>
              <Switch defaultChecked={i % 2 === 0} />
            </div>
          ))}
        </TabsContent>

        <TabsContent value="password" className="mt-5 rounded-2xl card-premium p-6">
          <div className="grid gap-4 sm:max-w-md">
            <div>
              <Label>Current password</Label>
              <Input type="password" className="mt-1 rounded-xl" />
            </div>
            <div>
              <Label>New password</Label>
              <Input type="password" className="mt-1 rounded-xl" />
            </div>
            <div>
              <Label>Confirm new</Label>
              <Input type="password" className="mt-1 rounded-xl" />
            </div>
          </div>
        </TabsContent>

        {["privacy", "payouts", "theme"].map((t) => (
          <TabsContent
            key={t}
            value={t}
            className="mt-5 rounded-2xl card-premium p-10 text-center text-sm text-muted-foreground"
          >
            {t} settings live here.
          </TabsContent>
        ))}
      </Tabs>
      <div className="mt-5">
        <Button
          className="rounded-xl gradient-primary border-0 text-primary-foreground"
          onClick={() => toast.success("Settings saved")}
        >
          Save changes
        </Button>
      </div>
    </div>
  );
}

