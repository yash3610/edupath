import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { LmsPageHeader } from "@/features/shared/components/PageHeader";
import { ChartCard } from "@/features/shared/components/ChartCard";
import { DataTable } from "@/features/shared/components/DataTable";
import { StatCard } from "@/features/shared/components/StatCard";
import { adminCourses, adminOrders, revenueByCategory, revenueMonthly } from "@/features/admin/data/admin";

const AXIS = "oklch(0.7 0.02 270)";
const GRID = "oklch(1 0 0 / 0.06)";
const PIE_COLORS = [
  "oklch(0.78 0.16 70)",
  "oklch(0.7 0.18 295)",
  "oklch(0.72 0.16 195)",
  "oklch(0.65 0.2 25)",
  "oklch(0.75 0.15 145)",
];

const money = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

export default function AdminEarningsPage() {
  const paidOrders = adminOrders.filter((order) => order.status === "paid");
  const gross = paidOrders.reduce((sum, order) => sum + order.amount, 0);
  const refunds = adminOrders
    .filter((order) => order.status === "refunded")
    .reduce((sum, order) => sum + order.amount, 0);
  const platformFee = Math.round(gross * 0.18);
  const net = gross - refunds;

  const columns = [
    {
      key: "title",
      header: "Course",
      render: (row) => <span className="font-medium">{row.title}</span>,
    },
    { key: "instructor", header: "Instructor", render: (row) => row.instructor },
    { key: "category", header: "Category", render: (row) => row.category },
    {
      key: "enrollments",
      header: "Enrollments",
      sort: (a, b) => a.enrollments - b.enrollments,
      render: (row) => row.enrollments.toLocaleString("en-IN"),
    },
    {
      key: "revenue",
      header: "Revenue",
      sort: (a, b) => a.revenue - b.revenue,
      render: (row) => <span className="font-medium">{money(row.revenue)}</span>,
    },
  ];

  return (
    <div className="mx-auto max-w-[1500px]">
      <LmsPageHeader
        eyebrow="Commerce"
        title="Earnings"
        description="Platform earnings, course revenue, and category performance."
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Gross earnings" value={money(gross)} delta={12.4} icon="IndianRupee" index={0} />
        <StatCard label="Net earnings" value={money(net)} delta={9.8} icon="TrendingUp" index={1} />
        <StatCard label="Platform fee" value={money(platformFee)} delta={4.1} icon="Percent" index={2} />
        <StatCard label="Refunded" value={money(refunds)} delta={-18.6} trend="down" icon="Undo2" index={3} />
      </div>

      <div className="mb-6 grid gap-5 lg:grid-cols-3">
        <ChartCard title="Earnings trend" subtitle="Last 7 months" className="lg:col-span-2">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueMonthly}>
                <defs>
                  <linearGradient id="admin-earnings" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.78 0.16 70)" stopOpacity={0.55} />
                    <stop offset="100%" stopColor="oklch(0.78 0.16 70)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke={GRID} vertical={false} />
                <XAxis dataKey="m" stroke={AXIS} fontSize={12} tickLine={false} axisLine={false} />
                <YAxis
                  stroke={AXIS}
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${value / 100000}L`}
                />
                <Tooltip
                  formatter={(value) => money(value)}
                  contentStyle={{
                    background: "oklch(0.18 0.02 270)",
                    border: "1px solid oklch(1 0 0 / 0.08)",
                    borderRadius: 12,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="oklch(0.78 0.16 70)"
                  strokeWidth={3}
                  fill="url(#admin-earnings)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Category share">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={revenueByCategory}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={3}
                  stroke="none"
                >
                  {revenueByCategory.map((_, index) => (
                    <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "oklch(0.18 0.02 270)",
                    border: "1px solid oklch(1 0 0 / 0.08)",
                    borderRadius: 12,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      <ChartCard title="Top earning courses" className="mb-6">
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={[...adminCourses].sort((a, b) => b.revenue - a.revenue).slice(0, 8)}>
              <CartesianGrid stroke={GRID} vertical={false} />
              <XAxis dataKey="category" stroke={AXIS} fontSize={11} tickLine={false} axisLine={false} />
              <YAxis
                stroke={AXIS}
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value / 100000}L`}
              />
              <Tooltip
                formatter={(value) => money(value)}
                contentStyle={{
                  background: "oklch(0.18 0.02 270)",
                  border: "1px solid oklch(1 0 0 / 0.08)",
                  borderRadius: 12,
                }}
              />
              <Bar dataKey="revenue" radius={[8, 8, 0, 0]} fill="oklch(0.7 0.18 295)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      <DataTable
        rows={[...adminCourses].sort((a, b) => b.revenue - a.revenue)}
        columns={columns}
        searchKeys={["title", "instructor", "category"]}
      />
    </div>
  );
}
