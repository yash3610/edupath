import { LmsPageHeader } from "@/features/shared/components/PageHeader";
import { DataTable } from "@/features/shared/components/DataTable";
import { StatusBadge } from "@/features/shared/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { adminCertificates } from "@/features/admin/data/admin";
import { toast } from "sonner";
import usePersistedDashboardState from "@/hooks/usePersistedDashboardState";
export default function Page() {
  const [list, setList] = usePersistedDashboardState("admin", "adminCertificates", adminCertificates);
  const cols = [
    {
      key: "id",
      header: "Certificate ID",
      render: (r) => <span className="font-mono text-xs text-primary">{r.id}</span>,
    },
    {
      key: "student",
      header: "Student",
      render: (r) => <span className="font-medium">{r.student}</span>,
    },
    {
      key: "course",
      header: "Course",
      render: (r) => <span className="text-sm text-muted-foreground">{r.course}</span>,
    },
    { key: "instructor", header: "Instructor", render: (r) => r.instructor },
    { key: "issued", header: "Issued", render: (r) => r.issued },
    {
      key: "status",
      header: "Status",
      render: (r) => <StatusBadge status={r.status} />,
    },
  ];
  return (
    <div className="mx-auto max-w-[1500px]">
      <LmsPageHeader
        eyebrow="Catalog"
        title="Certificates"
        description="Issued certificates — verify, download, or revoke."
        actions={
          <Button variant="outline" className="rounded-xl border-border/60">
            <Download className="mr-1.5 h-4 w-4" /> Export
          </Button>
        }
      />
      <DataTable
        rows={list}
        columns={cols}
        searchKeys={["id", "student", "course"]}
        actions={[
          {
            label: "Verify",
            onClick: () => toast.success("Certificate is valid"),
          },
          { label: "Download PDF", onClick: () => toast("Downloading…") },
          {
            label: "Revoke",
            onClick: (r) => {
              setList((items) => items.map((item) => item.id === r.id ? { ...item, status: "revoked" } : item));
              toast.error(`Revoked ${r.id}`);
            },
            danger: true,
          },
        ]}
      />
    </div>
  );
}

