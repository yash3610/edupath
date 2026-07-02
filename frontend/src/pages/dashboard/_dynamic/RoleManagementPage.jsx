import { useCallback, useEffect, useState } from "react";
import { RefreshCcw, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { LmsPageHeader } from "@/features/shared/components/PageHeader";
import { DataTable } from "@/features/shared/components/DataTable";
import { StatusBadge } from "@/features/shared/components/StatusBadge";
import { apiRequest } from "@/services/api";
import { PageLoader, formatDateTime } from "./LumaDynamicUtils";

export default function RoleManagementPage({ type = "moderation" }) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const result = await apiRequest(type === "moderation" ? "/api/admin/community" : `/api/admin/${type}`);
      setRecords(Array.isArray(result.data) ? result.data : []);
    } catch (error) {
      toast.error(error.message || "Unable to load records");
      setRecords([]);
    } finally {
      setLoading(false);
    }
  }, [type]);

  useEffect(() => { load(); }, [load]);

  async function removeRecord(row) {
    try {
      await apiRequest(type === "moderation" ? `/api/admin/community/${row._id}` : `/api/admin/${type}/${row._id}`, { method: "DELETE" });
      toast.success("Record removed.");
      await load();
    } catch (error) {
      toast.error(error.message || "Delete failed");
    }
  }

  if (loading) return <PageLoader label="Loading moderation queue" />;

  return (
    <div>
      <LmsPageHeader
        eyebrow="Admin Workspace"
        title={type === "moderation" ? "Community moderation" : "Management"}
        description="Review live database records and remove content that needs moderation."
        actions={<Button variant="outline" onClick={load}><RefreshCcw className="mr-2 h-4 w-4" />Refresh</Button>}
      />
      <DataTable
        rows={records.map((item) => ({ ...item, id: item._id }))}
        searchKeys={["title", "body", "status"]}
        emptyTitle="No records found"
        emptyDesc="This queue is clean right now."
        columns={[
          { key: "discussion", header: "Discussion", render: (row) => <div><div className="font-medium">{row.title || row.question || "Discussion"}</div><div className="line-clamp-1 text-xs text-muted-foreground">{row.body || row.description}</div></div> },
          { key: "author", header: "Author", render: (row) => row.user?.name || row.author?.name || "Unknown" },
          { key: "course", header: "Course", render: (row) => row.course?.title || "-" },
          { key: "status", header: "Status", render: (row) => <StatusBadge status={row.status || (row.reported ? "reported" : "open")} /> },
          { key: "created", header: "Created", render: (row) => formatDateTime(row.createdAt) },
          { key: "action", header: "", render: (row) => <Button variant="ghost" size="sm" className="text-destructive" onClick={() => removeRecord(row)}><Trash2 className="mr-2 h-4 w-4" />Delete</Button> },
        ]}
      />
    </div>
  );
}
