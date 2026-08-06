"use client";

import { useMemo, useState } from "react";
import { FiAward, FiEdit2, FiPlus, FiTrash2 } from "react-icons/fi";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminAvatar } from "@/components/admin/AdminAvatar";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { FilterBar } from "@/components/admin/FilterBar";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { ExportButton } from "@/components/admin/ExportButton";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/context/ToastProvider";
import { brands as seedBrands } from "@/lib/data/content";
import { products } from "@/lib/data/products";
import { generateId } from "@/lib/utils";
import type { Brand } from "@/lib/types";

const PER_PAGE = 8;

type BrandForm = {
  name: string;
  logo: string;
};

const emptyForm: BrandForm = { name: "", logo: "" };

const logoUrl = (seed: string) =>
  `https://picsum.photos/seed/${seed}/80/80`;

export default function AdminBrandsPage() {
  const { success, info, warning } = useToast();
  const [items, setItems] = useState<Brand[]>(seedBrands);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PER_PAGE);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Brand | null>(null);
  const [form, setForm] = useState<BrandForm>(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState<Brand | null>(null);

  const productCounts = useMemo(() => {
    const counts = new Map<string, number>();
    products.forEach((p) => {
      counts.set(p.brand, (counts.get(p.brand) ?? 0) + 1);
    });
    return counts;
  }, []);

  const countFor = (brand: Brand) => productCounts.get(brand.name) ?? 0;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter(
      (b) => !q || b.name.toLowerCase().includes(q) || b.logo.toLowerCase().includes(q)
    );
  }, [items, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageItems = filtered.slice((page - 1) * pageSize, page * pageSize);

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setFormOpen(true);
  };

  const openEdit = (brand: Brand) => {
    setEditing(brand);
    setForm({ name: brand.name, logo: brand.logo });
    setFormOpen(true);
  };

  const save = () => {
    const name = form.name.trim();
    const logo = form.logo.trim();
    if (!name) {
      warning("Name required", "Please enter a brand name.");
      return;
    }
    if (!logo) {
      warning("Logo required", "Please enter a logo seed string.");
      return;
    }
    if (items.some((b) => b.name.toLowerCase() === name.toLowerCase() && b.id !== editing?.id)) {
      warning("Duplicate brand", "A brand with this name already exists.");
      return;
    }
    if (editing) {
      const updated: Brand = { ...editing, name, logo };
      setItems((prev) => prev.map((b) => (b.id === editing.id ? updated : b)));
      success("Brand updated", `“${updated.name}” was saved.`);
    } else {
      const created: Brand = { id: generateId("brand"), name, logo };
      setItems((prev) => [...prev, created]);
      success("Brand created", `“${created.name}” was added.`);
    }
    setFormOpen(false);
  };

  const remove = () => {
    if (!deleteTarget) return;
    setItems((prev) => prev.filter((b) => b.id !== deleteTarget.id));
    success("Brand removed", `“${deleteTarget.name}” was deleted.`);
    setDeleteTarget(null);
  };

  const handlePageSize = (size: number) => {
    setPageSize(size);
    setPage(1);
  };

  const columns: Column<Brand>[] = [
    {
      key: "brand",
      header: "Brand",
      sortable: true,
      sortValue: (b) => b.name,
      render: (b) => (
        <div className="flex items-center gap-3">
          <AdminAvatar name={b.name} src={logoUrl(b.logo)} size="sm" />
          <div className="min-w-0">
            <p className="truncate font-semibold text-foreground">{b.name}</p>
            <p className="truncate text-xs text-muted-foreground">
              logo: {b.logo}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "count",
      header: "Products",
      align: "center",
      sortable: true,
      sortValue: (b) => countFor(b),
      render: (b) => <span className="font-semibold text-foreground">{countFor(b)}</span>,
    },
    {
      key: "status",
      header: "Status",
      align: "center",
      render: () => <StatusBadge status="active" />,
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      render: (b) => (
        <div className="flex justify-end gap-1">
          <button
            type="button"
            onClick={() => openEdit(b)}
            className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label={`Edit ${b.name}`}
          >
            <FiEdit2 className="h-4 w-4" aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => setDeleteTarget(b)}
            className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
            aria-label={`Delete ${b.name}`}
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
        title="Brands"
        subtitle={`Manage the brands in your catalog — ${items.length} brands total.`}
        breadcrumb={[{ label: "Brands" }]}
        actions={
          <>
            <ExportButton
              filename="brands"
              data={filtered.map((b) => ({
                Name: b.name,
                Logo: b.logo,
                Products: countFor(b),
                Status: "active",
              }))}
              disabled={filtered.length === 0}
            />
            <Button size="sm" onClick={openAdd}>
              <FiPlus className="h-4 w-4" aria-hidden />
              Add brand
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
        searchPlaceholder="Search brands..."
      />

      <DataTable<Brand>
        columns={columns}
        rows={pageItems}
        rowKey={(b) => b.id}
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
          icon: <FiAward className="h-7 w-7" aria-hidden />,
          title: "No brands found",
          description: "Try adjusting your search, or add a new brand.",
          actionLabel: "Add brand",
          onAction: openAdd,
        }}
      />

      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editing ? "Edit brand" : "Add brand"}
        subtitle={
          editing ? `Update “${editing.name}”.` : "Add a new brand to your catalog."
        }
        size="sm"
      >
        <div className="space-y-4">
          <Input
            label="Brand name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="e.g. Sonix"
          />
          <Input
            label="Logo seed"
            value={form.logo}
            onChange={(e) => setForm({ ...form, logo: e.target.value })}
            placeholder="e.g. sonix"
            hint="A short string used to generate the logo image."
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setFormOpen(false)}>
              Cancel
            </Button>
            <Button onClick={save}>
              {editing ? "Save changes" : "Add brand"}
            </Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={remove}
        title="Delete brand?"
        description={`This will permanently remove “${deleteTarget?.name}”. Products from this brand will not be deleted.`}
        confirmLabel="Delete"
      />
    </div>
  );
}
