import { useState } from "react";
import { LmsPageHeader } from "@/features/shared/components/PageHeader";
import NotificationList from "@/components/notifications/NotificationList";

export default function Page() {
  const [unread, setUnread] = useState(0);
  return (
    <div className="mx-auto max-w-[900px]">
      <LmsPageHeader
        eyebrow="Overview"
        title="Notifications"
        description={`${unread} unread - system, payment and content events auto-expire after 2 days.`}
      />
      <NotificationList onUnreadChange={setUnread} />
    </div>
  );
}
