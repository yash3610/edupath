import { useCallback, useEffect, useMemo, useState } from "react";
import { RefreshCcw, Save } from "lucide-react";
import { toast } from "sonner";
import { LmsPageHeader } from "@/features/shared/components/PageHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageLoader } from "@/pages/dashboard/_dynamic/LumaDynamicUtils";
import { useAuth } from "@/context/AuthContext";
import { apiRequest } from "@/services/api";
import { normalizeProfile, profileApi } from "@/services/profileApi";
import { applyDashboardTheme } from "@/utils/themePreferences";

const defaultPreferences = {
  timezone: "Asia/Kolkata",
  language: "English",
  theme: "system",
  accent: "orange",
  emailStudentQuestions: true,
  emailCourseApprovals: true,
  pushNewReviews: true,
  weeklyPerformanceDigest: true,
  publicInstructorProfile: true,
  showCourseStatsPublicly: true,
  allowStudentMessages: true,
  aiPersonalization: true,
};

const notificationItems = [
  ["emailStudentQuestions", "Email me when a student asks a question"],
  ["emailCourseApprovals", "Email me when a course is approved"],
  ["pushNewReviews", "Push notifications for new reviews"],
  ["weeklyPerformanceDigest", "Weekly performance digest"],
];

const privacyItems = [
  ["publicInstructorProfile", "Public instructor profile"],
  ["showCourseStatsPublicly", "Show course stats publicly"],
  ["allowStudentMessages", "Allow student messages"],
  ["aiPersonalization", "Use teaching activity for AI personalization"],
];

function ToggleRow({ label, checked, onChange }) {
  return (
    <div className="flex items-center justify-between gap-6 rounded-xl bg-muted/30 p-4">
      <span className="text-sm">{label}</span>
      <Switch checked={Boolean(checked)} onCheckedChange={onChange} />
    </div>
  );
}

export default function InstructorSettingsPage() {
  const { updateUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [account, setAccount] = useState({
    name: "",
    email: "",
    phone: "",
    headline: "",
    website: "",
  });
  const [preferences, setPreferences] = useState(defaultPreferences);
  const [password, setPassword] = useState({ current: "", next: "", confirm: "" });

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const [profileResponse, settingsResponse] = await Promise.allSettled([
        profileApi.me(),
        apiRequest("/api/settings"),
      ]);

      if (profileResponse.status === "fulfilled") {
        const profile = normalizeProfile(profileResponse.value.data);
        setAccount({
          name: profile.name,
          email: profile.email,
          phone: profile.phone,
          headline: profile.headline,
          website: profile.website,
        });
      } else {
        toast.error(profileResponse.reason?.message || "Unable to load account details.");
      }

      if (settingsResponse.status === "fulfilled") {
        const nextPreferences = { ...defaultPreferences, ...(settingsResponse.value.data || {}) };
        setPreferences(nextPreferences);
        applyDashboardTheme({
          theme: nextPreferences.theme,
          accent: nextPreferences.accent,
        });
      } else {
        toast.error(settingsResponse.reason?.message || "Unable to load preferences.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const profilePayload = useMemo(() => ({
    name: account.name.trim(),
    email: account.email.trim(),
    phone: account.phone.trim(),
    headline: account.headline.trim(),
    socialLinks: { website: account.website.trim() },
  }), [account]);

  function setPreference(key, value) {
    setPreferences((current) => {
      const next = { ...current, [key]: value };
      if (key === "theme" || key === "accent") {
        applyDashboardTheme({
          theme: next.theme,
          accent: next.accent,
        });
      }
      return next;
    });
  }

  async function saveSettings() {
    if (!profilePayload.name || !profilePayload.email) {
      toast.error("Name and email are required.");
      return;
    }
    try {
      setSaving(true);
      const [profileResult] = await Promise.all([
        profileApi.update(profilePayload),
        apiRequest("/api/settings", {
          method: "PATCH",
          body: JSON.stringify(preferences),
        }),
      ]);
      const nextProfile = normalizeProfile(profileResult.data);
      updateUser(nextProfile.user);
      toast.success("Settings saved successfully.");
    } catch (error) {
      toast.error(error.message || "Unable to save settings.");
    } finally {
      setSaving(false);
    }
  }

  async function updatePassword() {
    if (!password.current || !password.next || !password.confirm) {
      toast.error("Please fill all password fields.");
      return;
    }
    if (password.next.length < 8) {
      toast.error("New password must be at least 8 characters.");
      return;
    }
    if (password.next !== password.confirm) {
      toast.error("New password and confirmation do not match.");
      return;
    }
    try {
      setSaving(true);
      await apiRequest("/api/profile/change-password", {
        method: "PATCH",
        body: JSON.stringify({
          currentPassword: password.current,
          newPassword: password.next,
        }),
      });
      setPassword({ current: "", next: "", confirm: "" });
      toast.success("Password updated successfully.");
    } catch (error) {
      toast.error(error.message || "Unable to update password.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <PageLoader label="Loading settings" />;

  return (
    <div className="mx-auto max-w-[1100px]">
      <LmsPageHeader
        eyebrow="Account"
        title="Settings"
        description="Manage account, notifications, privacy and teaching preferences."
        actions={
          <Button variant="outline" className="rounded-xl border-border/60" onClick={load}>
            <RefreshCcw className="mr-2 h-4 w-4" /> Refresh
          </Button>
        }
      />

      <Tabs defaultValue="account">
        <TabsList className="h-auto flex-wrap rounded-xl bg-muted/60 p-1">
          {["account", "notifications", "privacy", "theme", "password"].map((tab) => (
            <TabsTrigger key={tab} value={tab} className="rounded-lg capitalize">
              {tab}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="account" className="mt-5 rounded-2xl card-premium p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Display name</Label>
              <Input
                value={account.name}
                onChange={(event) => setAccount((current) => ({ ...current, name: event.target.value }))}
                className="mt-1 rounded-xl"
              />
            </div>
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={account.email}
                onChange={(event) => setAccount((current) => ({ ...current, email: event.target.value }))}
                className="mt-1 rounded-xl"
              />
            </div>
            <div>
              <Label>Phone</Label>
              <Input
                value={account.phone}
                onChange={(event) => setAccount((current) => ({ ...current, phone: event.target.value }))}
                className="mt-1 rounded-xl"
                placeholder="+91..."
              />
            </div>
            <div>
              <Label>Headline</Label>
              <Input
                value={account.headline}
                onChange={(event) => setAccount((current) => ({ ...current, headline: event.target.value }))}
                className="mt-1 rounded-xl"
                placeholder="Senior frontend instructor"
              />
            </div>
            <div>
              <Label>Website</Label>
              <Input
                value={account.website}
                onChange={(event) => setAccount((current) => ({ ...current, website: event.target.value }))}
                className="mt-1 rounded-xl"
                placeholder="https://..."
              />
            </div>
            <div>
              <Label>Timezone</Label>
              <Input
                value={preferences.timezone}
                onChange={(event) => setPreference("timezone", event.target.value)}
                className="mt-1 rounded-xl"
              />
            </div>
            <div>
              <Label>Language</Label>
              <Select value={preferences.language} onValueChange={(value) => setPreference("language", value)}>
                <SelectTrigger className="mt-1 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["English", "Hindi", "Marathi"].map((language) => (
                    <SelectItem key={language} value={language}>
                      {language}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="notifications" className="mt-5 rounded-2xl card-premium p-6">
          <div className="space-y-3">
            {notificationItems.map(([key, label]) => (
              <ToggleRow
                key={key}
                label={label}
                checked={preferences[key]}
                onChange={(value) => setPreference(key, value)}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="privacy" className="mt-5 rounded-2xl card-premium p-6">
          <div className="space-y-3">
            {privacyItems.map(([key, label]) => (
              <ToggleRow
                key={key}
                label={label}
                checked={preferences[key]}
                onChange={(value) => setPreference(key, value)}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="theme" className="mt-5 rounded-2xl card-premium p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Theme</Label>
              <Select value={preferences.theme} onValueChange={(value) => setPreference("theme", value)}>
                <SelectTrigger className="mt-1 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="system">System</SelectItem>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Accent</Label>
              <Select value={preferences.accent} onValueChange={(value) => setPreference("accent", value)}>
                <SelectTrigger className="mt-1 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="orange">Orange</SelectItem>
                  <SelectItem value="blue">Blue</SelectItem>
                  <SelectItem value="green">Green</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="password" className="mt-5 rounded-2xl card-premium p-6">
          <div className="grid gap-4 sm:max-w-md">
            <div>
              <Label>Current password</Label>
              <Input
                type="password"
                value={password.current}
                onChange={(event) => setPassword((current) => ({ ...current, current: event.target.value }))}
                className="mt-1 rounded-xl"
              />
            </div>
            <div>
              <Label>New password</Label>
              <Input
                type="password"
                value={password.next}
                onChange={(event) => setPassword((current) => ({ ...current, next: event.target.value }))}
                className="mt-1 rounded-xl"
              />
            </div>
            <div>
              <Label>Confirm new password</Label>
              <Input
                type="password"
                value={password.confirm}
                onChange={(event) => setPassword((current) => ({ ...current, confirm: event.target.value }))}
                className="mt-1 rounded-xl"
              />
            </div>
            <Button className="rounded-xl" onClick={updatePassword} disabled={saving}>
              Update password
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      <div className="mt-5">
        <Button
          className="rounded-xl gradient-primary border-0 text-primary-foreground"
          onClick={saveSettings}
          disabled={saving}
        >
          <Save className="mr-2 h-4 w-4" /> {saving ? "Saving..." : "Save changes"}
        </Button>
      </div>
    </div>
  );
}
