"use client";

import { useParams } from "next/navigation";
import { FiEdit2 } from "react-icons/fi";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ProductForm } from "@/components/admin/ProductForm";
import { EmptyState } from "@/components/ui/EmptyState";
import { useGetProductQuery } from "@/lib/rtk/adminApi";

export default function EditProductPage() {
  const params = useParams<{ id: string }>();
  const { data: product, isLoading } = useGetProductQuery(params.id);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <AdminPageHeader title="Edit product" subtitle="Loading product..." />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="space-y-6">
        <AdminPageHeader
          title="Edit product"
          breadcrumb={[{ label: "Products", href: "/admin/products" }]}
        />
        <EmptyState
          icon={<FiEdit2 className="h-7 w-7" aria-hidden />}
          title="Product not found"
          description="We couldn't find that product. It may have been deleted."
          actionLabel="Back to products"
          actionHref="/admin/products"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={`Edit “${product.name}”`}
        subtitle="Update product details and click save."
        breadcrumb={[
          { label: "Products", href: "/admin/products" },
          { label: product.name },
        ]}
      />
      <ProductForm initial={product} mode="edit" />
    </div>
  );
}
