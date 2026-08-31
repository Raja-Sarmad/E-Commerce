"use client";

import Link from "next/link";
import {
  FiAward,
  FiBox,
  FiExternalLink,
  FiGrid,
  FiPlus,
  FiShoppingBag,
} from "react-icons/fi";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import {
  useGetAdminBrandsQuery,
  useGetAdminCategoriesQuery,
  useGetAdminProductsQuery,
} from "@/lib/rtk/adminApi";
import { formatNumber } from "@/lib/utils";

const links = [
  {
    title: "Products",
    description: "Add, edit and manage everything you sell.",
    href: "/admin/products",
    addHref: "/admin/products/new",
    icon: FiBox,
    color: "bg-primary/10 text-primary",
  },
  {
    title: "Categories",
    description: "Organize products by department.",
    href: "/admin/categories",
    addHref: "/admin/categories",
    icon: FiGrid,
    color: "bg-info/10 text-info",
  },
  {
    title: "Brands",
    description: "Manage brand names shown on products.",
    href: "/admin/brands",
    addHref: "/admin/brands",
    icon: FiAward,
    color: "bg-success/10 text-success",
  },
];

export default function AdminCatalogPage() {
  const { data: productsData, isLoading: productsLoading } = useGetAdminProductsQuery({
    limit: 1,
    page: 1,
  });
  const { data: categoriesData, isLoading: categoriesLoading } = useGetAdminCategoriesQuery({});
  const { data: brandsData, isLoading: brandsLoading } = useGetAdminBrandsQuery({});

  const productTotal = productsData?.total ?? 0;
  const categoryTotal = categoriesData?.total ?? categoriesData?.items?.length ?? 0;
  const brandTotal = brandsData?.total ?? brandsData?.items?.length ?? 0;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Catalog"
        subtitle="Manage products, categories and brands — then preview what customers see."
        breadcrumb={[{ label: "Catalog" }]}
        actions={
          <>
            <Button href="/shop" variant="outline" size="sm" target="_blank">
              <FiExternalLink className="h-4 w-4" aria-hidden />
              View live catalog
            </Button>
            <Button href="/admin/products/new" size="sm">
              <FiPlus className="h-4 w-4" aria-hidden />
              Add product
            </Button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="p-5">
          <p className="text-sm font-medium text-muted-foreground">Products</p>
          <p className="mt-1 text-3xl font-extrabold text-foreground">
            {productsLoading ? "…" : formatNumber(productTotal)}
          </p>
        </Card>
        <Card className="p-5">
          <p className="text-sm font-medium text-muted-foreground">Categories</p>
          <p className="mt-1 text-3xl font-extrabold text-foreground">
            {categoriesLoading ? "…" : formatNumber(categoryTotal)}
          </p>
        </Card>
        <Card className="p-5">
          <p className="text-sm font-medium text-muted-foreground">Brands</p>
          <p className="mt-1 text-3xl font-extrabold text-foreground">
            {brandsLoading ? "…" : formatNumber(brandTotal)}
          </p>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {links.map((item) => (
          <Card key={item.href} className="flex h-full flex-col p-5">
            <div className={`mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl ${item.color}`}>
              <item.icon className="h-5 w-5" aria-hidden />
            </div>
            <h2 className="text-lg font-bold text-foreground">{item.title}</h2>
            <p className="mt-1 flex-1 text-sm text-muted-foreground">{item.description}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button href={item.href} size="sm" variant="outline">
                Manage
              </Button>
              <Button href={item.addHref} size="sm">
                <FiPlus className="h-4 w-4" aria-hidden />
                Add
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <Card className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">
            <FiShoppingBag className="h-5 w-5" aria-hidden />
          </span>
          <div>
            <h3 className="font-bold text-foreground">Customer storefront catalog</h3>
            <p className="mt-0.5 text-sm text-muted-foreground">
              This is what shoppers see at <Link href="/shop" className="font-medium text-primary hover:underline">/shop</Link> — all active products from your catalog.
            </p>
          </div>
        </div>
        <Button href="/shop" variant="outline" target="_blank">
          <FiExternalLink className="h-4 w-4" aria-hidden />
          Open catalog
        </Button>
      </Card>
    </div>
  );
}
