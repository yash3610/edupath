import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { LmsPageHeader } from "@/features/shared/components/PageHeader";
import { StatCard } from "@/features/shared/components/StatCard";
import { ChartCard } from "@/features/shared/components/ChartCard";
import { DataTable } from "@/features/shared/components/DataTable";
import { earningsMonthly, instructorCourses } from "@/features/instructor/data/instructor";
import { inr } from "@/features/shared/utils/format";
export default function Page() {
  const cols = [
    {
      key: "title",
      header: "Course",
      render: (r) => (
        <div className="flex items-center gap-2">
          <img src={r.cover} alt="" className="h-9 w-12 rounded-lg object-cover" />
          <span className="text-sm font-medium">{r.title}</span>
        </div>
      ),
    },
    {
      key: "enrollments",
      header: "Enrolments",
      render: (r) => r.enrollments.toLocaleString(),
    },
    { key: "price", header: "Price", render: (r) => inr(r.price) },
    {
      key: "revenue",
      header: "Revenue",
      sort: (a, b) => a.revenue - b.revenue,
      render: (r) => <span className="font-medium">{inr(r.revenue)}</span>,
    },
  ];
  return (
    <div className="mx-auto max-w-[1400px]">
      <LmsPageHeader
        eyebrow="Money"
        title="Earnings"
        description="Your revenue at a glance — lifetime, this month, and per course."
      />
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total earned"
          value={2840000}
          prefix="₹"
          delta={17.4}
          icon="IndianRupee"
          index={0}
        />
        <StatCard
          label="Available"
          value={412000}
          prefix="₹"
          delta={11.6}
          icon="Wallet"
          index={1}
        />
        <StatCard
          label="Pending payout"
          value={86000}
          prefix="₹"
          delta={3.2}
          icon="Clock"
          index={2}
        />
        <StatCard
          label="This month"
          value={412000}
          prefix="₹"
          delta={11.6}
          icon="TrendingUp"
          index={3}
        />
      </div>

      <div className="mb-6">
        <ChartCard title="Revenue trend" subtitle="Last 7 months">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={earningsMonthly}>
                <defs>
                  <linearGradient id="er" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.78 0.16 70)" stopOpacity={0.55} />
                    <stop offset="100%" stopColor="oklch(0.78 0.16 70)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="oklch(1 0 0 / 0.06)" vertical={false} />
                <XAxis
                  dataKey="m"
                  stroke="oklch(0.7 0.02 270)"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="oklch(0.7 0.02 270)"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `${v / 1000}k`}
                />
                <Tooltip
                  contentStyle={{
                    background: "oklch(0.18 0.02 270)",
                    border: "1px solid oklch(1 0 0 / 0.08)",
                    borderRadius: 12,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="earn"
                  stroke="oklch(0.78 0.16 70)"
                  strokeWidth={3}
                  fill="url(#er)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      <DataTable rows={instructorCourses} columns={cols} searchKeys={["title"]} />
    </div>
  );
}

