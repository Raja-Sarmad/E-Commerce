"use client";

import { useMemo, useState } from "react";
import { FiEdit2, FiGrid, FiPlus, FiTrash2 } from "react-icons/fi";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminAvatar } from "@/components/admin/AdminAvatar";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { FilterBar } from "@/components/admin/FilterBar";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { ExportButton } from "@/components/admin/ExportButton";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { toast } from "@/hooks/use-toast";
import {
  useGetAdminCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} from "@/lib/rtk/adminApi";
import type { AdminCategory } from "@/lib/rtk/adminApi";
import { slugify } from "@/lib/utils";
import type { Category } from "@/lib/types";

const PER_PAGE = 8;

type CategoryForm = {
  name: string;
  description: string;
  image: string;
  featured: boolean;
};

const emptyForm: CategoryForm = {
  name: "",
  description: "",
  image: "",
  featured: false,
};

function toCategory(c: AdminCategory): Category {
  return {
    id: c._id,
    slug: c.slug,
    name: c.name,
    description: c.description,
    image: c.image,
    icon: c.icon,
    count: c.count,
    featured: c.featured,
  };
}

export default function AdminCategoriesPage() {
  const [query, setQuery] = useState("");
  const [featured, setFeatured] = useState("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PER_PAGE);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState<CategoryForm>(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);

  const { data, isLoading } = useGetAdminCategoriesQuery({});
  const [createCategory] = useCreateCategoryMutation();
  const [updateCategory] = useUpdateCategoryMutation();
  const [deleteCategory] = useDeleteCategoryMutation();

  const items = useMemo(() => {
    return (data?.items ?? []).map(toCategory);
  }, [data]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((c) => {
      const matchesQuery =
        !q || c.name.toLowerCase().includes(q) || c.slug.toLowerCase().includes(q);
      const matchesFeatured =
        featured === "all" ||
        (featured === "featured" && !!c.featured) ||
        (featured === "other" && !c.featured);
      return matchesQuery && matchesFeatured;
    });
  }, [items, query, featured]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageItems = filtered.slice((page - 1) * pageSize, page * pageSize);

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setFormOpen(true);
  };

  const openEdit = (cat: Category) => {
    setEditing(cat);
    setForm({
      name: cat.name,
      description: cat.description,
      image: cat.image,
      featured: !!cat.featured,
    });
    setFormOpen(true);
  };

  const save = () => {
    const name = form.name.trim();
    if (!name) {
      toast.warning("Name required", "Please enter a category name.");
      return;
    }
    const slug = slugify(name);
    if (items.some((c) => c.slug === slug && c.id !== editing?.id)) {
      toast.warning("Duplicate category", "A category with this name already exists.");
      return;
    }

    if (editing) {
      updateCategory({
        id: editing.id,
        body: {
          name,
          slug,
          description: form.description.trim(),
          image: form.image.trim() || editing.image,
          featured: form.featured,
        },
      })
        .unwrap()
        .then(() => {
          toast.success("Category updated", `"${name}" was saved.`);
          setFormOpen(false);
        })
        .catch(() => {
          toast.warning("Error", "Failed to update category.");
        });
    } else {
      createCategory({
        name,
        slug,
        description: form.description.trim(),
        image: form.image.trim() || `https://picsum.photos/seed/cat-${slug}/600/600`,
        count: 0,
        featured: form.featured,
        isActive: true,
        order: items.length,
      })
        .unwrap()
        .then(() => {
          toast.success("Category created", `"${name}" was added.`);
          setFormOpen(false);
        })
        .catch(() => {
          toast.warning("Error", "Failed to create category.");
        });
    }
  };

  const toggleFeatured = (cat: Category) => {
    updateCategory({
      id: cat.id,
      body: { featured: !cat.featured },
    })
      .unwrap()
      .then(() => {
        toast.info(
          !cat.featured ? "Featured" : "Unfeatured",
          `"${cat.name}" ${!cat.featured ? "marked as featured" : "removed from featured"}.`
        );
      })
      .catch(() => {
        toast.warning("Error", "Failed to update category.");
      });
  };

  const remove = () => {
    if (!deleteTarget) return;
    deleteCategory(deleteTarget.id)
      .unwrap()
      .then(() => {
        toast.success("Category removed", `"${deleteTarget.name}" was deleted.`);
        setDeleteTarget(null);
      })
      .catch(() => {
        toast.warning("Error", "Failed to delete category.");
      });
  };

  const handlePageSize = (size: number) => {
    setPageSize(size);
    setPage(1);
  };

  const columns: Column<Category>[] = [
    {
      key: "category",
      header: "Category",
      sortable: true,
      sortValue: (c) => c.name,
      render: (c) => (
        <div className="flex items-center gap-3">
          <AdminAvatar name={c.name} src={c.image} size="sm" />
          <div className="min-w-0">
            <p className="truncate font-semibold text-foreground">{c.name}</p>
            <p className="max-w-[260px] truncate text-xs text-muted-foreground">
              {c.description}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "slug",
      header: "Slug",
      sortable: true,
      sortValue: (c) => c.slug,
      render: (c) => (
        <code className="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground">
          {c.slug}
        </code>
      ),
    },
    {
      key: "count",
      header: "Products",
      align: "center",
      sortable: true,
      sortValue: (c) => c.count ?? 0,
      render: (c) => (
        <Badge variant="secondary" className="whitespace-nowrap">
          {c.count ?? 0}
        </Badge>
      ),
    },
    {
      key: "featured",
      header: "Featured",
      align: "center",
      sortable: true,
      sortValue: (c) => (c.featured ? 1 : 0),
      render: (c) => (
        <button
          type="button"
          onClick={() => toggleFeatured(c)}
          aria-pressed={!!c.featured}
          className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
            c.featured ? "bg-primary" : "bg-muted"
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
              c.featured ? "translate-x-6" : "translate-x-1"
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
            aria-label={`Edit ${c.name}`}
          >
            <FiEdit2 className="h-4 w-4" aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => setDeleteTarget(c)}
            className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
            aria-label={`Delete ${c.name}`}
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
        title="Categories"
        subtitle={`Organize your catalog by department — ${items.length} categories total.`}
        breadcrumb={[{ label: "Categories" }]}
        actions={
          <>
            <ExportButton
              filename="categories"
              data={filtered.map((c) => ({
                Name: c.name,
                Slug: c.slug,
                Description: c.description,
                Products: c.count ?? 0,
                Featured: c.featured ? "Yes" : "No",
              }))}
              disabled={filtered.length === 0}
            />
            <Button size="sm" onClick={openAdd}>
              <FiPlus className="h-4 w-4" aria-hidden />
              Add category
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
        searchPlaceholder="Search by name or slug..."
        leftSlot={
          <Select
            value={featured}
            onChange={(e) => {
              setFeatured(e.target.value);
              setPage(1);
            }}
            containerClassName="sm:w-44"
            className="h-10"
          >
            <option value="all">All categories</option>
            <option value="featured">Featured only</option>
            <option value="other">Not featured</option>
          </Select>
        }
      />

      <DataTable<Category>
        columns={columns}
        rows={pageItems}
        rowKey={(c) => c.id}
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
          icon: <FiGrid className="h-7 w-7" aria-hidden />,
          title: "No categories found",
          description: "Try adjusting your search or filters, or add a new category.",
          actionLabel: "Add category",
          onAction: openAdd,
        }}
      />

      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editing ? "Edit category" : "Add category"}
        subtitle={
          editing ? `Update "${editing.name}".` : "Create a new product category."
        }
        size="lg"
      >
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Electronics"
            />
            <Input
              label="Slug"
              value={slugify(form.name)}
              onChange={() => {}}
              hint="Auto-generated from the name."
              readOnly
            />
          </div>
          <Textarea
            label="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Short description shown in the store."
            containerClassName="min-h-[90px]"
          />
          <Input
            label="Image URL"
            value={form.image}
            onChange={(e) => setForm({ ...form, image: e.target.value })}
            placeholder="https://..."
            hint="Leave empty to use a placeholder image."
          />
          <label className="flex cursor-pointer items-center gap-2.5">
            <input
              type="checkbox"
              checked={form.featured}
              onChange={(e) => setForm({ ...form, featured: e.target.checked })}
              className="h-4 w-4 rounded border-border accent-primary"
            />
            <span className="text-sm font-medium text-foreground">
              Featured category
            </span>
          </label>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setFormOpen(false)}>
              Cancel
            </Button>
            <Button onClick={save}>
              {editing ? "Save changes" : "Add category"}
            </Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={remove}
        title="Delete category?"
        description={`This will permanently remove "${deleteTarget?.name}". Products in this category will not be deleted.`}
        confirmLabel="Delete"
      />
    </div>
  );
}
