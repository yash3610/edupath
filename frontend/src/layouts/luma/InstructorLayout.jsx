import { Outlet } from "react-router-dom";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { LmsSidebar } from "@/features/shared/components/Sidebar";
import { LmsTopbar } from "@/features/shared/components/Topbar";
import { INSTRUCTOR_NAV } from "@/features/shared/config/navigation";
import { instructor } from "@/features/instructor/data/instructor";
import { useAuth } from "@/context/AuthContext";
export default function InstructorLayout() {
  const { user: sessionUser } = useAuth();
  const user = {
    name: sessionUser?.name || instructor.name,
    role: "Instructor",
    avatar: sessionUser?.avatar || instructor.avatar,
  };
  return (
    <SidebarProvider>
      <div className="relative flex min-h-screen w-full bg-background">
        <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-40 -left-40 h-[480px] w-[480px] rounded-full gradient-aurora opacity-30 blur-3xl animate-aurora" />
          <div className="absolute -bottom-40 -right-40 h-[520px] w-[520px] rounded-full gradient-aurora opacity-20 blur-3xl animate-aurora" />
        </div>
        <LmsSidebar role="Instructor" user={user} groups={INSTRUCTOR_NAV} />
        <SidebarInset className="bg-transparent">
          <LmsTopbar
            user={user}
            notifPath="/instructor/dashboard/notifications"
            primaryAction={{ label: "Create Course", to: "/instructor/dashboard/create" }}
          />
          <main className="flex-1 px-4 py-6 md:px-8 md:py-10">
            <Outlet />
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}

