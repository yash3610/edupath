import { LmsPageHeader } from "@/features/shared/components/PageHeader";
import { DataTable } from "@/features/shared/components/DataTable";
import { StatusBadge } from "@/features/shared/components/StatusBadge";
import { adminAssignments } from "@/features/admin/data/admin";
import { toast } from "sonner";
export default function Page() {
  const cols = [
    {
      key: "title",
      header: "Assignment",
      render: (r) => <span className="font-medium">{r.title}</span>,
    },
    {
      key: "course",
      header: "Course",
      render: (r) => <span className="text-sm text-muted-foreground">{r.course}</span>,
    },
    { key: "instructor", header: "Instructor", render: (r) => r.instructor },
    {
      key: "submissions",
      header: "Submissions",
      sort: (a, b) => a.submissions - b.submissions,
      render: (r) => r.submissions,
    },
    {
      key: "pending",
      header: "Pending grade",
      render: (r) => <span className="text-warning font-medium">{r.pending}</span>,
    },
    {
      key: "deadline",
      header: "Deadline",
      render: (r) => <span className="text-sm text-muted-foreground">{r.deadline}</span>,
    },
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
        title="Assignments"
        description="Track assignments across the platform."
      />
      <DataTable
        rows={adminAssignments}
        columns={cols}
        searchKeys={["title", "course", "instructor"]}
        actions={[
          {
            label: "View submissions",
            onClick: () => toast("Opening grading…"),
          },
        ]}
      />
    </div>
  );
}

