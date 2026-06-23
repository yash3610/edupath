import { LmsPageHeader } from "@/features/shared/components/PageHeader";
import { Button } from "@/components/ui/button";
import { notificationsLog } from "@/features/admin/data/admin";
import { toast } from "sonner";
export default function Page() {
  return (
    <div className="mx-auto max-w-[900px]">
      <LmsPageHeader
        eyebrow="Overview"
        title="Notifications"
        description="System, payment and content events."
        actions={
          <Button
            variant="outline"
            className="rounded-xl border-border/60"
            onClick={() => toast.success("All marked as read")}
          >
            Mark all read
          </Button>
        }
      />
      <ol className="relative space-y-3 pl-6">
        <span className="absolute left-2 top-2 bottom-2 w-px bg-border/60" />
        {notificationsLog.map((n) => (
          <li key={n.id} className="relative rounded-2xl card-premium p-4">
            <span className="absolute -left-[14px] top-5 h-3 w-3 rounded-full gradient-primary shadow-glow" />
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-sm font-medium">{n.title}</div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground">
                  {n.type}
                </div>
              </div>
              <div className="text-xs text-muted-foreground">{n.time}</div>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

