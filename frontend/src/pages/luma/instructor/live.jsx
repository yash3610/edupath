import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  CalendarPlus,
  Mic,
  MicOff,
  Play,
  Send,
  Users,
  Video,
  VideoOff,
  PhoneOff,
  Pencil,
  Trash2,
  ScreenShare,
} from "lucide-react";
import { LmsPageHeader } from "@/features/shared/components/PageHeader";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/features/shared/components/StatusBadge";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { upcomingLive } from "@/features/instructor/data/instructor";
import { toast } from "sonner";
import usePersistedDashboardState from "@/hooks/usePersistedDashboardState";
export default function LivePage() {
  const [tab, setTab] = useState("upcoming");
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [list, setList] = usePersistedDashboardState(
    "instructor",
    "upcomingLive",
    () => upcomingLive.map((c) => ({ ...c })),
  );
  const [editing, setEditing] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [room, setRoom] = useState(null);
  // schedule form
  const [draft, setDraft] = useState({
    title: "",
    desc: "",
    date: "",
    time: "",
    reminders: true,
  });
  const filtered = useMemo(
    () =>
      list.filter((c) =>
        tab === "upcoming" ? c.status === "live" || c.status === "upcoming" : c.status === tab,
      ),
    [list, tab],
  );
  const updateClass = (id, patch) =>
    setList((l) => l.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  const startOrJoin = (c) => {
    if (c.status === "upcoming") updateClass(c.id, { status: "live" });
    setRoom({ ...c, status: "live" });
    toast.success(`${c.status === "live" ? "Joining" : "Starting"} ${c.title}`);
  };
  const endClass = () => {
    if (!room) return;
    updateClass(room.id, { status: "completed" });
    toast.success("Class ended");
    setRoom(null);
  };
  const saveEdit = () => {
    if (!editing) return;
    updateClass(editing.id, editing);
    toast.success("Class updated");
    setEditing(null);
  };
  const scheduleClass = () => {
    if (!draft.title || !draft.date || !draft.time) {
      toast.error("Title, date and time are required");
      return;
    }
    const newClass = {
      id: `LC-${Date.now()}`,
      title: draft.title,
      course: "New Course",
      date: `${draft.date} · ${draft.time}`,
      attendees: 0,
      status: "upcoming",
    };
    setList((l) => [newClass, ...l]);
    toast.success("Live class scheduled");
    setScheduleOpen(false);
    setDraft({ title: "", desc: "", date: "", time: "", reminders: true });
  };
  return (
    <div className="mx-auto max-w-[1300px]">
      <LmsPageHeader
        eyebrow="Learners"
        title="Live Classes"
        description="Schedule, run, and review live sessions."
        actions={
          <Button
            className="rounded-xl gradient-primary border-0 text-primary-foreground"
            onClick={() => setScheduleOpen(true)}
          >
            <CalendarPlus className="mr-1.5 h-4 w-4" /> Schedule live
          </Button>
        }
      />

      <Tabs value={tab} onValueChange={(v) => setTab(v)} className="mb-5">
        <TabsList className="rounded-xl bg-muted/60 p-1">
          {["upcoming", "completed", "cancelled"].map((s) => (
            <TabsTrigger key={s} value={s} className="rounded-lg capitalize">
              {s}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {filtered.length === 0 ? (
        <div className="rounded-2xl card-premium p-10 text-center text-sm text-muted-foreground">
          No {tab} classes yet.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((c, i) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="rounded-2xl card-premium p-5"
            >
              <div className="flex items-start justify-between">
                <div className="grid h-12 w-12 place-items-center rounded-xl gradient-primary shadow-glow">
                  <Video className="h-5 w-5 text-primary-foreground" />
                </div>
                <StatusBadge status={c.status} />
              </div>
              <h3 className="mt-3 font-display text-base font-semibold">{c.title}</h3>
              <Badge variant="outline" className="mt-1 border-border/60">
                {c.course}
              </Badge>
              <div className="mt-3 text-sm text-muted-foreground">
                {c.date} · {c.attendees} registered
              </div>
              <div className="mt-4 flex gap-2">
                {c.status === "completed" || c.status === "cancelled" ? (
                  <Button
                    variant="outline"
                    className="flex-1 rounded-xl border-border/60"
                    onClick={() => toast(`Replay opening for ${c.title}`)}
                  >
                    <Play className="mr-1.5 h-4 w-4" /> Replay
                  </Button>
                ) : (
                  <Button
                    className="flex-1 rounded-xl gradient-primary border-0 text-primary-foreground"
                    onClick={() => startOrJoin(c)}
                  >
                    <Play className="mr-1.5 h-4 w-4" /> {c.status === "live" ? "Join" : "Start"}
                  </Button>
                )}
                <Button
                  variant="outline"
                  className="rounded-xl border-border/60"
                  onClick={() => setEditing({ ...c })}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                {c.status !== "completed" && (
                  <Button
                    variant="outline"
                    className="rounded-xl border-border/60 text-destructive"
                    onClick={() => setConfirmDelete(c)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Schedule dialog */}
      <Dialog open={scheduleOpen} onOpenChange={setScheduleOpen}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-display">Schedule live class</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label>Title</Label>
              <Input
                className="mt-1 rounded-xl"
                placeholder="Server Components Q&A"
                value={draft.title}
                onChange={(e) => setDraft({ ...draft, title: e.target.value })}
              />
            </div>
            <div className="sm:col-span-2">
              <Label>Description</Label>
              <Textarea
                rows={3}
                className="mt-1 rounded-xl"
                value={draft.desc}
                onChange={(e) => setDraft({ ...draft, desc: e.target.value })}
              />
            </div>
            <div>
              <Label>Date</Label>
              <Input
                type="date"
                className="mt-1 rounded-xl"
                value={draft.date}
                onChange={(e) => setDraft({ ...draft, date: e.target.value })}
              />
            </div>
            <div>
              <Label>Time</Label>
              <Input
                type="time"
                className="mt-1 rounded-xl"
                value={draft.time}
                onChange={(e) => setDraft({ ...draft, time: e.target.value })}
              />
            </div>
            <div className="sm:col-span-2 flex items-center justify-between rounded-xl bg-muted/30 p-3 text-sm">
              <span>Email reminders</span>
              <Switch
                checked={draft.reminders}
                onCheckedChange={(v) => setDraft({ ...draft, reminders: v })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setScheduleOpen(false)} className="rounded-xl">
              Cancel
            </Button>
            <Button
              onClick={scheduleClass}
              className="rounded-xl gradient-primary border-0 text-primary-foreground"
            >
              Schedule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit dialog */}
      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-display">Edit live class</DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label>Title</Label>
                <Input
                  className="mt-1 rounded-xl"
                  value={editing.title}
                  onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                />
              </div>
              <div className="sm:col-span-2">
                <Label>Course</Label>
                <Input
                  className="mt-1 rounded-xl"
                  value={editing.course}
                  onChange={(e) => setEditing({ ...editing, course: e.target.value })}
                />
              </div>
              <div className="sm:col-span-2">
                <Label>When</Label>
                <Input
                  className="mt-1 rounded-xl"
                  value={editing.date}
                  onChange={(e) => setEditing({ ...editing, date: e.target.value })}
                />
              </div>
              <div>
                <Label>Attendees</Label>
                <Input
                  type="number"
                  className="mt-1 rounded-xl"
                  value={editing.attendees}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      attendees: Number(e.target.value) || 0,
                    })
                  }
                />
              </div>
              <div>
                <Label>Status</Label>
                <select
                  className="mt-1 w-full rounded-xl border border-border/60 bg-background p-2 text-sm"
                  value={editing.status}
                  onChange={(e) => setEditing({ ...editing, status: e.target.value })}
                >
                  <option value="upcoming">Upcoming</option>
                  <option value="live">Live</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="ghost" onClick={() => setEditing(null)} className="rounded-xl">
              Cancel
            </Button>
            <Button
              onClick={saveEdit}
              className="rounded-xl gradient-primary border-0 text-primary-foreground"
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm delete */}
      <Dialog open={!!confirmDelete} onOpenChange={(o) => !o && setConfirmDelete(null)}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-display">Cancel this class?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            "{confirmDelete?.title}" will be marked as cancelled. Registered learners will be
            notified.
          </p>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setConfirmDelete(null)} className="rounded-xl">
              Keep
            </Button>
            <Button
              className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (confirmDelete) {
                  updateClass(confirmDelete.id, { status: "cancelled" });
                  toast.success("Class cancelled");
                }
                setConfirmDelete(null);
              }}
            >
              Cancel class
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Live room */}
      <LiveRoomDialog room={room} onClose={() => setRoom(null)} onEnd={endClass} />
    </div>
  );
}
function LiveRoomDialog({ room, onClose, onEnd }) {
  const [mic, setMic] = useState(true);
  const [cam, setCam] = useState(true);
  const [share, setShare] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const scrollRef = useRef(null);
  useEffect(() => {
    if (!room) return;
    setElapsed(0);
    setMessages([
      { id: "m1", user: "Aarav", text: "Hi instructor! 👋" },
      { id: "m2", user: "Priya", text: "Audio is clear." },
      { id: "m3", user: "Devon", text: "Excited for today's session." },
    ]);
    const t = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(t);
  }, [room]);
  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);
  if (!room) return null;
  const fmt = (s) => {
    const m = Math.floor(s / 60)
      .toString()
      .padStart(2, "0");
    const r = (s % 60).toString().padStart(2, "0");
    return `${m}:${r}`;
  };
  const send = () => {
    const text = input.trim();
    if (!text) return;
    setMessages((m) => [...m, { id: `me-${Date.now()}`, user: "You", text, me: true }]);
    setInput("");
    setTimeout(() => {
      const replies = [
        "Got it!",
        "Thanks for the explanation 🙏",
        "Could you repeat that?",
        "Makes sense now.",
      ];
      const users = ["Aarav", "Priya", "Devon", "Mia", "Kai"];
      setMessages((m) => [
        ...m,
        {
          id: `r-${Date.now()}`,
          user: users[Math.floor(Math.random() * users.length)],
          text: replies[Math.floor(Math.random() * replies.length)],
        },
      ]);
    }, 900);
  };
  return (
    <Dialog open={!!room} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-5xl rounded-2xl p-0 overflow-hidden">
        <div className="grid md:grid-cols-[1fr_320px]">
          {/* Stage */}
          <div className="bg-black text-white">
            <div className="flex items-center justify-between px-4 py-3 bg-black/60 border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className="inline-flex h-2 w-2 animate-pulse rounded-full bg-red-500" />
                <span className="text-xs font-semibold uppercase tracking-wide">Live</span>
                <span className="text-xs text-white/60">· {fmt(elapsed)}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-white/70">
                <Users className="h-3.5 w-3.5" /> {room.attendees} watching
              </div>
            </div>
            <div className="relative aspect-video bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 grid place-items-center">
              {cam ? (
                <div className="flex flex-col items-center gap-3">
                  <div className="h-20 w-20 rounded-full bg-gradient-to-br from-indigo-500 to-fuchsia-500 grid place-items-center text-2xl font-display font-bold">
                    {room.title.charAt(0)}
                  </div>
                  <div className="text-sm text-white/80">{room.title}</div>
                  <div className="text-xs text-white/50">
                    {share ? "Sharing your screen" : "Camera on · Instructor view"}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 text-white/60">
                  <VideoOff className="h-10 w-10" />
                  <div className="text-sm">Camera off</div>
                </div>
              )}
              <div className="absolute bottom-3 left-3 rounded-md bg-black/60 px-2 py-1 text-xs">
                You (Host)
              </div>
            </div>
            <div className="flex items-center justify-center gap-2 bg-black/80 p-3">
              <Button
                size="icon"
                variant={mic ? "secondary" : "destructive"}
                className="rounded-full"
                onClick={() => setMic((v) => !v)}
              >
                {mic ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
              </Button>
              <Button
                size="icon"
                variant={cam ? "secondary" : "destructive"}
                className="rounded-full"
                onClick={() => setCam((v) => !v)}
              >
                {cam ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
              </Button>
              <Button
                size="icon"
                variant={share ? "default" : "secondary"}
                className="rounded-full"
                onClick={() => {
                  setShare((v) => !v);
                  toast(share ? "Stopped sharing" : "Sharing screen");
                }}
              >
                <ScreenShare className="h-4 w-4" />
              </Button>
              <Button
                className="rounded-full bg-red-600 hover:bg-red-700 text-white"
                onClick={onEnd}
              >
                <PhoneOff className="mr-1.5 h-4 w-4" /> End class
              </Button>
            </div>
          </div>

          {/* Chat */}
          <div className="flex flex-col border-l border-border/60 bg-background h-[520px]">
            <DialogHeader className="px-4 py-3 border-b border-border/60">
              <DialogTitle className="font-display text-sm">Class chat</DialogTitle>
            </DialogHeader>
            <ScrollArea className="flex-1">
              <div ref={scrollRef} className="space-y-2 px-3 py-3">
                {messages.map((m) => (
                  <div key={m.id} className={`flex ${m.me ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${m.me ? "gradient-primary text-primary-foreground" : "bg-muted"}`}
                    >
                      {!m.me && (
                        <div className="text-[10px] font-medium opacity-70 mb-0.5">{m.user}</div>
                      )}
                      {m.text}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <div className="flex items-center gap-2 border-t border-border/60 p-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
                placeholder="Message learners…"
                className="rounded-xl"
              />
              <Button
                size="icon"
                className="rounded-xl gradient-primary border-0 text-primary-foreground"
                onClick={send}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

