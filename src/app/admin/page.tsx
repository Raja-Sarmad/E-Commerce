"use client";

import Link from "next/link";
import {
  FiAlertTriangle,
  FiArrowRight,
  FiBox,
  FiDollarSign,
  FiPackage,
  FiPlus,
  FiShoppingBag,
  FiStar,
  FiTrendingUp,
  FiUsers,
} from "react-icons/fi";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { StatCard } from "@/components/admin/StatCard";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { AdminAvatar } from "@/components/admin/AdminAvatar";
import { DataTable, type Column } from "@/components/admin/DataTable";
import {
  CandlestickChart,
  ChartCard,
  DonutChart,
  LineChart,
  Sparkline,
} from "@/components/admin/charts";
import { useGetMeQuery } from "@/lib/rtk/authApi";
import {
  useGetDashboardOverviewQuery,
  useGetRevenueSeriesQuery,
  useGetSalesByCategoryQuery,
  useGetDailyOrdersQuery,
  useGetTopProductsQuery,
  useGetLowStockQuery,
  useGetRecentOrdersQuery,
  useGetRecentReviewsQuery,
  useGetOrdersQuery,
  useGetAdminNotificationsQuery,
  useGetRecentActivityQuery,
  useGetRevenueComparisonQuery,
} from "@/lib/rtk/adminApi";
import { formatNumber, timeAgo } from "@/lib/utils";
import { useFormatPrice } from "@/hooks/use-format-price";
import type { Order } from "@/lib/types";
import { useMemo } from "react";

const POLL_INTERVAL = 120000;
const POLL_OPTS = { pollingInterval: POLL_INTERVAL, skipPollingIfUnfocused: true } as const;

const donutColors = [
  "var(--color-primary)",
  "var(--color-accent)",
  "var(--color-info)",
  "var(--color-success)",
  "var(--color-warning)",
  "var(--color-muted-foreground)",
  "var(--color-primary-strong)",
];

export default function AdminDashboardPage() {
  const formatPrice = useFormatPrice();
  const { data: user } = useGetMeQuery();

  const { data: overview } = useGetDashboardOverviewQuery(undefined, POLL_OPTS);
  const { data: revenueSeries = [] } = useGetRevenueSeriesQuery(8, POLL_OPTS);
  const { data: categorySales = [] } = useGetSalesByCategoryQuery(undefined, POLL_OPTS);
  const { data: dailyOrders = [] } = useGetDailyOrdersQuery(undefined, POLL_OPTS);
  const { data: topProducts = [] } = useGetTopProductsQuery(undefined, POLL_OPTS);
  const { data: lowStock = [] } = useGetLowStockQuery(undefined, POLL_OPTS);
  const { data: recentOrdersRaw = [] } = useGetRecentOrdersQuery(undefined, POLL_OPTS);
  const { data: recentReviews = [] } = useGetRecentReviewsQuery(undefined, POLL_OPTS);
  const { data: allOrdersData } = useGetOrdersQuery({ page: 1, limit: 1 });
  const { data: notificationsResponse } = useGetAdminNotificationsQuery({ limit: 8 });
  const notificationsData = notificationsResponse?.items ?? [];
  const { data: activityData = [] } = useGetRecentActivityQuery(8, POLL_OPTS);
  const { data: comparison } = useGetRevenueComparisonQuery(undefined, POLL_OPTS);

  const totalRevenue = overview?.revenue ?? 0;
  const totalOrders = overview?.orders ?? 0;
  const totalCustomers = overview?.customers ?? 0;
  const totalProducts = overview?.products ?? 0;

  const recentOrders: Order[] = useMemo(
    () =>
      recentOrdersRaw.map((o) => ({
        id: String(o._id ?? ""),
        number: o.number,
        total: o.total,
        status: (o.status ?? "pending") as Order["status"],
        createdAt: o.createdAt,
        items: [],
        subtotal: 0,
        discount: 0,
        shipping: 0,
        tax: 0,
        shippingAddress: {} as Order["shippingAddress"],
        billingAddress: {} as Order["billingAddress"],
        paymentMethod: "",
        deliveryMethod: "",
        estimatedDelivery: "",
      })),
    [recentOrdersRaw]
  );

  const unreadNotifications = notificationsData.filter((n) => !n.read);

  const orderColumns: Column<Order>[] = [
    {
      key: "number",
      header: "Order",
      sortable: true,
      sortValue: (o) => o.number,
      render: (o) => (
        <Link
          href="/admin/orders"
          className="font-bold text-primary hover:text-primary-strong"
        >
          #{o.number}
        </Link>
      ),
    },
    {
      key: "createdAt",
      header: "Date",
      sortable: true,
      sortValue: (o) => new Date(o.createdAt).getTime(),
      render: (o) => (
        <span className="text-muted-foreground">{timeAgo(o.createdAt)}</span>
      ),
    },
    {
      key: "customer",
      header: "Customer",
      render: (o) => (
        <span className="text-foreground">
          {recentOrdersRaw.find((r) => r.number === o.number)?.user?.name ??
            "NovaMart"}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      sortValue: (o) => o.status,
      render: (o) => <StatusBadge status={o.status} />,
    },
    {
      key: "total",
      header: "Total",
      align: "right",
      sortable: true,
      sortValue: (o) => o.total,
      render: (o) => (
        <span className="font-bold text-foreground">{formatPrice(o.total)}</span>
      ),
    },
  ];

  const categorySlices = categorySales.slice(0, 6).map((c, i) => ({
    label: c.name,
    value: Math.round((c.value / (categorySales[0]?.value || 1)) * 100),
    color: donutColors[i % donutColors.length],
  }));

  const peak = dailyOrders.length > 0 ? Math.max(...dailyOrders.map((d) => d.value)) : 0;
  const avg = dailyOrders.length > 0 ? dailyOrders.reduce((s, d) => s + d.value, 0) / dailyOrders.length : 0;
  const today = dailyOrders.length > 0 ? dailyOrders[dailyOrders.length - 1].value : 0;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Dashboard"
        subtitle={`Welcome back, ${user?.name?.split(" ")[0] ?? "Admin"} — here's what's happening at NovaMart today.`}
        actions={
          <>
            <Button href="/admin/products/new" variant="outline" size="sm">
              <FiPlus className="h-4 w-4" aria-hidden />
              Add product
            </Button>
            <Button href="/admin/orders" size="sm">
              View orders
              <FiArrowRight className="h-4 w-4" aria-hidden />
            </Button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total revenue"
          value={formatPrice(totalRevenue)}
          icon={<FiDollarSign className="h-5 w-5" aria-hidden />}
          iconClassName="bg-success/10 text-success"
          changeLabel="Live from orders"
        />
        <StatCard
          label="Orders"
          value={formatNumber(totalOrders)}
          icon={<FiShoppingBag className="h-5 w-5" aria-hidden />}
          iconClassName="bg-primary/10 text-primary"
          changeLabel={`${allOrdersData?.total ?? 0} total`}
        />
        <StatCard
          label="Customers"
          value={formatNumber(totalCustomers)}
          icon={<FiUsers className="h-5 w-5" aria-hidden />}
          iconClassName="bg-accent/15 text-accent-strong"
          changeLabel="Registered accounts"
        />
        <StatCard
          label="Products"
          value={formatNumber(totalProducts)}
          icon={<FiBox className="h-5 w-5" aria-hidden />}
          iconClassName="bg-info/10 text-info"
          changeLabel="Active products"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <ChartCard
          title="Revenue overview"
          subtitle="Monthly gross revenue for the last 8 months"
          className="xl:col-span-2"
          action={
            comparison?.revenue?.change != null ? (
              <Badge variant={comparison.revenue.change >= 0 ? "success" : "destructive"}>
                <FiTrendingUp className="h-3 w-3" aria-hidden />
                {comparison.revenue.change > 0 ? "+" : ""}{comparison.revenue.change}%
              </Badge>
            ) : undefined
          }
        >
          <CandlestickChart
            data={revenueSeries}
            height={220}
            formatValue={(v) => formatPrice(v)}
          />
        </ChartCard>

        <ChartCard
          title="Sales by category"
          subtitle="Share of total sales"
        >
          <DonutChart
            slices={categorySlices.length > 0 ? categorySlices : [{ label: "No sales yet", value: 100, color: "var(--color-muted)" }]}
            centerLabel="Total sales"
            formatValue={(v) => `${v}%`}
          />
        </ChartCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <ChartCard
          title="Weekly sales"
          subtitle="Orders placed per day"
          className="xl:col-span-2"
        >
          <LineChart
            series={[
              {
                name: "Orders",
                color: "var(--color-primary)",
                points: dailyOrders.map((d) => ({ label: d.label, value: d.value })),
              },
            ]}
            formatValue={(v) => `${formatNumber(v)} orders`}
          />
        </ChartCard>

        <ChartCard title="Daily orders" subtitle="Orders placed per day">
          <div className="flex items-center gap-6">
            <Sparkline
              points={dailyOrders.map((d) => d.value)}
              width={120}
              height={64}
              color="var(--color-accent)"
            />
            <div className="flex-1 space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Today</span>
                <span className="font-bold text-foreground">{today}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Avg / day</span>
                <span className="font-bold text-foreground">{avg.toFixed(1)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Peak</span>
                <span className="font-bold text-foreground">{peak}</span>
              </div>
            </div>
          </div>
        </ChartCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <DataTable<Order>
          columns={orderColumns}
          rows={recentOrders}
          rowKey={(o) => o.id}
          className="xl:col-span-2"
          toolbar={
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-bold text-foreground">Recent orders</h2>
              <Link
                href="/admin/orders"
                className="flex items-center gap-1 text-sm font-semibold text-primary hover:text-primary-strong"
              >
                View all
                <FiArrowRight className="h-3.5 w-3.5" aria-hidden />
              </Link>
            </div>
          }
          empty={{
            icon: <FiShoppingBag className="h-7 w-7" aria-hidden />,
            title: "No orders yet",
            description: "Orders will appear here as they come in.",
          }}
        />

        <div className="space-y-6">
          <ChartCard title="Top products" subtitle="By units sold">
            <ul className="divide-y divide-border">
              {topProducts.map((product, i) => (
                <li
                  key={String(product._id ?? product.name)}
                  className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0"
                >
                  <span className="w-5 text-sm font-bold text-muted-foreground">
                    {i + 1}
                  </span>
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted text-xs font-bold text-foreground">
                    {product.name.charAt(0)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {product.name}
                    </p>
                    <p className="flex items-center gap-1 text-xs text-muted-foreground">
                      <FiStar className="h-3 w-3 text-warning" aria-hidden />
                      {product.totalSold ?? 0} sold · ★ {product.rating}
                    </p>
                  </div>
                  <span className="text-sm font-bold text-foreground">
                    {formatPrice(product.price)}
                  </span>
                </li>
              ))}
            </ul>
          </ChartCard>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <ChartCard title="Recent reviews" subtitle="Latest customer feedback">
          <ul className="divide-y divide-border">
            {recentReviews.map((review) => (
              <li key={String(review._id)} className="py-3 first:pt-0 last:pb-0">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <AdminAvatar name={review.name} size="sm" />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-foreground">
                        {review.name}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {review.product?.name ?? "Product"}
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Badge variant="success">
                      <FiStar className="h-3 w-3" aria-hidden />
                      {review.rating}
                    </Badge>
                    <span className="hidden text-xs text-muted-foreground sm:block">
                      {timeAgo(review.createdAt)}
                    </span>
                  </div>
                </div>
                <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">
                  "{review.body}"
                </p>
              </li>
            ))}
          </ul>
        </ChartCard>

        <ChartCard title="Recent activity" subtitle="Real-time admin & system actions">
          <ul className="divide-y divide-border">
            {activityData.length === 0 ? (
              <li className="py-4 text-center text-sm text-muted-foreground">No recent activity</li>
            ) : (
              activityData.slice(0, 6).map((activity) => {
                const levelType = activity.level === "error" ? "delete" : activity.level === "success" ? "create" : activity.details === "create" ? "create" : activity.details === "shipped" || activity.details === "pending" ? "status" : "update";
                return (
                  <li key={activity._id} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
                    <span
                      className={`mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                        levelType === "delete"
                          ? "bg-destructive/10 text-destructive"
                          : levelType === "status"
                            ? "bg-info/10 text-info"
                            : "bg-success/10 text-success"
                      }`}
                    >
                      {activity.user?.charAt(0) ?? "S"}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-foreground">
                        <span className="font-semibold">{activity.user}</span>{" "}
                        {activity.action}
                        {activity.details && (
                          <>{" "}
                            <span className="font-medium text-primary">
                              {activity.details}
                            </span>
                          </>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground">{timeAgo(activity.createdAt)}</p>
                    </div>
                  </li>
                );
              })
            )}
          </ul>
        </ChartCard>

        <div className="space-y-6">
          <ChartCard
            title="Notifications"
            action={
              <Badge variant="destructive" dot>
                {unreadNotifications.length} unread
              </Badge>
            }
          >
            <ul className="space-y-2.5">
              {notificationsData.slice(0, 4).map((n) => (
                <li
                  key={n._id}
                  className="flex items-start gap-3 rounded-lg border border-border bg-muted/30 p-3"
                >
                  <span
                    className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                      n.type === "stock"
                        ? "bg-destructive/10 text-destructive"
                        : n.type === "review"
                          ? "bg-warning/15 text-warning"
                          : "bg-primary/10 text-primary"
                    }`}
                  >
                    {n.type === "stock" ? (
                      <FiPackage className="h-4 w-4" aria-hidden />
                    ) : n.type === "review" ? (
                      <FiStar className="h-4 w-4" aria-hidden />
                    ) : (
                      <FiShoppingBag className="h-4 w-4" aria-hidden />
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-foreground">
                      {n.title}
                    </p>
                    <p className="text-xs text-muted-foreground">{n.message}</p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground/70">
                      {timeAgo(n.createdAt)}
                    </p>
                  </div>
                  {!n.read && (
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" aria-hidden />
                  )}
                </li>
              ))}
            </ul>
          </ChartCard>

          <ChartCard
            title="Low stock alerts"
            action={
              <Link
                href="/admin/inventory"
                className="text-sm font-semibold text-primary hover:text-primary-strong"
              >
                Inventory
              </Link>
            }
          >
            {lowStock.length === 0 ? (
              <p className="py-4 text-sm text-muted-foreground">
                All products are well stocked. Nice work!
              </p>
            ) : (
              <ul className="divide-y divide-border">
                {lowStock.map((product) => (
                  <li
                    key={String(product._id ?? product.name)}
                    className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0"
                  >
                    <p className="truncate text-sm font-medium text-foreground">
                      {product.name}
                    </p>
                    <Badge
                      variant={product.stock === 0 ? "destructive" : "warning"}
                      dot
                    >
                      {product.stock === 0 ? "Out" : `${product.stock} left`}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </ChartCard>

          <div className="flex items-start gap-3 rounded-2xl border border-warning/30 bg-warning/5 p-4">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-warning/15 text-warning">
              <FiAlertTriangle className="h-5 w-5" aria-hidden />
            </span>
            <div>
              <p className="text-sm font-semibold text-foreground">
                {overview?.pendingVendors ?? 0} vendors awaiting approval
              </p>
              <p className="text-xs text-muted-foreground">
                Review pending applications in the vendors section.
              </p>
              <Link
                href="/admin/vendors"
                className="mt-1 inline-block text-xs font-semibold text-primary hover:text-primary-strong"
              >
                Review now →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
