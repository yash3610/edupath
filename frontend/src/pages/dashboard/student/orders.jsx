import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Download, Receipt } from "lucide-react";
import { PageHeader } from "@/features/student/components/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { apiBlobRequest, apiRequest } from "@/services/api";
import { toast } from "sonner";

const money = (amount, currency = "INR") =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency, maximumFractionDigits: 0 }).format(Number(amount || 0));

const mapOrder = (order = {}) => {
  const firstItem = order.items?.[0];
  const course = order.course || firstItem?.course || {};
  return {
    id: order._id || order.id,
    course: course.title || order.courseTitle || `${order.items?.length || 1} course order`,
    date: order.createdAt ? new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "-",
    amount: money(order.amount || order.total || firstItem?.price, order.currency || "INR"),
    status: order.status || "pending",
  };
};

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiRequest("/api/orders/my")
      .then((result) => setOrders((result.data || []).map(mapOrder)))
      .catch((error) => toast.error(error.message || "Orders load zale nahit."))
      .finally(() => setLoading(false));
  }, []);

  const downloadInvoice = async (order) => {
    try {
      const blob = await apiBlobRequest(`/api/orders/${order.id}/invoice`);
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `invoice-${order.id}.pdf`;
      anchor.click();
      URL.revokeObjectURL(url);
      toast.success("Invoice downloaded");
    } catch (error) {
      toast.error(error.message || "Invoice download zala nahi.");
    }
  };

  return (
    <div className="mx-auto max-w-[1200px]">
      <PageHeader
        eyebrow="Billing"
        title="Orders & Invoices"
        description={loading ? "Loading live orders..." : `${orders.length} transactions from your account.`}
      />
      <div className="overflow-hidden rounded-2xl card-premium">
        <div className="grid grid-cols-12 gap-4 border-b border-border/60 px-6 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          <div className="col-span-6">Course</div>
          <div className="col-span-2">Date</div>
          <div className="col-span-2">Amount</div>
          <div className="col-span-2 text-right">Action</div>
        </div>
        {orders.map((order, i) => (
          <motion.div
            key={order.id}
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
                <div className="font-medium">{order.course}</div>
                <Badge variant="outline" className="mt-1 border-border/60 text-[10px] capitalize">{order.status}</Badge>
              </div>
            </div>
            <div className="col-span-2 text-sm text-muted-foreground">{order.date}</div>
            <div className="col-span-2 font-display text-lg font-semibold">{order.amount}</div>
            <div className="col-span-2 text-right">
              <Button size="sm" variant="ghost" className="rounded-lg" onClick={() => downloadInvoice(order)}>
                <Download className="mr-1 h-4 w-4" /> Invoice
              </Button>
            </div>
          </motion.div>
        ))}
        {!loading && orders.length === 0 && (
          <div className="px-6 py-12 text-center text-sm text-muted-foreground">No orders found.</div>
        )}
      </div>
    </div>
  );
}
