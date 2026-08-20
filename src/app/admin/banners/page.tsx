"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  FiEdit2,
  FiImage,
  FiPlus,
  FiTrash2,
} from "react-icons/fi";
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
import { toast } from "@/hooks/use-toast";
import {
  useGetAdminBannersQuery,
  useCreateBannerMutation,
  useUpdateBannerMutation,
  useDeleteBannerMutation,
  type AdminBanner,
} from "@/lib/rtk/adminApi";
import { formatNumber } from "@/lib/utils";

const PER_PAGE = 8;

type BannerPosition = "hero" | "promo" | "homepage" | "offer";

const positionVariant: Record<BannerPosition, "primary" | "accent" | "info" | "warning"> = {
  hero: "primary",
  promo: "accent",
  homepage: "info",
  offer: "warning",
};

type BannerForm = {
  title: string;
  position: BannerPosition;
  image: string;
  link: string;
  active: boolean;
};

const emptyForm: BannerForm = {
  title: "",
  position: "hero",
  image: "",
  link: "",
  active: true,
};

export default function AdminBannersPage() {
  const [query, setQuery] = useState("");
  const [positionFilter, setPositionFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PER_PAGE);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<AdminBanner | null>(null);
  const [form, setForm] = useState<BannerForm>(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState<AdminBanner | null>(null);

  const { data, isLoading } = useGetAdminBannersQuery({});
  const [createBanner] = useCreateBannerMutation();
  const [updateBanner] = useUpdateBannerMutation();
  const [deleteBanner] = useDeleteBannerMutation();

  const items = useMemo(() => data?.items ?? [], [data]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((b) => {
      const matchesQuery =
        !q ||
        b.title.toLowerCase().includes(q) ||
        (b.link ?? "").toLowerCase().includes(q);
      const matchesPosition =
        positionFilter === "all" || b.position === positionFilter;
      return matchesQuery && matchesPosition;
    });
  }, [items, query, positionFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageItems = filtered.slice((page - 1) * pageSize, page * pageSize);

  const ctr = (b: AdminBanner) =>
    b.views > 0 ? `${((b.clicks / b.views) * 100).toFixed(2)}%` : "—";

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setFormOpen(true);
  };

  const openEdit = (banner: AdminBanner) => {
    setEditing(banner);
    setForm({
      title: banner.title,
      position: (banner.position as BannerPosition) || "hero",
      image: banner.image,
      link: banner.link ?? "",
      active: banner.active,
    });
    setFormOpen(true);
  };

  const save = async () => {
    const title = form.title.trim();
    if (!title) {
      toast.warning("Title required", "Please enter a banner title.");
      return;
    }
    try {
      if (editing) {
        await updateBanner({
          id: editing._id,
          body: {
            title,
            position: form.position,
            image: form.image.trim() || editing.image,
            link: form.link.trim(),
            active: form.active,
          },
        }).unwrap();
        toast.success("Banner saved", `"${title}" was updated.`);
      } else {
        await createBanner({
          title,
          position: form.position,
          image:
            form.image.trim() ||
            `https://picsum.photos/seed/banner-${title.toLowerCase().replace(/\s+/g, "-")}/1200/500`,
          link: form.link.trim(),
          active: form.active,
        }).unwrap();
        toast.success("Banner created", `"${title}" was added.`);
      }
      setFormOpen(false);
    } catch {
      toast.error("Error", "Something went wrong. Please try again.");
    }
  };

  const toggleActive = async (banner: AdminBanner) => {
    try {
      await updateBanner({
        id: banner._id,
        body: { active: !banner.active },
      }).unwrap();
      toast.info(
        !banner.active ? "Activated" : "Deactivated",
        `"${banner.title}" is now ${!banner.active ? "active" : "inactive"}.`
      );
    } catch {
      toast.error("Error", "Failed to update banner status.");
    }
  };

  const remove = async () => {
    if (!deleteTarget) return;
    try {
      await deleteBanner(deleteTarget._id).unwrap();
      toast.success("Banner removed", `"${deleteTarget.title}" was deleted.`);
    } catch {
      toast.error("Error", "Failed to delete banner.");
    }
    setDeleteTarget(null);
  };

  const handlePageSize = (size: number) => {
    setPageSize(size);
    setPage(1);
  };

  const columns: Column<AdminBanner>[] = [
    {
      key: "banner",
      header: "Banner",
      sortable: true,
      sortValue: (b) => b.title,
      render: (b) => (
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={b.image}
            alt={b.title}
            className="h-10 w-16 shrink-0 rounded-lg object-cover"
          />
          <div className="min-w-0">
            <p className="max-w-[220px] truncate font-semibold text-foreground">
              {b.title}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "position",
      header: "Position",
      sortable: true,
      sortValue: (b) => b.position,
      render: (b) => (
        <Badge variant={positionVariant[b.position as BannerPosition] ?? "primary"}>
          {b.position}
        </Badge>
      ),
    },
    {
      key: "link",
      header: "Link",
      sortable: true,
      sortValue: (b) => b.link ?? "",
      render: (b) =>
        b.link ? (
          <Link
            href={b.link}
            className="block max-w-[180px] truncate text-muted-foreground hover:text-primary"
          >
            {b.link}
          </Link>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
    {
      key: "views",
      header: "Views",
      align: "right",
      sortable: true,
      sortValue: (b) => b.views,
      render: (b) => (
        <span className="whitespace-nowrap text-muted-foreground">
          {formatNumber(b.views)}
        </span>
      ),
    },
    {
      key: "clicks",
      header: "Clicks",
      align: "right",
      sortable: true,
      sortValue: (b) => b.clicks,
      render: (b) => (
        <span className="whitespace-nowrap text-muted-foreground">
          {formatNumber(b.clicks)}
        </span>
      ),
    },
    {
      key: "ctr",
      header: "CTR",
      align: "right",
      sortable: true,
      sortValue: (b) => (b.views > 0 ? b.clicks / b.views : 0),
      render: (b) => (
        <span className="whitespace-nowrap font-semibold text-foreground">
          {ctr(b)}
        </span>
      ),
    },
    {
      key: "active",
      header: "Active",
      align: "center",
      sortable: true,
      sortValue: (b) => (b.active ? 1 : 0),
      render: (b) => (
        <button
          type="button"
          onClick={() => toggleActive(b)}
          aria-pressed={b.active}
          className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
            b.active ? "bg-primary" : "bg-muted"
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
              b.active ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
      ),
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
            aria-label={`Edit ${b.title}`}
          >
            <FiEdit2 className="h-4 w-4" aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => setDeleteTarget(b)}
            className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
            aria-label={`Delete ${b.title}`}
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
        title="Banners"
        subtitle={`Promote your campaigns — ${data?.total ?? items.length} banners total.`}
        breadcrumb={[{ label: "Banners" }]}
        actions={
          <>
            <ExportButton
              filename="banners"
              data={filtered.map((b) => ({
                Title: b.title,
                Position: b.position,
                Link: b.link ?? "",
                Views: b.views,
                Clicks: b.clicks,
                CTR: ctr(b),
                Active: b.active ? "Yes" : "No",
              }))}
              disabled={filtered.length === 0}
            />
            <Button size="sm" onClick={openAdd}>
              <FiPlus className="h-4 w-4" aria-hidden />
              Add banner
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
        searchPlaceholder="Search by title or link..."
        leftSlot={
          <Select
            value={positionFilter}
            onChange={(e) => {
              setPositionFilter(e.target.value);
              setPage(1);
            }}
            containerClassName="sm:w-44"
            className="h-10"
          >
            <option value="all">All positions</option>
            <option value="hero">Hero</option>
            <option value="promo">Promo</option>
            <option value="homepage">Homepage</option>
            <option value="offer">Offer</option>
          </Select>
        }
      />

      {isLoading ? (
        <div className="flex items-center justify-center py-20 text-muted-foreground">
          Loading banners…
        </div>
      ) : (
        <DataTable<AdminBanner>
          columns={columns}
          rows={pageItems}
          rowKey={(b) => b._id}
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
            icon: <FiImage className="h-7 w-7" aria-hidden />,
            title: "No banners found",
            description: "Try adjusting your search or filters, or add a new banner.",
            actionLabel: "Add banner",
            onAction: openAdd,
          }}
        />
      )}

      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editing ? "Edit banner" : "Add banner"}
        subtitle={
          editing ? `Update "${editing.title}".` : "Create a new promotional banner."
        }
        size="lg"
      >
        <div className="space-y-4">
          <Input
            label="Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="e.g. Summer Tech Sale"
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Select
              label="Position"
              value={form.position}
              onChange={(e) =>
                setForm({ ...form, position: e.target.value as BannerPosition })
              }
            >
              <option value="hero">Hero</option>
              <option value="promo">Promo</option>
              <option value="homepage">Homepage</option>
              <option value="offer">Offer</option>
            </Select>
            <Input
              label="Image URL"
              value={form.image}
              onChange={(e) => setForm({ ...form, image: e.target.value })}
              placeholder="https://..."
              hint="Leave empty to use a placeholder image."
            />
          </div>
          <Input
            label="Link"
            value={form.link}
            onChange={(e) => setForm({ ...form, link: e.target.value })}
            placeholder="/shop?category=electronics"
          />
          <div className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3">
            <div>
              <p className="text-sm font-medium text-foreground">Active</p>
              <p className="text-xs text-muted-foreground">
                Show this banner on the storefront.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setForm({ ...form, active: !form.active })}
              aria-pressed={form.active}
              className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
                form.active ? "bg-primary" : "bg-muted"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                  form.active ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setFormOpen(false)}>
              Cancel
            </Button>
            <Button onClick={save}>
              {editing ? "Save changes" : "Add banner"}
            </Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={remove}
        title="Delete banner?"
        description={`This will permanently remove "${deleteTarget?.title}". This action cannot be undone.`}
        confirmLabel="Delete"
      />
    </div>
  );
}
