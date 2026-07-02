import { useState } from "react";
import { motion } from "framer-motion";
import { Edit3, Plus, Trash2 } from "lucide-react";
import { LmsPageHeader } from "@/features/shared/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StatusBadge } from "@/features/shared/components/StatusBadge";
import { adminCategories } from "@/features/admin/data/admin";
import { toast } from "sonner";
import usePersistedDashboardState from "@/hooks/usePersistedDashboardState";
export default function CategoriesPage() {
  const [list, setList] = usePersistedDashboardState("admin", "adminCategories", adminCategories);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const add = () => {
    if (!name) return;
    setList((l) => [
      {
        id: `cat${Date.now()}`,
        name,
        slug: name.toLowerCase().replace(/\s+/g, "-"),
        count: 0,
        featured: false,
        status: "active",
      },
      ...l,
    ]);
    toast.success(`Category "${name}" created`);
    setName("");
    setOpen(false);
  };
  return (
    <div className="mx-auto max-w-[1400px]">
      <LmsPageHeader
        eyebrow="Catalog"
        title="Categories"
        description="Organise the catalog. Featured categories appear on the homepage."
        actions={
          <Button
            className="rounded-xl gradient-primary border-0 text-primary-foreground"
            onClick={() => setOpen(true)}
          >
            <Plus className="mr-1.5 h-4 w-4" /> New category
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {list.map((c, i) => (
          <motion.div
            key={c.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            whileHover={{ y: -3 }}
            className="relative overflow-hidden rounded-2xl card-premium p-5"
          >
            <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full gradient-aurora opacity-25 blur-2xl" />
            <div className="relative flex items-start justify-between gap-2">
              <div className="grid h-12 w-12 place-items-center rounded-xl gradient-primary shadow-glow font-display text-lg font-bold text-primary-foreground">
                {c.name[0]}
              </div>
              <StatusBadge status={c.status} />
            </div>
            <h3 className="mt-3 font-display text-lg font-semibold">{c.name}</h3>
            <div className="text-xs text-muted-foreground">
              /{c.slug} ·{" "}
              <Badge variant="outline" className="border-border/60">
                {c.count} courses
              </Badge>
            </div>

            <div className="mt-4 flex items-center justify-between rounded-xl bg-muted/30 px-3 py-2 text-sm">
              <span>Featured</span>
              <Switch
                defaultChecked={c.featured}
                onCheckedChange={(v) =>
                  toast(`${c.name} ${v ? "added to" : "removed from"} featured`)
                }
              />
            </div>
            <div className="mt-3 flex gap-2">
              <Button
                size="sm"
                variant="outline"
                className="h-8 flex-1 rounded-lg border-border/60 text-xs"
              >
                <Edit3 className="mr-1 h-3.5 w-3.5" /> Edit
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-8 rounded-lg border-destructive/40 text-destructive text-xs hover:bg-destructive/10"
                onClick={() => {
                  setList((l) => l.filter((x) => x.id !== c.id));
                  toast.error(`Deleted ${c.name}`);
                }}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </motion.div>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-display">New category</DialogTitle>
            <DialogDescription>
              Categories appear in filters, homepage, and instructor course creation.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Name</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Computer Vision"
                className="mt-1 rounded-xl"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)} className="rounded-xl">
              Cancel
            </Button>
            <Button
              onClick={add}
              className="rounded-xl gradient-primary border-0 text-primary-foreground"
            >
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

