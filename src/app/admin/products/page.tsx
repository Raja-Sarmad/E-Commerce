"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { FiBox, FiEdit2, FiEye, FiPackage, FiPlus, FiStar, FiTrash2 } from "react-icons/fi";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminAvatar } from "@/components/admin/AdminAvatar";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { FilterBar } from "@/components/admin/FilterBar";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { ExportButton } from "@/components/admin/ExportButton";
import { useToast } from "@/context/ToastProvider";
import { readProducts, deleteProducts, deleteProduct, saveProduct } from "@/lib/products-store";
import { formatPrice } from "@/lib/utils";
import type { Product } from "@/lib/types";

const PER_PAGE = 8;

export default function AdminProductsPage() {
  const { info, success, warning } = useToast();
  const [items, setItems] = useState<Product[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [stock, setStock] = useState("all");
  const [brand, setBrand] = useState("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PER_PAGE);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);

  useEffect(() => {
    setItems(readProducts());
    setLoaded(true);
  }, []);

  const categories = useMemo(
    () => [...new Set(items.map((p) => p.category))].sort(),
    [items]
  );
  const brands = useMemo(
    () => [...new Set(items.map((p) => p.brand))].sort(),
    [items]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((p) => {
      const matchesQuery =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q);
      const matchesCategory = category === "all" || p.category === category;
      const matchesBrand = brand === "all" || p.brand === brand;
      const matchesStock =
        stock === "all" ||
        (stock === "low" && p.stock < 10) ||
        (stock === "out" && p.stock === 0) ||
        (stock === "in" && p.stock >= 10);
      return matchesQuery && matchesCategory && matchesBrand && matchesStock;
    });
  }, [items, query, category, brand, stock]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageItems = filtered.slice((page - 1) * pageSize, page * pageSize);

  const toggleFeatured = (product: Product) => {
    const updated = { ...product, isFeatured: !product.isFeatured };
    saveProduct(updated);
    setItems((prev) =>
      prev.map((p) => (p.id === product.id ? updated : p))
    );
    info(
      updated.isFeatured ? "Featured" : "Unfeatured",
      `“${product.name}” ${updated.isFeatured ? "marked as featured" : "removed from featured"}.`
    );
  };

  const removeOne = (product: Product) => {
    deleteProduct(product.id);
    setItems((prev) => prev.filter((p) => p.id !== product.id));
    setDeleteTarget(null);
    success("Product removed", `“${product.name}” was deleted.`);
  };

  const removeBulk = () => {
    const ids = [...selected];
    deleteProducts(ids);
    setItems((prev) => prev.filter((p) => !ids.includes(p.id)));
    setSelected(new Set());
    setBulkDeleteOpen(false);
    success("Products removed", `${ids.length} products were deleted.`);
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
          <AdminAvatar name={p.name} src={p.images[0]} size="sm" />
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
        subtitle={`Manage your catalog — ${items.length} products total.`}
        breadcrumb={[{ label: "Products" }]}
        actions={
          <>
            <ExportButton
              filename="products"
              data={filtered.map((p) => ({
                Name: p.name,
                SKU: p.sku,
                Brand: p.brand,
                Category: p.category,
                Price: p.price,
                Stock: p.stock,
                Rating: p.rating,
                Featured: p.isFeatured ? "Yes" : "No",
              }))}
              disabled={!loaded || filtered.length === 0}
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
        rows={pageItems}
        rowKey={(p) => p.id}
        loading={!loaded}
        selectable
        selectedKeys={selected}
        onSelectionChange={setSelected}
        bulkBar={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const updated = items.map((p) =>
                  selected.has(p.id) ? { ...p, isFeatured: true } : p
                );
                setItems(updated);
                selected.forEach((id) => {
                  const p = updated.find((item) => item.id === id);
                  if (p) saveProduct(p);
                });
                success("Featured", `${selected.size} products marked as featured.`);
                setSelected(new Set());
              }}
            >
              Mark featured
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const updated = items.map((p) =>
                  selected.has(p.id) ? { ...p, isFeatured: false } : p
                );
                setItems(updated);
                selected.forEach((id) => {
                  const p = updated.find((item) => item.id === id);
                  if (p) saveProduct(p);
                });
                info("Unfeatured", `${selected.size} products unfeatured.`);
                setSelected(new Set());
              }}
            >
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
          totalItems: filtered.length,
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
