import { LmsPageHeader } from "@/features/shared/components/PageHeader";
import { DataTable } from "@/features/shared/components/DataTable";
import { StatusBadge } from "@/features/shared/components/StatusBadge";
import { adminQuizzes } from "@/features/admin/data/admin";
import { toast } from "sonner";
export default function Page() {
  const cols = [
    {
      key: "title",
      header: "Quiz",
      render: (r) => <span className="font-medium">{r.title}</span>,
    },
    {
      key: "course",
      header: "Course",
      render: (r) => <span className="text-sm text-muted-foreground">{r.course}</span>,
    },
    { key: "instructor", header: "Instructor", render: (r) => r.instructor },
    { key: "questions", header: "Questions", render: (r) => r.questions },
    { key: "marks", header: "Marks", render: (r) => r.marks },
    {
      key: "attempts",
      header: "Attempts",
      sort: (a, b) => a.attempts - b.attempts,
      render: (r) => r.attempts.toLocaleString(),
    },
    {
      key: "pass",
      header: "Pass rate",
      render: (r) => <span className="font-medium text-success">{r.pass}%</span>,
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
        title="Quizzes"
        description="All quizzes across courses — review, approve, and analyze."
      />
      <DataTable
        rows={adminQuizzes}
        columns={cols}
        searchKeys={["title", "course", "instructor"]}
        actions={[
          {
            label: "View questions",
            onClick: () => toast("Opening editor…"),
          },
          {
            label: "Approve",
            onClick: (r) => toast.success(`Approved ${r.title}`),
          },
          {
            label: "Reject",
            onClick: (r) => toast.error(`Rejected ${r.title}`),
            danger: true,
          },
        ]}
      />
    </div>
  );
}

