import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  Loader2,
  MessageSquarePlus,
  Paperclip,
  Search,
  Send,
} from "lucide-react";
import { toast } from "sonner";
import { LmsPageHeader } from "@/features/shared/components/PageHeader";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { messages as demoThreads } from "@/features/instructor/data/instructor";
import usePersistedDashboardState from "@/hooks/usePersistedDashboardState";
import { assetUrl } from "@/services/api";
import { messageApi } from "@/services/messageApi";

const demoSeed = Object.fromEntries(
  demoThreads.map((thread) => [thread.id, [{ id: `${thread.id}-seed`, who: "them", text: thread.preview }]]),
);

function sameId(left, right) {
  return String(left || "") === String(right || "");
}

function initials(name = "U") {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase() || "U";
}

function relativeTime(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const diff = Date.now() - date.getTime();
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;
  if (diff < minute) return "now";
  if (diff < hour) return `${Math.floor(diff / minute)}m`;
  if (diff < day) return `${Math.floor(diff / hour)}h`;
  if (diff < 2 * day) return "Yesterday";
  if (diff < 7 * day) return `${Math.floor(diff / day)}d`;
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

function normalizeConversation(conversation, currentUserId) {
  const participants = Array.isArray(conversation?.participants) ? conversation.participants : [];
  const peer = participants.find((item) => !sameId(item?._id, currentUserId)) || participants[0] || {};
  return {
    id: String(conversation?._id || conversation?.id || ""),
    participantId: String(peer?._id || ""),
    from: peer?.name || "Student",
    email: peer?.email || "",
    role: peer?.role || "student",
    avatar: assetUrl(peer?.avatar),
    preview: conversation?.lastMessage || "No messages yet",
    time: relativeTime(conversation?.lastMessageAt || conversation?.updatedAt || conversation?.createdAt),
    unread: Number(conversation?.unreadCount || 0) > 0,
    rawTime: conversation?.lastMessageAt || conversation?.updatedAt || conversation?.createdAt,
    type: "conversation",
  };
}

function normalizeContact(contact) {
  return {
    id: `contact-${contact?._id || contact?.id}`,
    participantId: String(contact?._id || contact?.id || ""),
    from: contact?.name || "Student",
    email: contact?.email || "",
    role: contact?.role || "student",
    avatar: assetUrl(contact?.avatar),
    preview: "Start a new conversation",
    time: "",
    unread: false,
    type: "contact",
  };
}

function normalizeMessage(message, currentUserId) {
  const senderId = message?.sender?._id || message?.sender || "";
  return {
    id: String(message?._id || message?.id || `message-${Date.now()}`),
    who: sameId(senderId, currentUserId) ? "me" : "them",
    text: message?.body || "",
    attachmentUrl: assetUrl(message?.attachmentUrl),
    attachmentName: message?.attachmentName || "",
    attachmentType: message?.attachmentType || "",
    createdAt: message?.createdAt,
    pending: false,
  };
}

function keepValidActiveId(current, items) {
  if (items.some((item) => item.id === current)) return current;
  return items[0]?.id || "";
}

export default function MessagesPage() {
  const { user } = useAuth();
  const currentUserId = user?._id || user?.id;
  const [demoList, setDemoList] = usePersistedDashboardState("instructor", "messages", demoThreads);
  const [demoConvos, setDemoConvos] = useState(demoSeed);
  const [remoteThreads, setRemoteThreads] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [activeId, setActiveId] = useState("");
  const [remoteMessages, setRemoteMessages] = useState([]);
  const [input, setInput] = useState("");
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [demoMode, setDemoMode] = useState(false);
  const fileRef = useRef(null);
  const bottomRef = useRef(null);
  const messagesPaneRef = useRef(null);

  const loadConversations = useCallback(async ({ silent = false } = {}) => {
    if (!silent) setLoading(true);
    try {
      const [conversationResult, contactResult] = await Promise.all([
        messageApi.conversations(),
        messageApi.contacts(),
      ]);
      const normalizedThreads = (conversationResult.data || [])
        .map((item) => normalizeConversation(item, currentUserId))
        .filter((item) => item.id);
      const normalizedContacts = (contactResult.data || []).map(normalizeContact).filter((item) => item.participantId);

      setDemoMode(false);
      setRemoteThreads(normalizedThreads);
      setContacts(normalizedContacts);
      setActiveId((current) => keepValidActiveId(current, [...normalizedThreads, ...normalizedContacts]));
    } catch (error) {
      setDemoMode(true);
      setActiveId((current) => keepValidActiveId(current, demoList));
      if (!silent) {
        toast.error("Messages demo mode madhe load zale", {
          description: error.message || "Backend conversation API reachable nahi.",
        });
      }
    } finally {
      if (!silent) setLoading(false);
    }
  }, [currentUserId, demoList]);

  useEffect(() => {
    loadConversations();
    const timer = window.setInterval(() => loadConversations({ silent: true }), 20000);
    return () => window.clearInterval(timer);
  }, [loadConversations]);

  const listItems = useMemo(() => {
    if (demoMode) return demoList;
    const existingParticipants = new Set(remoteThreads.map((thread) => thread.participantId));
    return [
      ...remoteThreads,
      ...contacts.filter((contact) => !existingParticipants.has(contact.participantId)),
    ];
  }, [contacts, demoList, demoMode, remoteThreads]);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return listItems;
    return listItems.filter((item) =>
      [item.from, item.email, item.preview].some((value) => String(value || "").toLowerCase().includes(query)),
    );
  }, [listItems, q]);

  const active = listItems.find((thread) => thread.id === activeId) || listItems[0];
  const demoMsgs = demoConvos[activeId] || [];
  const visibleMessages = demoMode ? demoMsgs : remoteMessages;

  useEffect(() => {
    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    window.scrollTo({ top: 0, left: 0 });
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
    };
  }, []);

  const loadMessages = useCallback(async (conversationId) => {
    if (!conversationId || demoMode) return;
    setMessagesLoading(true);
    try {
      const result = await messageApi.messages(conversationId);
      setRemoteMessages((result.data || []).map((item) => normalizeMessage(item, currentUserId)));
      setRemoteThreads((threads) =>
        threads.map((thread) => (thread.id === conversationId ? { ...thread, unread: false } : thread)),
      );
    } catch (error) {
      toast.error("Conversation load zali nahi", {
        description: error.message || "Please refresh and try again.",
      });
    } finally {
      setMessagesLoading(false);
    }
  }, [currentUserId, demoMode]);

  useEffect(() => {
    if (!demoMode && active?.type === "conversation") loadMessages(active.id);
    if (demoMode && active?.id) {
      setDemoList((threads) => threads.map((thread) => (thread.id === active.id ? { ...thread, unread: false } : thread)));
    }
  }, [active?.id, active?.type, demoMode, loadMessages, setDemoList]);

  useEffect(() => {
    const pane = messagesPaneRef.current;
    if (pane) pane.scrollTop = pane.scrollHeight;
  }, [visibleMessages.length, activeId]);

  async function openThread(thread) {
    if (!thread) return;
    if (demoMode || thread.type === "conversation") {
      setActiveId(thread.id);
      if (!demoMode) setRemoteMessages([]);
      return;
    }

    setMessagesLoading(true);
    try {
      const result = await messageApi.startConversation(thread.participantId);
      const conversation = normalizeConversation(result.data, currentUserId);
      setRemoteThreads((threads) => {
        const exists = threads.some((item) => item.id === conversation.id);
        return exists ? threads : [conversation, ...threads];
      });
      setActiveId(conversation.id);
      setRemoteMessages([]);
      await loadMessages(conversation.id);
    } catch (error) {
      toast.error("Chat start zala nahi", {
        description: error.message || "Try again.",
      });
    } finally {
      setMessagesLoading(false);
    }
  }

  async function ensureConversation() {
    if (!active) return "";
    if (demoMode || active.type === "conversation") return active.id;
    const result = await messageApi.startConversation(active.participantId);
    const conversation = normalizeConversation(result.data, currentUserId);
    setRemoteThreads((threads) => {
      const withoutContact = threads.filter((item) => item.id !== conversation.id);
      return [conversation, ...withoutContact];
    });
    setActiveId(conversation.id);
    return conversation.id;
  }

  async function sendMessage(extra = {}) {
    const text = input.trim();
    if (!text && !extra.attachmentUrl) return;

    if (demoMode) {
      const nextMessage = { id: `demo-${Date.now()}`, who: "me", text: text || `Attachment: ${extra.attachmentName}` };
      setDemoConvos((current) => ({
        ...current,
        [activeId]: [...(current[activeId] || []), nextMessage],
      }));
      setDemoList((threads) =>
        threads.map((thread) =>
          thread.id === activeId ? { ...thread, preview: nextMessage.text, time: "now", unread: false } : thread,
        ),
      );
      setInput("");
      return;
    }

    setSending(true);
    const temporaryId = `pending-${Date.now()}`;
    const optimistic = {
      id: temporaryId,
      who: "me",
      text,
      attachmentUrl: extra.attachmentUrl || "",
      attachmentName: extra.attachmentName || "",
      attachmentType: extra.attachmentType || "",
      pending: true,
    };

    try {
      const conversationId = await ensureConversation();
      setInput("");
      setRemoteMessages((items) => [...items, optimistic]);
      const result = await messageApi.send({
        conversation: conversationId,
        body: text,
        attachmentUrl: extra.attachmentUrl,
        attachmentName: extra.attachmentName,
        attachmentType: extra.attachmentType,
      });
      const saved = normalizeMessage(result.data, currentUserId);
      setRemoteMessages((items) => items.map((item) => (item.id === temporaryId ? saved : item)));
      setRemoteThreads((threads) =>
        threads.map((thread) =>
          thread.id === conversationId
            ? {
                ...thread,
                preview: saved.text || `Attachment: ${saved.attachmentName || "file"}`,
                time: "now",
                unread: false,
              }
            : thread,
        ),
      );
    } catch (error) {
      setRemoteMessages((items) => items.filter((item) => item.id !== temporaryId));
      toast.error("Message send zala nahi", {
        description: error.message || "Please try again.",
      });
    } finally {
      setSending(false);
    }
  }

  async function uploadAttachment(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (demoMode) {
      sendMessage({ attachmentName: file.name, attachmentUrl: "demo" });
      return;
    }

    setUploading(true);
    try {
      const result = await messageApi.uploadAttachment(file);
      await sendMessage({
        attachmentUrl: result.data?.url,
        attachmentName: file.name,
        attachmentType: file.type,
      });
    } catch (error) {
      toast.error("Attachment upload zala nahi", {
        description: error.message || "Please choose another file.",
      });
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="mx-auto flex h-[calc(100vh-6rem)] min-h-0 max-w-[1300px] flex-col overflow-hidden">
      <div className="shrink-0">
        <LmsPageHeader
          eyebrow="Account"
          title="Messages"
          description="Conversations with your students."
        />
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-0 overflow-hidden rounded-2xl card-premium md:grid-cols-[320px_1fr]">
        <aside className="flex h-full min-h-0 flex-col overflow-hidden border-r border-border/60 bg-muted/10">
          <div className="shrink-0 border-b border-border/60 p-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={q}
                onChange={(event) => setQ(event.target.value)}
                placeholder="Search..."
                className="h-9 rounded-xl bg-muted/40 pl-9"
              />
            </div>
          </div>

          <div className="h-0 min-h-0 flex-1 overflow-y-scroll overscroll-contain">
            {loading ? (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading chats...
              </div>
            ) : filtered.length ? (
              filtered.map((thread) => (
                <button
                  key={thread.id}
                  type="button"
                  onClick={() => openThread(thread)}
                  className={`flex w-full items-start gap-3 border-b border-border/40 px-3 py-3 text-left transition hover:bg-muted/30 ${
                    active?.id === thread.id ? "bg-muted/30" : ""
                  }`}
                >
                  <Avatar className="h-10 w-10 shrink-0">
                    <AvatarImage src={thread.avatar} />
                    <AvatarFallback>{initials(thread.from)}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <div className="truncate text-sm font-medium">{thread.from}</div>
                      <div className="shrink-0 text-[10px] text-muted-foreground">{thread.time}</div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {thread.type === "contact" ? <MessageSquarePlus className="h-3.5 w-3.5 text-primary" /> : null}
                      <div
                        className={`truncate text-xs ${
                          thread.unread ? "font-medium text-foreground" : "text-muted-foreground"
                        }`}
                      >
                        {thread.preview}
                      </div>
                    </div>
                  </div>
                  {thread.unread ? <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary" /> : null}
                </button>
              ))
            ) : (
              <div className="flex h-full flex-col items-center justify-center px-6 text-center text-sm text-muted-foreground">
                No chats found
              </div>
            )}
          </div>
        </aside>

        <section className="flex h-full min-h-0 min-w-0 flex-col overflow-hidden bg-background">
          {active ? (
            <>
              <header className="flex shrink-0 items-center justify-between border-b border-border/60 px-4 py-3">
                <div className="flex min-w-0 items-center gap-3">
                  <Avatar className="h-9 w-9 shrink-0">
                    <AvatarImage src={active.avatar} />
                    <AvatarFallback>{initials(active.from)}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <div className="truncate font-medium">{active.from}</div>
                    <div className="truncate text-xs text-success">
                      {active.type === "contact" ? "Start conversation" : "● Online"}
                    </div>
                  </div>
                </div>
              </header>

              <div ref={messagesPaneRef} className="h-0 min-h-0 flex-1 overflow-y-scroll overscroll-contain p-4">
                {messagesLoading ? (
                  <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading messages...
                  </div>
                ) : visibleMessages.length ? (
                  <div className="space-y-3">
                    {visibleMessages.map((message) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={
                          message.who === "me"
                            ? "ml-auto max-w-md rounded-2xl rounded-br-sm gradient-primary p-3 text-sm text-primary-foreground shadow-glow"
                            : "max-w-md rounded-2xl rounded-bl-sm bg-muted/30 p-3 text-sm"
                        }
                      >
                        {message.text ? <div className="whitespace-pre-wrap break-words">{message.text}</div> : null}
                        {message.attachmentUrl ? (
                          <a
                            href={message.attachmentUrl === "demo" ? undefined : message.attachmentUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-2 flex items-center gap-2 rounded-lg bg-background/20 px-2 py-1.5 text-xs underline-offset-2 hover:underline"
                          >
                            <Paperclip className="h-3.5 w-3.5" />
                            <span className="truncate">{message.attachmentName || "Attachment"}</span>
                          </a>
                        ) : null}
                        {message.pending ? <div className="mt-1 text-[10px] opacity-70">Sending...</div> : null}
                      </motion.div>
                    ))}
                    <div ref={bottomRef} />
                  </div>
                ) : (
                  <div className="flex h-full flex-col items-center justify-center text-center text-sm text-muted-foreground">
                    <MessageSquarePlus className="mb-3 h-9 w-9" />
                    {active.type === "contact" ? "Send a message to start this chat." : "No messages yet."}
                  </div>
                )}
              </div>

              <form
                className="flex shrink-0 items-center gap-2 border-t border-border/60 p-3"
                onSubmit={(event) => {
                  event.preventDefault();
                  sendMessage();
                }}
              >
                <input ref={fileRef} type="file" className="hidden" onChange={uploadAttachment} />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 shrink-0 rounded-xl"
                  onClick={() => fileRef.current?.click()}
                  disabled={sending || uploading}
                >
                  {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Paperclip className="h-4 w-4" />}
                </Button>
                <Input
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  placeholder="Type a message..."
                  className="h-11 rounded-xl bg-muted/30"
                  disabled={sending}
                />
                <Button
                  type="submit"
                  className="h-11 shrink-0 rounded-xl gradient-primary border-0 text-primary-foreground"
                  disabled={sending || uploading || !input.trim()}
                >
                  {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </form>
            </>
          ) : (
            <div className="flex h-full flex-col items-center justify-center text-center text-sm text-muted-foreground">
              Select a student to open messages.
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
