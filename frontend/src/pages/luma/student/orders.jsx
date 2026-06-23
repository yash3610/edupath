import { motion } from "framer-motion";
import { Download, Receipt } from "lucide-react";
import { PageHeader } from "@/features/student/components/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { orders } from "@/features/student/data/mock";
import { toast } from "sonner";
export default function OrdersPage() {
  return (
    <div className="mx-auto max-w-[1200px]">
      <PageHeader
        eyebrow="Billing"
        title="Orders & Invoices"
        description="Every transaction in one tidy ledger."
      />
      <div className="rounded-2xl card-premium overflow-hidden">
        <div className="grid grid-cols-12 gap-4 border-b border-border/60 px-6 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          <div className="col-span-6">Course</div>
          <div className="col-span-2">Date</div>
          <div className="col-span-2">Amount</div>
          <div className="col-span-2 text-right">Action</div>
        </div>
        {orders.map((o, i) => (
          <motion.div
            key={o.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className="grid grid-cols-12 items-center gap-4 border-b border-border/60 px-6 py-4 last:border-0 hover:bg-muted/30"
          >
            <div className="col-span-6 flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl gradient-primary shadow-soft">
                <Receipt className="h-4 w-4 text-primary-foreground" />
              </div>
              <div>
                <div className="font-medium">{o.course}</div>
                <Badge
                  variant="outline"
                  className={`mt-1 text-[10px] ${o.status === "Refunded" ? "border-warning/40 text-warning-foreground" : "border-success/40 text-success"}`}
                >
                  {o.status}
                </Badge>
              </div>
            </div>
            <div className="col-span-2 text-sm text-muted-foreground">{o.date}</div>
            <div className="col-span-2 font-display text-lg font-semibold">{o.amount}</div>
            <div className="col-span-2 text-right">
              <Button
                size="sm"
                variant="ghost"
                className="rounded-lg"
                onClick={() => toast.success(`Invoice ${o.id.toUpperCase()} downloaded`)}
              >
                <Download className="mr-1 h-4 w-4" /> Invoice
              </Button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

