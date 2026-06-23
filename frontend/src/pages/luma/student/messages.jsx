import { useState } from "react";
import { motion } from "framer-motion";
import { Send } from "lucide-react";
import { PageHeader } from "@/features/student/components/PageHeader";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { messages } from "@/features/student/data/mock";
const SEED = {
  m1: [
    {
      who: "them",
      text: "Hi Aarav — really impressed by your component library submission!",
    },
    { who: "me", text: "Thank you 🙏 I spent the weekend refining the API." },
    {
      who: "them",
      text: "Let's jump on a 15-min call to discuss the next stretch goal?",
    },
  ],
  m2: [
    { who: "them", text: "Mia: anyone up for pairing tonight?" },
    { who: "them", text: "Jordan: I'm in around 9pm" },
  ],
  m3: [
    {
      who: "them",
      text: "Your project proposal looks promising. A few notes inline.",
    },
  ],
};
export default function MessagesPage() {
  const [threads, setThreads] = useState(messages);
  const [activeId, setActiveId] = useState(threads[0].id);
  const [convos, setConvos] = useState(SEED);
  const [input, setInput] = useState("");
  const active = threads.find((t) => t.id === activeId);
  const msgs = convos[activeId] ?? [];
  const send = () => {
    const text = input.trim();
    if (!text) return;
    setConvos((c) => ({
      ...c,
      [activeId]: [...(c[activeId] ?? []), { who: "me", text }],
    }));
    setInput("");
    // Auto-reply for life-like feel
    setTimeout(() => {
      setConvos((c) => ({
        ...c,
        [activeId]: [
          ...(c[activeId] ?? []),
          { who: "them", text: "Got it — let me check and circle back." },
        ],
      }));
    }, 900);
    setThreads((t) =>
      t.map((x) => (x.id === activeId ? { ...x, preview: text, time: "now", unread: false } : x)),
    );
  };
  const openThread = (id) => {
    setActiveId(id);
    setThreads((t) => t.map((x) => (x.id === id ? { ...x, unread: false } : x)));
  };
  return (
    <div className="mx-auto max-w-[1300px]">
      <PageHeader eyebrow="Direct" title="Messages" />
      <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
        <div className="rounded-2xl card-premium overflow-hidden">
          <ul className="divide-y divide-border/60">
            {threads.map((m, i) => (
              <motion.li
                key={m.id}
                initial={{ opacity: 0, x: -4 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                onClick={() => openThread(m.id)}
                className={`flex gap-3 p-4 cursor-pointer ${m.id === activeId ? "bg-muted/50" : "hover:bg-muted/30"}`}
              >
                <Avatar className="h-10 w-10">
                  <AvatarImage src={m.avatar} alt={m.from} />
                  <AvatarFallback>{m.from[0]}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="truncate text-sm font-medium">{m.from}</span>
                    <span className="text-xs text-muted-foreground">{m.time}</span>
                  </div>
                  <div className="truncate text-xs text-muted-foreground">{m.preview}</div>
                </div>
                {m.unread && (
                  <Badge className="h-5 self-start border-0 gradient-primary text-primary-foreground text-[10px]">
                    new
                  </Badge>
                )}
              </motion.li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col rounded-2xl card-premium">
          <div className="flex items-center gap-3 border-b border-border/60 p-4">
            <Avatar className="h-10 w-10 ring-2 ring-primary/30">
              <AvatarImage src={active.avatar} alt={active.from} />
              <AvatarFallback>{active.from[0]}</AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium">{active.from}</div>
              <div className="text-xs text-success">● Online</div>
            </div>
          </div>
          <div className="flex-1 space-y-3 p-4 min-h-[400px] max-h-[520px] overflow-y-auto">
            {msgs.map((m, i) => (
              <Bubble key={i} who={m.who}>
                {m.text}
              </Bubble>
            ))}
          </div>
          <form
            className="flex gap-2 border-t border-border/60 p-3"
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message…"
              className="h-11 rounded-xl"
            />
            <Button
              type="submit"
              className="h-11 rounded-xl gradient-primary border-0 text-primary-foreground px-4"
              disabled={!input.trim()}
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
function Bubble({ who, children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${who === "me" ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`max-w-md rounded-2xl px-4 py-2.5 text-sm ${who === "me" ? "gradient-primary text-primary-foreground rounded-br-sm" : "bg-muted rounded-bl-sm"}`}
      >
        {children}
      </div>
    </motion.div>
  );
}

