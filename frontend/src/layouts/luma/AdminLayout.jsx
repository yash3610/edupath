import { Outlet } from "react-router-dom";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { LmsSidebar } from "@/features/shared/components/Sidebar";
import { LmsTopbar } from "@/features/shared/components/Topbar";
import { ADMIN_NAV } from "@/features/shared/config/navigation";
import { adminUser } from "@/features/admin/data/admin";
import { useAuth } from "@/context/AuthContext";
import LumaDataGate from "@/components/luma/LumaDataGate";
export default function AdminLayout() {
  const { user } = useAuth();
  const dashboardUser = {
    ...adminUser,
    name: user?.name || adminUser.name,
    role: "Admin",
    avatar: user?.avatar || adminUser.avatar,
  };
  return (
    <LumaDataGate role="admin">
    <SidebarProvider>
      <div className="relative flex min-h-screen w-full bg-background">
        <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-40 -left-40 h-[480px] w-[480px] rounded-full gradient-aurora opacity-30 blur-3xl animate-aurora" />
          <div className="absolute -bottom-40 -right-40 h-[520px] w-[520px] rounded-full gradient-aurora opacity-20 blur-3xl animate-aurora" />
        </div>
        <LmsSidebar role="Admin" user={dashboardUser} groups={ADMIN_NAV} />
        <SidebarInset className="bg-transparent">
          <LmsTopbar
            user={dashboardUser}
            notifPath="/admin/dashboard/notifications"
            primaryAction={{ label: "Add Category", to: "/admin/dashboard/categories" }}
          />
          <main className="flex-1 px-4 py-6 md:px-8 md:py-10">
            <Outlet />
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
    </LumaDataGate>
  );
}

