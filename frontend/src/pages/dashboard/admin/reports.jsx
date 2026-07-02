import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Calendar, Download, FileText, TrendingUp } from "lucide-react";
import { LmsPageHeader } from "@/features/shared/components/PageHeader";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { adminReports } from "@/features/admin/data/admin";
import { toast } from "sonner";
import {
  LineChart,
  Line,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
export default function ReportsPage() {
  const [open, setOpen] = useState(null);
  const [rangeOpen, setRangeOpen] = useState(false);
  const [range, setRange] = useState({ from: "2026-01-01", to: "2026-06-16" });
  const seriesFor = (id) =>
    Array.from({ length: 12 }, (_, i) => ({
      m: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][i],
      v: Math.round(120 + Math.sin(i + id.length) * 60 + i * (id.charCodeAt(0) % 9) + 40),
    }));
  const downloadCsv = (r) => {
    const rows = seriesFor(r.id);
    const csv = "month,value\n" + rows.map((x) => `${x.m},${x.v}`).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${r.id}-report.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`${r.name}.csv downloaded`);
  };
  const downloadPdf = (r) => {
    const blob = new Blob(
      [`${r.name} Report\n${r.desc}\nGenerated ${new Date().toLocaleString()}`],
      { type: "application/pdf" },
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${r.id}-report.pdf`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`${r.name}.pdf downloaded`);
  };
  return (
    <div className="mx-auto max-w-[1300px]">
      <LmsPageHeader
        eyebrow="Overview"
        title="Reports"
        description="Deep, downloadable reports across revenue, learners, instructors, and content."
        actions={
          <>
            <Button
              variant="outline"
              className="rounded-xl border-border/60"
              onClick={() => setRangeOpen(true)}
            >
              <Calendar className="mr-1.5 h-4 w-4" /> Range
            </Button>
            <Button
              className="rounded-xl gradient-primary border-0 text-primary-foreground"
              onClick={() => {
                adminReports.forEach(downloadCsv);
              }}
            >
              <Download className="mr-1.5 h-4 w-4" /> Export all
            </Button>
          </>
        }
      />
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {adminReports.map((r, i) => (
          <motion.div
            key={r.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            whileHover={{ y: -3 }}
            className="relative overflow-hidden rounded-2xl card-premium p-6"
          >
            <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full gradient-aurora opacity-30 blur-2xl" />
            <div className="grid h-12 w-12 place-items-center rounded-xl gradient-primary shadow-glow font-display text-lg font-bold text-primary-foreground">
              {r.id[0].toUpperCase()}
            </div>
            <h3 className="mt-3 font-display text-lg font-semibold">{r.name} report</h3>
            <p className="mt-1 text-sm text-muted-foreground">{r.desc}</p>
            <div className="mt-4 flex gap-2">
              <Button
                size="sm"
                className="rounded-lg gradient-primary border-0 text-primary-foreground"
                onClick={() => setOpen(r)}
              >
                Open <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="rounded-lg border-border/60"
                onClick={() => downloadCsv(r)}
              >
                CSV
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="rounded-lg border-border/60"
                onClick={() => downloadPdf(r)}
              >
                PDF
              </Button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Report detail dialog */}
      <Dialog open={!!open} onOpenChange={(o) => !o && setOpen(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" /> {open?.name} report
            </DialogTitle>
            <DialogDescription>{open?.desc}</DialogDescription>
          </DialogHeader>
          {open && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Total", value: "₹ 18.4L" },
                  { label: "Δ vs prev", value: "+12.4%" },
                  { label: "Period", value: `${range.from} → ${range.to}` },
                ].map((s) => (
                  <div key={s.label} className="rounded-xl border border-border/60 bg-muted/30 p-3">
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      {s.label}
                    </div>
                    <div className="mt-1 font-display text-base font-semibold">{s.value}</div>
                  </div>
                ))}
              </div>
              <div className="h-64 rounded-xl border border-border/60 bg-card/40 p-3">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={seriesFor(open.id)}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="hsl(var(--border))"
                      opacity={0.4}
                    />
                    <XAxis dataKey="m" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
                    <Tooltip
                      contentStyle={{
                        background: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: 12,
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="v"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2.5}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <TrendingUp className="h-3.5 w-3.5 text-success" /> Trending up across the selected
                range
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              className="rounded-xl"
              onClick={() => open && downloadCsv(open)}
            >
              Download CSV
            </Button>
            <Button
              className="rounded-xl gradient-primary border-0 text-primary-foreground"
              onClick={() => open && downloadPdf(open)}
            >
              Download PDF
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Range picker */}
      <Dialog open={rangeOpen} onOpenChange={setRangeOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Select date range</DialogTitle>
            <DialogDescription>Filters all report cards below.</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <label className="text-xs text-muted-foreground">
              From
              <input
                type="date"
                value={range.from}
                onChange={(e) => setRange({ ...range, from: e.target.value })}
                className="mt-1 w-full rounded-lg border border-border/60 bg-background px-3 py-2 text-sm"
              />
            </label>
            <label className="text-xs text-muted-foreground">
              To
              <input
                type="date"
                value={range.to}
                onChange={(e) => setRange({ ...range, to: e.target.value })}
                className="mt-1 w-full rounded-lg border border-border/60 bg-background px-3 py-2 text-sm"
              />
            </label>
          </div>
          <DialogFooter>
            <Button variant="outline" className="rounded-xl" onClick={() => setRangeOpen(false)}>
              Cancel
            </Button>
            <Button
              className="rounded-xl gradient-primary border-0 text-primary-foreground"
              onClick={() => {
                setRangeOpen(false);
                toast.success("Range applied");
              }}
            >
              Apply
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

