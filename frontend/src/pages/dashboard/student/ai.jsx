import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import {
  Brain,
  Briefcase,
  Compass,
  LineChart as LucideLineChart,
  MessageSquare,
  Plus,
  Route as RouteIcon,
  ScrollText,
  Send,
  Sparkles,
  Square,
  Target,
  Wand2,
} from "lucide-react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { PageHeader } from "@/features/student/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { aiFeatures, student, continueLearning } from "@/features/student/data/mock";
import { apiUrl } from "@/services/api";
const icons = {
  MessageSquare,
  Wand2,
  ScrollText,
  Compass,
  Route: RouteIcon,
  LineChart: LucideLineChart,
  Target,
  Briefcase,
};
const STORAGE_KEY = "luma:ai-tutor:messages:v1";
function loadMessages() {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
const courseContext = `${continueLearning.course.title} — current lecture: "${continueLearning.lecture}" (${continueLearning.chapter})`;
const courseSuggestions = [
  `Explain "${continueLearning.lecture}" like I'm 12`,
  `Quiz me on ${continueLearning.course.title}`,
  `Summarize ${continueLearning.chapter}`,
  `What should I learn next after this lecture?`,
];
export default function AIPage() {
  const [initialMessages] = useState(() => loadMessages());
  const [input, setInput] = useState("");
  const scrollerRef = useRef(null);
  const inputRef = useRef(null);
  const transport = useRef(
    new DefaultChatTransport({
      api: apiUrl("/api/chat"),
      body: { courseContext },
    }),
  ).current;
  const { messages, sendMessage, status, error, stop, setMessages } = useChat({
    id: "luma-ai-tutor",
    messages: initialMessages,
    transport,
  });
  // persist
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch {
      /* ignore quota */
    }
  }, [messages]);
  // autoscroll
  useEffect(() => {
    scrollerRef.current?.scrollTo({
      top: scrollerRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, status]);
  // keep focus on textarea
  useEffect(() => {
    inputRef.current?.focus();
  }, [status]);
  const isStreaming = status === "submitted" || status === "streaming";
  const submit = async (text) => {
    const value = text.trim();
    if (!value || isStreaming) return;
    setInput("");
    await sendMessage({ text: value });
  };
  const onSubmit = (e) => {
    e.preventDefault();
    void submit(input);
  };
  const newChat = () => {
    setMessages([]);
    if (typeof window !== "undefined") window.localStorage.removeItem(STORAGE_KEY);
    inputRef.current?.focus();
  };
  return (
    <div className="mx-auto max-w-[1400px]">
      <PageHeader
        eyebrow="Intelligence"
        title="AI Learning Assistant"
        description="A real AI tutor with full context of what you're learning today."
      />

      {/* Hero chat panel */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative mb-10 overflow-hidden rounded-3xl border border-border bg-card shadow-elegant"
      >
        <div className="pointer-events-none absolute inset-0 gradient-hero" />
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full gradient-aurora opacity-40 blur-3xl animate-aurora" />

        <div className="relative grid gap-0 md:grid-cols-[1fr_280px]">
          {/* Chat column */}
          <div className="flex min-h-[560px] flex-col p-6 md:p-8">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="grid h-10 w-10 place-items-center rounded-2xl gradient-primary shadow-glow">
                  <Brain className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <div className="font-display text-lg font-semibold">Luma AI Tutor</div>
                  <div className="text-xs text-muted-foreground">
                    Context:{" "}
                    <span className="text-foreground/80">{continueLearning.course.title}</span>
                  </div>
                </div>
              </div>
              <Button onClick={newChat} variant="ghost" size="sm" className="rounded-lg gap-1.5">
                <Plus className="h-4 w-4" /> New chat
              </Button>
            </div>

            <div
              ref={scrollerRef}
              className="flex-1 space-y-4 overflow-y-auto rounded-2xl bg-background/30 p-4 backdrop-blur-sm scroll-smooth"
              style={{ maxHeight: 460 }}
            >
              {messages.length === 0 && <EmptyState onPick={(t) => void submit(t)} />}

              <AnimatePresence initial={false}>
                {messages.map((m) => (
                  <ChatBubble key={m.id} message={m} />
                ))}
              </AnimatePresence>

              {status === "submitted" && <TypingBubble />}

              {error && (
                <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
                  {error.message || "Something went wrong. Please try again."}
                </div>
              )}
            </div>

            <form onSubmit={onSubmit} className="mt-4 flex items-end gap-2">
              <div className="relative flex-1">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      void submit(input);
                    }
                  }}
                  placeholder="Ask your AI tutor anything…"
                  rows={1}
                  className="w-full resize-none rounded-xl border border-border bg-background/60 px-4 py-3 pr-12 text-sm backdrop-blur outline-none transition-all focus:border-primary/60 focus:ring-2 focus:ring-primary/20"
                  style={{ minHeight: 48, maxHeight: 160 }}
                />
              </div>
              {isStreaming ? (
                <Button
                  type="button"
                  onClick={() => stop()}
                  className="h-12 rounded-xl border-0 bg-destructive/90 text-destructive-foreground px-4"
                >
                  <Square className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={!input.trim()}
                  className="h-12 rounded-xl gradient-primary border-0 text-primary-foreground px-5 disabled:opacity-50"
                >
                  <Send className="h-4 w-4" />
                </Button>
              )}
            </form>
          </div>

          {/* Suggestions column */}
          <aside className="hidden border-l border-border/60 bg-background/20 p-6 md:flex md:flex-col md:gap-4">
            <div>
              <Badge className="border-0 bg-accent/15 text-accent">Course-aware</Badge>
              <h3 className="mt-2 font-display text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Try asking
              </h3>
            </div>
            <div className="flex flex-col gap-2">
              {courseSuggestions.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => void submit(s)}
                  disabled={isStreaming}
                  className="rounded-xl border border-border/60 bg-background/40 px-3 py-3 text-left text-xs leading-snug backdrop-blur-md transition-all hover:border-primary/60 hover:bg-background/70 disabled:opacity-50"
                >
                  {s}
                </button>
              ))}
            </div>
            <div className="mt-auto rounded-xl border border-border/60 bg-background/40 p-3 text-[11px] text-muted-foreground">
              Conversation history saved in this browser. Use{" "}
              <span className="text-foreground">New chat</span> to reset.
            </div>
          </aside>
        </div>
      </motion.div>

      <h2 className="mb-4 font-display text-2xl font-semibold">AI Toolkit</h2>
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {aiFeatures.map((f, i) => {
          const Icon = icons[f.icon] ?? Sparkles;
          return (
            <motion.div
              key={f.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              whileHover={{ y: -4 }}
              className="group relative overflow-hidden rounded-2xl card-premium p-6"
            >
              <div
                className={`pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full ${f.accent === "primary" ? "bg-primary/30" : "bg-accent/30"} blur-2xl opacity-0 transition-opacity group-hover:opacity-100`}
              />
              <div
                className={`grid h-12 w-12 place-items-center rounded-xl ${f.accent === "primary" ? "gradient-primary text-primary-foreground" : "gradient-accent text-accent-foreground"} shadow-soft`}
              >
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="mt-4 font-display text-lg font-semibold">{f.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
              <Button
                variant="ghost"
                className="mt-4 rounded-lg px-0 text-primary hover:bg-transparent"
              >
                Open →
              </Button>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
function messageText(m) {
  return m.parts.map((p) => (p.type === "text" ? p.text : "")).join("");
}
function ChatBubble({ message }) {
  const isUser = message.role === "user";
  const text = messageText(message);
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className={`flex gap-3 ${isUser ? "flex-row-reverse" : ""}`}
    >
      {isUser ? (
        <Avatar className="h-8 w-8 shrink-0">
          <AvatarImage src={student.avatar} alt={student.name} />
          <AvatarFallback className="bg-primary/15 text-primary">{student.name[0]}</AvatarFallback>
        </Avatar>
      ) : (
        <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full gradient-primary shadow-glow">
          <Sparkles className="h-4 w-4 text-primary-foreground" />
        </div>
      )}
      <div
        className={`max-w-[80%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
          isUser
            ? "gradient-primary text-primary-foreground rounded-tr-sm"
            : "glass-strong rounded-tl-sm"
        }`}
      >
        {text || <span className="opacity-60">…</span>}
      </div>
    </motion.div>
  );
}
function TypingBubble() {
  return (
    <div className="flex gap-3">
      <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full gradient-primary shadow-glow">
        <Sparkles className="h-4 w-4 text-primary-foreground" />
      </div>
      <div className="glass-strong flex items-center gap-1.5 rounded-2xl rounded-tl-sm px-4 py-3">
        <Dot delay={0} />
        <Dot delay={0.15} />
        <Dot delay={0.3} />
      </div>
    </div>
  );
}
function Dot({ delay }) {
  return (
    <motion.span
      className="h-1.5 w-1.5 rounded-full bg-foreground/60"
      animate={{ y: [0, -3, 0], opacity: [0.4, 1, 0.4] }}
      transition={{ duration: 1, repeat: Infinity, delay }}
    />
  );
}
function EmptyState({ onPick }) {
  return (
    <div className="flex h-full flex-col items-center justify-center px-4 py-10 text-center">
      <div className="grid h-14 w-14 place-items-center rounded-2xl gradient-primary shadow-glow">
        <Brain className="h-7 w-7 text-primary-foreground" />
      </div>
      <h3 className="mt-4 font-display text-xl font-semibold">
        What do you want to understand today?
      </h3>
      <p className="mt-1 max-w-md text-sm text-muted-foreground">
        Ask anything — from a tricky line of code to a full career plan. I know what lecture
        you're on.
      </p>
      <div className="mt-5 grid w-full max-w-md gap-2 sm:grid-cols-2">
        {courseSuggestions.slice(0, 4).map((s) => (
          <button
            key={s}
            onClick={() => onPick(s)}
            className="rounded-xl border border-border/60 bg-background/40 px-3 py-2.5 text-left text-xs leading-snug backdrop-blur transition-all hover:border-primary/60 hover:bg-background/70"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}

