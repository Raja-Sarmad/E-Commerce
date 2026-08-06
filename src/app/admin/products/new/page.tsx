"use client";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ProductForm } from "@/components/admin/ProductForm";

export default function NewProductPage() {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Add product"
        subtitle="Create a new product in your catalog."
        breadcrumb={[
          { label: "Products", href: "/admin/products" },
          { label: "Add product" },
        ]}
      />
      <ProductForm mode="create" />
    </div>
  );
}
