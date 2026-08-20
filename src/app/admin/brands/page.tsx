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
import { toast } from "@/hooks/use-toast";
import {
  useGetAdminBrandsQuery,
  useCreateBrandMutation,
  useUpdateBrandMutation,
  useDeleteBrandMutation,
} from "@/lib/rtk/adminApi";
import type { AdminBrand } from "@/lib/rtk/adminApi";
import type { Brand } from "@/lib/types";

const PER_PAGE = 8;

type BrandForm = {
  name: string;
  logo: string;
};

const emptyForm: BrandForm = { name: "", logo: "" };

const logoUrl = (seed: string) =>
  `https://picsum.photos/seed/${seed}/80/80`;

function toBrand(b: AdminBrand): Brand {
  return {
    id: b._id,
    name: b.name,
    logo: b.logo,
  };
}

export default function AdminBrandsPage() {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PER_PAGE);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Brand | null>(null);
  const [form, setForm] = useState<BrandForm>(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState<Brand | null>(null);

  const { data, isLoading } = useGetAdminBrandsQuery({});
  const [createBrand] = useCreateBrandMutation();
  const [updateBrand] = useUpdateBrandMutation();
  const [deleteBrand] = useDeleteBrandMutation();

  const items = useMemo(() => {
    return (data?.items ?? []).map(toBrand);
  }, [data]);

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
      toast.warning("Name required", "Please enter a brand name.");
      return;
    }
    if (!logo) {
      toast.warning("Logo required", "Please enter a logo seed string.");
      return;
    }
    if (items.some((b) => b.name.toLowerCase() === name.toLowerCase() && b.id !== editing?.id)) {
      toast.warning("Duplicate brand", "A brand with this name already exists.");
      return;
    }
    if (editing) {
      updateBrand({
        id: editing.id,
        body: { name, logo },
      })
        .unwrap()
        .then(() => {
          toast.success("Brand updated", `"${name}" was saved.`);
          setFormOpen(false);
        })
        .catch(() => {
          toast.warning("Error", "Failed to update brand.");
        });
    } else {
      createBrand({ name, logo, isActive: true })
        .unwrap()
        .then(() => {
          toast.success("Brand created", `"${name}" was added.`);
          setFormOpen(false);
        })
        .catch(() => {
          toast.warning("Error", "Failed to create brand.");
        });
    }
  };

  const remove = () => {
    if (!deleteTarget) return;
    deleteBrand(deleteTarget.id)
      .unwrap()
      .then(() => {
        toast.success("Brand removed", `"${deleteTarget.name}" was deleted.`);
        setDeleteTarget(null);
      })
      .catch(() => {
        toast.warning("Error", "Failed to delete brand.");
      });
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
      sortable: false,
      render: () => <span className="text-muted-foreground">—</span>,
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
        loading={isLoading}
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
          editing ? `Update "${editing.name}".` : "Add a new brand to your catalog."
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
        description={`This will permanently remove "${deleteTarget?.name}". Products from this brand will not be deleted.`}
        confirmLabel="Delete"
      />
    </div>
  );
}
