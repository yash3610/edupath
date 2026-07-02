import { useEffect, useState } from "react";
import { Command as CmdIcon, LogOut, Moon, Search, Settings, Sun, UserRound } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import NotificationBell from "@/components/notifications/NotificationBell";
import { useAuth } from "@/context/AuthContext";

export function Topbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const displayName = user?.name || "Student";
  const displayEmail = user?.email || "";
  const avatar = user?.avatar || user?.profileImage || "";
  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase() || "S";
  const [dark, setDark] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("luma-theme");
    const isDark = stored ? stored === "dark" : true;
    setDark(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("luma-theme", next ? "dark" : "light");
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border/60 bg-background/70 px-4 backdrop-blur-xl md:px-6">
      <SidebarTrigger className="-ml-1" />
      <div className="relative hidden flex-1 max-w-md md:block">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search courses, lectures, notes..."
          className="h-10 rounded-xl border-border/60 bg-muted/40 pl-9 pr-16 placeholder:text-muted-foreground/70 focus-visible:ring-primary/40"
        />
        <kbd className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 items-center gap-1 rounded-md border border-border/60 bg-background px-1.5 py-0.5 text-[10px] text-muted-foreground md:inline-flex">
          <CmdIcon className="h-3 w-3" /> K
        </kbd>
      </div>
      <div className="flex-1 md:hidden" />
      <Button variant="ghost" size="icon" onClick={toggle} className="ml-auto rounded-xl">
        {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </Button>
      <NotificationBell notifPath="/dashboard/notifications" />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button type="button" className="ml-1 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-primary/50">
            <Avatar className="h-9 w-9 ring-2 ring-primary/40 transition-all hover:ring-primary">
              <AvatarImage src={avatar} alt={displayName} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64 rounded-2xl">
          <DropdownMenuLabel className="space-y-1">
            <div className="truncate font-semibold">{displayName}</div>
            <div className="truncate text-xs font-normal text-muted-foreground">
              {displayEmail || "Email not available"}
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link to="/dashboard/profile" className="cursor-pointer">
              <UserRound className="mr-2 h-4 w-4" />
              Profile
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to="/dashboard/settings" className="cursor-pointer">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="cursor-pointer text-destructive focus:text-destructive" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
