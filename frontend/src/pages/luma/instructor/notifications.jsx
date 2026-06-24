import { useState } from "react";
import { LmsPageHeader } from "@/features/shared/components/PageHeader";
import NotificationList from "@/components/notifications/NotificationList";

export default function NotifPage() {
  const [unread, setUnread] = useState(0);
  return (
    <div className="mx-auto max-w-[900px]">
      <LmsPageHeader
        eyebrow="Account"
        title="Notifications"
        description={`${unread} unread - course, payment, review and Q&A activity.`}
      />
      <NotificationList onUnreadChange={setUnread} />
    </div>
  );
}
