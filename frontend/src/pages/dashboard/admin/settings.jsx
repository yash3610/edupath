import { useEffect, useState } from "react";
import { Save, RotateCcw } from "lucide-react";
import { LmsPageHeader } from "@/features/shared/components/PageHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiRequest } from "@/services/api";
import { toast } from "sonner";

const fallbackSettings = {
  platform: {
    name: "EduPath",
    supportEmail: "support@edupath.com",
    currency: "INR",
    timezone: "Asia/Kolkata",
    language: "English",
    maintenanceMode: false,
  },
  payment: {
    provider: "razorpay",
    mode: "test",
    currency: "INR",
    taxPercent: 18,
    minimumOrderAmount: 1,
    enableCoupons: true,
    enableRefunds: true,
  },
  email: {
    fromName: "EduPath",
    fromEmail: "support@edupath.com",
    smtpHost: "",
    smtpPort: 587,
    replyTo: "support@edupath.com",
    enableTransactionalEmail: true,
  },
  certificate: {
    issuerName: "EduPath Academy",
    signatureName: "EduPath Admin",
    verificationPrefix: "/api/certificates/verify",
    autoIssue: true,
    requireFullProgress: true,
    requireQuizPass: false,
    requireAssignmentCompletion: false,
  },
  notifications: {
    courseLaunchEmail: true,
    instructorPayoutEmail: true,
    failedPaymentAlert: true,
    refundRequestSms: false,
    adminDigestEmail: true,
    liveClassReminder: true,
  },
  roles: {
    allowInstructorSignup: false,
    requireInstructorApproval: true,
    defaultStudentStatus: "active",
    defaultInstructorStatus: "pending",
    studentCanDeleteAccount: true,
    instructorCanCreateLiveClasses: true,
  },
  security: {
    enforceAdmin2fa: false,
    requireStrongPasswords: true,
    auditLogRetentionDays: 90,
    sessionTimeoutMinutes: 15,
    maxLoginAttempts: 5,
    ipAllowlist: "",
  },
};

const tabs = ["platform", "payment", "email", "certificate", "notifications", "roles", "security"];

function mergeSettings(source) {
  return Object.fromEntries(
    Object.entries(fallbackSettings).map(([section, values]) => [section, { ...values, ...(source?.[section] || {}) }]),
  );
}

function Field({ section, name, label, type = "text", settings, setValue }) {
  return (
    <div>
      <Label htmlFor={`${section}-${name}`}>{label}</Label>
      <Input
        id={`${section}-${name}`}
        type={type}
        value={settings[section][name] ?? ""}
        onChange={(event) => setValue(section, name, type === "number" ? Number(event.target.value) : event.target.value)}
        className="mt-1 rounded-xl"
      />
    </div>
  );
}

function Toggle({ section, name, label, settings, setValue }) {
  return (
    <div className="flex min-h-14 items-center justify-between gap-4 rounded-xl bg-muted/30 p-4">
      <span className="text-sm font-medium">{label}</span>
      <Switch checked={Boolean(settings[section][name])} onCheckedChange={(checked) => setValue(section, name, checked)} />
    </div>
  );
}

function SelectField({ section, name, label, options, settings, setValue }) {
  return (
    <div>
      <Label>{label}</Label>
      <Select value={String(settings[section][name] || "")} onValueChange={(value) => setValue(section, name, value)}>
        <SelectTrigger className="mt-1 rounded-xl">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option} value={option}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export default function Page() {
  const [settings, setSettings] = useState(fallbackSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    apiRequest("/api/settings/admin/platform")
      .then((result) => setSettings(mergeSettings(result.data)))
      .catch((error) => toast.error(error.message || "Settings could not be loaded"))
      .finally(() => setLoading(false));
  }, []);

  function setValue(section, name, value) {
    setSettings((current) => ({
      ...current,
      [section]: { ...current[section], [name]: value },
    }));
  }

  async function saveSettings() {
    setSaving(true);
    try {
      const result = await apiRequest("/api/settings/admin/platform", {
        method: "PATCH",
        body: JSON.stringify(settings),
      });
      setSettings(mergeSettings(result.data));
      toast.success("Platform settings saved");
    } catch (error) {
      toast.error(error.message || "Settings could not be saved");
    } finally {
      setSaving(false);
    }
  }

  function resetDefaults() {
    setSettings(fallbackSettings);
    toast.message("Defaults restored locally. Save to apply.");
  }

  return (
    <div className="mx-auto max-w-[1100px]">
      <LmsPageHeader
        eyebrow="Admin"
        title="Platform Settings"
        description="Manage platform, payment, email, certificate, notification, role and security defaults."
      />
      <Tabs defaultValue="platform">
        <TabsList className="h-auto flex-wrap rounded-xl bg-muted/60 p-1">
          {tabs.map((tab) => (
            <TabsTrigger key={tab} value={tab} className="rounded-lg capitalize">
              {tab}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="platform" className="mt-5 rounded-2xl card-premium p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field section="platform" name="name" label="Platform name" settings={settings} setValue={setValue} />
            <Field section="platform" name="supportEmail" label="Support email" type="email" settings={settings} setValue={setValue} />
            <SelectField section="platform" name="currency" label="Primary currency" options={["INR", "USD", "EUR"]} settings={settings} setValue={setValue} />
            <Field section="platform" name="timezone" label="Timezone" settings={settings} setValue={setValue} />
            <SelectField section="platform" name="language" label="Default language" options={["English", "Hindi", "Marathi"]} settings={settings} setValue={setValue} />
            <Toggle section="platform" name="maintenanceMode" label="Maintenance mode" settings={settings} setValue={setValue} />
          </div>
        </TabsContent>

        <TabsContent value="payment" className="mt-5 rounded-2xl card-premium p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <SelectField section="payment" name="provider" label="Payment provider" options={["razorpay", "stripe", "cashfree"]} settings={settings} setValue={setValue} />
            <SelectField section="payment" name="mode" label="Gateway mode" options={["test", "live"]} settings={settings} setValue={setValue} />
            <SelectField section="payment" name="currency" label="Payment currency" options={["INR", "USD", "EUR"]} settings={settings} setValue={setValue} />
            <Field section="payment" name="taxPercent" label="Tax percent" type="number" settings={settings} setValue={setValue} />
            <Field section="payment" name="minimumOrderAmount" label="Minimum order amount" type="number" settings={settings} setValue={setValue} />
            <Toggle section="payment" name="enableCoupons" label="Enable coupons" settings={settings} setValue={setValue} />
            <Toggle section="payment" name="enableRefunds" label="Enable refund requests" settings={settings} setValue={setValue} />
          </div>
        </TabsContent>

        <TabsContent value="email" className="mt-5 rounded-2xl card-premium p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field section="email" name="fromName" label="From name" settings={settings} setValue={setValue} />
            <Field section="email" name="fromEmail" label="From email" type="email" settings={settings} setValue={setValue} />
            <Field section="email" name="replyTo" label="Reply-to email" type="email" settings={settings} setValue={setValue} />
            <Field section="email" name="smtpHost" label="SMTP host" settings={settings} setValue={setValue} />
            <Field section="email" name="smtpPort" label="SMTP port" type="number" settings={settings} setValue={setValue} />
            <Toggle section="email" name="enableTransactionalEmail" label="Transactional email" settings={settings} setValue={setValue} />
          </div>
        </TabsContent>

        <TabsContent value="certificate" className="mt-5 rounded-2xl card-premium p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field section="certificate" name="issuerName" label="Issuer name" settings={settings} setValue={setValue} />
            <Field section="certificate" name="signatureName" label="Signature name" settings={settings} setValue={setValue} />
            <Field section="certificate" name="verificationPrefix" label="Verification URL prefix" settings={settings} setValue={setValue} />
            <Toggle section="certificate" name="autoIssue" label="Auto issue certificates" settings={settings} setValue={setValue} />
            <Toggle section="certificate" name="requireFullProgress" label="Require full course progress" settings={settings} setValue={setValue} />
            <Toggle section="certificate" name="requireQuizPass" label="Require quiz pass" settings={settings} setValue={setValue} />
            <Toggle section="certificate" name="requireAssignmentCompletion" label="Require assignment completion" settings={settings} setValue={setValue} />
          </div>
        </TabsContent>

        <TabsContent value="notifications" className="mt-5 rounded-2xl card-premium p-6">
          <div className="grid gap-3 sm:grid-cols-2">
            <Toggle section="notifications" name="courseLaunchEmail" label="Email students on new course launch" settings={settings} setValue={setValue} />
            <Toggle section="notifications" name="instructorPayoutEmail" label="Email instructors on payout" settings={settings} setValue={setValue} />
            <Toggle section="notifications" name="failedPaymentAlert" label="Admin alerts for failed payments" settings={settings} setValue={setValue} />
            <Toggle section="notifications" name="refundRequestSms" label="SMS for refund requests" settings={settings} setValue={setValue} />
            <Toggle section="notifications" name="adminDigestEmail" label="Daily admin digest email" settings={settings} setValue={setValue} />
            <Toggle section="notifications" name="liveClassReminder" label="Live class reminders" settings={settings} setValue={setValue} />
          </div>
        </TabsContent>

        <TabsContent value="roles" className="mt-5 rounded-2xl card-premium p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <SelectField section="roles" name="defaultStudentStatus" label="Default student status" options={["active", "pending", "blocked"]} settings={settings} setValue={setValue} />
            <SelectField section="roles" name="defaultInstructorStatus" label="Default instructor status" options={["active", "pending", "blocked"]} settings={settings} setValue={setValue} />
            <Toggle section="roles" name="allowInstructorSignup" label="Allow instructor signup" settings={settings} setValue={setValue} />
            <Toggle section="roles" name="requireInstructorApproval" label="Require instructor approval" settings={settings} setValue={setValue} />
            <Toggle section="roles" name="studentCanDeleteAccount" label="Students can delete account" settings={settings} setValue={setValue} />
            <Toggle section="roles" name="instructorCanCreateLiveClasses" label="Instructors can create live classes" settings={settings} setValue={setValue} />
          </div>
        </TabsContent>

        <TabsContent value="security" className="mt-5 rounded-2xl card-premium p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <Toggle section="security" name="enforceAdmin2fa" label="Enforce 2FA for admins" settings={settings} setValue={setValue} />
            <Toggle section="security" name="requireStrongPasswords" label="Require strong passwords" settings={settings} setValue={setValue} />
            <Field section="security" name="auditLogRetentionDays" label="Audit log retention days" type="number" settings={settings} setValue={setValue} />
            <Field section="security" name="sessionTimeoutMinutes" label="Session timeout minutes" type="number" settings={settings} setValue={setValue} />
            <Field section="security" name="maxLoginAttempts" label="Max login attempts" type="number" settings={settings} setValue={setValue} />
            <div className="sm:col-span-2">
              <Label htmlFor="security-ipAllowlist">IP allowlist</Label>
              <Textarea
                id="security-ipAllowlist"
                value={settings.security.ipAllowlist || ""}
                onChange={(event) => setValue("security", "ipAllowlist", event.target.value)}
                className="mt-1 min-h-24 rounded-xl"
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <div className="mt-5 flex flex-wrap gap-3">
        <Button className="rounded-xl gradient-primary border-0 text-primary-foreground" onClick={saveSettings} disabled={saving || loading}>
          <Save className="h-4 w-4" /> {saving ? "Saving..." : "Save changes"}
        </Button>
        <Button type="button" variant="outline" className="rounded-xl" onClick={resetDefaults} disabled={saving || loading}>
          <RotateCcw className="h-4 w-4" /> Reset defaults
        </Button>
      </div>
    </div>
  );
}
