import { useState } from "react";
import { motion } from "framer-motion";
import { Paperclip, Send } from "lucide-react";
import { LmsPageHeader } from "@/features/shared/components/PageHeader";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { messages } from "@/features/instructor/data/instructor";
import { toast } from "sonner";
const SEED = Object.fromEntries(messages.map((m) => [m.id, [{ who: "them", text: m.preview }]]));
export default function MessagesPage() {
  const [threads, setThreads] = useState(messages);
  const [activeId, setActiveId] = useState(threads[0].id);
  const [convos, setConvos] = useState(SEED);
  const [input, setInput] = useState("");
  const [q, setQ] = useState("");
  const active = threads.find((t) => t.id === activeId);
  const msgs = convos[activeId] ?? [];
  const filtered = threads.filter((t) => !q || t.from.toLowerCase().includes(q.toLowerCase()));
  const send = () => {
    const text = input.trim();
    if (!text) return;
    setConvos((c) => ({
      ...c,
      [activeId]: [...(c[activeId] ?? []), { who: "me", text }],
    }));
    setThreads((t) =>
      t.map((x) => (x.id === activeId ? { ...x, preview: text, time: "now", unread: false } : x)),
    );
    setInput("");
    setTimeout(() => {
      setConvos((c) => ({
        ...c,
        [activeId]: [...(c[activeId] ?? []), { who: "them", text: "Thanks! I'll take a look." }],
      }));
    }, 900);
  };
  const openThread = (id) => {
    setActiveId(id);
    setThreads((t) => t.map((x) => (x.id === id ? { ...x, unread: false } : x)));
  };
  return (
    <div className="mx-auto max-w-[1300px]">
      <LmsPageHeader
        eyebrow="Account"
        title="Messages"
        description="Conversations with your students."
      />
      <div className="grid h-[640px] grid-cols-1 gap-0 overflow-hidden rounded-2xl card-premium md:grid-cols-[320px_1fr]">
        <aside className="flex flex-col border-r border-border/60 bg-muted/10">
          <div className="border-b border-border/60 p-3">
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search…"
              className="h-9 rounded-xl bg-muted/40"
            />
          </div>
          <div className="flex-1 overflow-y-auto">
            {filtered.map((m) => (
              <button
                key={m.id}
                onClick={() => openThread(m.id)}
                className={`flex w-full items-start gap-3 border-b border-border/40 px-3 py-3 text-left transition hover:bg-muted/30 ${activeId === m.id ? "bg-muted/30" : ""}`}
              >
                <Avatar className="h-10 w-10">
                  <AvatarImage src={m.avatar} />
                  <AvatarFallback>{m.from[0]}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <div className="truncate text-sm font-medium">{m.from}</div>
                    <div className="text-[10px] text-muted-foreground">{m.time}</div>
                  </div>
                  <div
                    className={`truncate text-xs ${m.unread ? "text-foreground font-medium" : "text-muted-foreground"}`}
                  >
                    {m.preview}
                  </div>
                </div>
                {m.unread && <span className="mt-2 h-2 w-2 rounded-full bg-primary" />}
              </button>
            ))}
          </div>
        </aside>

        <section className="flex flex-col">
          <header className="flex items-center justify-between border-b border-border/60 p-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-9 w-9">
                <AvatarImage src={active.avatar} />
                <AvatarFallback>{active.from[0]}</AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium">{active.from}</div>
                <div className="text-xs text-success">● Online</div>
              </div>
            </div>
          </header>
          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {msgs.map((m, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className={
                  m.who === "me"
                    ? "ml-auto max-w-md rounded-2xl rounded-br-sm gradient-primary p-3 text-sm text-primary-foreground shadow-glow"
                    : "max-w-md rounded-2xl rounded-bl-sm bg-muted/30 p-3 text-sm"
                }
              >
                {m.text}
              </motion.div>
            ))}
          </div>
          <form
            className="flex items-center gap-2 border-t border-border/60 p-3"
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
          >
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-xl"
              onClick={() => toast("Attachment picker coming soon")}
            >
              <Paperclip className="h-4 w-4" />
            </Button>
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message…"
              className="h-10 rounded-xl bg-muted/30"
            />
            <Button
              type="submit"
              className="h-10 rounded-xl gradient-primary border-0 text-primary-foreground"
              disabled={!input.trim()}
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </section>
      </div>
    </div>
  );
}

