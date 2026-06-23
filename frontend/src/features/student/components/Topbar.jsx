import { useEffect, useState } from "react";
import { Bell, Moon, Search, Sun, Command as CmdIcon } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { student } from "@/features/student/data/mock";
import { useAuth } from "@/context/AuthContext";
export function Topbar() {
  const { user } = useAuth();
  const dashboardStudent = {
    ...student,
    name: user?.name || student.name,
    avatar: user?.avatar || student.avatar,
  };
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
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border/60 bg-background/70 px-4 backdrop-blur-xl md:px-6">
      <SidebarTrigger className="-ml-1" />
      <div className="relative hidden flex-1 max-w-md md:block">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search courses, lectures, notes…"
          className="h-10 rounded-xl border-border/60 bg-muted/40 pl-9 pr-16 placeholder:text-muted-foreground/70 focus-visible:ring-primary/40"
        />
        <kbd className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 items-center gap-1 rounded-md border border-border/60 bg-background px-1.5 py-0.5 text-[10px] text-muted-foreground md:inline-flex">
          <CmdIcon className="h-3 w-3" /> K
        </kbd>
      </div>
      <div className="flex-1 md:hidden" />
      <Link to="/admin/dashboard" className="hidden md:inline-flex">
        <Button variant="outline" size="sm" className="h-9 rounded-xl border-border/60">
          Admin
        </Button>
      </Link>
      <Link to="/instructor/dashboard" className="hidden md:inline-flex">
        <Button
          size="sm"
          className="h-9 rounded-xl gradient-primary border-0 text-primary-foreground"
        >
          Instructor
        </Button>
      </Link>
      <Button variant="ghost" size="icon" onClick={toggle} className="rounded-xl">
        {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </Button>
      <Link to="/dashboard/notifications">
        <Button variant="ghost" size="icon" className="relative rounded-xl">
          <Bell className="h-4 w-4" />
          <Badge className="absolute -right-0.5 -top-0.5 h-4 min-w-4 rounded-full px-1 text-[10px] gradient-accent border-0 text-accent-foreground">
            3
          </Badge>
        </Button>
      </Link>
      <Link to="/dashboard/profile" className="ml-1">
        <Avatar className="h-9 w-9 ring-2 ring-primary/40 transition-all hover:ring-primary">
          <AvatarImage src={dashboardStudent.avatar} alt={dashboardStudent.name} />
          <AvatarFallback>{dashboardStudent.name[0]}</AvatarFallback>
        </Avatar>
      </Link>
    </header>
  );
}

