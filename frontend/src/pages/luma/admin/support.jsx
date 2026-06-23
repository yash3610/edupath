import { useState } from "react";
import { motion } from "framer-motion";
import { Send } from "lucide-react";
import { LmsPageHeader } from "@/features/shared/components/PageHeader";
import { DataTable } from "@/features/shared/components/DataTable";
import { StatusBadge } from "@/features/shared/components/StatusBadge";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { tickets } from "@/features/admin/data/admin";
import { toast } from "sonner";
export default function SupportPage() {
  const [open, setOpen] = useState(null);
  const cols = [
    {
      key: "id",
      header: "Ticket",
      render: (r) => (
        <button
          onClick={() => setOpen(r)}
          className="font-mono text-xs text-primary hover:underline"
        >
          {r.id}
        </button>
      ),
    },
    { key: "user", header: "User", render: (r) => r.user },
    {
      key: "subject",
      header: "Subject",
      render: (r) => <span className="text-sm">{r.subject}</span>,
    },
    {
      key: "priority",
      header: "Priority",
      render: (r) => <StatusBadge status={r.priority} />,
    },
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
        eyebrow="Engagement"
        title="Support Tickets"
        description="Customer inbox — prioritise and reply."
      />
      <DataTable
        rows={tickets}
        columns={cols}
        searchKeys={["id", "user", "subject"]}
        actions={[
          { label: "Open thread", onClick: (r) => setOpen(r) },
          {
            label: "Mark resolved",
            onClick: (r) => toast.success(`Resolved ${r.id}`),
          },
        ]}
      />

      <Sheet open={!!open} onOpenChange={(o) => !o && setOpen(null)}>
        <SheetContent className="w-full sm:max-w-lg">
          {open && (
            <>
              <SheetHeader>
                <SheetTitle className="font-display">{open.subject}</SheetTitle>
              </SheetHeader>
              <div className="mt-2 text-xs text-muted-foreground">
                {open.id} · {open.user} · {open.date}
              </div>
              <div className="mt-4 flex gap-2">
                <StatusBadge status={open.priority} />
                <StatusBadge status={open.status} />
              </div>
              <div className="mt-6 space-y-3">
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-xl bg-muted/30 p-4 text-sm"
                >
                  Hi team, I'm running into the issue described in the subject. Can you take a look?
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="ml-8 rounded-xl gradient-primary p-4 text-sm text-primary-foreground shadow-glow"
                >
                  Hi! Looking into this now. Could you share the order ID for context?
                </motion.div>
              </div>
              <div className="mt-6">
                <Textarea rows={4} placeholder="Type your reply…" className="rounded-xl" />
                <Button
                  className="mt-3 w-full rounded-xl gradient-primary border-0 text-primary-foreground"
                  onClick={() => toast.success("Reply sent")}
                >
                  <Send className="mr-1.5 h-4 w-4" /> Send reply
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

