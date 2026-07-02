import { useEffect, useState } from "react";
import { LmsPageHeader } from "@/features/shared/components/PageHeader";
import { DataTable } from "@/features/shared/components/DataTable";
import { StatusBadge } from "@/features/shared/components/StatusBadge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { apiRequest } from "@/services/api";
import { toast } from "sonner";

const mapProgressRow = (row = {}) => {
  const student = row.student || {};
  const course = row.course || {};
  return {
    id: row._id || `${student._id || student.id}-${course._id || course.id}`,
    name: student.name || "Student",
    email: student.email || "",
    avatar: student.avatar || student.profilePhoto || "",
    course: course.title || "Course",
    progress: Math.round(Number(row.progress || 0)),
    lastActive: row.updatedAt ? new Date(row.updatedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "-",
    quizAvg: Math.round(Number(row.quizAverage || row.quizAvg || 0)),
    assignment: row.assignmentStatus || "pending",
    cert: row.status === "completed" ? "approved" : "pending",
  };
};

export default function Page() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiRequest("/api/instructor/students-progress")
      .then((result) => setStudents((result.data || []).map(mapProgressRow)))
      .catch((error) => toast.error(error.message || "Students load zale nahit."))
      .finally(() => setLoading(false));
  }, []);

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
        <div className="flex w-32 items-center gap-2">
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
        description={loading ? "Loading enrolled students..." : `${students.length} enrolled across your courses.`}
      />
      <DataTable
        rows={students}
        columns={cols}
        searchKeys={["name", "email", "course"]}
        actions={[
          { label: "View progress", onClick: (r) => toast(`Opening progress for ${r.name}`) },
          { label: "Send message", onClick: (r) => toast.success(`Message drafted to ${r.name}`) },
        ]}
      />
    </div>
  );
}
