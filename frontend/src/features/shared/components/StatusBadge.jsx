import { cn } from "@/lib/utils";
const MAP = {
  active: "bg-success/15 text-success ring-success/30",
  approved: "bg-success/15 text-success ring-success/30",
  paid: "bg-success/15 text-success ring-success/30",
  issued: "bg-success/15 text-success ring-success/30",
  published: "bg-success/15 text-success ring-success/30",
  resolved: "bg-success/15 text-success ring-success/30",
  visible: "bg-success/15 text-success ring-success/30",
  completed: "bg-success/15 text-success ring-success/30",
  live: "bg-success/15 text-success ring-success/30",
  pending: "bg-warning/15 text-warning ring-warning/30",
  draft: "bg-warning/15 text-warning ring-warning/30",
  processing: "bg-warning/15 text-warning ring-warning/30",
  unverified: "bg-warning/15 text-warning ring-warning/30",
  upcoming: "bg-warning/15 text-warning ring-warning/30",
  open: "bg-warning/15 text-warning ring-warning/30",
  reported: "bg-warning/15 text-warning ring-warning/30",
  submitted: "bg-warning/15 text-warning ring-warning/30",
  blocked: "bg-destructive/15 text-destructive ring-destructive/30",
  rejected: "bg-destructive/15 text-destructive ring-destructive/30",
  refunded: "bg-destructive/15 text-destructive ring-destructive/30",
  failed: "bg-destructive/15 text-destructive ring-destructive/30",
  cancelled: "bg-destructive/15 text-destructive ring-destructive/30",
  revoked: "bg-destructive/15 text-destructive ring-destructive/30",
  hidden: "bg-destructive/15 text-destructive ring-destructive/30",
  inactive: "bg-muted text-muted-foreground ring-border",
  archived: "bg-muted text-muted-foreground ring-border",
  past: "bg-muted text-muted-foreground ring-border",
  graded: "bg-primary/15 text-primary ring-primary/30",
  none: "bg-muted text-muted-foreground ring-border",
  high: "bg-destructive/15 text-destructive ring-destructive/30",
  medium: "bg-warning/15 text-warning ring-warning/30",
  low: "bg-primary/15 text-primary ring-primary/30",
  easy: "bg-success/15 text-success ring-success/30",
  hard: "bg-destructive/15 text-destructive ring-destructive/30",
};
export function StatusBadge({ status, className }) {
  const cls = MAP[status] ?? "bg-primary/15 text-primary ring-primary/30";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium capitalize ring-1",
        cls,
        className,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", cls.split(" ")[1].replace("text-", "bg-"))} />
      {status}
    </span>
  );
}
