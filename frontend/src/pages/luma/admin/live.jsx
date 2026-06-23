import { useState } from "react";
import { motion } from "framer-motion";
import { CalendarDays, Video } from "lucide-react";
import { LmsPageHeader } from "@/features/shared/components/PageHeader";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/features/shared/components/StatusBadge";
import { adminLive } from "@/features/admin/data/admin";
import { toast } from "sonner";
export default function LivePage() {
  const [tab, setTab] = useState("upcoming");
  const rows = adminLive.filter((c) => tab === "all" || c.status === tab);
  return (
    <div className="mx-auto max-w-[1400px]">
      <LmsPageHeader
        eyebrow="Catalog"
        title="Live Classes"
        description="Scheduled sessions across all courses."
      />
      <Tabs value={tab} onValueChange={setTab} className="mb-5">
        <TabsList className="rounded-xl bg-muted/60 p-1">
          {["upcoming", "completed", "cancelled", "all"].map((s) => (
            <TabsTrigger key={s} value={s} className="rounded-lg capitalize">
              {s}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {rows.map((c, i) => (
          <motion.div
            key={c.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className="rounded-2xl card-premium p-5"
          >
            <div className="flex items-start justify-between">
              <div className="grid h-12 w-12 place-items-center rounded-xl gradient-primary shadow-glow">
                <Video className="h-5 w-5 text-primary-foreground" />
              </div>
              <StatusBadge status={c.status} />
            </div>
            <h3 className="mt-3 font-display text-base font-semibold">{c.title}</h3>
            <Badge variant="outline" className="mt-1 border-border/60">
              {c.course}
            </Badge>
            <div className="mt-3 space-y-1.5 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <CalendarDays className="h-3.5 w-3.5" /> {c.date}
              </div>
              <div className="text-muted-foreground">
                By {c.instructor} · {c.attendees} attendees
              </div>
            </div>
            <Button
              className="mt-4 w-full rounded-xl gradient-primary border-0 text-primary-foreground"
              onClick={() => toast(`Opening ${c.title}`)}
            >
              View details
            </Button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

