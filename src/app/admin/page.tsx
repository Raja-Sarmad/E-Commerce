"use client";

import { useEffect, useMemo, useState } from "react";
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
  BarChart,
  ChartCard,
  DonutChart,
  LineChart,
  Sparkline,
} from "@/components/admin/charts";
import { useAuth } from "@/context/AuthProvider";
import { readOrders } from "@/lib/orders-store";
import { sampleOrders } from "@/lib/data/content";
import { products } from "@/lib/data/products";
import { activities, notifications } from "@/lib/data/admin";
import {
  formatPrice,
  formatNumber,
  formatDate,
  timeAgo,
} from "@/lib/utils";
import type { Order } from "@/lib/types";

const revenueSeries = [
  { label: "Jan", value: 32400 },
  { label: "Feb", value: 41200 },
  { label: "Mar", value: 38600 },
  { label: "Apr", value: 45900 },
  { label: "May", value: 52300 },
  { label: "Jun", value: 48700 },
  { label: "Jul", value: 56200 },
  { label: "Aug", value: 61800 },
];

const weeklySales = [
  { name: "This week", color: "var(--color-primary)", points: [
    { label: "Mon", value: 1420 },
    { label: "Tue", value: 1780 },
    { label: "Wed", value: 1610 },
    { label: "Thu", value: 2140 },
    { label: "Fri", value: 2380 },
    { label: "Sat", value: 2910 },
    { label: "Sun", value: 2450 },
  ] },
  { name: "Last week", color: "var(--color-muted-foreground)", points: [
    { label: "Mon", value: 1180 },
    { label: "Tue", value: 1350 },
    { label: "Wed", value: 1490 },
    { label: "Thu", value: 1600 },
    { label: "Fri", value: 1820 },
    { label: "Sat", value: 2210 },
    { label: "Sun", value: 1980 },
  ] },
];

const categorySales = [
  { label: "Electronics", value: 38, color: "var(--color-primary)" },
  { label: "Fashion", value: 22, color: "var(--color-accent)" },
  { label: "Home & Living", value: 17, color: "var(--color-info)" },
  { label: "Beauty & Care", value: 12, color: "var(--color-success)" },
  { label: "Sports & Outdoors", value: 7, color: "var(--color-warning)" },
  { label: "Toys & Kids", value: 4, color: "var(--color-muted-foreground)" },
];

const dailyOrders = [34, 41, 38, 52, 47, 63, 58];

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const [placedOrders, setPlacedOrders] = useState<Order[]>([]);

  useEffect(() => {
    setPlacedOrders(readOrders());
  }, []);

  const allOrders = useMemo(
    () => [...placedOrders, ...sampleOrders],
    [placedOrders]
  );

  const revenue = allOrders
    .filter((o) => o.status !== "cancelled")
    .reduce((sum, o) => sum + o.total, 0);
  const totalRevenue = Math.round(revenue * 40 + 46200);

  const recentOrders = [...allOrders]
    .sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, 6);

  const topProducts = [...products]
    .sort((a, b) => b.reviewsCount - a.reviewsCount)
    .slice(0, 5);

  const lowStock = products.filter((p) => p.stock < 10).slice(0, 5);

  const recentReviews = useMemo(() => {
    const all = products.flatMap((p) =>
      p.reviews.map((r) => ({ ...r, productName: p.name, productSlug: p.slug }))
    );
    return all
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }, []);

  const unreadNotifications = notifications.filter((n) => !n.read);

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
        <span className="text-muted-foreground">{formatDate(o.createdAt)}</span>
      ),
    },
    {
      key: "customer",
      header: "Customer",
      render: () => (
        <span className="text-foreground">{user?.name ?? "NovaMart"}</span>
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
          change="+12.4%"
          up
          icon={<FiDollarSign className="h-5 w-5" aria-hidden />}
          iconClassName="bg-success/10 text-success"
          changeLabel="vs last month"
        />
        <StatCard
          label="Orders"
          value={formatNumber(allOrders.length + 1248)}
          change="+8.1%"
          up
          icon={<FiShoppingBag className="h-5 w-5" aria-hidden />}
          iconClassName="bg-primary/10 text-primary"
        />
        <StatCard
          label="Customers"
          value="1,284"
          change="+5.7%"
          up
          icon={<FiUsers className="h-5 w-5" aria-hidden />}
          iconClassName="bg-accent/15 text-accent-strong"
        />
        <StatCard
          label="Products"
          value={formatNumber(products.length)}
          change="3 new"
          up
          icon={<FiBox className="h-5 w-5" aria-hidden />}
          iconClassName="bg-info/10 text-info"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <ChartCard
          title="Revenue overview"
          subtitle="Monthly gross revenue for the last 8 months"
          className="xl:col-span-2"
          action={
            <Badge variant="success">
              <FiTrendingUp className="h-3 w-3" aria-hidden />
              +13.2%
            </Badge>
          }
        >
          <BarChart
            data={revenueSeries}
            height={220}
            formatValue={(v) => `$${(v / 1000).toFixed(1)}k`}
          />
        </ChartCard>

        <ChartCard
          title="Sales by category"
          subtitle="Share of total sales"
        >
          <DonutChart
            slices={categorySales}
            centerLabel="Total sales"
            formatValue={(v) => `${v}%`}
          />
        </ChartCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <ChartCard
          title="Weekly sales"
          subtitle="This week vs last week (daily orders)"
          className="xl:col-span-2"
        >
          <LineChart
            series={weeklySales}
            formatValue={(v) => `${formatNumber(v)} orders`}
          />
        </ChartCard>

        <ChartCard title="Daily orders" subtitle="Orders placed per day">
          <div className="flex items-center gap-6">
            <Sparkline
              points={dailyOrders}
              width={120}
              height={64}
              color="var(--color-accent)"
            />
            <div className="flex-1 space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Today</span>
                <span className="font-bold text-foreground">58</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Avg / day</span>
                <span className="font-bold text-foreground">47.6</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Peak</span>
                <span className="font-bold text-foreground">63</span>
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
          <ChartCard title="Top products" subtitle="By number of reviews">
            <ul className="divide-y divide-border">
              {topProducts.map((product, i) => (
                <li
                  key={product.id}
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
                      {product.rating} · {product.reviewsCount} reviews
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
              <li key={review.id} className="py-3 first:pt-0 last:pb-0">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <AdminAvatar name={review.name} size="sm" />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-foreground">
                        {review.name}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {review.productName}
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Badge variant="success">
                      <FiStar className="h-3 w-3" aria-hidden />
                      {review.rating}
                    </Badge>
                    <span className="hidden text-xs text-muted-foreground sm:block">
                      {timeAgo(review.date)}
                    </span>
                  </div>
                </div>
                <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">
                  “{review.body}”
                </p>
              </li>
            ))}
          </ul>
        </ChartCard>

        <ChartCard title="Recent activity" subtitle="Admin & system actions">
          <ul className="divide-y divide-border">
            {activities.slice(0, 6).map((activity) => (
              <li key={activity.id} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
                <span
                  className={`mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                    activity.type === "delete"
                      ? "bg-destructive/10 text-destructive"
                      : activity.type === "status"
                        ? "bg-info/10 text-info"
                        : activity.type === "login"
                          ? "bg-warning/15 text-warning"
                          : "bg-success/10 text-success"
                  }`}
                >
                  {activity.actor.charAt(0)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-foreground">
                    <span className="font-semibold">{activity.actor}</span>{" "}
                    {activity.action}{" "}
                    <span className="font-medium text-primary">
                      {activity.target}
                    </span>
                  </p>
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                </div>
              </li>
            ))}
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
              {notifications.slice(0, 4).map((n) => (
                <li
                  key={n.id}
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
                      {n.time}
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
                    key={product.id}
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
                3 vendors awaiting approval
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
