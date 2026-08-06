"use client";

import { useMemo, useState } from "react";
import {
  FiBarChart2,
  FiDollarSign,
  FiFileText,
  FiUsers,
  FiShoppingBag,
} from "react-icons/fi";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { StatCard } from "@/components/admin/StatCard";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { ExportButton } from "@/components/admin/ExportButton";
import { useToast } from "@/context/ToastProvider";
import { products } from "@/lib/data/products";
import { couponUsage, transactions } from "@/lib/data/admin";
import { formatPrice, formatNumber } from "@/lib/utils";

type ReportRow = {
  key: string;
  name: string;
  metric: string;
  secondary: string;
  value: number;
};

const reportTypes = [
  { key: "products", label: "Top products", icon: FiShoppingBag },
  { key: "customers", label: "Top customers", icon: FiUsers },
  { key: "coupons", label: "Coupon performance", icon: FiFileText },
  { key: "payments", label: "Payment methods", icon: FiDollarSign },
] as const;

export default function AdminReportsPage() {
  const { info } = useToast();
  const [active, setActive] = useState<(typeof reportTypes)[number]["key"]>("products");

  const reports = useMemo(() => {
    const topProducts = [...products]
      .sort((a, b) => b.reviewsCount - a.reviewsCount)
      .slice(0, 10)
      .map((p) => ({
        key: p.id,
        name: p.name,
        metric: "Sales",
        secondary: `${p.reviewsCount} reviews · ★ ${p.rating}`,
        value: p.reviewsCount * p.price,
      }));

    const topCustomers = [
      { name: "Rachel Greene", orders: 7, spent: 1284.2 },
      { name: "Miguel Santos", orders: 6, spent: 1120.0 },
      { name: "Priya Sharma", orders: 5, spent: 968.5 },
      { name: "James Whitfield", orders: 4, spent: 742.0 },
      { name: "Amara Okafor", orders: 4, spent: 689.9 },
      { name: "Daniel Reyes", orders: 3, spent: 531.0 },
    ].map((c, i) => ({
      key: `c-${i}`,
      name: c.name,
      metric: "Orders",
      secondary: `${c.orders} orders`,
      value: c.spent,
    }));

    const couponRows = Object.entries(couponUsage)
      .sort((a, b) => b[1].revenue - a[1].revenue)
      .map(([code, usage]) => ({
        key: code,
        name: code,
        metric: "Usage",
        secondary: `${usage.used} / ${usage.limit} used`,
        value: usage.revenue,
      }));

    const methodMap = transactions.reduce<Record<string, { count: number; amount: number }>>(
      (acc, t) => {
        acc[t.method] = acc[t.method] ?? { count: 0, amount: 0 };
        acc[t.method].count += 1;
        acc[t.method].amount += t.amount;
        return acc;
      },
      {}
    );
    const paymentRows = Object.entries(methodMap).map(([method, d]) => ({
      key: method,
      name: method,
      metric: "Transactions",
      secondary: `${d.count} transactions`,
      value: d.amount,
    }));

    return { products: topProducts, customers: topCustomers, coupons: couponRows, payments: paymentRows };
  }, []);

  const activeReport = reports[active];

  const columns: Column<ReportRow>[] = [
    {
      key: "rank",
      header: "#",
      align: "center",
      sortable: true,
      sortValue: (r) => r.name,
      render: (r) => {
        const idx = activeReport.findIndex((x) => x.key === r.key);
        return (
          <span className="text-sm font-bold text-muted-foreground">{idx + 1}</span>
        );
      },
    },
    {
      key: "name",
      header: active === "products" ? "Product" : active === "customers" ? "Customer" : active === "coupons" ? "Coupon code" : "Method",
      sortable: true,
      sortValue: (r) => r.name,
      render: (r) => (
        <span className="font-semibold text-foreground">{r.name}</span>
      ),
    },
    {
      key: "secondary",
      header: "Details",
      render: (r) => <span className="text-muted-foreground">{r.secondary}</span>,
    },
    {
      key: "value",
      header: "Value",
      align: "right",
      sortable: true,
      sortValue: (r) => r.value,
      render: (r) => (
        <span className="font-bold text-foreground">{formatPrice(r.value)}</span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Reports"
        subtitle="Generate and export performance reports."
        breadcrumb={[{ label: "Reports" }]}
        actions={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                info("Report generated", "The report PDF has been queued for download.")
              }
              leftIcon={<FiBarChart2 className="h-4 w-4" aria-hidden />}
            >
              Generate PDF
            </Button>
            <ExportButton
              filename={`report-${active}`}
              data={activeReport.map((r) => ({
                Name: r.name,
                Details: r.secondary,
                Value: r.value,
              }))}
              label="Export CSV"
            />
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total revenue"
          value={formatPrice(620000)}
          change="+18.2%"
          up
          icon={<FiDollarSign className="h-5 w-5" aria-hidden />}
          iconClassName="bg-success/10 text-success"
        />
        <StatCard
          label="Orders"
          value={formatNumber(2840)}
          change="+8.1%"
          up
          icon={<FiShoppingBag className="h-5 w-5" aria-hidden />}
          iconClassName="bg-primary/10 text-primary"
        />
        <StatCard
          label="Avg order value"
          value={formatPrice(218.3)}
          change="+3.4%"
          up
          icon={<FiBarChart2 className="h-5 w-5" aria-hidden />}
          iconClassName="bg-accent/15 text-accent-strong"
        />
        <StatCard
          label="Repeat customers"
          value="34%"
          change="+1.2%"
          up
          icon={<FiUsers className="h-5 w-5" aria-hidden />}
          iconClassName="bg-info/10 text-info"
        />
      </div>

      <Card className="overflow-hidden">
        <div className="flex flex-wrap gap-1 border-b border-border p-3">
          {reportTypes.map((report) => (
            <button
              key={report.key}
              type="button"
              onClick={() => setActive(report.key)}
              className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors ${
                active === report.key
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <report.icon className="h-4 w-4" aria-hidden />
              {report.label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-3">
          <h2 className="font-bold text-foreground">
            {reportTypes.find((r) => r.key === active)?.label}
          </h2>
          <Badge variant="secondary">{activeReport.length} entries</Badge>
        </div>
        <DataTable<ReportRow>
          columns={columns}
          rows={activeReport}
          rowKey={(r) => r.key}
          cardClassName="border-0 rounded-none shadow-none"
          empty={{
            title: "No data available",
            description: "Run a report to see results here.",
          }}
        />
      </Card>
    </div>
  );
}
