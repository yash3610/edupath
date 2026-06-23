import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  BookOpen,
  PlayCircle,
  Route as RouteIcon,
  ClipboardList,
  HelpCircle,
  Award,
  Trophy,
  Heart,
  Users,
  StickyNote,
  Download,
  Calendar,
  Bell,
  MessageCircle,
  ShoppingBag,
  User,
  Settings,
  Sparkles,
  BarChart3,
  GraduationCap,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { student } from "@/features/student/data/mock";
import { useAuth } from "@/context/AuthContext";
const main = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "My Courses", url: "/dashboard/courses", icon: BookOpen },
  { title: "Continue Learning", url: "/dashboard/continue", icon: PlayCircle },
  { title: "Learning Paths", url: "/dashboard/paths", icon: RouteIcon },
];
const study = [
  { title: "Assignments", url: "/dashboard/assignments", icon: ClipboardList },
  { title: "Quizzes", url: "/dashboard/quizzes", icon: HelpCircle },
  { title: "Certificates", url: "/dashboard/certificates", icon: Award },
  { title: "Achievements", url: "/dashboard/achievements", icon: Trophy },
  { title: "Notes", url: "/dashboard/notes", icon: StickyNote },
  { title: "Downloads", url: "/dashboard/downloads", icon: Download },
];
const smart = [
  { title: "AI Assistant", url: "/dashboard/ai", icon: Sparkles },
  { title: "Analytics", url: "/dashboard/analytics", icon: BarChart3 },
];
const social = [
  { title: "Community", url: "/dashboard/community", icon: Users },
  { title: "Messages", url: "/dashboard/messages", icon: MessageCircle },
  { title: "Calendar", url: "/dashboard/calendar", icon: Calendar },
  { title: "Wishlist", url: "/dashboard/wishlist", icon: Heart },
  { title: "Notifications", url: "/dashboard/notifications", icon: Bell },
];
const account = [
  { title: "Orders", url: "/dashboard/orders", icon: ShoppingBag },
  { title: "Profile", url: "/dashboard/profile", icon: User },
  { title: "Settings", url: "/dashboard/settings", icon: Settings },
];
function Group({ label, items, pathname }) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground/70">
        {label}
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => {
            const active =
              item.url === "/dashboard"
                ? pathname === item.url
                : pathname === item.url || pathname.startsWith(`${item.url}/`);
            return (
              <SidebarMenuItem key={item.url}>
                <SidebarMenuButton
                  asChild
                  isActive={active}
                  className="group relative h-10 rounded-xl transition-all data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground hover:bg-sidebar-accent/60"
                >
                  <Link to={item.url}>
                    {active && (
                      <motion.span
                        layoutId="sidebar-active"
                        className="absolute left-0 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-r-full gradient-primary"
                        transition={{
                          type: "spring",
                          stiffness: 380,
                          damping: 30,
                        }}
                      />
                    )}
                    <item.icon className="h-[18px] w-[18px]" />
                    <span className="text-sm font-medium">{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
export function AppSidebar() {
  const { user } = useAuth();
  const dashboardStudent = {
    ...student,
    name: user?.name || student.name,
    avatar: user?.avatar || student.avatar,
  };
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { pathname } = useLocation();
  // Avoid SSR hydration flash for active highlight
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const path = mounted ? pathname : "/";
  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="px-4 pt-5 pb-2">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl gradient-primary shadow-glow">
            <GraduationCap className="h-5 w-5 text-primary-foreground" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <div className="font-display text-lg font-semibold leading-none">Luma</div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                Learn · Master · Lead
              </div>
            </div>
          )}
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-2">
        <Group label="Overview" items={main} pathname={path} />
        <Group label="Study" items={study} pathname={path} />
        <Group label="Smart" items={smart} pathname={path} />
        <Group label="Social" items={social} pathname={path} />
        <Group label="Account" items={account} pathname={path} />
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-3">
        <div className="flex items-center gap-3 rounded-xl bg-sidebar-accent/40 p-2.5">
          <Avatar className="h-9 w-9 ring-2 ring-primary/40">
            <AvatarImage src={dashboardStudent.avatar} alt={dashboardStudent.name} />
            <AvatarFallback>{dashboardStudent.name[0]}</AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-semibold">{dashboardStudent.name}</div>
              <div className="truncate text-[11px] text-muted-foreground">
                {student.rank} · Lv {student.level}
              </div>
            </div>
          )}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}

