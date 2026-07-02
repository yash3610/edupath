import { Outlet } from "react-router-dom";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/features/student/components/AppSidebar";
import { Topbar } from "@/features/student/components/Topbar";
import LumaDataGate from "@/components/luma/LumaDataGate";
export default function AppLayout() {
  return (
    <LumaDataGate role="student">
    <SidebarProvider>
      <div className="relative flex min-h-screen w-full bg-background">
        {/* Ambient aurora background */}
        <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-40 -left-40 h-[480px] w-[480px] rounded-full gradient-aurora opacity-30 blur-3xl animate-aurora" />
          <div className="absolute -bottom-40 -right-40 h-[520px] w-[520px] rounded-full gradient-aurora opacity-20 blur-3xl animate-aurora" />
        </div>
        <AppSidebar />
        <SidebarInset className="bg-transparent">
          <Topbar />
          <main className="flex-1 px-4 py-6 md:px-8 md:py-10">
            <Outlet />
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
    </LumaDataGate>
  );
}
