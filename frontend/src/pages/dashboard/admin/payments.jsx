import { LmsPageHeader } from "@/features/shared/components/PageHeader";
import { DataTable } from "@/features/shared/components/DataTable";
import { StatusBadge } from "@/features/shared/components/StatusBadge";
import { StatCard } from "@/features/shared/components/StatCard";
import { adminPayments, paymentMethods } from "@/features/admin/data/admin";
import { inr } from "@/features/shared/utils/format";
export default function PaymentsPage() {
  const columns = [
    {
      key: "txn",
      header: "Transaction",
      render: (r) => <span className="font-mono text-xs text-primary">{r.txn}</span>,
    },
    {
      key: "order",
      header: "Order",
      render: (r) => <span className="font-mono text-xs">{r.order}</span>,
    },
    { key: "student", header: "Student", render: (r) => r.student },
    {
      key: "amount",
      header: "Amount",
      sort: (a, b) => a.amount - b.amount,
      render: (r) => inr(r.amount),
    },
    { key: "gateway", header: "Gateway", render: (r) => r.gateway },
    {
      key: "status",
      header: "Status",
      render: (r) => <StatusBadge status={r.status} />,
    },
    {
      key: "date",
      header: "Date",
      render: (r) => <span className="text-sm text-muted-foreground">{r.date}</span>,
    },
  ];
  const total = adminPayments.filter((p) => p.status === "paid").reduce((s, p) => s + p.amount, 0);
  const failed = adminPayments.filter((p) => p.status === "failed").length;
  return (
    <div className="mx-auto max-w-[1500px]">
      <LmsPageHeader
        eyebrow="Commerce"
        title="Payments"
        description="All gateway transactions and reconciliation."
      />
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Collected"
          value={total}
          prefix="₹"
          delta={12.4}
          icon="IndianRupee"
          index={0}
        />
        <StatCard
          label="Transactions"
          value={adminPayments.length}
          delta={6.8}
          icon="CreditCard"
          index={1}
        />
        <StatCard label="Failed" value={failed} delta={-22} trend="down" icon="XCircle" index={2} />
        <StatCard
          label="Top method"
          value={paymentMethods[0].name}
          delta={paymentMethods[0].value}
          icon="Wallet"
          index={3}
        />
      </div>
      <DataTable rows={adminPayments} columns={columns} searchKeys={["txn", "order", "student"]} />
    </div>
  );
}

