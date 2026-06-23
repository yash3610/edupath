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
        title="Platform Settings"
        description="Branding, payments, certificates, notifications and security."
      />
      <Tabs defaultValue="platform">
        <TabsList className="rounded-xl bg-muted/60 p-1 flex-wrap h-auto">
          {[
            "platform",
            "payment",
            "email",
            "certificate",
            "notifications",
            "roles",
            "security",
          ].map((t) => (
            <TabsTrigger key={t} value={t} className="rounded-lg capitalize">
              {t}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="platform" className="mt-5 rounded-2xl card-premium p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Platform name</Label>
              <Input defaultValue="Luma" className="mt-1 rounded-xl" />
            </div>
            <div>
              <Label>Support email</Label>
              <Input defaultValue="support@luma.ai" className="mt-1 rounded-xl" />
            </div>
            <div>
              <Label>Primary currency</Label>
              <Input defaultValue="INR" className="mt-1 rounded-xl" />
            </div>
            <div>
              <Label>Timezone</Label>
              <Input defaultValue="Asia/Kolkata" className="mt-1 rounded-xl" />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="notifications" className="mt-5 rounded-2xl card-premium p-6 space-y-3">
          {[
            "Email students on new course launch",
            "Email instructors on payout",
            "Slack alerts for failed payments",
            "SMS for refund requests",
          ].map((s, i) => (
            <div key={s} className="flex items-center justify-between rounded-xl bg-muted/30 p-4">
              <span className="text-sm">{s}</span>
              <Switch defaultChecked={i % 2 === 0} />
            </div>
          ))}
        </TabsContent>

        <TabsContent value="security" className="mt-5 rounded-2xl card-premium p-6 space-y-3">
          {[
            "Enforce 2FA for admins",
            "Require strong passwords",
            "Audit log retention 90 days",
            "IP allowlist",
          ].map((s, i) => (
            <div key={s} className="flex items-center justify-between rounded-xl bg-muted/30 p-4">
              <span className="text-sm">{s}</span>
              <Switch defaultChecked={i < 3} />
            </div>
          ))}
        </TabsContent>

        {["payment", "email", "certificate", "roles"].map((t) => (
          <TabsContent
            key={t}
            value={t}
            className="mt-5 rounded-2xl card-premium p-10 text-center text-sm text-muted-foreground"
          >
            {t} configuration UI lives here.
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

