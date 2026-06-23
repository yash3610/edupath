import { motion } from "framer-motion";
import { Flag, MessageSquare, ShieldX } from "lucide-react";
import { LmsPageHeader } from "@/features/shared/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { adminCommunity } from "@/features/admin/data/admin";
import { toast } from "sonner";
import usePersistedDashboardState from "@/hooks/usePersistedDashboardState";
export default function Page() {
  const [posts, setPosts] = usePersistedDashboardState("admin", "adminCommunity", adminCommunity);
  return (
    <div className="mx-auto max-w-[1100px]">
      <LmsPageHeader
        eyebrow="People"
        title="Community Moderation"
        description="Reported and reviewed posts across discussion forums."
      />
      <div className="space-y-4">
        {posts.map((p, i) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className="rounded-2xl card-premium p-5"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={p.avatar} />
                  <AvatarFallback>{p.author[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">{p.author}</div>
                  <div className="text-xs text-muted-foreground">
                    {p.course} · {p.date}
                  </div>
                </div>
              </div>
              {p.reported && (
                <Badge className="border-0 bg-destructive/15 text-destructive">
                  <Flag className="mr-1 h-3 w-3" /> Reported
                </Badge>
              )}
            </div>
            <div className="mt-3 font-display text-lg font-medium">{p.title}</div>
            <div className="mt-1 text-sm text-muted-foreground">{p.replies} replies</div>
            <div className="mt-4 flex gap-2">
              <Button
                size="sm"
                variant="outline"
                className="rounded-lg border-border/60"
                onClick={() => toast(`Opening "${p.title}"`)}
              >
                <MessageSquare className="mr-1 h-3.5 w-3.5" /> Open thread
              </Button>
              {p.reported && (
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-lg border-destructive/40 text-destructive hover:bg-destructive/10"
                  onClick={() => {
                    setPosts((items) => items.filter((item) => item.id !== p.id));
                    toast.error("Post removed");
                  }}
                >
                  <ShieldX className="mr-1 h-3.5 w-3.5" /> Remove
                </Button>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

