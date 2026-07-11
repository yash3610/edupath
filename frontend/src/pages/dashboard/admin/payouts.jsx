import { useMemo } from "react";
import { Download, Send } from "lucide-react";
import { toast } from "sonner";
import { LmsPageHeader } from "@/features/shared/components/PageHeader";
import { DataTable } from "@/features/shared/components/DataTable";
import { StatusBadge } from "@/features/shared/components/StatusBadge";
import { StatCard } from "@/features/shared/components/StatCard";
import { Button } from "@/components/ui/button";
import { adminInstructors } from "@/features/admin/data/admin";

const money = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

export default function AdminPayoutsPage() {
  const payouts = useMemo(
    () =>
      adminInstructors.map((instructor, index) => ({
        id: `PO-${2400 + index}`,
        instructor: instructor.name,
        email: instructor.email,
        amount: Math.round(instructor.revenue * 0.62),
        platformFee: Math.round(instructor.revenue * 0.18),
        method: ["Bank Transfer", "UPI", "Bank Transfer", "Wallet"][index % 4],
        requested: `Jul ${(index % 12) + 1}, 2026`,
        status: ["paid", "pending", "processing", "paid", "paid", "failed"][index % 6],
      })),
    [],
  );

  const pendingTotal = payouts
    .filter((payout) => payout.status === "pending" || payout.status === "processing")
    .reduce((sum, payout) => sum + payout.amount, 0);
  const paidTotal = payouts
    .filter((payout) => payout.status === "paid")
    .reduce((sum, payout) => sum + payout.amount, 0);
  const failed = payouts.filter((payout) => payout.status === "failed").length;

  const columns = [
    {
      key: "id",
      header: "Payout",
      render: (row) => <span className="font-mono text-xs text-primary">{row.id}</span>,
    },
    {
      key: "instructor",
      header: "Instructor",
      sort: (a, b) => a.instructor.localeCompare(b.instructor),
      render: (row) => (
        <div>
          <div className="text-sm font-medium">{row.instructor}</div>
          <div className="text-xs text-muted-foreground">{row.email}</div>
        </div>
      ),
    },
    {
      key: "amount",
      header: "Amount",
      sort: (a, b) => a.amount - b.amount,
      render: (row) => <span className="font-medium">{money(row.amount)}</span>,
    },
    {
      key: "platformFee",
      header: "Platform fee",
      sort: (a, b) => a.platformFee - b.platformFee,
      render: (row) => money(row.platformFee),
    },
    { key: "method", header: "Method", render: (row) => row.method },
    {
      key: "requested",
      header: "Requested",
      render: (row) => <span className="text-sm text-muted-foreground">{row.requested}</span>,
    },
    {
      key: "status",
      header: "Status",
      render: (row) => <StatusBadge status={row.status} />,
    },
  ];

  return (
    <div className="mx-auto max-w-[1500px]">
      <LmsPageHeader
        eyebrow="Commerce"
        title="Payouts"
        description="Admin-managed instructor payout queue and settlement history."
        actions={
          <>
            <Button
              variant="outline"
              className="rounded-xl border-border/60"
              onClick={() => toast.success("Payout CSV exported")}
            >
              <Download className="mr-1.5 h-4 w-4" /> Export
            </Button>
            <Button
              className="rounded-xl gradient-primary border-0 text-primary-foreground"
              onClick={() => toast.success("Pending payouts queued for review")}
            >
              <Send className="mr-1.5 h-4 w-4" /> Process queue
            </Button>
          </>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Paid out" value={money(paidTotal)} delta={8.5} icon="Wallet" index={0} />
        <StatCard label="Pending queue" value={money(pendingTotal)} delta={3.2} icon="Clock" index={1} />
        <StatCard label="Requests" value={payouts.length} delta={6.4} icon="Receipt" index={2} />
        <StatCard label="Failed" value={failed} delta={-12.5} trend="down" icon="AlertCircle" index={3} />
      </div>

      <DataTable
        rows={payouts}
        columns={columns}
        searchKeys={["id", "instructor", "email", "method", "status"]}
        actions={[
          { label: "Mark as paid", onClick: (row) => toast.success(`${row.id} marked as paid`) },
          { label: "Retry payout", onClick: (row) => toast.success(`Retry queued for ${row.id}`) },
          { label: "Hold payout", onClick: (row) => toast.warning(`${row.id} placed on hold`) },
        ]}
      />
    </div>
  );
}
