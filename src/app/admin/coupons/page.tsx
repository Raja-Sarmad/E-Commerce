"use client";

import { useMemo, useState } from "react";
import { FiEdit2, FiPlus, FiTag, FiTrash2 } from "react-icons/fi";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { FilterBar } from "@/components/admin/FilterBar";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { ExportButton } from "@/components/admin/ExportButton";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { useToast } from "@/context/ToastProvider";
import { coupons as seedCoupons } from "@/lib/data/content";
import { couponUsage } from "@/lib/data/admin";
import { formatDate, formatNumber, formatPrice } from "@/lib/utils";
import type { Coupon } from "@/lib/types";

const PER_PAGE = 8;

type CouponForm = {
  code: string;
  type: "percentage" | "fixed";
  value: string;
  minSpend: string;
  maxDiscount: string;
  expiresAt: string;
  active: boolean;
};

const emptyForm: CouponForm = {
  code: "",
  type: "percentage",
  value: "",
  minSpend: "",
  maxDiscount: "",
  expiresAt: "",
  active: true,
};

export default function AdminCouponsPage() {
  const { success, info, warning } = useToast();
  const [items, setItems] = useState<Coupon[]>(seedCoupons);
  const [query, setQuery] = useState("");
  const [type, setType] = useState("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PER_PAGE);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Coupon | null>(null);
  const [form, setForm] = useState<CouponForm>(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState<Coupon | null>(null);

  const usageFor = (code: string) =>
    couponUsage[code] ?? { used: 0, limit: 100, revenue: 0 };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((c) => {
      const matchesQuery = !q || c.code.toLowerCase().includes(q);
      const matchesType = type === "all" || c.type === type;
      return matchesQuery && matchesType;
    });
  }, [items, query, type]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageItems = filtered.slice((page - 1) * pageSize, page * pageSize);

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setFormOpen(true);
  };

  const openEdit = (coupon: Coupon) => {
    setEditing(coupon);
    setForm({
      code: coupon.code,
      type: coupon.type,
      value: String(coupon.value),
      minSpend: String(coupon.minSpend),
      maxDiscount: coupon.maxDiscount !== undefined ? String(coupon.maxDiscount) : "",
      expiresAt: coupon.expiresAt.slice(0, 10),
      active: coupon.active,
    });
    setFormOpen(true);
  };

  const save = () => {
    const code = form.code.trim().toUpperCase();
    const value = Number(form.value);
    const minSpend = Number(form.minSpend);
    const maxDiscount = form.maxDiscount.trim() ? Number(form.maxDiscount) : undefined;
    if (!code) {
      warning("Code required", "Please enter a coupon code.");
      return;
    }
    if (!form.value || Number.isNaN(value) || value <= 0) {
      warning("Invalid value", "Discount value must be a positive number.");
      return;
    }
    if (Number.isNaN(minSpend) || minSpend < 0) {
      warning("Invalid minimum spend", "Minimum spend must be zero or more.");
      return;
    }
    if (!form.expiresAt) {
      warning("Expiry required", "Please choose an expiration date.");
      return;
    }
    if (items.some((c) => c.code.toLowerCase() === code.toLowerCase() && c.code !== editing?.code)) {
      warning("Duplicate code", "A coupon with this code already exists.");
      return;
    }
    const base = {
      type: form.type,
      value,
      minSpend,
      maxDiscount,
      expiresAt: `${form.expiresAt}T00:00:00Z`,
      active: form.active,
    };
    if (editing) {
      const updated: Coupon = { ...editing, code, ...base };
      setItems((prev) => prev.map((c) => (c.code === editing.code ? updated : c)));
      success("Coupon updated", `Coupon “${updated.code}” was saved.`);
    } else {
      const created: Coupon = { code, ...base };
      setItems((prev) => [...prev, created]);
      success("Coupon created", `Coupon “${created.code}” was added.`);
    }
    setFormOpen(false);
  };

  const toggleActive = (coupon: Coupon) => {
    const updated = { ...coupon, active: !coupon.active };
    setItems((prev) =>
      prev.map((c) => (c.code === coupon.code ? updated : c))
    );
    info(
      updated.active ? "Activated" : "Deactivated",
      `Coupon “${updated.code}” is now ${updated.active ? "active" : "inactive"}.`
    );
  };

  const remove = () => {
    if (!deleteTarget) return;
    setItems((prev) => prev.filter((c) => c.code !== deleteTarget.code));
    success("Coupon removed", `Coupon “${deleteTarget.code}” was deleted.`);
    setDeleteTarget(null);
  };

  const handlePageSize = (size: number) => {
    setPageSize(size);
    setPage(1);
  };

  const valueLabel = (coupon: Coupon) =>
    coupon.type === "percentage" ? `${coupon.value}%` : formatPrice(coupon.value);

  const columns: Column<Coupon>[] = [
    {
      key: "code",
      header: "Code",
      sortable: true,
      sortValue: (c) => c.code,
      render: (c) => (
        <span className="whitespace-nowrap font-bold tracking-wide text-foreground">
          {c.code}
        </span>
      ),
    },
    {
      key: "type",
      header: "Type",
      sortable: true,
      sortValue: (c) => c.type,
      render: (c) => (
        <Badge variant={c.type === "percentage" ? "primary" : "accent"}>
          {c.type}
        </Badge>
      ),
    },
    {
      key: "value",
      header: "Value",
      align: "right",
      sortable: true,
      sortValue: (c) => c.value,
      render: (c) => (
        <div className="text-right">
          <p className="font-semibold text-foreground">{valueLabel(c)}</p>
          {c.maxDiscount !== undefined && c.type === "percentage" && (
            <p className="text-xs text-muted-foreground">
              up to {formatPrice(c.maxDiscount)}
            </p>
          )}
        </div>
      ),
    },
    {
      key: "minSpend",
      header: "Min spend",
      align: "right",
      sortable: true,
      sortValue: (c) => c.minSpend,
      render: (c) => (
        <span className="whitespace-nowrap text-muted-foreground">
          {formatPrice(c.minSpend)}
        </span>
      ),
    },
    {
      key: "usage",
      header: "Usage",
      sortable: true,
      sortValue: (c) => {
        const u = usageFor(c.code);
        return u.limit > 0 ? u.used / u.limit : 0;
      },
      render: (c) => {
        const u = usageFor(c.code);
        const pct = u.limit > 0 ? Math.min(100, (u.used / u.limit) * 100) : 0;
        return (
          <div className="w-32">
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${pct}%` }}
              />
            </div>
            <p className="mt-1 whitespace-nowrap text-xs text-muted-foreground">
              {formatNumber(u.used)} / {formatNumber(u.limit)}
            </p>
          </div>
        );
      },
    },
    {
      key: "revenue",
      header: "Revenue",
      align: "right",
      sortable: true,
      sortValue: (c) => usageFor(c.code).revenue,
      render: (c) => (
        <span className="whitespace-nowrap font-medium text-foreground">
          {formatPrice(usageFor(c.code).revenue)}
        </span>
      ),
    },
    {
      key: "expires",
      header: "Expires",
      sortable: true,
      sortValue: (c) => c.expiresAt,
      render: (c) => (
        <span className="whitespace-nowrap text-muted-foreground">
          {formatDate(c.expiresAt)}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      align: "center",
      sortable: true,
      sortValue: (c) => (c.active ? 1 : 0),
      render: (c) => (
        <button
          type="button"
          onClick={() => toggleActive(c)}
          aria-pressed={c.active}
          className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
            c.active ? "bg-primary" : "bg-muted"
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
              c.active ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      render: (c) => (
        <div className="flex justify-end gap-1">
          <button
            type="button"
            onClick={() => openEdit(c)}
            className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label={`Edit ${c.code}`}
          >
            <FiEdit2 className="h-4 w-4" aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => setDeleteTarget(c)}
            className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
            aria-label={`Delete ${c.code}`}
          >
            <FiTrash2 className="h-4 w-4" aria-hidden />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Coupons"
        subtitle={`Create and manage discount codes — ${items.length} coupons total.`}
        breadcrumb={[{ label: "Coupons" }]}
        actions={
          <>
            <ExportButton
              filename="coupons"
              data={filtered.map((c) => ({
                Code: c.code,
                Type: c.type,
                Value: valueLabel(c),
                MinSpend: c.minSpend,
                Used: usageFor(c.code).used,
                Limit: usageFor(c.code).limit,
                Revenue: usageFor(c.code).revenue,
                Expires: formatDate(c.expiresAt),
                Active: c.active ? "Yes" : "No",
              }))}
              disabled={filtered.length === 0}
            />
            <Button size="sm" onClick={openAdd}>
              <FiPlus className="h-4 w-4" aria-hidden />
              Add coupon
            </Button>
          </>
        }
      />

      <FilterBar
        searchValue={query}
        onSearchChange={(v) => {
          setQuery(v);
          setPage(1);
        }}
        searchPlaceholder="Search by coupon code..."
        leftSlot={
          <Select
            value={type}
            onChange={(e) => {
              setType(e.target.value);
              setPage(1);
            }}
            containerClassName="sm:w-44"
            className="h-10"
          >
            <option value="all">All types</option>
            <option value="percentage">Percentage</option>
            <option value="fixed">Fixed amount</option>
          </Select>
        }
      />

      <DataTable<Coupon>
        columns={columns}
        rows={pageItems}
        rowKey={(c) => c.code}
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
          icon: <FiTag className="h-7 w-7" aria-hidden />,
          title: "No coupons found",
          description: "Try adjusting your search or filters, or add a new coupon.",
          actionLabel: "Add coupon",
          onAction: openAdd,
        }}
      />

      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editing ? "Edit coupon" : "Add coupon"}
        subtitle={
          editing ? `Update “${editing.code}”.` : "Create a new discount code."
        }
        size="lg"
      >
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Code"
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value })}
              placeholder="e.g. SUMMER20"
              hint="Stored in uppercase."
            />
            <Select
              label="Type"
              value={form.type}
              onChange={(e) =>
                setForm({
                  ...form,
                  type: e.target.value as "percentage" | "fixed",
                })
              }
            >
              <option value="percentage">Percentage off</option>
              <option value="fixed">Fixed amount</option>
            </Select>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <Input
              label="Value"
              type="number"
              min={0}
              value={form.value}
              onChange={(e) => setForm({ ...form, value: e.target.value })}
              placeholder="10"
              hint={form.type === "percentage" ? "Percent off" : "Dollar amount"}
            />
            <Input
              label="Min spend"
              type="number"
              min={0}
              value={form.minSpend}
              onChange={(e) => setForm({ ...form, minSpend: e.target.value })}
              placeholder="0"
            />
            <Input
              label="Max discount"
              type="number"
              min={0}
              value={form.maxDiscount}
              onChange={(e) => setForm({ ...form, maxDiscount: e.target.value })}
              placeholder="Optional"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Expires"
              type="date"
              value={form.expiresAt}
              onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
            />
          </div>
          <label className="flex cursor-pointer items-center gap-2.5">
            <input
              type="checkbox"
              checked={form.active}
              onChange={(e) => setForm({ ...form, active: e.target.checked })}
              className="h-4 w-4 rounded border-border accent-primary"
            />
            <span className="text-sm font-medium text-foreground">
              Active coupon
            </span>
          </label>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setFormOpen(false)}>
              Cancel
            </Button>
            <Button onClick={save}>
              {editing ? "Save changes" : "Add coupon"}
            </Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={remove}
        title="Delete coupon?"
        description={`This will permanently remove coupon “${deleteTarget?.code}”. This action cannot be undone.`}
        confirmLabel="Delete"
      />
    </div>
  );
}
