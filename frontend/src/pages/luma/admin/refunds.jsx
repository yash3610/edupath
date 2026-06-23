import { useState } from "react";
import { LmsPageHeader } from "@/features/shared/components/PageHeader";
import { StatusBadge } from "@/features/shared/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { adminRefunds } from "@/features/admin/data/admin";
import { inr } from "@/features/shared/utils/format";
import { toast } from "sonner";
export default function RefundsPage() {
  const [tab, setTab] = useState("all");
  const rows = adminRefunds.filter((r) => tab === "all" || r.status === tab);
  return (
    <div className="mx-auto max-w-[1300px]">
      <LmsPageHeader
        eyebrow="Commerce"
        title="Refunds"
        description="Review and act on refund requests."
      />
      <Tabs value={tab} onValueChange={setTab} className="mb-5">
        <TabsList className="rounded-xl bg-muted/60 p-1">
          {["all", "pending", "approved", "rejected"].map((s) => (
            <TabsTrigger key={s} value={s} className="rounded-lg capitalize">
              {s}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="grid gap-4 md:grid-cols-2">
        {rows.map((r) => (
          <div key={r.id} className="rounded-2xl card-premium p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback>{r.student[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-display text-base font-semibold">{r.student}</div>
                  <div className="text-xs text-muted-foreground">
                    {r.date} · {r.id}
                  </div>
                </div>
              </div>
              <StatusBadge status={r.status} />
            </div>
            <div className="mt-3 text-sm">{r.course}</div>
            <div className="mt-1 text-xs text-muted-foreground">Reason · {r.reason}</div>
            <div className="mt-3 flex items-center justify-between rounded-xl bg-muted/30 p-3">
              <span className="text-xs text-muted-foreground">Refund amount</span>
              <span className="font-display text-lg font-semibold">{inr(r.amount)}</span>
            </div>
            {r.status === "pending" && (
              <div className="mt-4 flex gap-2">
                <Button
                  size="sm"
                  className="flex-1 rounded-lg gradient-primary border-0 text-primary-foreground"
                  onClick={() => toast.success(`Refund ${r.id} approved`)}
                >
                  Approve
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-lg border-destructive/40 text-destructive hover:bg-destructive/10"
                  onClick={() => toast.error(`Refund ${r.id} rejected`)}
                >
                  Reject
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

