import { useState } from "react";
import { motion } from "framer-motion";
import { Copy, Plus, Ticket } from "lucide-react";
import { LmsPageHeader } from "@/features/shared/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { StatusBadge } from "@/features/shared/components/StatusBadge";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { adminCoupons } from "@/features/admin/data/admin";
import { toast } from "sonner";
export default function CouponsPage() {
  const [list, setList] = useState(adminCoupons);
  const [open, setOpen] = useState(false);
  return (
    <div className="mx-auto max-w-[1300px]">
      <LmsPageHeader
        eyebrow="Commerce"
        title="Coupons"
        description="Create discount codes, set rules, and track usage."
        actions={
          <Button
            className="rounded-xl gradient-primary border-0 text-primary-foreground"
            onClick={() => setOpen(true)}
          >
            <Plus className="mr-1.5 h-4 w-4" /> Create coupon
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((c, i) => (
          <motion.div
            key={c.code}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className="relative overflow-hidden rounded-2xl card-premium p-5"
          >
            <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full gradient-aurora opacity-25 blur-2xl" />
            <div className="flex items-start justify-between">
              <div className="grid h-12 w-12 place-items-center rounded-xl gradient-primary shadow-glow">
                <Ticket className="h-5 w-5 text-primary-foreground" />
              </div>
              <StatusBadge status={c.status} />
            </div>
            <div className="mt-3 flex items-center gap-2">
              <span className="font-mono text-lg font-bold tracking-wider">{c.code}</span>
              <button
                onClick={() => {
                  navigator.clipboard?.writeText(c.code);
                  toast.success(`Copied ${c.code}`);
                }}
                className="rounded-md p-1 text-muted-foreground hover:text-foreground"
              >
                <Copy className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="mt-1 text-2xl font-display font-semibold text-primary">
              {c.type === "Percent" ? `${c.value}%` : `₹${c.value}`} off
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
              <Box k="Used" v={`${c.used.toLocaleString()} / ${c.max.toLocaleString()}`} />
              <Box k="Min order" v={`₹${c.min.toLocaleString()}`} />
              <Box k="Expires" v={c.expiry} />
              <Box k="Type" v={c.type} />
            </div>
            <div className="mt-3 flex items-center justify-between rounded-xl bg-muted/30 px-3 py-2 text-sm">
              <span>Active</span>
              <Switch
                defaultChecked={c.status === "active"}
                onCheckedChange={(v) => {
                  setList((l) =>
                    l.map((x) =>
                      x.code === c.code ? { ...x, status: v ? "active" : "inactive" } : x,
                    ),
                  );
                  toast(`${c.code} ${v ? "activated" : "deactivated"}`);
                }}
              />
            </div>
          </motion.div>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-display">Create coupon</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label>Code</Label>
              <Input placeholder="WELCOME500" className="mt-1 rounded-xl font-mono uppercase" />
            </div>
            <div>
              <Label>Type</Label>
              <Select defaultValue="Percent">
                <SelectTrigger className="mt-1 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Percent">Percentage</SelectItem>
                  <SelectItem value="Flat">Flat amount</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Value</Label>
              <Input placeholder="20" type="number" className="mt-1 rounded-xl" />
            </div>
            <div>
              <Label>Max usage</Label>
              <Input placeholder="500" type="number" className="mt-1 rounded-xl" />
            </div>
            <div>
              <Label>Min order ₹</Label>
              <Input placeholder="1999" type="number" className="mt-1 rounded-xl" />
            </div>
            <div>
              <Label>Expiry</Label>
              <Input type="date" className="mt-1 rounded-xl" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)} className="rounded-xl">
              Cancel
            </Button>
            <Button
              onClick={() => {
                toast.success("Coupon created");
                setOpen(false);
              }}
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
function Box({ k, v }) {
  return (
    <div className="rounded-lg bg-muted/30 p-2">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{k}</div>
      <div className="mt-0.5 font-medium">{v}</div>
    </div>
  );
}

