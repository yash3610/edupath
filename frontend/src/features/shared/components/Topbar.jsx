import { useEffect, useState } from "react";
import { Command as CmdIcon, MessageSquare, Moon, Plus, Search, Sun } from "lucide-react";
import { Link } from "react-router-dom";
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
import { applyDashboardTheme, onDashboardThemeChange, readStoredDashboardTheme } from "@/utils/themePreferences";

export function LmsTopbar({ user, notifPath, primaryAction }) {
  const { logout } = useAuth();
  const roleBase = user.role.toLowerCase() === "admin" ? "/admin/dashboard" : "/instructor/dashboard";
  const [dark, setDark] = useState(true);

  useEffect(() => {
    const current = applyDashboardTheme(readStoredDashboardTheme());
    setDark(current.dark);
    return onDashboardThemeChange((theme) => setDark(theme.dark));
  }, []);

  const toggle = () => {
    const next = !dark;
    const current = readStoredDashboardTheme();
    const applied = applyDashboardTheme({
      theme: next ? "dark" : "light",
      accent: current.accent,
    });
    setDark(applied.dark);
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border/60 bg-background/70 px-4 backdrop-blur-xl md:px-6">
      <SidebarTrigger className="-ml-1" />
      <div className="relative hidden flex-1 max-w-md md:block">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search students, courses, orders..."
          className="h-10 rounded-xl border-border/60 bg-muted/40 pl-9 pr-16 placeholder:text-muted-foreground/70 focus-visible:ring-primary/40"
        />
        <kbd className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 items-center gap-1 rounded-md border border-border/60 bg-background px-1.5 py-0.5 text-[10px] text-muted-foreground md:inline-flex">
          <CmdIcon className="h-3 w-3" /> K
        </kbd>
      </div>
      <div className="flex-1 md:hidden" />

      {primaryAction && (
        <Link to={primaryAction.to} className="ml-auto hidden sm:inline-flex">
          <Button size="sm" className="h-9 rounded-xl gradient-primary border-0 text-primary-foreground">
            <Plus className="mr-1.5 h-3.5 w-3.5" /> {primaryAction.label}
          </Button>
        </Link>
      )}

      <Button variant="ghost" size="icon" onClick={toggle} className={primaryAction ? "rounded-xl" : "ml-auto rounded-xl"}>
        {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </Button>

      <NotificationBell notifPath={notifPath} />

      <Button variant="ghost" size="icon" className="rounded-xl hidden sm:inline-flex">
        <MessageSquare className="h-4 w-4" />
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="ml-1 outline-none">
            <Avatar className="h-9 w-9 ring-2 ring-primary/40 transition-all hover:ring-primary">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback>{user.name[0]}</AvatarFallback>
            </Avatar>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 rounded-2xl">
          <DropdownMenuLabel>
            <div className="font-semibold">{user.name}</div>
            <div className="text-xs text-muted-foreground">{user.role}</div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild><Link to={`${roleBase}/profile`}>Profile</Link></DropdownMenuItem>
          <DropdownMenuItem asChild><Link to={`${roleBase}/settings`}>Settings</Link></DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => logout()}>
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
