import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import EmojiPicker from "emoji-picker-react";
import { motion } from "framer-motion";
import { FileText, Paperclip, Send, Smile } from "lucide-react";
import { PageHeader } from "@/features/student/components/PageHeader";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { apiFormRequest, apiRequest, assetUrl } from "@/services/api";
import { getSocket } from "@/services/realtime";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

const idOf = (value) => String(value?._id || value?.id || value || "");
const initialOf = (value = "User") => value.trim().slice(0, 1).toUpperCase() || "U";
const EMOJIS = ["😀", "😂", "😊", "😍", "😎", "🥳", "👍", "👏", "🙏", "🔥", "✅", "💯", "📚", "🎯", "✨", "❤️"];

function formatTime(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  if (date.toDateString() === new Date().toDateString()) {
    return date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
  }
  return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
}

function dateKey(value) {
  const date = new Date(value || Date.now());
  if (Number.isNaN(date.getTime())) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDayLabel(value) {
  const date = new Date(value || Date.now());
  if (Number.isNaN(date.getTime())) return "";
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (date.toDateString() === today.toDateString()) return "Today";
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
  const diff = today.setHours(0, 0, 0, 0) - new Date(date).setHours(0, 0, 0, 0);
  if (diff > 0 && diff < 7 * 24 * 60 * 60 * 1000) {
    return date.toLocaleDateString("en-IN", { weekday: "long" });
  }
  return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function participantFor(conversation, currentUserId) {
  return conversation?.participants?.find((user) => idOf(user) !== currentUserId) || conversation?.participants?.[0] || {};
}

function mapConversation(conversation, currentUserId) {
  const participant = participantFor(conversation, currentUserId);
  return {
    id: conversation._id,
    from: participant.name || "Conversation",
    avatar: assetUrl(participant.avatar),
    preview: conversation.lastMessage || "No messages yet",
    time: formatTime(conversation.lastMessageAt || conversation.updatedAt),
    unread: Number(conversation.unreadCount || 0) > 0,
    conversation,
  };
}

function mapContact(contact) {
  return {
    id: `contact-${contact._id}`,
    from: contact.name || "Contact",
    avatar: assetUrl(contact.avatar),
    preview: contact.role || contact.email || "Start conversation",
    time: "new",
    unread: false,
    contact,
  };
}

function mapMessage(message, currentUserId) {
  const attachmentUrl = assetUrl(message.attachmentUrl);
  const attachmentType = message.attachmentType || "";
  const isImage = Boolean(attachmentUrl && (attachmentType.startsWith("image/") || /\.(png|jpe?g|gif|webp|avif)$/i.test(attachmentUrl)));
  return {
    id: message._id,
    who: idOf(message.sender) === currentUserId ? "me" : "them",
    text: message.body || (isImage ? "" : message.attachmentName || "Attachment"),
    attachmentUrl,
    attachmentName: message.attachmentName || "Attachment",
    attachmentType,
    isImage,
    createdAt: message.createdAt || new Date().toISOString(),
  };
}

function appendUnique(messages, message) {
  if (!message?.id || messages.some((item) => item.id === message.id)) return messages;
  return [...messages, message];
}

function DateSeparator({ value }) {
  return (
    <div className="flex justify-center">
      <span className="rounded-lg bg-background px-3 py-1 text-[11px] font-medium text-muted-foreground shadow-sm ring-1 ring-border/70">
        {formatDayLabel(value)}
      </span>
    </div>
  );
}

export default function MessagesPage() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const requestedContactId = searchParams.get("contact") || "";
  const [isDesktop, setIsDesktop] = useState(() => typeof window !== "undefined" && window.innerWidth >= 1024);
  const currentUserId = idOf(user);
  const [threads, setThreads] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [activeId, setActiveId] = useState("");
  const [convos, setConvos] = useState({});
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [emojiPosition, setEmojiPosition] = useState({ top: 0, left: 0, width: 320, height: 360 });
  const [typingUsers, setTypingUsers] = useState({});
  const typingTimer = useRef(null);
  const chatScrollRef = useRef(null);
  const fileInputRef = useRef(null);
  const emojiButtonRef = useRef(null);
  const emojiPickerRef = useRef(null);

  const active = threads.find((t) => t.id === activeId) || threads[0];
  const msgs = convos[active?.id] ?? [];
  const latestMessageId = msgs[msgs.length - 1]?.id || "";
  const layoutHeight = isDesktop ? Math.max(420, Math.min(660, window.innerHeight - 220)) : null;

  const scrollChatToLatest = () => {
    const container = chatScrollRef.current;
    if (!container) return;
    window.requestAnimationFrame(() => {
      container.scrollTop = container.scrollHeight;
    });
  };

  const openEmojiPicker = () => {
    const button = emojiButtonRef.current;
    if (!button) return;
    const rect = button.getBoundingClientRect();
    const width = Math.min(340, window.innerWidth - 24);
    const height = Math.min(390, window.innerHeight - 24);
    const left = Math.min(Math.max(12, rect.left), window.innerWidth - width - 12);
    const top = rect.top - height - 10 >= 12 ? rect.top - height - 10 : rect.bottom + 10;
    setEmojiPosition({ top: Math.max(12, top), left, width, height });
    setEmojiOpen(true);
  };

  useEffect(() => {
    const updateLayoutMode = () => setIsDesktop(window.innerWidth >= 1024);
    updateLayoutMode();
    window.addEventListener("resize", updateLayoutMode);
    return () => window.removeEventListener("resize", updateLayoutMode);
  }, []);

  useEffect(() => {
    let ignore = false;
    async function load() {
      try {
        const [conversationResult, contactResult] = await Promise.all([
          apiRequest("/api/messages/conversations"),
          apiRequest("/api/messages/contacts"),
        ]);
        if (ignore) return;
        const nextContacts = contactResult.data || [];
        const nextThreads = (conversationResult.data || []).map((item) => mapConversation(item, currentUserId));
        setContacts(nextContacts);
        if (requestedContactId) {
          const result = await apiRequest("/api/messages/conversations", {
            method: "POST",
            body: JSON.stringify({ participantId: requestedContactId }),
          });
          if (ignore) return;
          const requestedThread = mapConversation(result.data, currentUserId);
          setThreads([requestedThread, ...nextThreads.filter((item) => item.id !== requestedThread.id)]);
          setActiveId(requestedThread.id);
        } else {
          setThreads(nextThreads.length ? nextThreads : nextContacts.map(mapContact));
          setActiveId((current) => current || nextThreads[0]?.id || "");
        }
      } catch (error) {
        if (!ignore) toast.error(error.message || "Unable to load messages.");
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    load();
    return () => {
      ignore = true;
    };
  }, [currentUserId, requestedContactId]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;
    const onMessage = ({ conversationId, conversation, message }) => {
      const mapped = mapMessage(message, currentUserId);
      setConvos((items) => ({
        ...items,
        [conversationId]: appendUnique(items[conversationId] ?? [], mapped),
      }));
      setThreads((items) => {
        const next = items.map((thread) => (
          thread.id === conversationId
            ? { ...thread, preview: mapped.text || mapped.attachmentName || "Attachment", time: formatTime(mapped.createdAt), unread: thread.id !== activeId }
            : thread
        ));
        if (next.some((thread) => thread.id === conversationId) || !conversation) return next;
        return [{ ...mapConversation(conversation, currentUserId), preview: mapped.text || mapped.attachmentName || "Attachment", time: formatTime(mapped.createdAt), unread: true }, ...next];
      });
    };
    const onTypingStart = ({ conversationId, user }) => {
      if (idOf(user) === currentUserId) return;
      setTypingUsers((items) => ({ ...items, [conversationId]: user?.name || "User" }));
    };
    const onTypingStop = ({ conversationId, user }) => {
      if (idOf(user) === currentUserId) return;
      setTypingUsers((items) => {
        const next = { ...items };
        delete next[conversationId];
        return next;
      });
    };
    socket.on("message:new", onMessage);
    socket.on("typing:start", onTypingStart);
    socket.on("typing:stop", onTypingStop);
    return () => {
      socket.off("message:new", onMessage);
      socket.off("typing:start", onTypingStart);
      socket.off("typing:stop", onTypingStop);
    };
  }, [activeId, currentUserId]);

  useEffect(() => {
    if (!active?.conversation || convos[active.id]) return;
    let ignore = false;
    async function loadMessages() {
      setLoadingMessages(true);
      try {
        const result = await apiRequest(`/api/messages/conversation/${active.id}`);
        if (ignore) return;
        setConvos((items) => ({ ...items, [active.id]: (result.data || []).map((message) => mapMessage(message, currentUserId)) }));
        setThreads((items) => items.map((thread) => (thread.id === active.id ? { ...thread, unread: false } : thread)));
      } catch (error) {
        if (!ignore) toast.error(error.message || "Unable to load this conversation.");
      } finally {
        if (!ignore) setLoadingMessages(false);
      }
    }
    loadMessages();
    return () => {
      ignore = true;
    };
  }, [active, convos, currentUserId]);

  useEffect(() => {
    if (!active?.conversation) return;
    const socket = getSocket();
    socket?.emit("conversation:join", { conversationId: active.id });
  }, [active?.id, active?.conversation]);

  useEffect(() => {
    if (!active?.id || loadingMessages) return;
    scrollChatToLatest();
  }, [active?.id, latestMessageId, loadingMessages]);

  useEffect(() => {
    if (!emojiOpen) return;
    const handlePointerDown = (event) => {
      if (emojiPickerRef.current?.contains(event.target) || emojiButtonRef.current?.contains(event.target)) return;
      setEmojiOpen(false);
    };
    const handleResize = () => setEmojiOpen(false);
    document.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("resize", handleResize);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("resize", handleResize);
    };
  }, [emojiOpen]);

  const openThread = async (id) => {
    const selected = threads.find((thread) => thread.id === id);
    if (!selected) return;
    if (selected.contact) {
      try {
        const result = await apiRequest("/api/messages/conversations", {
          method: "POST",
          body: JSON.stringify({ participantId: selected.contact._id }),
        });
        const thread = mapConversation(result.data, currentUserId);
        setThreads((items) => {
          const withoutContact = items.filter((item) => item.id !== id);
          return [thread, ...withoutContact.filter((item) => item.id !== thread.id)];
        });
        setActiveId(thread.id);
      } catch (error) {
        toast.error(error.message || "Unable to start the conversation.");
      }
      return;
    }
    setActiveId(id);
    setThreads((t) => t.map((x) => (x.id === id ? { ...x, unread: false } : x)));
  };

  const send = async () => {
    const text = input.trim();
    if (!text || !active?.conversation || sending || uploading) return;
    getSocket()?.emit("typing:stop", { conversationId: active.id });
    setSending(true);
    try {
      const result = await apiRequest("/api/messages/send", {
        method: "POST",
        body: JSON.stringify({ conversation: active.id, body: text }),
      });
      const message = mapMessage(result.data, currentUserId);
      setConvos((c) => ({
        ...c,
        [active.id]: appendUnique(c[active.id] ?? [], message),
      }));
      setInput("");
      setThreads((t) =>
        t.map((x) => (x.id === active.id ? { ...x, preview: text, time: "now", unread: false } : x)),
      );
    } catch (error) {
      toast.error(error.message || "Unable to send the message.");
    } finally {
      setSending(false);
    }
  };

  const sendAttachment = async (file) => {
    if (!file || !active?.conversation || sending || uploading) return;
    getSocket()?.emit("typing:stop", { conversationId: active.id });
    setEmojiOpen(false);
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const uploadResult = await apiFormRequest("/api/messages/upload-attachment", formData);
      const attachmentUrl = uploadResult.data?.url;
      if (!attachmentUrl) throw new Error("Unable to upload the attachment.");
      const caption = input.trim();
      const result = await apiRequest("/api/messages/send", {
        method: "POST",
        body: JSON.stringify({
          conversation: active.id,
          body: caption,
          attachmentUrl,
          attachmentName: file.name,
          attachmentType: file.type,
        }),
      });
      const message = mapMessage(result.data, currentUserId);
      setConvos((items) => ({
        ...items,
        [active.id]: appendUnique(items[active.id] ?? [], message),
      }));
      setInput("");
      setThreads((items) =>
        items.map((thread) => (
          thread.id === active.id
            ? { ...thread, preview: caption || file.name || "Attachment", time: "now", unread: false }
            : thread
        )),
      );
    } catch (error) {
      toast.error(error.message || "Unable to send the attachment.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleInputChange = (event) => {
    const value = event.target.value;
    setInput(value);
    if (!active?.conversation) return;
    const socket = getSocket();
    socket?.emit("typing:start", { conversationId: active.id });
    window.clearTimeout(typingTimer.current);
    typingTimer.current = window.setTimeout(() => {
      socket?.emit("typing:stop", { conversationId: active.id });
    }, 900);
  };

  const addEmoji = (emojiData) => {
    setInput((value) => `${value}${emojiData?.emoji || ""}`);
  };

  return (
    <div className="mx-auto max-w-[1300px]">
      {emojiOpen && (
        <div
          ref={emojiPickerRef}
          className="fixed z-[1000] overflow-hidden rounded-2xl border border-border/70 bg-background shadow-lg"
          style={{ top: emojiPosition.top, left: emojiPosition.left }}
        >
          <EmojiPicker
            width={emojiPosition.width}
            height={emojiPosition.height}
            lazyLoadEmojis
            onEmojiClick={addEmoji}
            previewConfig={{ showPreview: false }}
          />
        </div>
      )}
      <PageHeader eyebrow="Direct" title="Messages" />
      <div
        className="grid gap-4 lg:grid-cols-[320px_1fr] lg:overflow-hidden"
        style={isDesktop ? { height: layoutHeight } : undefined}
      >
        <div className="flex flex-col rounded-2xl card-premium overflow-hidden min-h-[420px] lg:h-full lg:min-h-0">
          <ul className="chat-scroll min-h-0 flex-1 divide-y divide-border/60 overflow-y-auto overscroll-contain">
            {loading && <li className="p-4 text-sm text-muted-foreground">Loading conversations...</li>}
            {!loading && threads.length === 0 && <li className="p-4 text-sm text-muted-foreground">No conversations yet.</li>}
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
                  <AvatarFallback>{initialOf(m.from)}</AvatarFallback>
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

        <div className="flex flex-col rounded-2xl card-premium overflow-hidden min-h-[420px] lg:h-full lg:min-h-0">
          {active ? (
            <>
              <div className="flex shrink-0 items-center gap-3 border-b border-border/60 p-4">
                <Avatar className="h-10 w-10 ring-2 ring-primary/30">
                  <AvatarImage src={active.avatar} alt={active.from} />
                  <AvatarFallback>{initialOf(active.from)}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">{active.from}</div>
                  <div className="text-xs text-success">Online</div>
                </div>
              </div>
              <div ref={chatScrollRef} className="chat-scroll min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain p-4">
                {loadingMessages && <div className="text-sm text-muted-foreground">Loading messages...</div>}
                {!loadingMessages && msgs.length === 0 && <div className="text-sm text-muted-foreground">No messages yet.</div>}
                {!loadingMessages && msgs.length > 0 && (
                  <div className="sticky top-0 z-10 pb-1">
                    <DateSeparator value={msgs[msgs.length - 1]?.createdAt} />
                  </div>
                )}
                {msgs.map((m, index) => {
                  const showDate = dateKey(m.createdAt) !== dateKey(msgs[index - 1]?.createdAt);
                  return (
                    <div key={m.id} className="space-y-3">
                      {showDate && (
                        <DateSeparator value={m.createdAt} />
                      )}
                      <Bubble who={m.who} time={formatTime(m.createdAt)}>
                        {m.isImage ? (
                          <img src={m.attachmentUrl} alt={m.attachmentName} className="max-h-56 w-auto max-w-full rounded-xl object-contain" loading="lazy" onLoad={scrollChatToLatest} />
                        ) : null}
                        {!m.isImage && m.attachmentUrl ? (
                          <a
                            href={m.attachmentUrl}
                            target="_blank"
                            rel="noreferrer"
                            className={`flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium ${m.who === "me" ? "bg-white/20 text-primary-foreground" : "bg-background text-foreground ring-1 ring-border/70"}`}
                          >
                            <FileText className="h-4 w-4 shrink-0" />
                            <span className="min-w-0 truncate">{m.attachmentName}</span>
                          </a>
                        ) : null}
                        {m.text && <span className="break-words">{m.text}</span>}
                      </Bubble>
                    </div>
                  );
                })}
                {typingUsers[active?.id] && <div className="text-xs font-medium text-muted-foreground">{typingUsers[active.id]} is typing...</div>}
              </div>
              <form
                className="relative flex shrink-0 gap-2 border-t border-border/60 p-3"
                onSubmit={(e) => {
                  e.preventDefault();
                  send();
                }}
              >
                <Button
                  ref={emojiButtonRef}
                  type="button"
                  variant="outline"
                  className="h-11 w-11 shrink-0 rounded-xl p-0"
                  disabled={!active.conversation || sending || uploading}
                  onClick={() => (emojiOpen ? setEmojiOpen(false) : openEmojiPicker())}
                >
                  <Smile className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="h-11 w-11 shrink-0 rounded-xl p-0"
                  disabled={!active.conversation || sending || uploading}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Paperclip className="h-4 w-4" />
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  onChange={(event) => sendAttachment(event.target.files?.[0])}
                />
                <Input
                  value={input}
                  onChange={handleInputChange}
                  placeholder={uploading ? "Uploading attachment..." : "Type a message..."}
                  className="h-11 rounded-xl"
                  disabled={!active.conversation || uploading}
                />
                <Button
                  type="submit"
                  className="h-11 rounded-xl gradient-primary border-0 text-primary-foreground px-4"
                  disabled={!input.trim() || !active.conversation || sending || uploading}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </>
          ) : (
            <div className="flex-1 p-4 text-sm text-muted-foreground">No conversations yet.</div>
          )}
        </div>
      </div>
    </div>
  );
}
function Bubble({ who, time, children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${who === "me" ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`max-w-md overflow-hidden rounded-2xl px-4 py-2.5 text-sm ${who === "me" ? "gradient-primary text-primary-foreground rounded-br-sm" : "bg-muted rounded-bl-sm"}`}
      >
        <div className="flex flex-col gap-1">
          {children}
          {time && <span className={`self-end text-[10px] ${who === "me" ? "text-primary-foreground/75" : "text-muted-foreground"}`}>{time}</span>}
        </div>
      </div>
    </motion.div>
  );
}
