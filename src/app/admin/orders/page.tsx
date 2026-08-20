"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  FiBox,
  FiDollarSign,
  FiEye,
  FiRefreshCw,
  FiShoppingBag,
  FiUsers,
} from "react-icons/fi";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Select } from "@/components/ui/Select";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminAvatar } from "@/components/admin/AdminAvatar";
import { StatCard } from "@/components/admin/StatCard";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { FilterBar } from "@/components/admin/FilterBar";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { ExportButton } from "@/components/admin/ExportButton";
import { toast } from "@/hooks/use-toast";
import {
  useGetOrdersQuery,
  useUpdateOrderStatusMutation,
} from "@/lib/rtk/adminApi";
import { formatPrice, formatNumber, formatDate } from "@/lib/utils";
import type { Order, OrderStatus } from "@/lib/types";

const statusOptions: OrderStatus[] = [
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

const PER_PAGE = 8;

export default function AdminOrdersPage() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PER_PAGE);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkStatus, setBulkStatus] = useState<OrderStatus>("processing");
  const [cancelTarget, setCancelTarget] = useState<Order | null>(null);

  const { data, isLoading } = useGetOrdersQuery({
    page,
    limit: pageSize,
    search: query || undefined,
    status: status !== "all" ? status : undefined,
  });

  const [updateOrderStatus] = useUpdateOrderStatusMutation();

  const items = useMemo(() => {
    const raw = data?.items ?? [];
    return raw.map((o) => ({
      ...o,
      shippingAddress: o.shippingAddress ?? {
        firstName: (o as any).user?.name?.split(" ")[0] ?? "",
        lastName: (o as any).user?.name?.split(" ").slice(1).join(" ") ?? "",
        address: "",
        city: "",
        state: "",
        zip: "",
        country: "",
        phone: "",
      },
    }));
  }, [data]);

  const filtered = items;

  const totalPages = data?.totalPages ?? Math.max(1, Math.ceil((data?.total ?? 0) / pageSize));
  const totalItems = data?.total ?? filtered.length;

  const stats = useMemo(() => {
    const valid = items.filter((o) => o.status !== "cancelled");
    return {
      revenue: valid.reduce((sum, o) => sum + o.total, 0),
      orders: items.length,
      pending: items.filter((o) => o.status === "pending").length,
      processing: items.filter((o) => o.status === "processing").length,
    };
  }, [items]);

  const changeStatus = (order: Order, next: OrderStatus) => {
    updateOrderStatus({ id: order.id, status: next })
      .unwrap()
      .then(() => {
        toast.info("Status updated", `Order #${order.number} is now ${next}.`);
      })
      .catch(() => {
        toast.warning("Error", "Failed to update order status.");
      });
  };

  const changeBulkStatus = () => {
    const ids = [...selected];
    Promise.all(
      ids.map((id) =>
        updateOrderStatus({ id, status: bulkStatus }).unwrap()
      )
    )
      .then(() => {
        toast.success("Bulk update", `${ids.length} orders updated to "${bulkStatus}".`);
        setSelected(new Set());
      })
      .catch(() => {
        toast.warning("Error", "Failed to update some orders.");
      });
  };

  const cancelOrder = (order: Order) => {
    updateOrderStatus({ id: order.id, status: "cancelled" })
      .unwrap()
      .then(() => {
        setCancelTarget(null);
        toast.success("Order cancelled", `Order #${order.number} was cancelled.`);
      })
      .catch(() => {
        toast.warning("Error", "Failed to cancel order.");
      });
  };

  const customerName = (o: Order) => {
    const user = (o as any).user as { name?: string; email?: string } | undefined;
    if (user?.name) return user.name;
    if (o.shippingAddress) {
      return `${o.shippingAddress.firstName} ${o.shippingAddress.lastName}`.trim();
    }
    return "Unknown";
  };

  const columns: Column<Order>[] = [
    {
      key: "number",
      header: "Order",
      sortable: true,
      sortValue: (o) => o.number,
      render: (o) => (
        <Link
          href={`/admin/orders/${o.number}`}
          className="font-bold text-primary hover:text-primary-strong"
        >
          #{o.number}
        </Link>
      ),
    },
    {
      key: "customer",
      header: "Customer",
      sortable: true,
      sortValue: (o) => customerName(o),
      render: (o) => (
        <div className="flex items-center gap-2.5">
          <AdminAvatar name={customerName(o)} size="sm" />
          <span className="whitespace-nowrap font-medium text-foreground">
            {customerName(o)}
          </span>
        </div>
      ),
    },
    {
      key: "createdAt",
      header: "Date",
      sortable: true,
      sortValue: (o) => new Date(o.createdAt).getTime(),
      render: (o) => (
        <span className="whitespace-nowrap text-muted-foreground">
          {formatDate(o.createdAt)}
        </span>
      ),
    },
    {
      key: "items",
      header: "Items",
      align: "center",
      sortable: true,
      sortValue: (o) => o.items.reduce((sum, i) => sum + i.quantity, 0),
      render: (o) => (
        <span className="text-muted-foreground">
          {o.items.reduce((sum, i) => sum + i.quantity, 0)}
        </span>
      ),
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
    {
      key: "status",
      header: "Status",
      sortable: true,
      sortValue: (o) => o.status,
      render: (o) => <StatusBadge status={o.status} />,
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      render: (o) => (
        <div className="flex justify-end gap-1">
          <Link
            href={`/admin/orders/${o.number}`}
            className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label={`View order ${o.number}`}
          >
            <FiEye className="h-4 w-4" aria-hidden />
          </Link>
          {o.status !== "cancelled" && (
            <button
              type="button"
              onClick={() => setCancelTarget(o)}
              className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
              aria-label={`Cancel order ${o.number}`}
            >
              <FiRefreshCw className="h-4 w-4" aria-hidden />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Orders"
        subtitle={`Track and manage customer orders — ${totalItems} total.`}
        breadcrumb={[{ label: "Orders" }]}
        actions={
          <ExportButton
            filename="orders"
            data={filtered.map((o) => ({
              Order: o.number,
              Customer: customerName(o),
              Date: formatDate(o.createdAt),
              Items: o.items.reduce((sum, i) => sum + i.quantity, 0),
              Total: o.total,
              Status: o.status,
              Payment: o.paymentMethod,
            }))}
            disabled={isLoading || filtered.length === 0}
          />
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total revenue"
          value={formatPrice(stats.revenue)}
          change="+8.1%"
          up
          icon={<FiDollarSign className="h-5 w-5" aria-hidden />}
          iconClassName="bg-success/10 text-success"
        />
        <StatCard
          label="Orders"
          value={formatNumber(stats.orders)}
          change="+5.2%"
          up
          icon={<FiShoppingBag className="h-5 w-5" aria-hidden />}
          iconClassName="bg-primary/10 text-primary"
        />
        <StatCard
          label="Pending"
          value={stats.pending}
          change="needs review"
          icon={<FiBox className="h-5 w-5" aria-hidden />}
          iconClassName="bg-warning/15 text-warning"
        />
        <StatCard
          label="Processing"
          value={stats.processing}
          change="in progress"
          icon={<FiUsers className="h-5 w-5" aria-hidden />}
          iconClassName="bg-info/10 text-info"
        />
      </div>

      <FilterBar
        searchValue={query}
        onSearchChange={(v) => {
          setQuery(v);
          setPage(1);
        }}
        searchPlaceholder="Search by order # or customer..."
        leftSlot={
          <Select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            containerClassName="sm:w-44"
            className="h-10"
          >
            <option value="all">All statuses</option>
            {statusOptions.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
        }
      />

      <DataTable<Order>
        columns={columns}
        rows={filtered}
        rowKey={(o) => o.id}
        loading={isLoading}
        selectable
        selectedKeys={selected}
        onSelectionChange={setSelected}
        bulkBar={
          <>
            <div className="flex items-center gap-2">
              <Select
                value={bulkStatus}
                onChange={(e) => setBulkStatus(e.target.value as OrderStatus)}
                containerClassName="w-40"
                className="h-9 px-3 text-xs"
              >
                {statusOptions.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </Select>
              <Button variant="outline" size="sm" onClick={changeBulkStatus}>
                Update status
              </Button>
            </div>
          </>
        }
        pagination={{
          page,
          totalPages,
          totalItems,
          pageSize,
          onPageChange: setPage,
          onPageSizeChange: (size) => {
            setPageSize(size);
            setPage(1);
          },
          pageSizeOptions: [8, 16, 24],
        }}
        empty={{
          icon: <FiShoppingBag className="h-7 w-7" aria-hidden />,
          title: "No orders found",
          description: "Try adjusting your search or filters.",
          actionHref: "/admin/orders",
        }}
      />

      <ConfirmDialog
        open={cancelTarget !== null}
        onClose={() => setCancelTarget(null)}
        onConfirm={() => cancelTarget && cancelOrder(cancelTarget)}
        title="Cancel order?"
        description={`This will cancel order #${cancelTarget?.number}. The customer will need to be notified of the refund.`}
        confirmLabel="Cancel order"
      />
    </div>
  );
}
