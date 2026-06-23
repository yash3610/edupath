import { Inbox } from "lucide-react";
export function EmptyState({ icon, title, description, action }) {
  return (
    <div className="rounded-2xl border border-dashed border-border/60 bg-muted/20 p-10 text-center">
      <div className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-2xl gradient-primary shadow-glow">
        {icon ?? <Inbox className="h-6 w-6 text-primary-foreground" />}
      </div>
      <h3 className="font-display text-lg font-semibold">{title}</h3>
      {description && (
        <p className="mx-auto mt-1.5 max-w-sm text-sm text-muted-foreground">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
