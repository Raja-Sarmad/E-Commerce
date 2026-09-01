"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { FiBox, FiEdit2, FiEye, FiPackage, FiPlus, FiStar, FiTrash2 } from "react-icons/fi";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Select } from "@/components/ui/Select";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminAvatar } from "@/components/admin/AdminAvatar";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { FilterBar } from "@/components/admin/FilterBar";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { ExportButton } from "@/components/admin/ExportButton";
import { toast } from "@/hooks/use-toast";
import {
  useGetAdminProductsQuery,
  useUpdateProductMutation,
  useDeleteProductMutation,
} from "@/lib/rtk/adminApi";
import { getErrorMessage } from "@/lib/rtk/baseApi";
import { useFormatPrice } from "@/hooks/use-format-price";
import type { Product } from "@/lib/types";

const PER_PAGE = 8;

export default function AdminProductsPage() {
  const formatPrice = useFormatPrice();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [stock, setStock] = useState("all");
  const [brand, setBrand] = useState("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PER_PAGE);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);

  const { data, isLoading } = useGetAdminProductsQuery({
    search: query || undefined,
    category: category === "all" ? undefined : category,
    brand: brand === "all" ? undefined : brand,
    stockStatus: stock === "all" ? undefined : stock,
    sort: "position",
    page,
    limit: pageSize,
  });

  const [updateProduct, { isLoading: updating }] = useUpdateProductMutation();
  const [deleteProduct, { isLoading: deleting }] = useDeleteProductMutation();

  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, data?.totalPages ?? 1);

  const categories = useMemo(
    () => [...new Set(items.map((p) => p.category))].sort(),
    [items]
  );
  const brands = useMemo(
    () => [...new Set(items.map((p) => p.brand))].sort(),
    [items]
  );

  const toggleFeatured = async (product: Product) => {
    const next = !product.isFeatured;
    try {
      await updateProduct({ id: product.id, body: { isFeatured: next } }).unwrap();
      toast.info(
        next ? "Featured" : "Unfeatured",
        `“${product.name}” ${next ? "marked as featured" : "removed from featured"}.`
      );
    } catch (err) {
      toast.warning("Could not update", getErrorMessage(err));
    }
  };

  const removeOne = async (product: Product) => {
    try {
      await deleteProduct(product.id).unwrap();
      setDeleteTarget(null);
      toast.success("Product removed", `“${product.name}” was deleted.`);
    } catch (err) {
      toast.warning("Could not delete", getErrorMessage(err));
    }
  };

  const removeBulk = async () => {
    const ids = [...selected];
    try {
      await Promise.all(ids.map((id) => deleteProduct(id).unwrap()));
      setSelected(new Set());
      setBulkDeleteOpen(false);
      toast.success("Products removed", `${ids.length} products were deleted.`);
    } catch (err) {
      toast.warning("Could not delete", getErrorMessage(err));
    }
  };

  const markFeatured = async (value: boolean) => {
    const ids = [...selected];
    try {
      await Promise.all(
        ids.map((id) => updateProduct({ id, body: { isFeatured: value } }).unwrap())
      );
      value
        ? toast.success("Featured", `${ids.length} products marked as featured.`)
        : toast.info("Unfeatured", `${ids.length} products unfeatured.`);
      setSelected(new Set());
    } catch (err) {
      toast.warning("Could not update", getErrorMessage(err));
    }
  };

  const stockVariant = (stockCount: number) =>
    stockCount === 0 ? "destructive" : stockCount < 10 ? "warning" : "success";

  const columns: Column<Product>[] = [
    {
      key: "product",
      header: "Product",
      sortable: true,
      sortValue: (p) => p.name,
      render: (p) => (
        <div className="flex items-center gap-3">
          <AdminAvatar name={p.name} src={p.images?.[0] ?? ""} size="sm" />
          <div className="min-w-0">
            <Link
              href={`/admin/products/${p.id}/edit`}
              className="block max-w-[220px] truncate font-semibold text-foreground hover:text-primary"
            >
              {p.name}
            </Link>
            <p className="truncate text-xs text-muted-foreground">
              {p.brand} · {p.sku}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "category",
      header: "Category",
      sortable: true,
      sortValue: (p) => p.category,
      render: (p) => (
        <Badge variant="secondary">{p.category}</Badge>
      ),
    },
    {
      key: "price",
      header: "Price",
      align: "right",
      sortable: true,
      sortValue: (p) => p.price,
      render: (p) => (
        <div className="text-right">
          <p className="font-bold text-foreground">{formatPrice(p.price)}</p>
          {p.onSale && (
            <p className="text-xs text-destructive">-{p.discountPercent}%</p>
          )}
        </div>
      ),
    },
    {
      key: "stock",
      header: "Stock",
      align: "center",
      sortable: true,
      sortValue: (p) => p.stock,
      render: (p) => (
        <Badge variant={stockVariant(p.stock)} dot className="whitespace-nowrap">
          {p.stock}
        </Badge>
      ),
    },
    {
      key: "position",
      header: "Position",
      align: "center",
      sortable: true,
      sortValue: (p) => p.position ?? 0,
      render: (p) => (
        <span className="text-sm text-muted-foreground">{p.position ?? 0}</span>
      ),
    },
    {
      key: "rating",
      header: "Rating",
      align: "center",
      sortable: true,
      sortValue: (p) => p.rating,
      render: (p) => (
        <span className="flex items-center justify-center gap-1 whitespace-nowrap text-muted-foreground">
          <FiStar className="h-3.5 w-3.5 text-warning" aria-hidden />
          {p.rating} ({p.reviewsCount})
        </span>
      ),
    },
    {
      key: "featured",
      header: "Featured",
      align: "center",
      sortable: true,
      sortValue: (p) => (p.isFeatured ? 1 : 0),
      render: (p) => (
        <button
          type="button"
          onClick={() => toggleFeatured(p)}
          disabled={updating}
          aria-pressed={p.isFeatured}
          className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
            p.isFeatured ? "bg-primary" : "bg-muted"
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
              p.isFeatured ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      render: (p) => (
        <div className="flex justify-end gap-1">
          <Link
            href={`/shop/${p.slug}`}
            className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label={`View ${p.name}`}
          >
            <FiEye className="h-4 w-4" aria-hidden />
          </Link>
          <Link
            href={`/admin/products/${p.id}/edit`}
            className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label={`Edit ${p.name}`}
          >
            <FiEdit2 className="h-4 w-4" aria-hidden />
          </Link>
          <button
            type="button"
            onClick={() => setDeleteTarget(p)}
            className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
            aria-label={`Delete ${p.name}`}
          >
            <FiTrash2 className="h-4 w-4" aria-hidden />
          </button>
        </div>
      ),
    },
  ];

  const handlePageSize = (size: number) => {
    setPageSize(size);
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Products"
        subtitle={`Manage your catalog — ${total} products total.`}
        breadcrumb={[{ label: "Products" }]}
        actions={
          <>
            <ExportButton
              filename="products"
              data={items.map((p) => ({
                Name: p.name,
                SKU: p.sku,
                Brand: p.brand,
                Category: p.category,
                Price: p.price,
                Stock: p.stock,
                Rating: p.rating,
                Featured: p.isFeatured ? "Yes" : "No",
              }))}
              disabled={isLoading || items.length === 0}
            />
            <Button href="/admin/products/new" size="sm">
              <FiPlus className="h-4 w-4" aria-hidden />
              Add product
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
        searchPlaceholder="Search by name, SKU or brand..."
        leftSlot={
          <>
            <Select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setPage(1);
              }}
              containerClassName="sm:w-44"
              className="h-10"
            >
              <option value="all">All categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
            <Select
              value={brand}
              onChange={(e) => {
                setBrand(e.target.value);
                setPage(1);
              }}
              containerClassName="sm:w-40"
              className="h-10"
            >
              <option value="all">All brands</option>
              {brands.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </Select>
            <Select
              value={stock}
              onChange={(e) => {
                setStock(e.target.value);
                setPage(1);
              }}
              containerClassName="sm:w-44"
              className="h-10"
            >
              <option value="all">All stock levels</option>
              <option value="in">In stock (10+)</option>
              <option value="low">Low stock (&lt;10)</option>
              <option value="out">Out of stock</option>
            </Select>
          </>
        }
      />

      <DataTable<Product>
        columns={columns}
        rows={items}
        rowKey={(p) => p.id}
        loading={isLoading}
        selectable
        selectedKeys={selected}
        onSelectionChange={setSelected}
        bulkBar={
          <>
            <Button variant="outline" size="sm" onClick={() => markFeatured(true)}>
              Mark featured
            </Button>
            <Button variant="outline" size="sm" onClick={() => markFeatured(false)}>
              Unfeature
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setBulkDeleteOpen(true)}
              leftIcon={<FiTrash2 className="h-4 w-4" aria-hidden />}
            >
              Delete
            </Button>
          </>
        }
        pagination={{
          page,
          totalPages,
          totalItems: total,
          pageSize,
          onPageChange: setPage,
          onPageSizeChange: handlePageSize,
          pageSizeOptions: [8, 16, 24],
        }}
        empty={{
          icon: <FiPackage className="h-7 w-7" aria-hidden />,
          title: "No products found",
          description: "Try adjusting your search or filters, or add a new product.",
          actionLabel: "Add product",
          actionHref: "/admin/products/new",
        }}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && removeOne(deleteTarget)}
        title="Delete product?"
        description={`This will permanently remove “${deleteTarget?.name}” from your catalog. This action cannot be undone.`}
        confirmLabel="Delete"
      />

      <ConfirmDialog
        open={bulkDeleteOpen}
        onClose={() => setBulkDeleteOpen(false)}
        onConfirm={removeBulk}
        title="Delete selected products?"
        description={`You're about to delete ${selected.size} products. This action cannot be undone.`}
        confirmLabel={`Delete ${selected.size} products`}
      />
    </div>
  );
}
