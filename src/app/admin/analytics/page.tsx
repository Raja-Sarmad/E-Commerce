"use client";

import { useMemo, useState } from "react";
import {
  FiDollarSign,
  FiEye,
  FiShoppingBag,
  FiTrendingUp,
  FiUsers,
} from "react-icons/fi";
import { Badge } from "@/components/ui/Badge";
import { Select } from "@/components/ui/Select";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { StatCard } from "@/components/admin/StatCard";
import { ExportButton } from "@/components/admin/ExportButton";
import {
  BarChart,
  ChartCard,
  DonutChart,
  LineChart,
} from "@/components/admin/charts";
import { products } from "@/lib/data/products";
import { sampleOrders } from "@/lib/data/content";
import { formatPrice, formatNumber, cn } from "@/lib/utils";

const revenueByMonth = [
  { label: "Aug", value: 42000 },
  { label: "Sep", value: 48500 },
  { label: "Oct", value: 45200 },
  { label: "Nov", value: 61200 },
  { label: "Dec", value: 74800 },
  { label: "Jan", value: 52300 },
  { label: "Feb", value: 57800 },
  { label: "Mar", value: 63400 },
  { label: "Apr", value: 69800 },
  { label: "May", value: 72400 },
  { label: "Jun", value: 78600 },
  { label: "Jul", value: 84500 },
];

const visitorsSeries = [
  {
    name: "Visitors",
    color: "var(--color-primary)",
    points: [
      { label: "Mon", value: 12400 },
      { label: "Tue", value: 13200 },
      { label: "Wed", value: 11800 },
      { label: "Thu", value: 14500 },
      { label: "Fri", value: 15200 },
      { label: "Sat", value: 17800 },
      { label: "Sun", value: 16400 },
    ],
  },
  {
    name: "Orders",
    color: "var(--color-accent)",
    points: [
      { label: "Mon", value: 42 },
      { label: "Tue", value: 51 },
      { label: "Wed", value: 44 },
      { label: "Thu", value: 58 },
      { label: "Fri", value: 63 },
      { label: "Sat", value: 79 },
      { label: "Sun", value: 71 },
    ],
  },
];

const salesChannels = [
  { label: "Organic search", value: 42, color: "var(--color-primary)" },
  { label: "Direct", value: 26, color: "var(--color-accent)" },
  { label: "Social media", value: 18, color: "var(--color-success)" },
  { label: "Referral", value: 9, color: "var(--color-info)" },
  { label: "Email", value: 5, color: "var(--color-warning)" },
];

const devices = [
  { label: "Mobile", value: 58, color: "var(--color-primary)" },
  { label: "Desktop", value: 35, color: "var(--color-accent)" },
  { label: "Tablet", value: 7, color: "var(--color-success)" },
];

export default function AdminAnalyticsPage() {
  const [range, setRange] = useState("12m");

  const totalRevenue = revenueByMonth.reduce((sum, m) => sum + m.value, 0);
  const avgOrderValue = totalRevenue / 2840;
  const conversionRate = 3.8;

  const categoryData = useMemo(() => {
    const acc = products.reduce<Record<string, number>>((map, p) => {
      map[p.category] = (map[p.category] ?? 0) + p.price;
      return map;
    }, {});
    return Object.entries(acc)
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value);
  }, []);

  const bestSeller = useMemo(
    () => [...products].sort((a, b) => b.reviewsCount - a.reviewsCount)[0],
    []
  );

  const ordersByMonth = useMemo(() => {
    const months = ["Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"];
    return months.map((label, i) => ({
      label,
      value: 120 + i * 18 + (i % 3) * 10,
    }));
  }, []);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Analytics"
        subtitle="Store performance across visitors, sales and channels."
        breadcrumb={[{ label: "Analytics" }]}
        actions={
          <>
            <Select
              value={range}
              onChange={(e) => setRange(e.target.value)}
              containerClassName="w-36"
              className="h-10"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="12m">Last 12 months</option>
            </Select>
            <ExportButton
              filename="analytics-revenue"
              data={revenueByMonth.map((m) => ({
                Month: m.label,
                Revenue: m.value,
              }))}
            />
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Revenue (12 mo)"
          value={formatPrice(totalRevenue)}
          change="+18.2%"
          up
          icon={<FiDollarSign className="h-5 w-5" aria-hidden />}
          iconClassName="bg-success/10 text-success"
        />
        <StatCard
          label="Avg. order value"
          value={formatPrice(avgOrderValue)}
          change="+3.4%"
          up
          icon={<FiShoppingBag className="h-5 w-5" aria-hidden />}
          iconClassName="bg-primary/10 text-primary"
        />
        <StatCard
          label="Conversion rate"
          value={`${conversionRate}%`}
          change="+0.6%"
          up
          icon={<FiTrendingUp className="h-5 w-5" aria-hidden />}
          iconClassName="bg-accent/15 text-accent-strong"
        />
        <StatCard
          label="Visitors"
          value={formatNumber(101342)}
          change="+9.8%"
          up
          icon={<FiUsers className="h-5 w-5" aria-hidden />}
          iconClassName="bg-info/10 text-info"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <ChartCard
          title="Monthly revenue"
          subtitle="Gross revenue for the last 12 months"
          className="xl:col-span-2"
          action={
            <Badge variant="success">
              <FiTrendingUp className="h-3 w-3" aria-hidden />
              +18.2% YoY
            </Badge>
          }
        >
          <BarChart
            data={revenueByMonth}
            height={240}
            formatValue={(v) => `$${(v / 1000).toFixed(1)}k`}
          />
        </ChartCard>

        <ChartCard title="Sales by channel" subtitle="Share of total sales">
          <DonutChart
            slices={salesChannels}
            centerLabel="Channels"
            formatValue={(v) => `${v}%`}
          />
        </ChartCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <ChartCard
          title="Visitors vs orders"
          subtitle="Last 7 days"
          className="xl:col-span-2"
        >
          <LineChart
            series={visitorsSeries}
            formatValue={(v) => formatNumber(v)}
          />
        </ChartCard>

        <ChartCard title="Devices" subtitle="Where visitors browse from">
          <DonutChart
            slices={devices}
            centerLabel="Devices"
            formatValue={(v) => `${v}%`}
          />
        </ChartCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <ChartCard
          title="Orders per month"
          subtitle="Order volume trend"
        >
          <BarChart
            data={ordersByMonth}
            height={220}
            formatValue={(v) => formatNumber(v)}
          />
        </ChartCard>

        <ChartCard title="Revenue by category" subtitle="Estimated from catalog pricing">
          <div className="flex h-full flex-col justify-center gap-4">
            {categoryData.map((cat, i) => {
              const max = categoryData[0].value;
              const pct = Math.round((cat.value / max) * 100);
              return (
                <div key={cat.label}>
                  <div className="mb-1.5 flex items-center justify-between text-sm">
                    <span className="font-medium text-foreground">{cat.label}</span>
                    <span className="font-semibold text-muted-foreground">
                      {formatPrice(cat.value)}
                    </span>
                  </div>
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className={cn(
                        "h-full rounded-full",
                        i % 2 === 0 ? "bg-primary" : "bg-accent"
                      )}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </ChartCard>
      </div>

      <div className="flex items-start gap-3 rounded-2xl border border-info/30 bg-info/5 p-4">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-info/10 text-info">
          <FiEye className="h-5 w-5" aria-hidden />
        </span>
        <p className="text-sm text-muted-foreground">
          Best seller this month:{" "}
          <span className="font-bold text-foreground">{bestSeller?.name}</span> —{" "}
          {bestSeller?.reviewsCount} reviews, ★ {bestSeller?.rating}. {sampleOrders.length} sample orders are included in the live order count.
        </p>
      </div>
    </div>
  );
}
