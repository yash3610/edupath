import { useState } from "react";
import { motion } from "framer-motion";
import { Flag, Star } from "lucide-react";
import { LmsPageHeader } from "@/features/shared/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatusBadge } from "@/features/shared/components/StatusBadge";
import { adminReviews } from "@/features/admin/data/admin";
import { toast } from "sonner";
export default function ReviewsPage() {
  const [tab, setTab] = useState("all");
  const rows = adminReviews.filter((r) => tab === "all" || r.status === tab);
  return (
    <div className="mx-auto max-w-[1300px]">
      <LmsPageHeader
        eyebrow="Engagement"
        title="Reviews"
        description="Moderate reviews across the catalog."
      />
      <Tabs value={tab} onValueChange={setTab} className="mb-5">
        <TabsList className="rounded-xl bg-muted/60 p-1">
          {["all", "visible", "reported", "hidden"].map((s) => (
            <TabsTrigger key={s} value={s} className="rounded-lg capitalize">
              {s}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="grid gap-4 md:grid-cols-2">
        {rows.map((r, i) => (
          <motion.div
            key={r.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className="rounded-2xl card-premium p-5"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={r.avatar} />
                  <AvatarFallback>{r.student[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">{r.student}</div>
                  <div className="text-xs text-muted-foreground">
                    {r.course} · {r.date}
                  </div>
                </div>
              </div>
              <StatusBadge status={r.status} />
            </div>
            <div className="mt-2 flex gap-0.5">
              {Array.from({ length: 5 }).map((_, k) => (
                <Star
                  key={k}
                  className={`h-3.5 w-3.5 ${k < r.rating ? "fill-current text-warning" : "text-muted-foreground/30"}`}
                />
              ))}
            </div>
            <p className="mt-3 text-sm leading-relaxed">{r.text}</p>
            <div className="mt-4 flex gap-2">
              <Button
                size="sm"
                variant="outline"
                className="rounded-lg border-border/60"
                onClick={() => toast(`${r.status === "hidden" ? "Unhidden" : "Hidden"} review`)}
              >
                {r.status === "hidden" ? "Unhide" : "Hide"}
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="rounded-lg border-border/60"
                onClick={() => toast("Marked as reviewed")}
              >
                <Flag className="mr-1 h-3.5 w-3.5" /> Mark reviewed
              </Button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

