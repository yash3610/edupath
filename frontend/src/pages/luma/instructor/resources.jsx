import { LmsPageHeader } from "@/features/shared/components/PageHeader";
import { DataTable } from "@/features/shared/components/DataTable";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { resources } from "@/features/instructor/data/instructor";
import { toast } from "sonner";
export default function Page() {
  const cols = [
    {
      key: "name",
      header: "File",
      render: (r) => <span className="font-medium">{r.name}</span>,
    },
    {
      key: "course",
      header: "Course",
      render: (r) => <span className="text-sm text-muted-foreground">{r.course}</span>,
    },
    { key: "lecture", header: "Lecture", render: (r) => r.lecture },
    { key: "size", header: "Size", render: (r) => r.size },
    {
      key: "downloads",
      header: "Downloads",
      sort: (a, b) => a.downloads - b.downloads,
      render: (r) => r.downloads.toLocaleString(),
    },
    {
      key: "uploaded",
      header: "Uploaded",
      render: (r) => <span className="text-sm text-muted-foreground">{r.uploaded}</span>,
    },
  ];
  return (
    <div className="mx-auto max-w-[1300px]">
      <LmsPageHeader
        eyebrow="Teaching"
        title="Resources"
        description="Reusable assets across your courses."
        actions={
          <Button className="rounded-xl gradient-primary border-0 text-primary-foreground">
            <Upload className="mr-1.5 h-4 w-4" /> Upload
          </Button>
        }
      />
      <DataTable
        rows={resources}
        columns={cols}
        searchKeys={["name", "course"]}
        actions={[
          { label: "Download", onClick: () => toast("Downloading…") },
          {
            label: "Replace",
            onClick: () => toast("Upload a new version…"),
          },
          {
            label: "Delete",
            onClick: (r) => toast.error(`Deleted ${r.name}`),
            danger: true,
          },
        ]}
      />
    </div>
  );
}

