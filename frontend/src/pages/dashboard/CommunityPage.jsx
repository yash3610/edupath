import React, { useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { Icon, MotionCard, SectionHeading } from "../../components/dashboard/DashboardPrimitives.jsx";

const discussions = [
  {
    id: 1,
    author: "Meera Joshi",
    avatar: "/assets/images/course/details/student-1.png",
    role: "Frontend learner",
    time: "12 min ago",
    topic: "React",
    title: "How do you keep a large dashboard component structure clean?",
    body: "I am splitting pages by feature and keeping shared cards in one folder. Is there a better pattern when the dashboard starts growing?",
    likes: 24,
    replies: 8,
  },
  {
    id: 2,
    author: "Rohan Kulkarni",
    avatar: "/assets/images/course/details/student-3.jpg",
    role: "Data learner",
    time: "1 hour ago",
    topic: "Projects",
    title: "Sharing my first learning analytics project",
    body: "I used Recharts to compare weekly study time and quiz scores. The biggest lesson was keeping the chart labels simple.",
    likes: 42,
    replies: 13,
  },
  {
    id: 3,
    author: "Ananya Patel",
    avatar: "/assets/images/testimonial/testimonial-1/author-1.png",
    role: "UI/UX learner",
    time: "Yesterday",
    topic: "Study Tips",
    title: "A small routine that made quiz preparation easier",
    body: "After each lesson I write three questions from memory. Revising those questions before a quiz has worked better than rereading every note.",
    likes: 31,
    replies: 11,
  },
];

const topics = ["All", "React", "Projects", "Study Tips"];

export default function CommunityPage() {
  const { student } = useOutletContext();
  const [activeTopic, setActiveTopic] = useState("All");
  const [liked, setLiked] = useState([]);
  const visibleDiscussions = useMemo(() => activeTopic === "All" ? discussions : discussions.filter((post) => post.topic === activeTopic), [activeTopic]);

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Community"
        title="Learn better, together"
        action={<button className="inline-flex items-center gap-2 rounded-xl bg-[#ff723a] px-4 py-2.5 text-sm font-extrabold text-white transition hover:bg-[#ed5f29]"><Icon name="Users" className="h-4 w-4" /> Browse members</button>}
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-5">
          <MotionCard className="p-4 sm:p-5">
            <div className="flex gap-3">
              <img src={student.avatar} alt={student.name} className="h-11 w-11 shrink-0 rounded-2xl object-cover" />
              <button className="flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-left text-sm font-medium text-slate-500 transition hover:border-orange-200 hover:bg-[#fff8f2] dark:border-white/10 dark:bg-white/5">
                Ask a question or share something useful...
              </button>
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4 dark:border-white/10">
              <div className="flex gap-2">
                <button className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-extrabold text-slate-600 hover:bg-slate-100 dark:text-slate-300"><Icon name="Image" className="h-4 w-4 text-[#ff723a]" /> Photo</button>
                <button className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-extrabold text-slate-600 hover:bg-slate-100 dark:text-slate-300"><Icon name="BadgeHelp" className="h-4 w-4 text-[#ff723a]" /> Question</button>
              </div>
              <button className="rounded-xl bg-[#1f1c35] px-4 py-2 text-xs font-extrabold text-white hover:bg-[#ff723a]">Create post</button>
            </div>
          </MotionCard>

          <div className="flex gap-2 overflow-x-auto pb-1">
            {topics.map((topic) => (
              <button key={topic} onClick={() => setActiveTopic(topic)} className={`shrink-0 rounded-xl px-4 py-2.5 text-sm font-extrabold transition ${activeTopic === topic ? "bg-[#ff723a] text-white" : "border border-slate-200 bg-white text-slate-600 hover:border-orange-200 dark:border-white/10 dark:bg-slate-900 dark:text-slate-300"}`}>
                {topic}
              </button>
            ))}
          </div>

          {visibleDiscussions.map((post, index) => {
            const isLiked = liked.includes(post.id);
            return (
              <MotionCard key={post.id} className="p-5 sm:p-6" delay={index * 0.04}>
                <div className="flex items-start gap-3">
                  <img src={post.avatar} alt={post.author} className="h-11 w-11 rounded-2xl object-cover" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-sm font-extrabold text-slate-950 dark:text-white">{post.author}</h3>
                        <p className="mt-0.5 text-xs text-slate-400">{post.role} · {post.time}</p>
                      </div>
                      <button className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10"><Icon name="Ellipsis" className="h-5 w-5" /></button>
                    </div>
                    <span className="mt-4 inline-flex rounded-full bg-[#fff1e8] px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide text-[#ff723a] dark:bg-orange-500/10">{post.topic}</span>
                    <h2 className="mt-3 text-lg font-extrabold leading-7 tracking-[-0.01em] text-slate-950 dark:text-white">{post.title}</h2>
                    <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-300">{post.body}</p>
                    <div className="mt-5 flex items-center gap-2 border-t border-slate-100 pt-4 dark:border-white/10">
                      <button onClick={() => setLiked((current) => isLiked ? current.filter((id) => id !== post.id) : [...current, post.id])} className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-extrabold transition ${isLiked ? "bg-[#fff1e8] text-[#ff723a] dark:bg-orange-500/10" : "text-slate-500 hover:bg-slate-100 dark:hover:bg-white/10"}`}>
                        <Icon name="ThumbsUp" className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`} /> {post.likes + (isLiked ? 1 : 0)}
                      </button>
                      <button className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-extrabold text-slate-500 hover:bg-slate-100 dark:hover:bg-white/10"><Icon name="MessageCircle" className="h-4 w-4" /> {post.replies} replies</button>
                      <button className="ml-auto inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-extrabold text-[#ff723a] hover:bg-[#fff1e8] dark:hover:bg-orange-500/10">Join discussion <Icon name="ChevronRight" className="h-4 w-4" /></button>
                    </div>
                  </div>
                </div>
              </MotionCard>
            );
          })}
        </div>

        <aside className="space-y-5">
          <MotionCard className="p-5 xl:sticky xl:top-24">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#fec961] text-[#1f1c35]"><Icon name="Users" className="h-5 w-5" /></div>
            <h3 className="mt-4 text-lg font-extrabold">EduPath Community</h3>
            <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-300">A focused place to ask questions, share progress, and help other learners.</p>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-slate-50 p-4 dark:bg-white/5"><p className="text-xl font-extrabold">2.4k</p><p className="mt-1 text-xs text-slate-500">Members</p></div>
              <div className="rounded-2xl bg-slate-50 p-4 dark:bg-white/5"><p className="text-xl font-extrabold">186</p><p className="mt-1 text-xs text-slate-500">Online</p></div>
            </div>
            <div className="mt-6 border-t border-slate-100 pt-5 dark:border-white/10">
              <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-slate-400">Community guidelines</p>
              {["Be clear and constructive", "Give context with questions", "Celebrate useful answers"].map((rule) => (
                <div key={rule} className="mt-3 flex items-center gap-2 text-sm font-bold text-slate-600 dark:text-slate-300"><Icon name="CheckCircle2" className="h-4 w-4 text-emerald-500" /> {rule}</div>
              ))}
            </div>
          </MotionCard>
        </aside>
      </div>
    </div>
  );
}
