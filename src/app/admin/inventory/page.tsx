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
import { useToast } from "@/context/ToastProvider";
import { generateId, inventoryHistory as seedHistory, type InventoryEntry } from "@/lib/data/admin";
import { products as seedProducts } from "@/lib/data/products";
import { cn, formatDate, formatNumber } from "@/lib/utils";
import type { Product } from "@/lib/types";

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
  const { success } = useToast();
  const [entries, setEntries] = useState<InventoryEntry[]>(seedHistory);
  const [products, setProducts] = useState<Product[]>(seedProducts);
  const [query, setQuery] = useState("");
  const [direction, setDirection] = useState("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PER_PAGE);
  const [adjustTarget, setAdjustTarget] = useState<InventoryEntry | null>(null);
  const [form, setForm] = useState<AdjustmentState>({ qty: "", reason: "" });

  const totalUnits = products.reduce((sum, p) => sum + p.stock, 0);
  const lowStock = products.filter((p) => p.stock < 10).length;
  const outOfStock = products.filter((p) => p.stock === 0).length;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return entries.filter((e) => {
      const matchesQuery =
        !q ||
        e.productName.toLowerCase().includes(q) ||
        e.sku.toLowerCase().includes(q);
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

  const currentStock = (entry: InventoryEntry) => {
    const latest = entries.find((e) => e.productId === entry.productId);
    if (latest) return latest.current;
    return products.find((p) => p.id === entry.productId)?.stock ?? 0;
  };

  const submitAdjustment = () => {
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
    const previous = currentStock(adjustTarget);
    const next = previous + quantity;
    if (next < 0) {
      setForm((f) => ({ ...f, qtyError: "Stock cannot go below zero." }));
      return;
    }
    const entry: InventoryEntry = {
      id: generateId("ih"),
      productId: adjustTarget.productId,
      productName: adjustTarget.productName,
      sku: adjustTarget.sku,
      previous,
      adjustment: quantity,
      current: next,
      reason: form.reason.trim(),
      user: "admin@novamart.com",
      date: new Date().toISOString(),
    };
    setEntries((prev) => [entry, ...prev]);
    setProducts((prev) =>
      prev.map((p) => (p.id === entry.productId ? { ...p, stock: next } : p))
    );
    setAdjustTarget(null);
    setForm({ qty: "", reason: "" });
    success(
      "Stock adjusted",
      `${adjustTarget.productName} is now ${formatNumber(next)} units (${quantity > 0 ? "+" : ""}${quantity}).`
    );
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
      sortValue: (e) => e.productName,
      render: (e) => (
        <div className="min-w-0">
          <p className="max-w-[240px] truncate font-semibold text-foreground">
            {e.productName}
          </p>
          <p className="truncate text-xs text-muted-foreground">{e.sku}</p>
        </div>
      ),
    },
    {
      key: "sku",
      header: "SKU",
      sortable: true,
      sortValue: (e) => e.sku,
      render: (e) => <span className="font-mono text-xs text-muted-foreground">{e.sku}</span>,
    },
    {
      key: "previous",
      header: "Previous",
      align: "right",
      sortable: true,
      sortValue: (e) => e.previous,
      render: (e) => <span className="text-muted-foreground">{formatNumber(e.previous)}</span>,
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
      sortValue: (e) => e.current,
      render: (e) => <span className="font-bold text-foreground">{formatNumber(e.current)}</span>,
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
      render: (e) => <span className="text-muted-foreground">{e.user}</span>,
    },
    {
      key: "date",
      header: "Date",
      sortable: true,
      sortValue: (e) => e.date,
      render: (e) => (
        <span className="whitespace-nowrap text-muted-foreground">{formatDate(e.date)}</span>
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
            aria-label={`Adjust stock for ${e.productName}`}
          >
            <FiEdit2 className="h-4 w-4" aria-hidden />
          </button>
        </div>
      ),
    },
  ];

  const targetCurrent = adjustTarget ? currentStock(adjustTarget) : 0;

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
              Product: e.productName,
              SKU: e.sku,
              Previous: e.previous,
              Adjustment: e.adjustment,
              Current: e.current,
              Reason: e.reason,
              User: e.user,
              Date: formatDate(e.date),
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
          value={formatNumber(products.length)}
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
        rowKey={(e) => e.id}
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
        subtitle={adjustTarget?.productName}
        size="md"
      >
        {adjustTarget && (
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-xl border border-border bg-muted/40 px-4 py-3">
              <div className="min-w-0">
                <p className="truncate font-semibold text-foreground">
                  {adjustTarget.productName}
                </p>
                <p className="font-mono text-xs text-muted-foreground">{adjustTarget.sku}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Current stock</p>
                <p className="text-xl font-extrabold text-foreground">
                  {formatNumber(targetCurrent)}
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
              <Button onClick={submitAdjustment}>
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
