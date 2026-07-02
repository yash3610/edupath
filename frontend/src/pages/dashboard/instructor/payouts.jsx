import { LmsPageHeader } from "@/features/shared/components/PageHeader";
import { DataTable } from "@/features/shared/components/DataTable";
import { StatusBadge } from "@/features/shared/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Wallet } from "lucide-react";
import { payoutHistory } from "@/features/instructor/data/instructor";
import { inr } from "@/features/shared/utils/format";
import { toast } from "sonner";
export default function Page() {
  const cols = [
    {
      key: "id",
      header: "Payout",
      render: (r) => <span className="font-mono text-xs text-primary">{r.id}</span>,
    },
    {
      key: "amount",
      header: "Amount",
      sort: (a, b) => a.amount - b.amount,
      render: (r) => <span className="font-medium">{inr(r.amount)}</span>,
    },
    {
      key: "status",
      header: "Status",
      render: (r) => <StatusBadge status={r.status} />,
    },
    { key: "requested", header: "Requested", render: (r) => r.requested },
    { key: "paid", header: "Paid", render: (r) => r.paid },
    { key: "method", header: "Method", render: (r) => r.method },
  ];
  return (
    <div className="mx-auto max-w-[1300px]">
      <LmsPageHeader
        eyebrow="Money"
        title="Payouts"
        description="Withdraw your earnings to your linked bank account."
        actions={
          <Button
            className="rounded-xl gradient-primary border-0 text-primary-foreground"
            onClick={() => toast.success("Payout requested · ₹4.12L")}
          >
            <Wallet className="mr-1.5 h-4 w-4" /> Request payout
          </Button>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Box t="Lifetime" v={inr(2840000)} />
        <Box t="Available" v={inr(412000)} />
        <Box t="Next payout" v="Jul 02, 2026" />
      </div>

      <DataTable rows={payoutHistory} columns={cols} searchKeys={["id"]} />
    </div>
  );
}
function Box({ t, v }) {
  return (
    <div className="rounded-2xl card-premium p-5">
      <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">{t}</div>
      <div className="mt-1.5 font-display text-2xl font-semibold">{v}</div>
    </div>
  );
}

