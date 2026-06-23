import { LmsPageHeader } from "@/features/shared/components/PageHeader";
import { DataTable } from "@/features/shared/components/DataTable";
import { StatusBadge } from "@/features/shared/components/StatusBadge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { instructorStudents } from "@/features/instructor/data/instructor";
import { toast } from "sonner";
export default function Page() {
  const cols = [
    {
      key: "name",
      header: "Student",
      render: (r) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarImage src={r.avatar} />
            <AvatarFallback>{r.name[0]}</AvatarFallback>
          </Avatar>
          <div>
            <div className="text-sm font-medium">{r.name}</div>
            <div className="text-xs text-muted-foreground">{r.email}</div>
          </div>
        </div>
      ),
    },
    {
      key: "course",
      header: "Course",
      render: (r) => <span className="text-sm text-muted-foreground">{r.course}</span>,
    },
    {
      key: "progress",
      header: "Progress",
      sort: (a, b) => a.progress - b.progress,
      render: (r) => (
        <div className="flex items-center gap-2 w-32">
          <Progress value={r.progress} className="h-1.5" />
          <span className="text-xs">{r.progress}%</span>
        </div>
      ),
    },
    {
      key: "lastActive",
      header: "Last active",
      render: (r) => <span className="text-sm text-muted-foreground">{r.lastActive}</span>,
    },
    {
      key: "quizAvg",
      header: "Quiz avg",
      render: (r) => <span className="font-medium">{r.quizAvg}%</span>,
    },
    {
      key: "assignment",
      header: "Assignment",
      render: (r) => <StatusBadge status={r.assignment} />,
    },
    {
      key: "cert",
      header: "Cert",
      render: (r) => <StatusBadge status={r.cert} />,
    },
  ];
  return (
    <div className="mx-auto max-w-[1500px]">
      <LmsPageHeader
        eyebrow="Learners"
        title="My Students"
        description={`${instructorStudents.length} enrolled across your courses.`}
      />
      <DataTable
        rows={instructorStudents}
        columns={cols}
        searchKeys={["name", "email", "course"]}
        actions={[
          {
            label: "View progress",
            onClick: (r) => toast(`Opening progress for ${r.name}`),
          },
          {
            label: "Send message",
            onClick: (r) => toast.success(`Message drafted to ${r.name}`),
          },
        ]}
      />
    </div>
  );
}

