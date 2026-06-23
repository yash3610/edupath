import { useState } from "react";
import { motion } from "framer-motion";
import { Award, Bell, BookOpen, CheckCheck, MessageCircle, Trash2, Trophy } from "lucide-react";
import { PageHeader } from "@/features/student/components/PageHeader";
import { Button } from "@/components/ui/button";
import { notifications as seed } from "@/features/student/data/mock";
import { toast } from "sonner";
import usePersistedDashboardState from "@/hooks/usePersistedDashboardState";
const iconMap = {
  lecture: BookOpen,
  quiz: Trophy,
  cert: Award,
  community: MessageCircle,
  assignment: BookOpen,
};
export default function NotifPage() {
  const [list, setList] = usePersistedDashboardState(
    "student",
    "notifications",
    seed,
  );
  const unread = list.filter((n) => !n.read).length;
  const markAll = () => {
    setList((l) => l.map((n) => ({ ...n, read: true })));
    toast.success("All notifications marked as read");
  };
  const toggle = (id) => setList((l) => l.map((n) => (n.id === id ? { ...n, read: !n.read } : n)));
  const remove = (id) => {
    setList((l) => l.filter((n) => n.id !== id));
    toast("Notification removed");
  };
  return (
    <div className="mx-auto max-w-[900px]">
      <PageHeader
        eyebrow="Inbox"
        title="Notifications"
        description={`${unread} unread · everything that mattered, in chronological order.`}
        actions={
          unread > 0 ? (
            <Button variant="outline" className="rounded-xl border-border/60" onClick={markAll}>
              <CheckCheck className="mr-1.5 h-4 w-4" /> Mark all read
            </Button>
          ) : undefined
        }
      />
      {list.length === 0 ? (
        <div className="rounded-2xl card-premium p-16 text-center text-sm text-muted-foreground">
          You're all caught up.
        </div>
      ) : (
        <div className="rounded-2xl card-premium divide-y divide-border/60">
          {list.map((n, i) => {
            const Icon = iconMap[n.type] ?? Bell;
            return (
              <motion.div
                key={n.id}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className={`group flex items-start gap-4 p-4 transition-colors hover:bg-muted/40 ${n.read ? "opacity-70" : ""}`}
              >
                <button
                  onClick={() => toggle(n.id)}
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-xl gradient-primary shadow-soft"
                  aria-label="Toggle read"
                >
                  <Icon className="h-5 w-5 text-primary-foreground" />
                </button>
                <button onClick={() => toggle(n.id)} className="min-w-0 flex-1 text-left">
                  <div className="text-sm">{n.text}</div>
                  <div className="mt-0.5 text-xs text-muted-foreground">{n.time}</div>
                </button>
                {!n.read && <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary" />}
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 rounded-lg text-destructive opacity-0 transition-opacity group-hover:opacity-100"
                  onClick={() => remove(n.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

