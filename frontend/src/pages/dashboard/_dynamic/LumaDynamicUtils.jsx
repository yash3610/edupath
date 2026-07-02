import { Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

export const unwrap = (result, fallback = null) => result?.data ?? result ?? fallback;

export const moneyInr = (value = 0) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(Number(value || 0));

export const formatDateTime = (value) =>
  value ? new Date(value).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : "Not scheduled";

export function PageLoader({ label = "Loading data" }) {
  return (
    <div className="grid min-h-[360px] place-items-center rounded-2xl card-premium">
      <div className="flex items-center gap-3 text-sm font-medium text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
        {label}
      </div>
    </div>
  );
}

export function MetricCard({ icon: Icon, label, value, helper }) {
  return (
    <div className="rounded-2xl card-premium p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </div>
        {helper && <Badge variant="secondary" className="rounded-full">{helper}</Badge>}
      </div>
      <p className="mt-5 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-semibold tracking-tight">{value}</p>
    </div>
  );
}

export function EmptyPanel({ title = "Nothing here yet", description = "Data will appear here once it is available.", action }) {
  return (
    <div className="rounded-2xl card-premium p-8 text-center">
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function ActionButton({ loading, children, ...props }) {
  return (
    <Button {...props} disabled={loading || props.disabled}>
      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {children}
    </Button>
  );
}

export function CompletionLine({ value = 0 }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>Progress</span>
        <span>{Math.round(value)}%</span>
      </div>
      <Progress value={Math.min(100, Math.max(0, Number(value) || 0))} />
    </div>
  );
}
