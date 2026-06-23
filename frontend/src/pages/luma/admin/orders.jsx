import { Download, Filter } from "lucide-react";
import { LmsPageHeader } from "@/features/shared/components/PageHeader";
import { DataTable } from "@/features/shared/components/DataTable";
import { StatusBadge } from "@/features/shared/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { adminOrders } from "@/features/admin/data/admin";
import { inr } from "@/features/shared/utils/format";
import { toast } from "sonner";
import usePersistedDashboardState from "@/hooks/usePersistedDashboardState";
export default function OrdersPage() {
  const [list, setList] = usePersistedDashboardState("admin", "adminOrders", adminOrders);
  const columns = [
    {
      key: "id",
      header: "Order",
      render: (r) => <span className="font-mono text-xs text-primary">{r.id}</span>,
    },
    {
      key: "student",
      header: "Student",
      sort: (a, b) => a.student.localeCompare(b.student),
      render: (r) => r.student,
    },
    {
      key: "course",
      header: "Course",
      render: (r) => <span className="text-sm text-muted-foreground line-clamp-1">{r.course}</span>,
    },
    {
      key: "amount",
      header: "Amount",
      sort: (a, b) => a.amount - b.amount,
      render: (r) => <span className="font-medium">{inr(r.amount)}</span>,
    },
    {
      key: "discount",
      header: "Discount",
      render: (r) =>
        r.discount ? <span className="text-success">-{inr(r.discount)}</span> : "—",
    },
    {
      key: "coupon",
      header: "Coupon",
      render: (r) => (
        <Badge variant="outline" className="border-border/60">
          {r.coupon}
        </Badge>
      ),
    },
    { key: "method", header: "Method", render: (r) => r.method },
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
  return (
    <div className="mx-auto max-w-[1500px]">
      <LmsPageHeader
        eyebrow="Commerce"
        title="Orders"
        description="Every transaction across the platform — search, filter, and export."
        actions={
          <>
            <Button variant="outline" className="rounded-xl border-border/60">
              <Filter className="mr-1.5 h-4 w-4" /> Filters
            </Button>
            <Button
              className="rounded-xl gradient-primary border-0 text-primary-foreground"
              onClick={() => toast.success("Export queued")}
            >
              <Download className="mr-1.5 h-4 w-4" /> Export CSV
            </Button>
          </>
        }
      />
      <DataTable
        rows={list}
        columns={columns}
        searchKeys={["id", "student", "course"]}
        actions={[
          { label: "View invoice", onClick: () => toast("Opening invoice…") },
          {
            label: "Issue refund",
            onClick: (r) => {
              setList((items) => items.map((item) => item.id === r.id ? { ...item, status: "refunded" } : item));
              toast.error(`Refund issued for ${r.id}`);
            },
            danger: true,
          },
        ]}
      />
    </div>
  );
}

