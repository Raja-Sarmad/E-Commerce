"use client";

import { useState, useMemo } from "react";
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
import { formatPrice, formatNumber, cn } from "@/lib/utils";
import {
  useGetDashboardOverviewQuery,
  useGetRevenueSeriesQuery,
  useGetSalesByCategoryQuery,
  useGetDailyOrdersQuery,
  useGetTopProductsQuery,
  useGetRevenueComparisonQuery,
} from "@/lib/rtk/adminApi";

export default function AdminAnalyticsPage() {
  const [range, setRange] = useState("12m");

  const monthsParam = range === "12m" ? 12 : range === "30d" ? 1 : range === "7d" ? undefined : undefined;

  const { data: overview } = useGetDashboardOverviewQuery();
  const { data: revenueSeries = [] } = useGetRevenueSeriesQuery(monthsParam);
  const { data: categorySales = [] } = useGetSalesByCategoryQuery();
  const { data: dailyOrders = [] } = useGetDailyOrdersQuery();
  const { data: topProducts = [] } = useGetTopProductsQuery();
  const { data: comparison } = useGetRevenueComparisonQuery();

  const revenueByMonth = useMemo(
    () => revenueSeries.map((p) => ({ label: p.label, value: p.value })),
    [revenueSeries]
  );

  const totalRevenue = revenueByMonth.reduce((sum, m) => sum + m.value, 0);
  const avgOrderValue = overview?.averageOrderValue ?? (overview?.orders ? totalRevenue / overview.orders : 0);
  const conversionRate = overview?.orders && overview?.customers ? ((overview.orders / overview.customers) * 100) : 0;

  const visitorsSeries = useMemo(
    () => [
      {
        name: "Orders",
        color: "var(--color-accent)",
        points: dailyOrders.map((d) => ({ label: d.label, value: d.value })),
      },
    ],
    [dailyOrders]
  );

  const salesChannels = useMemo(
    () =>
      categorySales.map((c) => ({
        label: c.name,
        value: c.orders,
        color: "var(--color-primary)",
      })),
    [categorySales]
  );

  const categoryData = useMemo(
    () => categorySales.map((c) => ({ label: c.name, value: c.value })).sort((a, b) => b.value - a.value),
    [categorySales]
  );

  const bestSeller = useMemo(() => topProducts[0] ?? null, [topProducts]);

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
          label="Revenue (this month)"
          value={formatPrice(comparison?.revenue.thisMonth ?? totalRevenue)}
          change={comparison?.revenue.change != null ? `${comparison.revenue.change > 0 ? "+" : ""}${comparison.revenue.change}%` : undefined}
          up={(comparison?.revenue.change ?? 0) >= 0}
          icon={<FiDollarSign className="h-5 w-5" aria-hidden />}
          iconClassName="bg-success/10 text-success"
          changeLabel="vs last month"
        />
        <StatCard
          label="Avg. order value"
          value={formatPrice(avgOrderValue)}
          change={comparison?.orders.change != null ? `${comparison.orders.change > 0 ? "+" : ""}${comparison.orders.change}%` : undefined}
          up={(comparison?.orders.change ?? 0) >= 0}
          icon={<FiShoppingBag className="h-5 w-5" aria-hidden />}
          iconClassName="bg-primary/10 text-primary"
          changeLabel="orders vs last month"
        />
        <StatCard
          label="Conversion rate"
          value={`${conversionRate.toFixed(1)}%`}
          change={comparison?.customers.change != null ? `${comparison.customers.change > 0 ? "+" : ""}${comparison.customers.change}%` : undefined}
          up={(comparison?.customers.change ?? 0) >= 0}
          icon={<FiTrendingUp className="h-5 w-5" aria-hidden />}
          iconClassName="bg-accent/15 text-accent-strong"
          changeLabel="new customers vs last month"
        />
        <StatCard
          label="Visitors"
          value={formatNumber(overview?.customers ?? 0)}
          change={comparison?.customers.change != null ? `${comparison.customers.change > 0 ? "+" : ""}${comparison.customers.change}%` : undefined}
          up={(comparison?.customers.change ?? 0) >= 0}
          icon={<FiUsers className="h-5 w-5" aria-hidden />}
          iconClassName="bg-info/10 text-info"
          changeLabel="registered users"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <ChartCard
          title="Monthly revenue"
          subtitle="Gross revenue for the last 12 months"
          className="xl:col-span-2"
          action={
            comparison?.yearlyRevenue?.change != null ? (
              <Badge variant={comparison.yearlyRevenue.change >= 0 ? "success" : "destructive"}>
                <FiTrendingUp className="h-3 w-3" aria-hidden />
                {comparison.yearlyRevenue.change > 0 ? "+" : ""}{comparison.yearlyRevenue.change}% YoY
              </Badge>
            ) : undefined
          }
        >
          <BarChart
            data={revenueByMonth}
            height={240}
            formatValue={(v) => `$${(v / 1000).toFixed(1)}k`}
          />
        </ChartCard>

        <ChartCard title="Sales by category" subtitle="Revenue share by product category">
          {salesChannels.length > 0 ? (
            <DonutChart
              slices={salesChannels}
              centerLabel="Categories"
              formatValue={(v) => `${v}%`}
            />
          ) : (
            <p className="py-8 text-center text-sm text-muted-foreground">No category data</p>
          )}
        </ChartCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <ChartCard
          title="Orders vs revenue"
          subtitle="Recent order volume"
          className="xl:col-span-2"
        >
          <LineChart
            series={visitorsSeries}
            formatValue={(v) => formatNumber(v)}
          />
        </ChartCard>

        <ChartCard title="Revenue by category" subtitle="Estimated from catalog pricing">
          <div className="flex h-full flex-col justify-center gap-4">
            {categoryData.map((cat, i) => {
              const max = categoryData[0]?.value ?? 1;
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
            {categoryData.length === 0 && (
              <p className="py-4 text-center text-sm text-muted-foreground">No data available</p>
            )}
          </div>
        </ChartCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <ChartCard
          title="Daily orders"
          subtitle="Order volume trend"
        >
          <BarChart
            data={dailyOrders.map((d) => ({ label: d.label, value: d.value }))}
            height={220}
            formatValue={(v) => formatNumber(v)}
          />
        </ChartCard>

        <ChartCard title="Top products" subtitle="By units sold from orders">
          <div className="flex h-full flex-col justify-center gap-3">
            {topProducts.slice(0, 5).map((p) => (
              <div key={p._id} className="flex items-center justify-between gap-3">
                <span className="truncate text-sm font-medium text-foreground">{p.name}</span>
                <span className="shrink-0 text-sm text-muted-foreground">{p.totalSold ?? 0} sold</span>
              </div>
            ))}
            {topProducts.length === 0 && (
              <p className="py-4 text-center text-sm text-muted-foreground">No data available</p>
            )}
          </div>
        </ChartCard>
      </div>

      <div className="flex items-start gap-3 rounded-2xl border border-info/30 bg-info/5 p-4">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-info/10 text-info">
          <FiEye className="h-5 w-5" aria-hidden />
        </span>
        <p className="text-sm text-muted-foreground">
          Best seller:{" "}
          <span className="font-bold text-foreground">{bestSeller?.name ?? "—"}</span>
          {bestSeller && <> — {bestSeller.totalSold ?? 0} units sold.</>}
        </p>
      </div>
    </div>
  );
}
