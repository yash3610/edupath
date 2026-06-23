import { useState } from "react";
import { Filter, UserPlus } from "lucide-react";
import { LmsPageHeader } from "@/features/shared/components/PageHeader";
import { DataTable } from "@/features/shared/components/DataTable";
import { StatusBadge } from "@/features/shared/components/StatusBadge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { adminStudents } from "@/features/admin/data/admin";
import { inr } from "@/features/shared/utils/format";
import { toast } from "sonner";
export default function StudentsPage() {
  const [tab, setTab] = useState("all");
  const [open, setOpen] = useState(null);
  const rows = adminStudents.filter((s) => tab === "all" || s.status === tab);
  const columns = [
    {
      key: "name",
      header: "Student",
      sort: (a, b) => a.name.localeCompare(b.name),
      render: (r) => (
        <button
          onClick={() => setOpen(r)}
          className="flex items-center gap-3 text-left hover:text-primary"
        >
          <Avatar className="h-9 w-9">
            <AvatarImage src={r.avatar} />
            <AvatarFallback>{r.name[0]}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <div className="truncate text-sm font-medium">{r.name}</div>
            <div className="truncate text-xs text-muted-foreground">{r.email}</div>
          </div>
        </button>
      ),
    },
    {
      key: "phone",
      header: "Phone",
      render: (r) => <span className="text-sm text-muted-foreground">{r.phone}</span>,
    },
    {
      key: "enrolled",
      header: "Enrolled",
      sort: (a, b) => a.enrolled - b.enrolled,
      render: (r) => <span className="font-medium">{r.enrolled}</span>,
    },
    {
      key: "completed",
      header: "Completed",
      render: (r) => <span>{r.completed}</span>,
    },
    {
      key: "spent",
      header: "Spent",
      sort: (a, b) => a.spent - b.spent,
      render: (r) => <span className="font-medium">{inr(r.spent)}</span>,
    },
    {
      key: "status",
      header: "Status",
      render: (r) => <StatusBadge status={r.status} />,
    },
    {
      key: "joined",
      header: "Joined",
      render: (r) => <span className="text-sm text-muted-foreground">{r.joined}</span>,
    },
  ];
  return (
    <div className="mx-auto max-w-[1500px]">
      <LmsPageHeader
        eyebrow="People"
        title="Students"
        description={`Manage ${adminStudents.length.toLocaleString()} learners — view enrolments, block, message and more.`}
        actions={
          <>
            <Button variant="outline" className="rounded-xl border-border/60">
              <Filter className="mr-1.5 h-4 w-4" /> Filters
            </Button>
            <Button className="rounded-xl gradient-primary border-0 text-primary-foreground">
              <UserPlus className="mr-1.5 h-4 w-4" /> Invite
            </Button>
          </>
        }
      />

      <div className="mb-4">
        <Tabs value={tab} onValueChange={(v) => setTab(v)}>
          <TabsList className="rounded-xl bg-muted/60 p-1">
            <TabsTrigger value="all" className="rounded-lg">
              All
            </TabsTrigger>
            <TabsTrigger value="active" className="rounded-lg">
              Active
            </TabsTrigger>
            <TabsTrigger value="blocked" className="rounded-lg">
              Blocked
            </TabsTrigger>
            <TabsTrigger value="unverified" className="rounded-lg">
              Unverified
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <DataTable
        rows={rows}
        columns={columns}
        searchKeys={["name", "email", "id"]}
        actions={[
          { label: "View profile", onClick: (r) => setOpen(r) },
          {
            label: "Send notification",
            onClick: (r) => toast.success(`Notification sent to ${r.name}`),
          },
          {
            label: "Block / unblock",
            onClick: (r) => toast(`${r.status === "blocked" ? "Unblocked" : "Blocked"} ${r.name}`),
          },
          {
            label: "Delete student",
            onClick: (r) => toast.error(`Deleted ${r.name}`),
            danger: true,
          },
        ]}
      />

      <Sheet open={!!open} onOpenChange={(o) => !o && setOpen(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
          {open && (
            <>
              <SheetHeader>
                <div className="flex items-center gap-3">
                  <Avatar className="h-14 w-14 ring-2 ring-primary/40">
                    <AvatarImage src={open.avatar} />
                    <AvatarFallback>{open.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <SheetTitle className="font-display text-xl">{open.name}</SheetTitle>
                    <SheetDescription>{open.email}</SheetDescription>
                  </div>
                </div>
              </SheetHeader>

              <div className="mt-6 grid grid-cols-3 gap-2 text-center">
                <Stat label="Enrolled" v={open.enrolled} />
                <Stat label="Completed" v={open.completed} />
                <Stat label="Spent" v={inr(open.spent)} />
              </div>

              <Section title="Profile">
                <Row k="Phone" v={open.phone} />
                <Row k="Status" v={<StatusBadge status={open.status} />} />
                <Row k="Joined" v={open.joined} />
                <Row k="Student ID" v={<span className="font-mono text-xs">{open.id}</span>} />
              </Section>

              <Section title="Recent enrolments">
                {["Advanced React", "Machine Learning Foundations", "Modern Product Design"]
                  .slice(0, open.enrolled)
                  .map((c, i) => (
                    <div
                      key={c}
                      className="flex items-center justify-between rounded-lg bg-muted/30 p-3"
                    >
                      <div>
                        <div className="text-sm font-medium">{c}</div>
                        <div className="text-xs text-muted-foreground">
                          Progress · {Math.min(100, 30 + i * 25)}%
                        </div>
                      </div>
                      <Badge variant="outline" className="border-border/60">
                        Active
                      </Badge>
                    </div>
                  ))}
              </Section>

              <Section title="Activity timeline">
                <ul className="relative space-y-3 pl-5">
                  <span className="absolute left-2 top-1.5 bottom-1.5 w-px bg-border/60" />
                  {[
                    "Logged in from Mumbai",
                    "Completed quiz — 88%",
                    "Submitted assignment — Linear Regression",
                    "Joined live class — Server Components Q&A",
                  ].map((t, i) => (
                    <li key={t} className="relative">
                      <span className="absolute -left-3.5 top-1.5 h-3 w-3 rounded-full gradient-primary shadow-glow" />
                      <div className="text-sm">{t}</div>
                      <div className="text-[11px] text-muted-foreground">{i + 1}h ago</div>
                    </li>
                  ))}
                </ul>
              </Section>

              <div className="mt-6 flex gap-2">
                <Button
                  className="flex-1 rounded-xl gradient-primary border-0 text-primary-foreground"
                  onClick={() => toast.success(`Notification sent to ${open.name}`)}
                >
                  Send notification
                </Button>
                <Button
                  variant="outline"
                  className="rounded-xl border-border/60"
                  onClick={() =>
                    toast(`${open.status === "blocked" ? "Unblocked" : "Blocked"} ${open.name}`)
                  }
                >
                  {open.status === "blocked" ? "Unblock" : "Block"}
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
function Stat({ label, v }) {
  return (
    <div className="rounded-xl bg-muted/30 p-3">
      <div className="font-display text-lg font-semibold">{v}</div>
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</div>
    </div>
  );
}
function Section({ title, children }) {
  return (
    <div className="mt-6">
      <div className="mb-2 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
        {title}
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  );
}
function Row({ k, v }) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-muted/20 px-3 py-2 text-sm">
      <span className="text-muted-foreground">{k}</span>
      <span>{v}</span>
    </div>
  );
}

