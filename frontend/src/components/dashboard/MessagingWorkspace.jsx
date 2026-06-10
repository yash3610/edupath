import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Icon, MotionCard, SectionHeading } from "./DashboardPrimitives.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { useToast } from "../../context/ToastContext.jsx";
import { apiFormRequest, apiRequest } from "../../services/api.js";

export default function MessagingWorkspace({ title, emptyContactText }) {
  const { user } = useAuth();
  const toast = useToast();
  const [conversations, setConversations] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [selected, setSelected] = useState(null);
  const [messages, setMessages] = useState([]);
  const [query, setQuery] = useState("");
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const fileInput = useRef(null);
  const messageEnd = useRef(null);

  const loadConversations = useCallback(async () => {
    const result = await apiRequest("/api/messages/conversations");
    setConversations(result.data || []);
    return result.data || [];
  }, []);

  const loadContacts = useCallback(async () => {
    const result = await apiRequest("/api/messages/contacts");
    setContacts(result.data || []);
  }, []);

  const openConversation = useCallback(async (conversation, quiet = false) => {
    try {
      const result = await apiRequest(`/api/messages/conversation/${conversation._id}`);
      setSelected(conversation);
      setMessages(result.data || []);
      if (!quiet) await loadConversations();
    } catch (error) {
      if (!quiet) toast.error(error.message);
    }
  }, [loadConversations, toast]);

  useEffect(() => {
    Promise.all([loadConversations(), loadContacts()])
      .then(([items]) => {
        if (items[0]) openConversation(items[0], true);
      })
      .catch((error) => toast.error(error.message))
      .finally(() => setLoading(false));
  }, [loadContacts, loadConversations, openConversation, toast]);

  useEffect(() => {
    const timer = window.setInterval(async () => {
      try {
        await loadConversations();
        if (selected) await openConversation(selected, true);
      } catch {
        // Keep the current inbox visible during a temporary network failure.
      }
    }, 5000);
    return () => window.clearInterval(timer);
  }, [loadConversations, openConversation, selected]);

  useEffect(() => {
    messageEnd.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const filtered = useMemo(() => conversations.filter((conversation) => {
    const contact = otherParticipant(conversation, user?._id);
    return `${contact?.name} ${contact?.email} ${conversation.lastMessage}`.toLowerCase().includes(query.toLowerCase());
  }), [conversations, query, user?._id]);

  const availableContacts = useMemo(() => {
    const activeIds = new Set(conversations.flatMap((conversation) => conversation.participants || []).map((participant) => participant._id));
    return contacts.filter((contact) => !activeIds.has(contact._id));
  }, [contacts, conversations]);

  async function startChat(contactId) {
    if (!contactId) return;
    try {
      const result = await apiRequest("/api/messages/conversations", { method: "POST", body: JSON.stringify({ participantId: contactId }) });
      await loadConversations();
      await openConversation(result.data);
    } catch (error) {
      toast.error(error.message);
    }
  }

  async function send(event, attachment = null) {
    event?.preventDefault();
    if (!selected || (!body.trim() && !attachment)) return;
    try {
      setSending(true);
      await apiRequest("/api/messages/send", {
        method: "POST",
        body: JSON.stringify({
          conversation: selected._id,
          body,
          attachmentUrl: attachment?.url,
          attachmentName: attachment?.name,
          attachmentType: attachment?.type,
        }),
      });
      setBody("");
      await openConversation(selected);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSending(false);
    }
  }

  async function upload(file) {
    if (!file || !selected) return;
    try {
      setSending(true);
      const form = new FormData();
      form.append("file", file);
      const result = await apiFormRequest("/api/messages/upload-attachment", form);
      await send(null, { url: result.data.url, name: file.name, type: file.type });
    } catch (error) {
      toast.error(error.message);
      setSending(false);
    } finally {
      if (fileInput.current) fileInput.current.value = "";
    }
  }

  const selectedContact = selected ? otherParticipant(selected, user?._id) : null;

  return (
    <div className="space-y-5">
      <SectionHeading eyebrow="Messages" title={title} />
      <div className="grid min-w-0 gap-5 2xl:grid-cols-[minmax(280px,350px)_minmax(0,1fr)]">
        <MotionCard className="p-4">
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 dark:border-white/10">
            <Icon name="Search" className="h-4 w-4 text-slate-400" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} className="w-full bg-transparent text-sm font-bold outline-none" placeholder="Search conversations" />
          </div>
          <select defaultValue="" onChange={(event) => { startChat(event.target.value); event.target.value = ""; }} className="mt-3 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-bold dark:border-white/10 dark:bg-slate-900">
            <option value="">{availableContacts.length ? "Start a new conversation" : emptyContactText}</option>
            {availableContacts.map((contact) => <option key={contact._id} value={contact._id}>{contact.name} · {contact.role}</option>)}
          </select>
          <div className="mt-3 space-y-2">
            {filtered.map((conversation) => {
              const contact = otherParticipant(conversation, user?._id);
              return (
                <button key={conversation._id} onClick={() => openConversation(conversation)} className={`flex w-full items-center gap-3 rounded-2xl p-3 text-left ${selected?._id === conversation._id ? "bg-orange-50 dark:bg-white/10" : "hover:bg-slate-100 dark:hover:bg-white/5"}`}>
                  <Avatar user={contact} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-extrabold">{contact?.name || "Conversation"}</span>
                    <span className="block truncate text-xs text-slate-500">{conversation.lastMessage || "No messages yet"}</span>
                  </span>
                  {conversation.unreadCount > 0 && <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-[#ff723a] px-1.5 text-[10px] font-extrabold text-white">{conversation.unreadCount}</span>}
                </button>
              );
            })}
            {!loading && !filtered.length && <p className="py-8 text-center text-sm font-bold text-slate-400">No conversations found.</p>}
          </div>
        </MotionCard>

        <MotionCard className="flex min-h-[480px] flex-col overflow-hidden p-0 sm:min-h-[560px] 2xl:min-h-[600px]">
          <div className="flex items-center gap-3 border-b border-slate-200 p-4 dark:border-white/10">
            {selectedContact ? <Avatar user={selectedContact} /> : <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 dark:bg-white/10"><Icon name="MessageCircle" /></span>}
            <div><h3 className="font-extrabold">{selectedContact?.name || "Select a conversation"}</h3><p className="text-xs text-slate-500">{selectedContact ? `${selectedContact.role} · ${selectedContact.email}` : "Choose a contact to begin"}</p></div>
          </div>
          <div className="flex-1 space-y-3 overflow-y-auto bg-slate-50/50 p-4 dark:bg-transparent">
            {messages.map((message) => {
              const mine = String(message.sender?._id || message.sender) === String(user?._id);
              return (
                <div key={message._id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[82%] rounded-2xl px-4 py-3 text-sm ${mine ? "bg-[#ff6b35] text-white" : "bg-white shadow-sm dark:bg-white/10"}`}>
                    {message.body && <p className="font-semibold leading-6">{message.body}</p>}
                    {message.attachmentUrl && <a href={message.attachmentUrl} target="_blank" rel="noreferrer" className={`mt-1 flex items-center gap-2 font-extrabold underline ${mine ? "text-white" : "text-[#ff6b35]"}`}><Icon name="Paperclip" className="h-4 w-4" /> {message.attachmentName || "Open attachment"}</a>}
                    <p className={`mt-1 text-[10px] ${mine ? "text-white/70" : "text-slate-400"}`}>{formatTime(message.createdAt)}</p>
                  </div>
                </div>
              );
            })}
            {selected && !messages.length && <p className="py-16 text-center text-sm font-bold text-slate-400">No messages yet. Say hello.</p>}
            <div ref={messageEnd} />
          </div>
          <form onSubmit={send} className="flex gap-2 border-t border-slate-200 p-3 dark:border-white/10 sm:p-4">
            <input ref={fileInput} type="file" className="hidden" accept="image/jpeg,image/png,image/webp,application/pdf,application/zip,.docx" onChange={(event) => upload(event.target.files?.[0])} />
            <button type="button" disabled={!selected || sending} onClick={() => fileInput.current?.click()} className="rounded-xl border border-slate-200 p-3 disabled:opacity-40 dark:border-white/10"><Icon name="UploadCloud" /></button>
            <input disabled={!selected || sending} value={body} onChange={(event) => setBody(event.target.value)} className="min-w-0 flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold outline-none dark:border-white/10 dark:bg-slate-800" placeholder="Type a message..." />
            <button disabled={!selected || sending || !body.trim()} className="rounded-xl bg-[#ff6b35] px-4 py-3 text-white disabled:opacity-40"><Icon name="Send" /></button>
          </form>
        </MotionCard>
      </div>
    </div>
  );
}

function otherParticipant(conversation, currentUserId) {
  return conversation.participants?.find((participant) => String(participant._id) !== String(currentUserId)) || conversation.participants?.[0];
}

function Avatar({ user }) {
  if (user?.avatar) return <img src={user.avatar} alt={user.name} className="h-11 w-11 rounded-xl object-cover" />;
  return <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#1f1c35] text-sm font-extrabold text-white">{user?.name?.[0]?.toUpperCase() || "M"}</span>;
}

function formatTime(value) {
  if (!value) return "";
  return new Date(value).toLocaleString([], { dateStyle: "short", timeStyle: "short" });
}
