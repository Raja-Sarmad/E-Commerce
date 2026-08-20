"use client";

import { useMemo, useState, type ReactNode } from "react";
import { FiAlertTriangle, FiBox, FiEdit2, FiPackage, FiXCircle } from "react-icons/fi";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Modal } from "@/components/ui/Modal";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { FilterBar } from "@/components/admin/FilterBar";
import { ExportButton } from "@/components/admin/ExportButton";
import { toast } from "@/hooks/use-toast";
import {
  useGetInventoryHistoryQuery,
  useGetInventoryLowStockQuery,
  useAdjustInventoryMutation,
  useGetAdminProductsQuery,
  type InventoryEntry,
} from "@/lib/rtk/adminApi";
import { cn, formatDate, formatNumber } from "@/lib/utils";

const PER_PAGE = 8;

function StatCard({
  icon,
  label,
  value,
  tone,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  tone: string;
}) {
  return (
    <Card className="p-5">
      <div className="flex items-center gap-3">
        <span
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${tone}`}
        >
          {icon}
        </span>
        <div className="min-w-0">
          <p className="truncate text-xl font-extrabold text-foreground">{value}</p>
          <p className="truncate text-xs text-muted-foreground">{label}</p>
        </div>
      </div>
    </Card>
  );
}

type AdjustmentState = {
  qty: string;
  reason: string;
  qtyError?: string;
  reasonError?: string;
};

export default function AdminInventoryPage() {
  const [query, setQuery] = useState("");
  const [direction, setDirection] = useState("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PER_PAGE);
  const [adjustTarget, setAdjustTarget] = useState<InventoryEntry | null>(null);
  const [form, setForm] = useState<AdjustmentState>({ qty: "", reason: "" });

  const { data: historyData, isLoading: historyLoading } = useGetInventoryHistoryQuery({});
  const { data: lowStockItems, isLoading: lowStockLoading } = useGetInventoryLowStockQuery();
  const { data: productsData } = useGetAdminProductsQuery({});
  const [adjustInventory, { isLoading: adjusting }] = useAdjustInventoryMutation();

  const entries = useMemo(() => historyData ?? [], [historyData]);
  const allProducts = useMemo(() => productsData?.items ?? [], [productsData]);
  const lowStockList = useMemo(() => lowStockItems ?? [], [lowStockItems]);

  const totalUnits = useMemo(
    () => allProducts.reduce((sum, p) => sum + (p.stock ?? 0), 0),
    [allProducts]
  );
  const lowStock = useMemo(() => lowStockList.length, [lowStockList]);
  const outOfStock = useMemo(
    () => allProducts.filter((p) => p.stock === 0).length,
    [allProducts]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return entries.filter((e) => {
      const productName = e.product?.name ?? "";
      const sku = e.product?.sku ?? "";
      const matchesQuery =
        !q ||
        productName.toLowerCase().includes(q) ||
        sku.toLowerCase().includes(q);
      const matchesDirection =
        direction === "all" ||
        (direction === "in" && e.adjustment > 0) ||
        (direction === "out" && e.adjustment < 0);
      return matchesQuery && matchesDirection;
    });
  }, [entries, query, direction]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageItems = filtered.slice((page - 1) * pageSize, page * pageSize);

  const handlePageSize = (size: number) => {
    setPageSize(size);
    setPage(1);
  };

  const submitAdjustment = async () => {
    if (!adjustTarget) return;
    const quantity = Number(form.qty);
    if (!Number.isFinite(quantity) || quantity === 0) {
      setForm((f) => ({ ...f, qtyError: "Enter a quantity that isn't zero." }));
      return;
    }
    if (!form.reason.trim()) {
      setForm((f) => ({ ...f, reasonError: "A reason is required." }));
      return;
    }
    const productId = adjustTarget.product?.name ? (adjustTarget as Record<string, unknown>)._id as string : "";
    if (!productId) return;
    try {
      await adjustInventory({
        productId,
        adjustment: quantity,
        reason: form.reason.trim(),
      }).unwrap();
      setAdjustTarget(null);
      setForm({ qty: "", reason: "" });
      toast.success(
        "Stock adjusted",
        `${adjustTarget.product?.name ?? "Product"} stock updated by ${quantity > 0 ? "+" : ""}${quantity}.`
      );
    } catch {
      toast.error("Adjustment failed", "Could not adjust stock. Please try again.");
    }
  };

  const openAdjust = (entry: InventoryEntry) => {
    setAdjustTarget(entry);
    setForm({ qty: "", reason: "" });
  };

  const columns: Column<InventoryEntry>[] = [
    {
      key: "product",
      header: "Product",
      sortable: true,
      sortValue: (e) => e.product?.name ?? "",
      render: (e) => (
        <div className="min-w-0">
          <p className="max-w-[240px] truncate font-semibold text-foreground">
            {e.product?.name ?? "Unknown"}
          </p>
          <p className="truncate text-xs text-muted-foreground">{e.product?.sku ?? ""}</p>
        </div>
      ),
    },
    {
      key: "sku",
      header: "SKU",
      sortable: true,
      sortValue: (e) => e.product?.sku ?? "",
      render: (e) => <span className="font-mono text-xs text-muted-foreground">{e.product?.sku ?? ""}</span>,
    },
    {
      key: "previous",
      header: "Previous",
      align: "right",
      sortable: true,
      sortValue: (e) => e.previousStock,
      render: (e) => <span className="text-muted-foreground">{formatNumber(e.previousStock)}</span>,
    },
    {
      key: "adjustment",
      header: "Adjustment",
      align: "right",
      sortable: true,
      sortValue: (e) => e.adjustment,
      render: (e) => (
        <span
          className={cn(
            "font-bold",
            e.adjustment > 0
              ? "text-success"
              : e.adjustment < 0
                ? "text-destructive"
                : "text-muted-foreground"
          )}
        >
          {e.adjustment > 0 ? `+${formatNumber(e.adjustment)}` : formatNumber(e.adjustment)}
        </span>
      ),
    },
    {
      key: "current",
      header: "Current",
      align: "right",
      sortable: true,
      sortValue: (e) => e.newStock,
      render: (e) => <span className="font-bold text-foreground">{formatNumber(e.newStock)}</span>,
    },
    {
      key: "reason",
      header: "Reason",
      render: (e) => (
        <span className="block max-w-[220px] truncate text-muted-foreground" title={e.reason}>
          {e.reason}
        </span>
      ),
    },
    {
      key: "user",
      header: "User",
      render: (e) => <span className="text-muted-foreground">{e.user?.name ?? ""}</span>,
    },
    {
      key: "date",
      header: "Date",
      sortable: true,
      sortValue: (e) => e.createdAt,
      render: (e) => (
        <span className="whitespace-nowrap text-muted-foreground">{formatDate(e.createdAt)}</span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      render: (e) => (
        <div className="flex justify-end gap-1">
          <button
            type="button"
            onClick={() => openAdjust(e)}
            className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label={`Adjust stock for ${e.product?.name ?? "product"}`}
          >
            <FiEdit2 className="h-4 w-4" aria-hidden />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Inventory"
        subtitle={`Track stock levels and adjustments — ${entries.length} history entries.`}
        breadcrumb={[{ label: "Inventory" }]}
        actions={
          <ExportButton
            filename="inventory-history"
            data={filtered.map((e) => ({
              Product: e.product?.name ?? "",
              SKU: e.product?.sku ?? "",
              Previous: e.previousStock,
              Adjustment: e.adjustment,
              Current: e.newStock,
              Reason: e.reason,
              User: e.user?.name ?? "",
              Date: formatDate(e.createdAt),
            }))}
            disabled={filtered.length === 0}
          />
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={<FiPackage className="h-5 w-5" aria-hidden />}
          label="Total units"
          value={formatNumber(totalUnits)}
          tone="bg-primary/10 text-primary"
        />
        <StatCard
          icon={<FiBox className="h-5 w-5" aria-hidden />}
          label="Products"
          value={formatNumber(allProducts.length)}
          tone="bg-info/10 text-info"
        />
        <StatCard
          icon={<FiAlertTriangle className="h-5 w-5" aria-hidden />}
          label="Low stock (&lt;10)"
          value={formatNumber(lowStock)}
          tone="bg-warning/15 text-warning"
        />
        <StatCard
          icon={<FiXCircle className="h-5 w-5" aria-hidden />}
          label="Out of stock"
          value={formatNumber(outOfStock)}
          tone="bg-destructive/10 text-destructive"
        />
      </div>

      <FilterBar
        searchValue={query}
        onSearchChange={(v) => {
          setQuery(v);
          setPage(1);
        }}
        searchPlaceholder="Search by product or SKU..."
        leftSlot={
          <Select
            value={direction}
            onChange={(e) => {
              setDirection(e.target.value);
              setPage(1);
            }}
            containerClassName="sm:w-44"
            className="h-10"
          >
            <option value="all">All adjustments</option>
            <option value="in">Stock in</option>
            <option value="out">Stock out</option>
          </Select>
        }
      />

      <DataTable<InventoryEntry>
        columns={columns}
        rows={pageItems}
        rowKey={(e) => e._id}
        pagination={{
          page,
          totalPages,
          totalItems: filtered.length,
          pageSize,
          onPageChange: setPage,
          onPageSizeChange: handlePageSize,
          pageSizeOptions: [8, 16, 24],
        }}
        empty={{
          icon: <FiPackage className="h-7 w-7" aria-hidden />,
          title: "No inventory entries found",
          description: "Try adjusting your search or filters.",
        }}
      />

      <Modal
        open={adjustTarget !== null}
        onClose={() => {
          setAdjustTarget(null);
          setForm({ qty: "", reason: "" });
        }}
        title="Adjust stock"
        subtitle={adjustTarget?.product?.name}
        size="md"
      >
        {adjustTarget && (
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-xl border border-border bg-muted/40 px-4 py-3">
              <div className="min-w-0">
                <p className="truncate font-semibold text-foreground">
                  {adjustTarget.product?.name ?? "Unknown"}
                </p>
                <p className="font-mono text-xs text-muted-foreground">{adjustTarget.product?.sku ?? ""}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Current stock</p>
                <p className="text-xl font-extrabold text-foreground">
                  {formatNumber(adjustTarget.newStock)}
                </p>
              </div>
            </div>
            <Input
              label="Quantity"
              type="number"
              placeholder="e.g. 12 or -3"
              value={form.qty}
              onChange={(e) =>
                setForm((f) => ({ ...f, qty: e.target.value, qtyError: undefined }))
              }
              error={form.qtyError}
              hint="Use a positive value to add stock, or a negative value to remove it."
            />
            <Input
              label="Reason"
              placeholder="e.g. Restock (purchase order #PO-2204)"
              value={form.reason}
              onChange={(e) =>
                setForm((f) => ({ ...f, reason: e.target.value, reasonError: undefined }))
              }
              error={form.reasonError}
            />
            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => {
                  setAdjustTarget(null);
                  setForm({ qty: "", reason: "" });
                }}
              >
                Cancel
              </Button>
              <Button onClick={submitAdjustment} disabled={adjusting}>
                <FiBox className="h-4 w-4" aria-hidden />
                Save adjustment
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
