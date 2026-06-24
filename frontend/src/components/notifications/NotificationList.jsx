import { useCallback, useEffect, useState } from "react";
import { Bell, Check, CheckCheck, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/services/api";
import { toast } from "sonner";

function formatTime(value) {
  if (!value) return "Just now";
  const diff = Date.now() - new Date(value).getTime();
  if (Number.isNaN(diff)) return "Just now";
  const minutes = Math.max(0, Math.floor(diff / 60000));
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function NotificationList({ onUnreadChange }) {
  const [items, setItems] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await api.notifications({ summary: true });
      const nextItems = result.data?.items || [];
      const nextUnread = result.data?.unreadCount || 0;
      setItems(nextItems);
      setUnreadCount(nextUnread);
      onUnreadChange?.(nextUnread);
    } catch (error) {
      toast.error(error.message || "Could not load notifications");
    } finally {
      setLoading(false);
    }
  }, [onUnreadChange]);

  useEffect(() => {
    load();
  }, [load]);

  async function markRead(item) {
    if (item.read) return;
    try {
      await api.readNotification(item._id);
      setItems((current) => current.map((entry) => (entry._id === item._id ? { ...entry, read: true } : entry)));
      setUnreadCount((count) => {
        const next = Math.max(0, count - 1);
        onUnreadChange?.(next);
        return next;
      });
    } catch (error) {
      toast.error(error.message || "Could not mark notification as read");
    }
  }

  async function markAllRead() {
    try {
      await api.readAllNotifications();
      setItems((current) => current.map((item) => ({ ...item, read: true })));
      setUnreadCount(0);
      onUnreadChange?.(0);
      toast.success("All notifications marked as read");
    } catch (error) {
      toast.error(error.message || "Could not mark notifications as read");
    }
  }

  async function remove(item) {
    try {
      await api.deleteNotification(item._id);
      setItems((current) => current.filter((entry) => entry._id !== item._id));
      if (!item.read) {
        setUnreadCount((count) => {
          const next = Math.max(0, count - 1);
          onUnreadChange?.(next);
          return next;
        });
      }
      toast.success("Notification deleted");
    } catch (error) {
      toast.error(error.message || "Could not delete notification");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button variant="outline" className="rounded-xl border-border/60" onClick={markAllRead} disabled={!unreadCount}>
          <CheckCheck className="mr-1.5 h-4 w-4" /> Mark all read
        </Button>
      </div>
      {loading ? (
        <div className="rounded-2xl card-premium p-12 text-center text-sm text-muted-foreground">Loading notifications...</div>
      ) : !items.length ? (
        <div className="rounded-2xl card-premium p-16 text-center text-sm text-muted-foreground">You are all caught up.</div>
      ) : (
        <div className="rounded-2xl card-premium divide-y divide-border/60">
          {items.map((item) => (
            <div key={item._id} className={`group flex items-start gap-4 p-4 transition-colors hover:bg-muted/40 ${item.read ? "opacity-70" : ""}`}>
              <button
                type="button"
                onClick={() => markRead(item)}
                className="grid h-10 w-10 shrink-0 place-items-center rounded-xl gradient-primary shadow-soft"
                title="Mark as read"
              >
                <Bell className="h-5 w-5 text-primary-foreground" />
              </button>
              <button type="button" onClick={() => markRead(item)} className="min-w-0 flex-1 text-left">
                <div className="text-sm font-semibold">{item.title || item.message || "Notification"}</div>
                {item.message && item.title && <div className="mt-1 text-sm text-muted-foreground">{item.message}</div>}
                <div className="mt-1 text-xs text-muted-foreground">{item.type || "update"} - {formatTime(item.createdAt)}</div>
              </button>
              {!item.read && <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary" />}
              {!item.read && (
                <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg" onClick={() => markRead(item)} title="Mark as read">
                  <Check className="h-3.5 w-3.5" />
                </Button>
              )}
              <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg text-destructive" onClick={() => remove(item)} title="Delete">
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
