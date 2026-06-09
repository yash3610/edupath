import React, { useEffect, useState } from "react";
import { Icon, MotionCard, SectionHeading } from "../../components/dashboard/DashboardPrimitives.jsx";
import { apiRequest } from "../../services/api.js";
import { useToast } from "../../context/ToastContext.jsx";

export default function InstructorMessagesPage() {
  const toast = useToast();
  const [conversations, setConversations] = useState([]);
  const [selected, setSelected] = useState(null);
  const [messages, setMessages] = useState([]);
  const [body, setBody] = useState("");

  useEffect(() => {
    apiRequest("/api/messages/conversations").then((result) => setConversations(result.data || [])).catch((error) => toast.error(error.message));
  }, [toast]);

  async function openConversation(conversation) {
    try {
      setSelected(conversation);
      const result = await apiRequest(`/api/messages/conversation/${conversation._id}`);
      setMessages(result.data || []);
    } catch (error) {
      toast.error(error.message);
    }
  }

  async function send(event) {
    event.preventDefault();
    if (!selected || !body.trim()) return;
    try {
      await apiRequest("/api/messages/send", { method: "POST", body: JSON.stringify({ conversation: selected._id, body }) });
      setBody("");
      await openConversation(selected);
    } catch (error) {
      toast.error(error.message);
    }
  }

  return (
    <div className="space-y-6">
      <SectionHeading eyebrow="Messages" title="Student conversations" />
      <div className="grid gap-6 xl:grid-cols-[340px_1fr]">
        <MotionCard className="p-4"><div className="space-y-2">{conversations.map((conversation) => <button key={conversation._id} onClick={() => openConversation(conversation)} className={`flex w-full items-center gap-3 rounded-xl p-3 text-left ${selected?._id === conversation._id ? "bg-[#fff1e8]" : "hover:bg-slate-50 dark:hover:bg-white/5"}`}><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1f1c35] text-white"><Icon name="MessageCircle" className="h-4 w-4" /></span><span className="min-w-0"><span className="block text-sm font-extrabold">Conversation</span><span className="block truncate text-xs text-slate-400">{conversation.lastMessage || "No messages"}</span></span></button>)}{!conversations.length && <p className="py-8 text-center text-sm font-bold text-slate-400">No conversations yet.</p>}</div></MotionCard>
        <MotionCard className="flex min-h-[560px] flex-col p-0"><div className="border-b border-slate-100 p-5 dark:border-white/10"><h3 className="font-extrabold">{selected ? "Conversation" : "Select a conversation"}</h3></div><div className="flex-1 space-y-3 overflow-y-auto p-5">{messages.map((message) => <div key={message._id} className="max-w-[80%] rounded-2xl bg-slate-100 px-4 py-3 text-sm dark:bg-white/10">{message.body}</div>)}</div><form onSubmit={send} className="flex gap-3 border-t border-slate-100 p-4 dark:border-white/10"><input disabled={!selected} value={body} onChange={(event) => setBody(event.target.value)} placeholder="Write a message..." className="flex-1 rounded-xl border border-slate-200 px-4 py-3 dark:border-white/10 dark:bg-slate-900" /><button disabled={!selected} className="rounded-xl bg-[#ff723a] px-4 text-white disabled:opacity-40"><Icon name="Send" /></button></form></MotionCard>
      </div>
    </div>
  );
}
