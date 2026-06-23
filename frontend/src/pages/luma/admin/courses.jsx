import { useState } from "react";
import { motion } from "framer-motion";
import { LayoutGrid, List, Plus, Star } from "lucide-react";
import { LmsPageHeader } from "@/features/shared/components/PageHeader";
import { DataTable } from "@/features/shared/components/DataTable";
import { StatusBadge } from "@/features/shared/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { adminCourses as INITIAL } from "@/features/admin/data/admin";
import { inr } from "@/features/shared/utils/format";
import { toast } from "sonner";
export default function CoursesPage() {
  const [view, setView] = useState("grid");
  const [status, setStatus] = useState("all");
  const [list, setList] = useState(() => INITIAL.map((c) => ({ ...c, featured: false })));
  const [manageOf, setManageOf] = useState(null);
  const [previewOf, setPreviewOf] = useState(null);
  const [deleteOf, setDeleteOf] = useState(null);
  const [draft, setDraft] = useState(null);
  const rows = list.filter((c) => status === "all" || c.status === status);
  const openManage = (c) => {
    setManageOf(c);
    setDraft({ ...c });
  };
  const saveManage = () => {
    if (!draft) return;
    setList((l) => l.map((x) => (x.id === draft.id ? draft : x)));
    toast.success(`${draft.title} updated`);
    setManageOf(null);
    setDraft(null);
  };
  const setStatusOf = (id, s) => {
    setList((l) => l.map((x) => (x.id === id ? { ...x, status: s } : x)));
    toast.success(`Status set to ${s}`);
  };
  const removeRow = (id) => {
    setList((l) => l.filter((x) => x.id !== id));
    toast.error("Course deleted");
    setDeleteOf(null);
  };
  const toggleFeature = (id) => {
    setList((l) => l.map((x) => (x.id === id ? { ...x, featured: !x.featured } : x)));
    const target = list.find((x) => x.id === id);
    toast.success(`${target?.featured ? "Unfeatured" : "Featured"} ${target?.title}`);
  };
  const columns = [
    {
      key: "title",
      header: "Course",
      sort: (a, b) => a.title.localeCompare(b.title),
      render: (r) => (
        <div className="flex items-center gap-3">
          <img src={r.cover} alt="" className="h-10 w-14 shrink-0 rounded-lg object-cover" />
          <div className="min-w-0">
            <div className="truncate text-sm font-medium">{r.title}</div>
            <div className="truncate text-xs text-muted-foreground">{r.instructor}</div>
          </div>
        </div>
      ),
    },
    {
      key: "category",
      header: "Category",
      render: (r) => (
        <Badge variant="outline" className="border-border/60">
          {r.category}
        </Badge>
      ),
    },
    {
      key: "price",
      header: "Price",
      sort: (a, b) => a.price - b.price,
      render: (r) => inr(r.price),
    },
    {
      key: "enrollments",
      header: "Enrolments",
      sort: (a, b) => a.enrollments - b.enrollments,
      render: (r) => r.enrollments.toLocaleString(),
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
    {
      key: "updated",
      header: "Updated",
      render: (r) => <span className="text-xs text-muted-foreground">{r.updated}</span>,
    },
  ];
  return (
    <div className="mx-auto max-w-[1500px]">
      <LmsPageHeader
        eyebrow="Catalog"
        title="Courses"
        description={`${list.length} courses across all categories. Manage publishing, pricing, and visibility.`}
        actions={
          <>
            <Tabs value={view} onValueChange={(v) => setView(v)}>
              <TabsList className="rounded-xl bg-muted/60 p-1">
                <TabsTrigger value="grid" className="rounded-lg">
                  <LayoutGrid className="h-3.5 w-3.5" />
                </TabsTrigger>
                <TabsTrigger value="table" className="rounded-lg">
                  <List className="h-3.5 w-3.5" />
                </TabsTrigger>
              </TabsList>
            </Tabs>
            <Button
              className="rounded-xl gradient-primary border-0 text-primary-foreground"
              onClick={() => toast("Open any course card and toggle Feature inside Manage")}
            >
              <Plus className="mr-1.5 h-4 w-4" /> Feature course
            </Button>
          </>
        }
      />

      <Tabs value={status} onValueChange={setStatus} className="mb-5">
        <TabsList className="rounded-xl bg-muted/60 p-1 flex-wrap h-auto">
          {["all", "published", "draft", "pending", "rejected", "archived"].map((s) => (
            <TabsTrigger key={s} value={s} className="rounded-lg capitalize">
              {s}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {view === "grid" ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {rows.map((c, i) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              whileHover={{ y: -4 }}
              className="group overflow-hidden rounded-2xl card-premium"
            >
              <div className="relative h-36 overflow-hidden">
                <img
                  src={c.cover}
                  alt=""
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <Badge className="absolute left-3 top-3 border-0 bg-background/80 text-foreground">
                  {c.category}
                </Badge>
                <div className="absolute right-3 top-3">
                  <StatusBadge status={c.status} />
                </div>
                {c.featured && (
                  <Badge className="absolute bottom-3 left-3 border-0 gradient-primary text-primary-foreground">
                    Featured
                  </Badge>
                )}
              </div>
              <div className="p-4">
                <h3 className="line-clamp-1 font-display text-base font-semibold">{c.title}</h3>
                <div className="mt-0.5 text-xs text-muted-foreground">{c.instructor}</div>
                <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                  <Mini label="Enrol" v={c.enrollments.toLocaleString()} />
                  <Mini label="Rev" v={inr(c.revenue)} />
                  <Mini label="★" v={c.rating.toFixed(1)} />
                </div>
                <div className="mt-3 flex gap-2">
                  <Button
                    size="sm"
                    className="h-8 flex-1 rounded-lg gradient-primary border-0 text-primary-foreground text-xs"
                    onClick={() => openManage(c)}
                  >
                    Manage
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 rounded-lg border-border/60 text-xs"
                    onClick={() => setPreviewOf(c)}
                  >
                    Preview
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <DataTable
          rows={rows}
          columns={columns}
          searchKeys={["title", "instructor", "category"]}
          actions={[
            { label: "Manage", onClick: (r) => openManage(r) },
            { label: "Preview", onClick: (r) => setPreviewOf(r) },
            {
              label: "Approve",
              onClick: (r) => setStatusOf(r.id, "published"),
            },
            { label: "Reject", onClick: (r) => setStatusOf(r.id, "rejected") },
            { label: "Archive", onClick: (r) => setStatusOf(r.id, "archived") },
            { label: "Toggle feature", onClick: (r) => toggleFeature(r.id) },
            { label: "Delete", onClick: (r) => setDeleteOf(r), danger: true },
          ]}
        />
      )}

      <Dialog
        open={!!manageOf}
        onOpenChange={(o) => {
          if (!o) {
            setManageOf(null);
            setDraft(null);
          }
        }}
      >
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">Manage course</DialogTitle>
            <DialogDescription>Edit pricing, status and visibility.</DialogDescription>
          </DialogHeader>
          {draft && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <img src={draft.cover} alt="" className="h-16 w-24 rounded-lg object-cover" />
                <div className="min-w-0">
                  <div className="font-display text-base font-semibold">{draft.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {draft.instructor} · {draft.category}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Title</Label>
                  <Input
                    value={draft.title}
                    onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs">Price (₹)</Label>
                  <Input
                    type="number"
                    value={draft.price}
                    onChange={(e) => setDraft({ ...draft, price: Number(e.target.value) })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs">Status</Label>
                  <Select
                    value={draft.status}
                    onValueChange={(v) => setDraft({ ...draft, status: v })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {["published", "draft", "pending", "rejected", "archived"].map((s) => (
                        <SelectItem key={s} value={s} className="capitalize">
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Category</Label>
                  <Input
                    value={draft.category}
                    onChange={(e) => setDraft({ ...draft, category: e.target.value })}
                    className="mt-1"
                  />
                </div>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-border/60 bg-muted/30 p-3">
                <div>
                  <div className="text-sm font-medium">Feature on homepage</div>
                  <div className="text-xs text-muted-foreground">
                    Surface this course in hero & discovery rails.
                  </div>
                </div>
                <Switch
                  checked={!!draft.featured}
                  onCheckedChange={(v) => setDraft({ ...draft, featured: v })}
                />
              </div>
            </div>
          )}
          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              variant="destructive"
              className="rounded-xl mr-auto"
              onClick={() => {
                if (manageOf) {
                  setDeleteOf(manageOf);
                  setManageOf(null);
                }
              }}
            >
              Delete
            </Button>
            <Button
              variant="outline"
              className="rounded-xl"
              onClick={() => {
                setManageOf(null);
                setDraft(null);
              }}
            >
              Cancel
            </Button>
            <Button
              className="rounded-xl gradient-primary border-0 text-primary-foreground"
              onClick={saveManage}
            >
              Save changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!previewOf} onOpenChange={(o) => !o && setPreviewOf(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">{previewOf?.title}</DialogTitle>
            <DialogDescription>
              {previewOf?.instructor} · {previewOf?.category}
            </DialogDescription>
          </DialogHeader>
          {previewOf && (
            <div className="space-y-4">
              <img src={previewOf.cover} alt="" className="h-56 w-full rounded-xl object-cover" />
              <div className="grid grid-cols-4 gap-3">
                <Mini label="Price" v={inr(previewOf.price)} />
                <Mini label="Enrol" v={previewOf.enrollments.toLocaleString()} />
                <Mini label="Revenue" v={inr(previewOf.revenue)} />
                <Mini label="Rating" v={previewOf.rating.toFixed(1)} />
              </div>
              <div className="text-sm text-muted-foreground">
                A premium curriculum covering core concepts, real-world projects, and capstone
                reviews by senior practitioners.
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" className="rounded-xl" onClick={() => setPreviewOf(null)}>
              Close
            </Button>
            <Button
              className="rounded-xl gradient-primary border-0 text-primary-foreground"
              onClick={() => {
                if (previewOf) {
                  openManage(previewOf);
                  setPreviewOf(null);
                }
              }}
            >
              Manage
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteOf} onOpenChange={(o) => !o && setDeleteOf(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this course?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove "{deleteOf?.title}" from the catalog. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteOf && removeRow(deleteOf.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
function Mini({ label, v }) {
  return (
    <div className="rounded-lg bg-muted/30 p-1.5">
      <div className="text-xs font-semibold">{v}</div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
    </div>
  );
}

