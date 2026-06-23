import { useState } from "react";
import { LmsPageHeader } from "@/features/shared/components/PageHeader";
import { Button } from "@/components/ui/button";
import { instructorNotifications } from "@/features/instructor/data/instructor";
import { toast } from "sonner";
export default function NotifPage() {
  const [list, setList] = useState(instructorNotifications);
  const unread = list.filter((n) => !n.read).length;
  const toggle = (id) => setList((l) => l.map((n) => (n.id === id ? { ...n, read: !n.read } : n)));
  const markAll = () => {
    setList((l) => l.map((n) => ({ ...n, read: true })));
    toast.success("All marked read");
  };
  return (
    <div className="mx-auto max-w-[900px]">
      <LmsPageHeader
        eyebrow="Account"
        title="Notifications"
        description={`${unread} unread · course, payment, review and Q&A activity.`}
        actions={
          unread > 0 ? (
            <Button variant="outline" className="rounded-xl border-border/60" onClick={markAll}>
              Mark all read
            </Button>
          ) : undefined
        }
      />
      <ol className="space-y-2">
        {list.map((n) => (
          <li key={n.id}>
            <button
              onClick={() => toggle(n.id)}
              className={`w-full rounded-2xl p-4 text-left transition hover:bg-muted/30 ${n.read ? "card-premium opacity-70" : "card-premium ring-1 ring-primary/30"}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-xs uppercase tracking-wider text-muted-foreground">
                    {n.type}
                  </div>
                  <div className="mt-1 font-medium">{n.title}</div>
                </div>
                <div className="text-xs text-muted-foreground">{n.time}</div>
              </div>
            </button>
          </li>
        ))}
      </ol>
    </div>
  );
}

