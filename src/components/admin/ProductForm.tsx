"use client";

import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  FiImage,
  FiLink,
  FiList,
  FiPlus,
  FiSave,
  FiTag,
  FiTrash2,
  FiX,
} from "react-icons/fi";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Badge } from "@/components/ui/Badge";
import { useToast } from "@/context/ToastProvider";
import { categories } from "@/lib/data/categories";
import { saveProduct, generateProductId } from "@/lib/products-store";
import { slugify, formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { Product } from "@/lib/types";

const brandOptions = [
  "Sonix",
  "TechOne",
  "Vortex",
  "Aura & Oak",
  "Lumen",
  "Northbound",
  "Botaniq",
  "TrailPeak",
];

const sizeOptions = ["XS", "S", "M", "L", "XL", "XXL", "One Size"];
const colorOptions = [
  "Black",
  "White",
  "Grey",
  "Navy",
  "Red",
  "Green",
  "Blue",
  "Beige",
  "Pink",
  "Silver",
];

function SectionCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <Card className="p-5">
      <div className="mb-4">
        <h2 className="font-bold text-foreground">{title}</h2>
        {description && (
          <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {children}
    </Card>
  );
}

function ListEditor({
  label,
  value,
  onChange,
  placeholder,
  hint,
}: {
  label: string;
  value: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
  hint?: string;
}) {
  const [draft, setDraft] = useState("");
  const add = () => {
    const item = draft.trim();
    if (!item) return;
    onChange([...value, item]);
    setDraft("");
  };
  return (
    <div className="flex w-full flex-col gap-1.5">
      <label className="text-sm font-medium text-foreground">{label}</label>
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {value.map((item) => (
            <Badge key={item} variant="secondary" className="gap-1 py-1 pl-2.5 pr-1">
              {item}
              <button
                type="button"
                aria-label={`Remove ${item}`}
                onClick={() => onChange(value.filter((v) => v !== item))}
                className="rounded-full p-0.5 transition-colors hover:bg-muted hover:text-foreground"
              >
                <FiX className="h-3 w-3" aria-hidden />
              </button>
            </Badge>
          ))}
        </div>
      )}
      <div className="flex gap-2">
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
          placeholder={placeholder}
          className="h-9"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={add}
          leftIcon={<FiPlus className="h-4 w-4" aria-hidden />}
        >
          Add
        </Button>
      </div>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

type ProductFormProps = {
  initial?: Product;
  mode: "create" | "edit";
};

const emptyForm = {
  name: "",
  slug: "",
  brand: "Sonix",
  category: "Electronics",
  categorySlug: "electronics",
  description: "",
  features: [] as string[],
  price: "",
  compareAtPrice: "",
  sku: "",
  stock: "",
  tags: [] as string[],
  colors: [] as string[],
  sizes: [] as string[],
  images: [] as string[],
  isFeatured: false,
  isBestSeller: false,
  isNew: true,
  isTrending: false,
  onSale: false,
};

export function ProductForm({ initial, mode }: ProductFormProps) {
  const router = useRouter();
  const { success, error } = useToast();

  const [form, setForm] = useState(() =>
    initial
      ? {
          name: initial.name,
          slug: initial.slug,
          brand: initial.brand,
          category: initial.category,
          categorySlug: initial.categorySlug,
          description: initial.description,
          features: [...initial.features],
          price: String(initial.price),
          compareAtPrice: initial.compareAtPrice
            ? String(initial.compareAtPrice)
            : "",
          sku: initial.sku,
          stock: String(initial.stock),
          tags: [...initial.tags],
          colors: [...initial.colors],
          sizes: [...(initial.sizes ?? [])],
          images: [...initial.images],
          isFeatured: initial.isFeatured,
          isBestSeller: initial.isBestSeller,
          isNew: initial.isNew,
          isTrending: initial.isTrending,
          onSale: initial.onSale,
        }
      : { ...emptyForm }
  );
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const set = <K extends keyof typeof emptyForm>(
    key: K,
    value: (typeof emptyForm)[K]
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (fieldErrors[key as string]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[key as string];
        return next;
      });
    }
  };

  const selectCategory = (name: string) => {
    const cat = categories.find((c) => c.name === name);
    set("category", name);
    set("categorySlug", cat?.slug ?? slugify(name));
  };

  const validate = () => {
    const errors: Record<string, string> = {};
    if (!form.name.trim()) errors.name = "Product name is required.";
    if (!form.price.trim() || Number(form.price) <= 0)
      errors.price = "Enter a valid price greater than 0.";
    if (!form.sku.trim()) errors.sku = "SKU is required.";
    if (!form.stock.trim() || Number(form.stock) < 0)
      errors.stock = "Stock must be 0 or greater.";
    if (form.images.length === 0)
      errors.images = "Add at least one product image.";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) {
      error("Validation failed", "Please fix the highlighted fields.");
      return;
    }
    setSaving(true);
    const price = Number(form.price);
    const compareAtPrice = form.compareAtPrice
      ? Number(form.compareAtPrice)
      : undefined;
    const discountPercent =
      compareAtPrice && compareAtPrice > price
        ? Math.round(((compareAtPrice - price) / compareAtPrice) * 100)
        : 0;

    const product: Product = {
      id: initial?.id ?? generateProductId(),
      slug: form.slug.trim() || slugify(form.name),
      name: form.name.trim(),
      brand: form.brand,
      category: form.category,
      categorySlug: form.categorySlug,
      description: form.description.trim(),
      features: form.features,
      specifications: initial?.specifications ?? {},
      price,
      compareAtPrice,
      images: form.images.filter(Boolean),
      rating: initial?.rating ?? 0,
      reviewsCount: initial?.reviewsCount ?? 0,
      stock: Number(form.stock),
      sku: form.sku.trim(),
      tags: form.tags,
      isFeatured: form.isFeatured,
      isBestSeller: form.isBestSeller,
      isNew: form.isNew,
      isTrending: form.isTrending,
      onSale: form.onSale,
      discountPercent,
      colors: form.colors,
      sizes: form.sizes,
      createdAt: initial?.createdAt ?? new Date().toISOString(),
      reviews: initial?.reviews ?? [],
    };

    saveProduct(product);
    setTimeout(() => {
      setSaving(false);
      success(
        mode === "edit" ? "Product updated" : "Product created",
        `“${product.name}” was ${mode === "edit" ? "updated" : "added to your catalog"}.`
      );
      router.push("/admin/products");
    }, 400);
  };

  const toggleFlag = (key: keyof typeof emptyForm) => {
    if (key === "isFeatured" || key === "isBestSeller" || key === "isNew" || key === "isTrending" || key === "onSale") {
      set(key, !form[key]);
    }
  };

  return (
    <div className="space-y-6">
      <SectionCard title="General" description="Core product information shown to customers.">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Product name"
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            error={fieldErrors.name}
            placeholder="e.g. Aurora Wireless Headphones Pro"
            containerClassName="sm:col-span-2"
          />
          <Input
            label="Slug"
            value={form.slug}
            onChange={(e) => set("slug", e.target.value)}
            hint="Leave empty to auto-generate from name"
            leftIcon={<FiLink className="h-4 w-4" aria-hidden />}
            placeholder="aurora-wireless-headphones-pro"
          />
          <Select
            label="Brand"
            value={form.brand}
            onChange={(e) => set("brand", e.target.value)}
          >
            {brandOptions.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </Select>
          <Select
            label="Category"
            value={form.category}
            onChange={(e) => selectCategory(e.target.value)}
          >
            {categories.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </Select>
          <Textarea
            label="Description"
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            placeholder="Describe the product..."
            containerClassName="sm:col-span-2"
          />
        </div>
      </SectionCard>

      <SectionCard title="Pricing" description="Prices, discounts and sale settings.">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Price (USD)"
            type="number"
            min="0"
            step="0.01"
            value={form.price}
            onChange={(e) => set("price", e.target.value)}
            error={fieldErrors.price}
            placeholder="99.00"
          />
          <Input
            label="Compare-at price (USD)"
            type="number"
            min="0"
            step="0.01"
            value={form.compareAtPrice}
            onChange={(e) => set("compareAtPrice", e.target.value)}
            hint="Original price used to show a discount"
            placeholder="129.00"
          />
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2 rounded-xl border border-border bg-muted/40 p-3">
          <span className="text-sm text-muted-foreground">Preview:</span>
          <span className="text-lg font-extrabold text-foreground">
            {form.price ? formatPrice(Number(form.price)) : "$0"}
          </span>
          {form.compareAtPrice &&
            Number(form.compareAtPrice) > Number(form.price) && (
              <>
                <span className="text-sm text-muted-foreground line-through">
                  {formatPrice(Number(form.compareAtPrice))}
                </span>
                <Badge variant="destructive">
                  -
                  {Math.round(
                    ((Number(form.compareAtPrice) - Number(form.price)) /
                      Number(form.compareAtPrice)) *
                      100
                  )}
                  %
                </Badge>
              </>
            )}
        </div>
      </SectionCard>

      <SectionCard title="Inventory" description="SKU and stock control.">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="SKU"
            value={form.sku}
            onChange={(e) => set("sku", e.target.value)}
            error={fieldErrors.sku}
            placeholder="AUR-HDP-PRO-BLK"
          />
          <Input
            label="Stock quantity"
            type="number"
            min="0"
            value={form.stock}
            onChange={(e) => set("stock", e.target.value)}
            error={fieldErrors.stock}
            placeholder="50"
          />
        </div>
      </SectionCard>

      <SectionCard
        title="Images"
        description="Product photos shown on the storefront."
      >
        <ListEditor
          label="Image URLs"
          value={form.images}
          onChange={(next) => set("images", next)}
          placeholder="https://picsum.photos/seed/..."
          hint="Add image URLs one at a time. First image is the primary photo."
        />
        {fieldErrors.images && (
          <p className="mt-1.5 text-xs font-medium text-destructive">
            {fieldErrors.images}
          </p>
        )}
        {form.images.length > 0 && (
          <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-5">
            {form.images.map((src, i) => (
              <div
                key={`${src}-${i}`}
                className={cn(
                  "group relative aspect-square overflow-hidden rounded-xl border border-border",
                  i === 0 && "ring-2 ring-primary"
                )}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src}
                  alt={`Product image ${i + 1}`}
                  className="h-full w-full object-cover"
                />
                {i === 0 && (
                  <span className="absolute left-1 top-1 rounded bg-primary px-1.5 py-0.5 text-[10px] font-bold text-white">
                    Primary
                  </span>
                )}
                <button
                  type="button"
                  aria-label={`Remove image ${i + 1}`}
                  onClick={() =>
                    set(
                      "images",
                      form.images.filter((_, idx) => idx !== i)
                    )
                  }
                  className="absolute right-1 top-1 rounded-md bg-black/60 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <FiTrash2 className="h-3.5 w-3.5" aria-hidden />
                </button>
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      <SectionCard title="Variants" description="Colors and sizes customers can pick.">
        <div className="grid gap-6 sm:grid-cols-2">
          <ListEditor
            label="Colors"
            value={form.colors}
            onChange={(next) => set("colors", next)}
            placeholder="Type a color and press Enter"
            hint="Suggestions: Black, White, Navy, Beige"
          />
          <ListEditor
            label="Sizes"
            value={form.sizes}
            onChange={(next) => set("sizes", next)}
            placeholder="Type a size and press Enter"
            hint="Suggestions: S, M, L, XL, One Size"
          />
        </div>
      </SectionCard>

      <SectionCard title="Catalog details" description="Features, tags and merchandising flags.">
        <div className="space-y-5">
          <ListEditor
            label="Features"
            value={form.features}
            onChange={(next) => set("features", next)}
            placeholder="Add a product feature"
            hint="Short bullet points shown on the product page"
          />
          <ListEditor
            label="Tags"
            value={form.tags}
            onChange={(next) => set("tags", next)}
            placeholder="Add a tag"
          />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {(
              [
                { key: "isFeatured", label: "Featured" },
                { key: "isBestSeller", label: "Best seller" },
                { key: "isNew", label: "New arrival" },
                { key: "isTrending", label: "Trending" },
                { key: "onSale", label: "On sale" },
              ] as const
            ).map(({ key, label }) => (
              <button
                key={key}
                type="button"
                onClick={() => toggleFlag(key)}
                aria-pressed={form[key]}
                className={cn(
                  "flex items-center justify-between gap-2 rounded-xl border px-3 py-2.5 text-sm font-medium transition-colors",
                  form[key]
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-card text-muted-foreground hover:text-foreground"
                )}
              >
                {label}
                <span
                  className={cn(
                    "relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors",
                    form[key] ? "bg-primary" : "bg-muted"
                  )}
                >
                  <span
                    className={cn(
                      "inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform",
                      form[key] ? "translate-x-5" : "translate-x-1"
                    )}
                  />
                </span>
              </button>
            ))}
          </div>
        </div>
      </SectionCard>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button
          variant="outline"
          onClick={() => router.push("/admin/products")}
          leftIcon={<FiX className="h-4 w-4" aria-hidden />}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          loading={saving}
          leftIcon={!saving ? <FiSave className="h-4 w-4" aria-hidden /> : undefined}
        >
          {mode === "edit" ? "Save changes" : "Create product"}
        </Button>
      </div>
    </div>
  );
}
