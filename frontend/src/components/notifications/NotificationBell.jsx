import { useCallback, useEffect, useState } from "react";
import { Bell, Check, CheckCheck, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { api } from "@/services/api";
import { toast } from "sonner";

function formatNotificationTime(value) {
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

function notificationTitle(item) {
  return item.title || item.message || "Notification";
}

export default function NotificationBell({ notifPath }) {
  const [items, setItems] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const result = await api.notifications({ limit: 5, summary: true });
      setItems(result.data?.items || []);
      setUnreadCount(result.data?.unreadCount || 0);
    } catch {
      setItems([]);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
    const interval = window.setInterval(loadNotifications, 30000);
    return () => window.clearInterval(interval);
  }, [loadNotifications]);

  async function markRead(event, item) {
    event.preventDefault();
    event.stopPropagation();
    if (item.read) return;
    try {
      await api.readNotification(item._id);
      setItems((current) => current.map((entry) => (entry._id === item._id ? { ...entry, read: true } : entry)));
      setUnreadCount((count) => Math.max(0, count - 1));
    } catch (error) {
      toast.error(error.message || "Could not mark notification as read");
    }
  }

  async function remove(event, item) {
    event.preventDefault();
    event.stopPropagation();
    try {
      await api.deleteNotification(item._id);
      setItems((current) => current.filter((entry) => entry._id !== item._id));
      if (!item.read) setUnreadCount((count) => Math.max(0, count - 1));
    } catch (error) {
      toast.error(error.message || "Could not delete notification");
    }
  }

  async function markAllRead(event) {
    event.preventDefault();
    event.stopPropagation();
    try {
      await api.readAllNotifications();
      setItems((current) => current.map((item) => ({ ...item, read: true })));
      setUnreadCount(0);
      toast.success("Notifications marked as read");
    } catch (error) {
      toast.error(error.message || "Could not mark notifications as read");
    }
  }

  return (
    <DropdownMenu onOpenChange={(open) => open && loadNotifications()}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative rounded-xl">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge className="absolute -right-0.5 -top-0.5 h-4 min-w-4 rounded-full px-1 text-[10px] gradient-accent border-0 text-accent-foreground">
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 rounded-2xl">
        <DropdownMenuLabel className="flex items-center justify-between gap-3">
          <span>Notifications</span>
          <div className="flex items-center gap-3">
            {unreadCount > 0 && (
              <button type="button" onClick={markAllRead} className="text-xs font-medium text-primary">
                Read all
              </button>
            )}
            <Link to={notifPath} className="text-xs text-primary">
              View all
            </Link>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {loading && <div className="px-4 py-8 text-center text-sm text-muted-foreground">Loading...</div>}
        {!loading && items.map((item) => (
          <DropdownMenuItem key={item._id} className="group flex items-start gap-3 rounded-lg p-3" onSelect={(event) => event.preventDefault()}>
            <span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${item.read ? "bg-muted" : "bg-primary"}`} />
            <Link to={notifPath} className="min-w-0 flex-1">
              <div className="line-clamp-1 text-sm font-medium">{notificationTitle(item)}</div>
              {item.message && item.title && <div className="line-clamp-1 text-xs text-muted-foreground">{item.message}</div>}
              <div className="mt-1 text-[11px] text-muted-foreground">{formatNotificationTime(item.createdAt)}</div>
            </Link>
            <div className="flex shrink-0 gap-1 opacity-100 sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100">
              {!item.read && (
                <Button size="icon" variant="ghost" className="h-7 w-7 rounded-lg" onClick={(event) => markRead(event, item)} title="Mark as read">
                  <Check className="h-3.5 w-3.5" />
                </Button>
              )}
              <Button size="icon" variant="ghost" className="h-7 w-7 rounded-lg text-destructive" onClick={(event) => remove(event, item)} title="Delete">
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </DropdownMenuItem>
        ))}
        {!loading && !items.length && (
          <div className="px-4 py-8 text-center">
            <CheckCheck className="mx-auto h-5 w-5 text-muted-foreground" />
            <p className="mt-2 text-sm font-medium">No notifications</p>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
