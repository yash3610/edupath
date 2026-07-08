import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, MessageSquare, ShieldX, Star, UserPlus } from "lucide-react";
import { LmsPageHeader } from "@/features/shared/components/PageHeader";
import { DataTable } from "@/features/shared/components/DataTable";
import { StatusBadge } from "@/features/shared/components/StatusBadge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { inr } from "@/features/shared/utils/format";
import { apiRequest } from "@/services/api";
import { toast } from "sonner";

const mapInstructor = (user = {}) => ({
  id: user._id || user.id,
  name: user.name || "Instructor",
  email: user.email || "",
  avatar: user.avatar || user.profilePhoto || "",
  expertise: user.expertise || user.profile?.expertise || "Instructor",
  courses: Number(user.courses || 0),
  students: Number(user.students || 0),
  revenue: Number(user.revenue || 0),
  rating: Number(user.rating || 0),
  status: user.status || "pending",
});
export default function InstructorsPage() {
  const [view, setView] = useState("grid");
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiRequest("/api/admin/instructors")
      .then((result) => setList((result.data || []).map(mapInstructor)))
      .catch((error) => toast.error(error.message || "Unable to load instructors."))
      .finally(() => setLoading(false));
  }, []);

  const setInstructorStatus = async (instructor, status) => {
    const apiStatus = status === "approved" ? "active" : status === "rejected" ? "blocked" : status;
    try {
      const result = await apiRequest(`/api/admin/users/${instructor.id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: apiStatus }),
      });
      const updated = mapInstructor(result.data);
      setList((items) => items.map((item) => item.id === instructor.id ? { ...item, ...updated } : item));
      toast(`${status === "approved" ? "Approved" : "Updated"} ${instructor.name}`);
    } catch (error) {
      toast.error(error.message || "Unable to update instructor status.");
    }
  };
  const columns = [
    {
      key: "name",
      header: "Instructor",
      sort: (a, b) => a.name.localeCompare(b.name),
      render: (r) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarImage src={r.avatar} />
            <AvatarFallback>{r.name[0]}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <div className="truncate text-sm font-medium">{r.name}</div>
            <div className="truncate text-xs text-muted-foreground">{r.email}</div>
          </div>
        </div>
      ),
    },
    {
      key: "expertise",
      header: "Expertise",
      render: (r) => (
        <Badge variant="outline" className="border-border/60">
          {r.expertise}
        </Badge>
      ),
    },
    {
      key: "courses",
      header: "Courses",
      sort: (a, b) => a.courses - b.courses,
      render: (r) => r.courses,
    },
    {
      key: "students",
      header: "Students",
      sort: (a, b) => a.students - b.students,
      render: (r) => r.students.toLocaleString(),
    },
    {
      key: "revenue",
      header: "Revenue",
      sort: (a, b) => a.revenue - b.revenue,
      render: (r) => <span className="font-medium">{inr(r.revenue)}</span>,
    },
    {
      key: "rating",
      header: "Rating",
      render: (r) => (
        <span className="inline-flex items-center gap-1">
          <Star className="h-3 w-3 fill-current text-warning" /> {r.rating.toFixed(1)}
        </span>
      ),
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
        eyebrow="People"
        title="Instructors"
        description={loading ? "Loading live instructors..." : `${list.length} instructors from database`}
        actions={
          <>
            <Tabs value={view} onValueChange={(v) => setView(v)}>
              <TabsList className="rounded-xl bg-muted/60 p-1">
                <TabsTrigger value="grid" className="rounded-lg">
                  Grid
                </TabsTrigger>
                <TabsTrigger value="table" className="rounded-lg">
                  Table
                </TabsTrigger>
              </TabsList>
            </Tabs>
            <Button className="rounded-xl gradient-primary border-0 text-primary-foreground">
              <UserPlus className="mr-1.5 h-4 w-4" /> Invite instructor
            </Button>
          </>
        }
      />

      {view === "grid" ? (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {list.map((r, i) => (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              whileHover={{ y: -3 }}
              className="relative overflow-hidden rounded-2xl card-premium p-5"
            >
              <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full gradient-aurora opacity-25 blur-2xl" />
              <div className="flex items-start gap-3">
                <Avatar className="h-14 w-14 ring-2 ring-primary/40">
                  <AvatarImage src={r.avatar} />
                  <AvatarFallback>{r.name[0]}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="truncate font-display text-lg font-semibold">{r.name}</h3>
                    <StatusBadge status={r.status} />
                  </div>
                  <div className="truncate text-xs text-muted-foreground">{r.email}</div>
                  <Badge variant="outline" className="mt-1.5 border-border/60">
                    {r.expertise}
                  </Badge>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                <Mini label="Courses" v={r.courses} />
                <Mini label="Students" v={r.students.toLocaleString()} />
                <Mini label="Revenue" v={inr(r.revenue)} />
              </div>

              <div className="mt-4 flex items-center justify-between">
                <span className="inline-flex items-center gap-1 text-sm">
                  <Star className="h-3.5 w-3.5 fill-current text-warning" /> {r.rating.toFixed(1)}
                </span>
                <div className="flex gap-2">
                  {r.status === "pending" ? (
                    <>
                      <Button
                        size="sm"
                        className="h-8 rounded-lg gradient-primary border-0 text-primary-foreground text-xs"
                        onClick={() => setInstructorStatus(r, "approved")}
                      >
                        <CheckCircle2 className="mr-1 h-3.5 w-3.5" /> Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 rounded-lg border-border/60 text-xs"
                        onClick={() => setInstructorStatus(r, "rejected")}
                      >
                        <ShieldX className="mr-1 h-3.5 w-3.5" /> Reject
                      </Button>
                    </>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 rounded-lg border-border/60 text-xs"
                      onClick={() => toast.success(`Message drafted to ${r.name}`)}
                    >
                      <MessageSquare className="mr-1 h-3.5 w-3.5" /> Message
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <DataTable
          rows={list}
          columns={columns}
          searchKeys={["name", "email", "expertise"]}
          actions={[
            {
              label: "Approve",
              onClick: (r) => setInstructorStatus(r, "approved"),
            },
            { label: "Suspend", onClick: (r) => setInstructorStatus(r, "suspended") },
            {
              label: "View courses",
              onClick: () => toast("Opening courses…"),
            },
            {
              label: "Send message",
              onClick: () => toast("Opening messages…"),
            },
          ]}
        />
      )}
    </div>
  );
}
function Mini({ label, v }) {
  return (
    <div className="rounded-lg bg-muted/30 p-2">
      <div className="font-display text-sm font-semibold">{v}</div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
    </div>
  );
}

