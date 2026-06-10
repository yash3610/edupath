import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { Icon, MotionCard, SectionHeading } from "../../components/dashboard/DashboardPrimitives.jsx";
import { useToast } from "../../context/ToastContext.jsx";
import { apiRequest } from "../../services/api.js";

const emptyPost = { title: "", body: "", course: "", tags: "" };

export default function CommunityPage() {
  const { student } = useOutletContext();
  const toast = useToast();
  const [questions, setQuestions] = useState([]);
  const [courses, setCourses] = useState([]);
  const [activeTopic, setActiveTopic] = useState("All");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [composerOpen, setComposerOpen] = useState(false);
  const [form, setForm] = useState(emptyPost);
  const [saving, setSaving] = useState(false);
  const [selected, setSelected] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [reply, setReply] = useState("");
  const [detailsLoading, setDetailsLoading] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const [questionResult, enrollmentResult] = await Promise.all([
        apiRequest("/api/community/questions"),
        apiRequest("/api/enrollments/my"),
      ]);
      setQuestions(questionResult.data || []);
      setCourses((enrollmentResult.data || []).map((item) => item.course).filter(Boolean));
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { load(); }, [load]);

  const topics = useMemo(() => ["All", ...new Set(questions.flatMap((item) => item.tags || []))], [questions]);
  const visibleQuestions = useMemo(() => questions.filter((item) => {
    const matchesTopic = activeTopic === "All" || item.tags?.includes(activeTopic);
    const text = `${item.title} ${item.body} ${item.user?.name || ""} ${item.course?.title || ""}`.toLowerCase();
    return matchesTopic && text.includes(search.trim().toLowerCase());
  }), [activeTopic, questions, search]);

  async function createPost(event) {
    event.preventDefault();
    try {
      setSaving(true);
      await apiRequest("/api/community/questions", {
        method: "POST",
        body: JSON.stringify({
          ...form,
          course: form.course || undefined,
          tags: form.tags.split(",").map((tag) => tag.trim()).filter(Boolean),
        }),
      });
      setForm(emptyPost);
      setComposerOpen(false);
      toast.success("Discussion created.");
      await load();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  }

  async function openDiscussion(question) {
    try {
      setSelected(question);
      setDetailsLoading(true);
      const result = await apiRequest(`/api/community/questions/${question._id}`);
      setSelected(result.data?.question || question);
      setAnswers(result.data?.answers || []);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setDetailsLoading(false);
    }
  }

  async function addReply(event) {
    event.preventDefault();
    if (!reply.trim()) return;
    try {
      await apiRequest(`/api/community/questions/${selected._id}/answers`, {
        method: "POST",
        body: JSON.stringify({ body: reply.trim() }),
      });
      setReply("");
      await openDiscussion(selected);
      await load();
    } catch (error) {
      toast.error(error.message);
    }
  }

  async function upvote(answerId) {
    try {
      await apiRequest(`/api/community/answers/${answerId}/upvote`, { method: "PATCH" });
      await openDiscussion(selected);
    } catch (error) {
      toast.error(error.message);
    }
  }

  return (
    <div className="space-y-5">
      <SectionHeading
        eyebrow="Community"
        title="Learn better, together"
        action={<button onClick={() => setComposerOpen((value) => !value)} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#ff723a] px-4 py-2.5 text-sm font-extrabold text-white"><Icon name="Plus" className="h-4 w-4" /> New discussion</button>}
      />

      {composerOpen && (
        <MotionCard>
          <form onSubmit={createPost}>
            <SectionHeading eyebrow="Create Post" title="Ask the community" />
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Discussion title" required value={form.title} onChange={(value) => setFormValue(setForm, "title", value)} className="md:col-span-2" />
              <label className="text-sm font-extrabold">Course<select value={form.course} onChange={(event) => setFormValue(setForm, "course", event.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 dark:border-white/10 dark:bg-slate-800"><option value="">General discussion</option>{courses.map((course) => <option key={course._id} value={course._id}>{course.title}</option>)}</select></label>
              <Field label="Topics" value={form.tags} onChange={(value) => setFormValue(setForm, "tags", value)} placeholder="React, Projects, Study Tips" />
              <label className="text-sm font-extrabold md:col-span-2">Description<textarea required rows={4} value={form.body} onChange={(event) => setFormValue(setForm, "body", event.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-[#ff723a] dark:border-white/10 dark:bg-slate-800" placeholder="Add enough context so others can help..." /></label>
            </div>
            <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button type="button" onClick={() => setComposerOpen(false)} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-extrabold dark:border-white/10">Cancel</button>
              <button disabled={saving} className="rounded-xl bg-[#1f1c35] px-5 py-2.5 text-sm font-extrabold text-white disabled:opacity-50">{saving ? "Publishing..." : "Publish discussion"}</button>
            </div>
          </form>
        </MotionCard>
      )}

      <div className="grid min-w-0 gap-5 xl:grid-cols-[250px_minmax(0,1fr)]">
        <aside className="space-y-4">
          <MotionCard className="p-4 xl:sticky xl:top-24">
            <label className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 dark:border-white/10"><Icon name="Search" className="h-4 w-4 text-slate-400" /><input value={search} onChange={(event) => setSearch(event.target.value)} className="dashboard-search-input min-w-0 flex-1 bg-transparent text-sm font-bold outline-none" placeholder="Search discussions" /></label>
            <p className="mt-5 px-1 text-[10px] font-extrabold uppercase tracking-[.16em] text-slate-400">Topics</p>
            <div className="mt-2 flex gap-2 overflow-x-auto pb-1 xl:block xl:space-y-1">
              {topics.map((topic) => <button key={topic} onClick={() => setActiveTopic(topic)} className={`flex shrink-0 items-center justify-between rounded-xl px-3 py-2.5 text-sm font-extrabold xl:w-full ${activeTopic === topic ? "bg-[#ff723a] text-white" : "bg-slate-50 text-slate-600 hover:bg-orange-50 dark:bg-white/5 dark:text-slate-300"}`}><span>{topic}</span><span className="ml-3 text-xs opacity-70">{topic === "All" ? questions.length : questions.filter((item) => item.tags?.includes(topic)).length}</span></button>)}
            </div>
            <div className="mt-5 rounded-2xl bg-[#fff8ef] p-4 dark:bg-white/5">
              <p className="font-extrabold">Community space</p>
              <p className="mt-1 text-xs leading-5 text-slate-500">Ask clear questions, share useful context, and keep replies constructive.</p>
            </div>
          </MotionCard>
        </aside>

        <main className="min-w-0 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-bold text-slate-500">{visibleQuestions.length} discussions</p>
            <p className="text-xs font-bold text-slate-400">Latest first</p>
          </div>
          {loading && [1, 2, 3].map((item) => <div key={item} className="h-48 animate-pulse rounded-[22px] bg-slate-200 dark:bg-white/10" />)}
          {!loading && visibleQuestions.map((post, index) => (
            <MotionCard key={post._id} className="p-4 sm:p-6" delay={index * 0.03}>
              <div className="flex min-w-0 gap-3">
                <Avatar user={post.user} fallback={student} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <p className="text-sm font-extrabold">{post.user?.name || "EduPath learner"}</p>
                    <span className="text-xs text-slate-400">{formatTime(post.createdAt)}</span>
                    {post.course?.title && <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-extrabold text-slate-500 dark:bg-white/10">{post.course.title}</span>}
                  </div>
                  <h2 className="mt-3 text-lg font-extrabold leading-6 sm:text-xl">{post.title}</h2>
                  <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-500 dark:text-slate-300">{post.body}</p>
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    {(post.tags || []).map((tag) => <button key={tag} onClick={() => setActiveTopic(tag)} className="rounded-full bg-[#fff1e8] px-2.5 py-1 text-[10px] font-extrabold uppercase text-[#ff723a] dark:bg-orange-500/10">{tag}</button>)}
                    <button onClick={() => openDiscussion(post)} className="ml-auto inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-extrabold text-[#ff723a] hover:bg-orange-50"><Icon name="MessageCircle" className="h-4 w-4" /> {post.answerCount || 0} replies</button>
                  </div>
                </div>
              </div>
            </MotionCard>
          ))}
          {!loading && !visibleQuestions.length && <EmptyState title="No discussions found" text="Try another topic or start a new discussion." />}
        </main>
      </div>

      {selected && (
        <div className="fixed inset-0 z-[80] flex justify-end bg-slate-950/45">
          <button className="absolute inset-0" aria-label="Close discussion" onClick={() => setSelected(null)} />
          <aside className="relative h-full w-full max-w-2xl overflow-y-auto bg-white p-4 shadow-2xl dark:bg-slate-900 sm:p-6">
            <div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="text-xs font-extrabold uppercase tracking-widest text-[#ff723a]">Discussion</p><h2 className="mt-2 text-xl font-extrabold sm:text-2xl">{selected.title}</h2></div><button onClick={() => setSelected(null)} className="shrink-0 rounded-xl bg-slate-100 p-2 dark:bg-white/10"><Icon name="X" /></button></div>
            <p className="mt-4 text-sm leading-7 text-slate-600 dark:text-slate-300">{selected.body}</p>
            <div className="my-6 border-t border-slate-200 dark:border-white/10" />
            <h3 className="font-extrabold">{answers.length} replies</h3>
            <div className="mt-3 space-y-3">
              {detailsLoading && <p className="py-8 text-center text-sm font-bold text-slate-400">Loading replies...</p>}
              {!detailsLoading && answers.map((answer) => <div key={answer._id} className={`rounded-2xl border p-4 ${answer.accepted ? "border-emerald-200 bg-emerald-50 dark:border-emerald-500/30 dark:bg-emerald-500/10" : "border-slate-200 dark:border-white/10"}`}><div className="flex items-center gap-3"><Avatar user={answer.user} small /><div><p className="text-sm font-extrabold">{answer.user?.name || "Learner"}</p><p className="text-xs text-slate-400">{formatTime(answer.createdAt)}</p></div>{answer.accepted && <span className="ml-auto text-xs font-extrabold text-emerald-600">Accepted</span>}</div><p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">{answer.body}</p><button onClick={() => upvote(answer._id)} className="mt-3 inline-flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-extrabold dark:bg-white/10"><Icon name="ThumbsUp" className="h-3.5 w-3.5" /> {answer.upvotes?.length || 0}</button></div>)}
              {!detailsLoading && !answers.length && <p className="rounded-2xl bg-slate-50 p-6 text-center text-sm font-bold text-slate-400 dark:bg-white/5">Be the first to reply.</p>}
            </div>
            <form onSubmit={addReply} className="sticky bottom-0 mt-5 bg-white pt-3 dark:bg-slate-900"><textarea required rows={3} value={reply} onChange={(event) => setReply(event.target.value)} className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none dark:border-white/10 dark:bg-slate-800" placeholder="Write a helpful reply..." /><button className="mt-2 w-full rounded-xl bg-[#ff723a] px-4 py-3 text-sm font-extrabold text-white">Post reply</button></form>
          </aside>
        </div>
      )}
    </div>
  );
}

function Field({ label, value, onChange, required = false, placeholder = "", className = "" }) {
  return <label className={`text-sm font-extrabold ${className}`}>{label}<input required={required} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-[#ff723a] dark:border-white/10 dark:bg-slate-800" /></label>;
}

function Avatar({ user, fallback, small = false }) {
  const size = small ? "h-9 w-9 rounded-xl" : "h-11 w-11 rounded-2xl";
  const image = user?.avatar || fallback?.avatar;
  if (image) return <img src={image} alt={user?.name || fallback?.name || "User"} className={`${size} shrink-0 object-cover`} />;
  return <span className={`${size} flex shrink-0 items-center justify-center bg-[#1f1c35] text-sm font-extrabold text-white`}>{(user?.name || "U")[0].toUpperCase()}</span>;
}

function EmptyState({ title, text }) {
  return <MotionCard className="py-12 text-center"><span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-[#ff723a] dark:bg-white/10"><Icon name="MessageCircle" /></span><h3 className="mt-4 font-extrabold">{title}</h3><p className="mt-1 text-sm text-slate-500">{text}</p></MotionCard>;
}

function setFormValue(setter, key, value) { setter((current) => ({ ...current, [key]: value })); }
function formatTime(value) {
  if (!value) return "Just now";
  const diff = Math.max(0, Date.now() - new Date(value).getTime());
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return new Date(value).toLocaleDateString([], { month: "short", day: "numeric" });
}
