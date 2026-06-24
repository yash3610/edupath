import { useState } from "react";
import { PageHeader } from "@/features/student/components/PageHeader";
import NotificationList from "@/components/notifications/NotificationList";

export default function NotifPage() {
  const [unread, setUnread] = useState(0);
  return (
    <div className="mx-auto max-w-[900px]">
      <PageHeader
        eyebrow="Inbox"
        title="Notifications"
        description={`${unread} unread - notifications are automatically deleted after 2 days.`}
      />
      <NotificationList onUnreadChange={setUnread} />
    </div>
  );
}
