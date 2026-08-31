"use client";

import { useMemo, useState } from "react";
import {
  FiBox,
  FiDollarSign,
  FiFileText,
  FiPackage,
  FiShield,
  FiTruck,
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
import { DateRangeFilter } from "@/components/admin/DateRangeFilter";
import { dateRangeFromPreset, type DateRangePreset } from "@/lib/admin-filters";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { formatPrice, formatNumber } from "@/lib/utils";
import {
  useGetSalesReportQuery,
  useGetInventoryReportQuery,
  useGetCustomerReportQuery,
  useGetPaymentsReportQuery,
  useGetVendorReportQuery,
} from "@/lib/rtk/adminApi";

type SalesRow = { _id: string; revenue: number; orders: number; itemsSold: number; discount: number; shipping: number; tax: number };
type CustomerRow = { _id: string; name: string; email: string; role: string; orders: number; spent: number };
type PaymentMethodRow = { _id: string; count: number; amount: number; fee: number };
type PaymentStatusRow = { _id: string; count: number; amount: number };
type InventoryProduct = { name: string; sku: string; stock: number; price: number; category: string; isActive: boolean };
type VendorRow = { name: string; email: string; status: string; totalEarnings: number; productsCount: number; rating: number; verified: boolean };

const reportTypes = [
  { key: "sales", label: "Sales", icon: FiDollarSign },
  { key: "customers", label: "Customers", icon: FiUsers },
  { key: "inventory", label: "Inventory", icon: FiBox },
  { key: "payments", label: "Payments", icon: FiShield },
  { key: "vendors", label: "Vendors", icon: FiTruck },
] as const;

type TabKey = (typeof reportTypes)[number]["key"];

export default function AdminReportsPage() {
  const [active, setActive] = useState<TabKey>("sales");
  const [dateRange, setDateRange] = useState<DateRangePreset>("last_month");

  const dates = useMemo(() => dateRangeFromPreset(dateRange), [dateRange]);

  const { data: salesData, isLoading: salesLoading } = useGetSalesReportQuery(dates);
  const { data: inventoryData, isLoading: invLoading } = useGetInventoryReportQuery({});
  const { data: customerData, isLoading: custLoading } = useGetCustomerReportQuery({});
  const { data: paymentsData, isLoading: payLoading } = useGetPaymentsReportQuery({});
  const { data: vendorData, isLoading: vendLoading } = useGetVendorReportQuery({});

  const salesRows: SalesRow[] = Array.isArray(salesData?.rows) ? salesData!.rows : [];
  const salesTotals = (salesData?.totals ?? { revenue: 0, orders: 0, itemsSold: 0, discount: 0, shipping: 0, tax: 0 }) as { revenue: number; orders: number; itemsSold: number; discount: number; shipping: number; tax: number };
  const customers: CustomerRow[] = Array.isArray(customerData?.customers) ? customerData!.customers : [];
  const invProducts: InventoryProduct[] = Array.isArray(inventoryData?.products) ? inventoryData!.products : [];
  const invStats = (inventoryData?.stats ?? { totalProducts: 0, totalUnits: 0, stockValue: 0, lowStock: 0, outOfStock: 0 }) as { totalProducts: number; totalUnits: number; stockValue: number; lowStock: number; outOfStock: number };
  const payMethods: PaymentMethodRow[] = Array.isArray(paymentsData?.byMethod) ? paymentsData!.byMethod : [];
  const payStatuses: PaymentStatusRow[] = Array.isArray(paymentsData?.byStatus) ? paymentsData!.byStatus : [];
  const payTotals = (paymentsData?.totals ?? { count: 0, gross: 0, fees: 0 }) as { count: number; gross: number; fees: number };
  const vendors: VendorRow[] = Array.isArray(vendorData) ? vendorData : [];

  const avgOrderValue = salesTotals.orders ? salesTotals.revenue / salesTotals.orders : 0;

  const isLoading = salesLoading || invLoading || custLoading || payLoading || vendLoading;

  const csvData = useMemo(() => {
    if (active === "sales") return salesRows.map((r) => ({ Period: r._id, Revenue: r.revenue, Orders: r.orders, Items: r.itemsSold, Discount: r.discount, Shipping: r.shipping, Tax: r.tax }));
    if (active === "customers") return customers.map((c) => ({ Name: c.name, Email: c.email, Orders: c.orders, Spent: c.spent }));
    if (active === "inventory") return invProducts.map((p) => ({ Name: p.name, SKU: p.sku, Stock: p.stock, Price: p.price, Category: p.category, Active: p.isActive }));
    if (active === "payments") return payMethods.map((m) => ({ Method: m._id, Transactions: m.count, Amount: m.amount, Fees: m.fee }));
    return vendors.map((v) => ({ Name: v.name, Email: v.email, Status: v.status, Earnings: v.totalEarnings, Products: v.productsCount, Rating: v.rating }));
  }, [active, salesRows, customers, invProducts, payMethods, vendors]);

  const salesColumns: Column<SalesRow>[] = [
    { key: "period", header: "Period", sortable: true, sortValue: (r) => r._id, render: (r) => <span className="font-semibold text-foreground">{r._id}</span> },
    { key: "revenue", header: "Revenue", align: "right", sortable: true, sortValue: (r) => r.revenue, render: (r) => <span className="font-bold text-success">{formatPrice(r.revenue)}</span> },
    { key: "orders", header: "Orders", align: "right", sortable: true, sortValue: (r) => r.orders, render: (r) => <span className="font-semibold text-foreground">{formatNumber(r.orders)}</span> },
    { key: "itemsSold", header: "Items sold", align: "right", sortable: true, sortValue: (r) => r.itemsSold, render: (r) => <span className="text-muted-foreground">{formatNumber(r.itemsSold)}</span> },
    { key: "discount", header: "Discounts", align: "right", sortable: true, sortValue: (r) => r.discount, render: (r) => <span className="text-muted-foreground">{formatPrice(r.discount)}</span> },
    { key: "shipping", header: "Shipping", align: "right", sortable: true, sortValue: (r) => r.shipping, render: (r) => <span className="text-muted-foreground">{formatPrice(r.shipping)}</span> },
    { key: "tax", header: "Tax", align: "right", sortable: true, sortValue: (r) => r.tax, render: (r) => <span className="text-muted-foreground">{formatPrice(r.tax)}</span> },
  ];

  const customerColumns: Column<CustomerRow>[] = [
    { key: "name", header: "Customer", sortable: true, sortValue: (r) => r.name, render: (r) => <span className="font-semibold text-foreground">{r.name}</span> },
    { key: "email", header: "Email", render: (r) => <span className="text-muted-foreground">{r.email}</span> },
    { key: "orders", header: "Orders", align: "right", sortable: true, sortValue: (r) => r.orders, render: (r) => <span className="font-semibold text-foreground">{formatNumber(r.orders)}</span> },
    { key: "spent", header: "Total spent", align: "right", sortable: true, sortValue: (r) => r.spent, render: (r) => <span className="font-bold text-success">{formatPrice(r.spent)}</span> },
  ];

  const inventoryColumns: Column<InventoryProduct>[] = [
    { key: "name", header: "Product", sortable: true, sortValue: (r) => r.name, render: (r) => <span className="font-semibold text-foreground">{r.name}</span> },
    { key: "sku", header: "SKU", render: (r) => <span className="text-muted-foreground">{r.sku}</span> },
    { key: "stock", header: "Stock", align: "right", sortable: true, sortValue: (r) => r.stock, render: (r) => <Badge variant={r.stock === 0 ? "destructive" : r.stock <= 10 ? "warning" : "success"} dot>{r.stock}</Badge> },
    { key: "price", header: "Price", align: "right", sortable: true, sortValue: (r) => r.price, render: (r) => <span className="font-semibold text-foreground">{formatPrice(r.price)}</span> },
    { key: "category", header: "Category", render: (r) => <span className="text-muted-foreground">{r.category}</span> },
  ];

  const paymentColumns: Column<PaymentMethodRow>[] = [
    { key: "method", header: "Payment method", sortable: true, sortValue: (r) => r._id, render: (r) => <span className="font-semibold text-foreground capitalize">{r._id}</span> },
    { key: "count", header: "Transactions", align: "right", sortable: true, sortValue: (r) => r.count, render: (r) => <span className="font-semibold text-foreground">{formatNumber(r.count)}</span> },
    { key: "amount", header: "Amount", align: "right", sortable: true, sortValue: (r) => r.amount, render: (r) => <span className="font-bold text-success">{formatPrice(r.amount)}</span> },
    { key: "fee", header: "Fees", align: "right", sortable: true, sortValue: (r) => r.fee, render: (r) => <span className="text-muted-foreground">{formatPrice(r.fee)}</span> },
  ];

  const vendorColumns: Column<VendorRow>[] = [
    { key: "name", header: "Vendor", sortable: true, sortValue: (r) => r.name, render: (r) => <span className="font-semibold text-foreground">{r.name}</span> },
    { key: "email", header: "Email", render: (r) => <span className="text-muted-foreground">{r.email}</span> },
    { key: "status", header: "Status", sortable: true, sortValue: (r) => r.status, render: (r) => <Badge variant={r.status === "approved" ? "success" : r.status === "pending" ? "warning" : "destructive"}>{r.status}</Badge> },
    { key: "products", header: "Products", align: "right", sortable: true, sortValue: (r) => r.productsCount, render: (r) => <span className="font-semibold text-foreground">{r.productsCount}</span> },
    { key: "earnings", header: "Earnings", align: "right", sortable: true, sortValue: (r) => r.totalEarnings, render: (r) => <span className="font-bold text-success">{formatPrice(r.totalEarnings)}</span> },
  ];

  const activeColumns = active === "sales" ? salesColumns : active === "customers" ? customerColumns : active === "inventory" ? inventoryColumns : active === "payments" ? paymentColumns : vendorColumns;
  const activeRows = active === "sales" ? salesRows : active === "customers" ? customers : active === "inventory" ? invProducts : active === "payments" ? payMethods : vendors;
  const activeLoading = active === "sales" ? salesLoading : active === "customers" ? custLoading : active === "inventory" ? invLoading : active === "payments" ? payLoading : vendLoading;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Reports"
        subtitle="Performance reports across sales, customers, inventory, payments and vendors."
        breadcrumb={[{ label: "Reports" }]}
        actions={
          <ExportButton
            filename={`report-${active}`}
            data={csvData}
            label="Export CSV"
          />
        }
      />

      <div className="flex flex-wrap items-center gap-3">
        <DateRangeFilter
          value={dateRange}
          onChange={setDateRange}
          containerClassName="sm:w-48"
        />
        <p className="text-sm text-muted-foreground">
          Sales report period (other tabs show current snapshot)
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total revenue"
          value={formatPrice(salesTotals.revenue)}
          icon={<FiDollarSign className="h-5 w-5" aria-hidden />}
          iconClassName="bg-success/10 text-success"
          changeLabel={`${salesTotals.orders} orders`}
        />
        <StatCard
          label="Total orders"
          value={formatNumber(salesTotals.orders)}
          icon={<FiShoppingBag className="h-5 w-5" aria-hidden />}
          iconClassName="bg-primary/10 text-primary"
          changeLabel={`${formatNumber(salesTotals.itemsSold)} items sold`}
        />
        <StatCard
          label="Avg order value"
          value={formatPrice(avgOrderValue)}
          icon={<FiFileText className="h-5 w-5" aria-hidden />}
          iconClassName="bg-accent/15 text-accent-strong"
          changeLabel="Revenue / orders"
        />
        <StatCard
          label="Active customers"
          value={formatNumber(customers.length)}
          icon={<FiUsers className="h-5 w-5" aria-hidden />}
          iconClassName="bg-info/10 text-info"
          changeLabel={`${invStats.outOfStock} out-of-stock products`}
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

        {active === "payments" && payStatuses.length > 0 && (
          <div className="flex flex-wrap gap-3 border-b border-border px-5 py-3">
            {payStatuses.map((s) => (
              <div key={s._id} className="flex items-center gap-2">
                <Badge variant={s._id === "completed" || s._id === "paid" ? "success" : s._id === "pending" ? "warning" : "destructive"}>
                  {s._id}
                </Badge>
                <span className="text-sm text-muted-foreground">{s.count} txns · {formatPrice(s.amount)}</span>
              </div>
            ))}
            <div className="ml-auto text-sm font-semibold text-foreground">
              Total: {formatNumber(payTotals.count)} txns · {formatPrice(payTotals.gross)} · Fees: {formatPrice(payTotals.fees)}
            </div>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-3">
          <h2 className="font-bold text-foreground">
            {reportTypes.find((r) => r.key === active)?.label}
          </h2>
          <Badge variant="secondary">{activeRows.length} entries</Badge>
        </div>

        <DataTable<Record<string, unknown>>
          columns={activeColumns as Column<Record<string, unknown>>[]}
          rows={activeRows as Record<string, unknown>[]}
          rowKey={(r) => String(r._id ?? r.name ?? r.sku ?? "")}
          loading={activeLoading}
          cardClassName="border-0 rounded-none shadow-none"
          empty={{
            title: "No data available",
            description: isLoading ? "Loading report data..." : "No records found for this report.",
          }}
        />
      </Card>
    </div>
  );
}
