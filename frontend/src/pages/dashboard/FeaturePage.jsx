import React from "react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { achievements, aiFeatures, certificates, notifications, orders, skillGrowth, weeklyHours } from "../../data/dashboardData.js";
import { Icon, MotionCard, ProgressBar, SectionHeading } from "../../components/dashboard/DashboardPrimitives.jsx";

const colors = ["#ff6b35", "#7c3aed", "#10b981", "#f59e0b", "#06b6d4"];

const config = {
  paths: { eyebrow: "Learning Paths", title: "Personalized roadmaps", items: [["Frontend Engineer", 72], ["AI Product Builder", 48], ["Data Analyst", 64]] },
  certificates: { eyebrow: "Certificates", title: "Certificate gallery", cards: certificates },
  achievements: { eyebrow: "Achievements", title: "Badges and milestones", achievements },
  wishlist: { eyebrow: "Wishlist", title: "Saved courses", items: [["Design Systems", 55], ["Business Analytics", 34], ["Machine Learning", 22]] },
  community: { eyebrow: "Community", title: "Discussions and doubts", feed: [["How should I structure React routes?", "24 upvotes"], ["Best way to prepare for quiz?", "18 answers"], ["Share your dashboard project", "42 replies"]] },
  notes: { eyebrow: "Notes", title: "Organize notes by course", notes: [["React Layouts", "Nested routes, shared layout, protected pages"], ["AI Tutor Prompts", "Ask narrow questions and include context"], ["Charts", "Use Recharts for responsive analytics"]] },
  downloads: { eyebrow: "Downloads", title: "Learning resources", feed: [["React dashboard checklist.pdf", "2.4 MB"], ["AI prompt pack.zip", "8.1 MB"], ["Certificate template.png", "1.2 MB"]] },
  calendar: { eyebrow: "Calendar", title: "Learning schedule", feed: [["Live Class: Dashboard UI", "June 9, 2026"], ["Quiz: Hooks", "June 11, 2026"], ["Assignment Deadline", "June 14, 2026"]] },
  notifications: { eyebrow: "Notifications", title: "Learning updates", feed: notifications.map(([a, b, c]) => [a, `${b} - ${c}`]) },
  messages: { eyebrow: "Messages", title: "Inbox", feed: [["Jenny Wilson", "Reviewed your component architecture."], ["Study Group", "Live class starts in 30 minutes."], ["Mentor", "Great progress this week."]] },
  orders: { eyebrow: "Orders", title: "Invoices and transactions", orders },
  ai: { eyebrow: "AI Assistant", title: "Smart learning tools", ai: aiFeatures },
  analytics: { eyebrow: "Analytics", title: "Performance insights", analytics: true },
};

export default function FeaturePage({ type }) {
  const page = config[type] || config.paths;

  return (
    <div className="space-y-5">
      <SectionHeading eyebrow={page.eyebrow} title={page.title} />

      {page.items && (
        <div className="grid gap-5 md:grid-cols-3">
          {page.items.map(([label, value]) => (
            <MotionCard key={label}>
              <h3 className="text-lg font-black">{label}</h3>
              <div className="mt-4"><ProgressBar value={value} /></div>
              <p className="mt-3 text-sm font-bold text-slate-500">{value}% roadmap readiness</p>
            </MotionCard>
          ))}
        </div>
      )}

      {page.cards && (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {page.cards.map(([title, image, status]) => (
            <MotionCard key={title} className="overflow-hidden p-0">
              <img src={image} alt={title} className="h-40 w-full object-cover" />
              <div className="p-5">
                <h3 className="text-lg font-black">{title}</h3>
                <p className="mt-1 text-sm font-bold text-[#ff6b35]">{status}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-bold text-white dark:bg-white dark:text-slate-950">Preview</button>
                  <button className="rounded-xl bg-[#ff6b35] px-4 py-2 text-sm font-bold text-white">Download</button>
                </div>
              </div>
            </MotionCard>
          ))}
        </div>
      )}

      {page.achievements && (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {page.achievements.map(([title, icon, text]) => (
            <MotionCard key={title} className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-50 text-[#ff6b35] dark:bg-white/10">
                <Icon name={icon} className="h-7 w-7" />
              </div>
              <h3 className="mt-4 text-lg font-black">{title}</h3>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-300">{text}</p>
            </MotionCard>
          ))}
        </div>
      )}

      {page.feed && (
        <div className="grid gap-4">
          {page.feed.map(([title, text]) => (
            <MotionCard key={title}>
              <div className="flex gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-[#ff6b35] dark:bg-white/10">
                  <Icon name="Bell" className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-black">{title}</h3>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-300">{text}</p>
                </div>
              </div>
            </MotionCard>
          ))}
        </div>
      )}

      {page.notes && (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {page.notes.map(([title, text]) => (
            <MotionCard key={title}>
              <h3 className="text-lg font-black">{title}</h3>
              <textarea className="mt-4 min-h-36 w-full rounded-xl border border-slate-200 bg-white p-4 text-sm outline-none dark:border-white/10 dark:bg-slate-800" defaultValue={text} />
              <div className="mt-4 flex gap-2">
                <button className="rounded-xl bg-[#ff6b35] px-4 py-2 text-sm font-bold text-white">Save</button>
                <button className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-bold dark:bg-white/10">Delete</button>
              </div>
            </MotionCard>
          ))}
        </div>
      )}

      {page.orders && (
        <MotionCard className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 dark:bg-white/5">
                <tr>
                  {["Invoice", "Course", "Amount", "Status", "Date"].map((head) => <th key={head} className="px-5 py-4 font-black">{head}</th>)}
                </tr>
              </thead>
              <tbody>
                {page.orders.map((row) => (
                  <tr key={row[0]} className="border-t border-slate-200 dark:border-white/10">
                    {row.map((cell, index) => (
                      <td key={`${row[0]}-${cell}`} className="px-5 py-4 font-bold">
                        <span className={index === 3 ? "rounded-full bg-emerald-50 px-3 py-1 text-emerald-600 dark:bg-emerald-500/10" : ""}>{cell}</span>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </MotionCard>
      )}

      {page.ai && (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {page.ai.map(([title, text, icon]) => (
            <MotionCard key={title}>
              <Icon name={icon} className="h-8 w-8 text-[#ff6b35]" />
              <h3 className="mt-4 text-lg font-black">{title}</h3>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-300">{text}</p>
              <button className="mt-5 rounded-xl bg-slate-950 px-4 py-3 text-sm font-bold text-white dark:bg-white dark:text-slate-950">Launch</button>
            </MotionCard>
          ))}
        </div>
      )}

      {page.analytics && (
        <div className="grid gap-5 xl:grid-cols-2">
          <ChartCard title="Completion probability: 86%">
            <AreaChart data={weeklyHours}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.16} />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Area dataKey="hours" stroke="#ff6b35" fill="#ff6b35" fillOpacity={0.16} />
            </AreaChart>
          </ChartCard>
          <ChartCard title="Topic mastery">
            <PieChart>
              <Pie data={skillGrowth} dataKey="value" nameKey="skill" outerRadius={95}>
                {skillGrowth.map((entry, index) => <Cell key={entry.skill} fill={colors[index % colors.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ChartCard>
          <MotionCard className="xl:col-span-2">
            <SectionHeading eyebrow="Engagement" title="Skill growth graph" />
            <div className="h-72">
              <ResponsiveContainer>
                <BarChart data={skillGrowth}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.16} />
                  <XAxis dataKey="skill" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#7c3aed" radius={[10, 10, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </MotionCard>
        </div>
      )}

    </div>
  );
}

function ChartCard({ title, children }) {
  return (
    <MotionCard>
      <SectionHeading eyebrow="Analytics" title={title} />
      <div className="h-72">
        <ResponsiveContainer>{children}</ResponsiveContainer>
      </div>
    </MotionCard>
  );
}
