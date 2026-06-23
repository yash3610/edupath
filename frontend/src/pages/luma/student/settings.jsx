import { useState } from "react";
import { PageHeader } from "@/features/student/components/PageHeader";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
const sections = [
  {
    title: "Preferences",
    items: [
      {
        k: "Email notifications",
        d: "Weekly recap, new lectures, replies",
        on: true,
      },
      {
        k: "Push notifications",
        d: "Reminders for live classes and quizzes",
        on: true,
      },
      { k: "Sound effects", d: "Subtle audio cues across the app", on: false },
    ],
  },
  {
    title: "Learning",
    items: [
      {
        k: "Autoplay next lecture",
        d: "Continue automatically when one ends",
        on: true,
      },
      { k: "Closed captions", d: "Always show subtitles", on: false },
      { k: "Slow-mode (0.9x default)", d: "Default playback speed", on: false },
    ],
  },
  {
    title: "Privacy",
    items: [
      {
        k: "Public profile",
        d: "Show your profile on the leaderboard",
        on: true,
      },
      {
        k: "AI personalization",
        d: "Use my activity to improve recommendations",
        on: true,
      },
    ],
  },
];
export default function SettingsPage() {
  const [pw, setPw] = useState({ current: "", next: "" });
  const [confirmDel, setConfirmDel] = useState(false);
  const updatePw = () => {
    if (!pw.current || !pw.next) {
      toast.error("Both fields required");
      return;
    }
    if (pw.next.length < 8) {
      toast.error("New password must be at least 8 chars");
      return;
    }
    setPw({ current: "", next: "" });
    toast.success("Password updated");
  };
  return (
    <div className="mx-auto max-w-[1000px]">
      <PageHeader eyebrow="Account" title="Settings" description="Tune Luma to fit your taste." />

      <div className="space-y-6">
        {sections.map((s) => (
          <section key={s.title} className="rounded-2xl card-premium overflow-hidden">
            <div className="border-b border-border/60 px-6 py-4">
              <h2 className="font-display text-lg font-semibold">{s.title}</h2>
            </div>
            <ul className="divide-y divide-border/60">
              {s.items.map((it) => (
                <li key={it.k} className="flex items-center justify-between gap-6 px-6 py-4">
                  <div>
                    <div className="text-sm font-medium">{it.k}</div>
                    <div className="text-xs text-muted-foreground">{it.d}</div>
                  </div>
                  <Switch
                    defaultChecked={it.on}
                    onCheckedChange={(v) => toast(`${it.k} ${v ? "on" : "off"}`)}
                  />
                </li>
              ))}
            </ul>
          </section>
        ))}

        <section className="rounded-2xl card-premium p-6">
          <h2 className="font-display text-lg font-semibold">Change password</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <Input
              type="password"
              placeholder="Current password"
              className="h-11 rounded-xl"
              value={pw.current}
              onChange={(e) => setPw({ ...pw, current: e.target.value })}
            />
            <Input
              type="password"
              placeholder="New password"
              className="h-11 rounded-xl"
              value={pw.next}
              onChange={(e) => setPw({ ...pw, next: e.target.value })}
            />
          </div>
          <Button
            className="mt-4 rounded-xl gradient-primary border-0 text-primary-foreground"
            onClick={updatePw}
          >
            Update password
          </Button>
        </section>

        <section className="rounded-2xl border border-destructive/40 bg-destructive/5 p-6">
          <h2 className="font-display text-lg font-semibold text-destructive">Danger zone</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Delete your account and all associated data. This cannot be undone.
          </p>
          <Button
            variant="destructive"
            className="mt-4 rounded-xl"
            onClick={() => setConfirmDel(true)}
          >
            Delete account
          </Button>
        </section>
      </div>

      <AlertDialog open={confirmDel} onOpenChange={setConfirmDel}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display">Delete your account?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently deletes your courses, certificates, notes, and orders. This cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => toast.error("Account scheduled for deletion in 24h")}
            >
              Yes, delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

