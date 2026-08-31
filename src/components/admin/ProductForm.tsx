"use client";

import { useRef, useState, useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  FiGrid,
  FiLink,
  FiPlus,
  FiSave,
  FiTrash2,
  FiUpload,
  FiX,
} from "react-icons/fi";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { toast } from "@/hooks/use-toast";
import {
  useCreateProductMutation,
  useUpdateProductMutation,
  useGetAdminCategoriesQuery,
} from "@/lib/rtk/adminApi";
import { getErrorMessage } from "@/lib/rtk/baseApi";
import { uploadFileToCloudinary } from "@/lib/cloudinary-upload";
import { slugify, formatPrice, sanitizePositiveDecimal, sanitizeWholeNumber } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { Product } from "@/lib/types";

const maxImageSizeMb = 5;

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

type ImageEntry =
  | { kind: "file"; file: File; preview: string }
  | { kind: "url"; url: string };

type ProductFormProps = {
  initial?: Product;
  mode: "create" | "edit";
};

const emptyForm = {
  name: "",
  slug: "",
  brand: "",
  category: "",
  categorySlug: "",
  description: "",
  features: [] as string[],
  price: "",
  compareAtPrice: "",
  sku: "",
  stock: "",
  tags: [] as string[],
  colors: [] as string[],
  sizes: [] as string[],
  position: "",
  isFeatured: true,
  isBestSeller: false,
  isNew: true,
  isTrending: false,
  onSale: false,
};

export function ProductForm({ initial, mode }: ProductFormProps) {
  const router = useRouter();
  const { data: categoryData, isLoading: categoriesLoading } = useGetAdminCategoriesQuery({});
  const categories = categoryData?.items ?? [];
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [createProduct] = useCreateProductMutation();
  const [updateProduct] = useUpdateProductMutation();

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
          position: initial.position != null ? String(initial.position) : "",
          isFeatured: initial.isFeatured,
          isBestSeller: initial.isBestSeller,
          isNew: initial.isNew,
          isTrending: initial.isTrending,
          onSale: initial.onSale,
        }
      : { ...emptyForm }
  );

  const [images, setImages] = useState<ImageEntry[]>(() => {
    if (initial?.images) {
      return initial.images.map((url) => ({ kind: "url" as const, url }));
    }
    return [];
  });

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);

  useEffect(() => {
    if (mode !== "create" || initial || categories.length === 0) return;
    setForm((prev) => {
      if (prev.categorySlug) return prev;
      const first = categories[0];
      return {
        ...prev,
        category: first.name,
        categorySlug: first.slug,
      };
    });
  }, [categories, mode, initial]);

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

  const selectCategoryBySlug = (slug: string) => {
    const cat = categories.find((c) => c.slug === slug);
    if (!cat) return;
    set("category", cat.name);
    set("categorySlug", cat.slug);
  };

  const hasCurrentCategory =
    !form.categorySlug ||
    categories.some((c) => c.slug === form.categorySlug);

  const validate = () => {
    const errors: Record<string, string> = {};
    if (!form.category.trim()) errors.category = "Select a category.";
    if (!form.price.trim() || Number(form.price) <= 0)
      errors.price = "Enter a valid price greater than 0.";
    if (!form.sku.trim()) errors.sku = "SKU is required.";
    if (!form.stock.trim() || Number(form.stock) < 0)
      errors.stock = "Stock must be 0 or greater.";
    if (images.length === 0)
      errors.images = "Add at least one product image.";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      toast.error("Validation failed", "Please fix the highlighted fields.");
      return;
    }
    setSaving(true);

    const formData = new FormData();
    formData.append("name", form.name.trim());
    formData.append("slug", form.slug.trim() || slugify(form.name));
    formData.append("brand", form.brand);
    formData.append("category", form.category);
    formData.append("categorySlug", form.categorySlug);
    formData.append("description", form.description.trim());
    formData.append("price", String(Math.max(0, Number(form.price) || 0)));
    if (form.compareAtPrice) {
      formData.append("compareAtPrice", String(Math.max(0, Number(form.compareAtPrice) || 0)));
    }
    formData.append("stock", form.stock);
    formData.append("sku", form.sku.trim());
    formData.append("position", form.position || "0");
    formData.append("isFeatured", String(form.isFeatured));
    formData.append("isBestSeller", String(form.isBestSeller));
    formData.append("isNew", String(form.isNew));
    formData.append("isTrending", String(form.isTrending));
    formData.append("onSale", String(form.onSale));
    formData.append("isActive", "true");

    form.features.forEach((f) => formData.append("features", f));
    form.tags.forEach((t) => formData.append("tags", t));
    form.colors.forEach((c) => formData.append("colors", c));
    form.sizes.forEach((s) => formData.append("sizes", s));

    try {
      const fileEntries = images.filter(
        (entry): entry is Extract<ImageEntry, { kind: "file" }> => entry.kind === "file"
      );
      const urlImages = images
        .filter((entry): entry is Extract<ImageEntry, { kind: "url" }> => entry.kind === "url")
        .map((entry) => entry.url);

      if (fileEntries.length > 0) {
        setUploadingImages(true);
        toast.info("Uploading images", "Sending photos directly to Cloudinary...");
        for (const entry of fileEntries) {
          const uploaded = await uploadFileToCloudinary(entry.file);
          urlImages.push(uploaded.url);
        }
        setUploadingImages(false);
      }

      if (urlImages.length > 0) {
        formData.append("imageUrls", JSON.stringify(urlImages));
      }

      if (mode === "edit" && initial) {
        await updateProduct({ id: initial.id, body: formData }).unwrap();
      } else {
        await createProduct(formData).unwrap();
      }
      setSaving(false);
      toast.success(
        mode === "edit" ? "Product updated" : "Product created",
        `"${form.name.trim()}" was ${mode === "edit" ? "updated" : "added to your catalog"}.`
      );
      router.push("/admin/products");
    } catch (err) {
      setSaving(false);
      setUploadingImages(false);
      toast.error(
        mode === "edit" ? "Could not update product" : "Could not create product",
        getErrorMessage(err)
      );
    }
  };

  const handleFileSelect = (fileList: FileList | null) => {
    if (!fileList) return;
    const newEntries: ImageEntry[] = [];
    for (const file of Array.from(fileList)) {
      if (!file.type.startsWith("image/")) {
        toast.error("Unsupported file", `"${file.name}" is not an image.`);
        continue;
      }
      if (file.size > maxImageSizeMb * 1024 * 1024) {
        toast.error("File too large", `"${file.name}" exceeds ${maxImageSizeMb} MB limit.`);
        continue;
      }
      newEntries.push({ kind: "file", file, preview: URL.createObjectURL(file) });
    }
    if (newEntries.length > 0) {
      setImages((prev) => [...prev, ...newEntries]);
      if (fieldErrors.images) {
        setFieldErrors((prev) => {
          const next = { ...prev };
          delete next.images;
          return next;
        });
      }
      toast.success("Images added", `${newEntries.length} image(s) ready to upload.`);
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => {
      const removed = prev[index];
      if (removed?.kind === "file") URL.revokeObjectURL(removed.preview);
      return prev.filter((_, i) => i !== index);
    });
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
          <Input
            label="Brand"
            value={form.brand}
            onChange={(e) => set("brand", e.target.value)}
            placeholder="e.g. Sonix, TechOne, or your own brand"
          />
          <div className="flex flex-col gap-1.5">
            {categories.length === 0 && !categoriesLoading ? (
              <div className="rounded-xl border border-dashed border-border bg-muted/30 p-4">
                <p className="text-sm font-medium text-foreground">No categories yet</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Create a category first, then assign your product to it.
                </p>
                <Button
                  href="/admin/categories"
                  variant="outline"
                  size="sm"
                  className="mt-3"
                  leftIcon={<FiPlus className="h-4 w-4" aria-hidden />}
                >
                  Add category
                </Button>
              </div>
            ) : (
              <Select
                label="Category"
                value={form.categorySlug}
                onChange={(e) => selectCategoryBySlug(e.target.value)}
                error={fieldErrors.category}
                hint={
                  categoriesLoading
                    ? "Loading categories..."
                    : `${categories.length} categor${categories.length === 1 ? "y" : "ies"} available`
                }
                leftIcon={<FiGrid className="h-4 w-4" aria-hidden />}
                disabled={categoriesLoading || categories.length === 0}
              >
                <option value="" disabled>
                  Select a category
                </option>
                {!hasCurrentCategory && form.categorySlug && (
                  <option value={form.categorySlug}>
                    {form.category} (current)
                  </option>
                )}
                {categories.map((c) => (
                  <option key={c._id} value={c.slug}>
                    {c.name}
                    {!c.isActive ? " (inactive)" : ""}
                    {typeof c.count === "number" ? ` · ${c.count} product${c.count === 1 ? "" : "s"}` : ""}
                  </option>
                ))}
              </Select>
            )}
          </div>
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
            type="text"
            inputMode="decimal"
            value={form.price}
            onChange={(e) => set("price", sanitizePositiveDecimal(e.target.value))}
            onKeyDown={(e) => {
              if (["-", "+", "e", "E"].includes(e.key)) e.preventDefault();
            }}
            onWheel={(e) => (e.target as HTMLInputElement).blur()}
            error={fieldErrors.price}
            placeholder="99.00"
          />
          <Input
            label="Compare-at price (USD)"
            type="text"
            inputMode="decimal"
            value={form.compareAtPrice}
            onChange={(e) => set("compareAtPrice", sanitizePositiveDecimal(e.target.value))}
            onKeyDown={(e) => {
              if (["-", "+", "e", "E"].includes(e.key)) e.preventDefault();
            }}
            onWheel={(e) => (e.target as HTMLInputElement).blur()}
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
                  {Math.round(
                    ((Number(form.compareAtPrice) - Number(form.price)) /
                      Number(form.compareAtPrice)) *
                      100
                  )}
                  % off
                </Badge>
              </>
            )}
        </div>
      </SectionCard>

      <SectionCard title="Inventory" description="SKU, stock and display order.">
        <div className="grid gap-4 sm:grid-cols-3">
          <Input
            label="SKU"
            value={form.sku}
            onChange={(e) => set("sku", e.target.value)}
            error={fieldErrors.sku}
            placeholder="AUR-HDP-PRO-BLK"
          />
          <Input
            label="Stock quantity"
            type="text"
            inputMode="numeric"
            value={form.stock}
            onChange={(e) => set("stock", sanitizeWholeNumber(e.target.value))}
            onKeyDown={(e) => {
              if (["-", "+", "e", "E", "."].includes(e.key)) e.preventDefault();
            }}
            onWheel={(e) => (e.target as HTMLInputElement).blur()}
            error={fieldErrors.stock}
            placeholder="50"
          />
          <Input
            label="Display position"
            type="text"
            inputMode="numeric"
            value={form.position}
            onChange={(e) => set("position", sanitizeWholeNumber(e.target.value))}
            onKeyDown={(e) => {
              if (["-", "+", "e", "E", "."].includes(e.key)) e.preventDefault();
            }}
            onWheel={(e) => (e.target as HTMLInputElement).blur()}
            hint="Lower = shown first. 0 = default order."
            placeholder="0"
          />
        </div>
      </SectionCard>

      <SectionCard
        title="Images"
        description="Product photos shown on the storefront. Upload from your device or paste URLs."
      >
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            leftIcon={<FiUpload className="h-4 w-4" aria-hidden />}
          >
            Upload from device
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,.avif,.heic,.heif,.bmp,.tiff,.tif,.ico,.svg"
            multiple
            className="hidden"
            onChange={(e) => {
              handleFileSelect(e.target.files);
              e.target.value = "";
            }}
          />
          <span className="text-xs text-muted-foreground">
            Supports JPG, PNG, WebP, GIF, SVG, AVIF, HEIC, BMP, TIFF and more.
          </span>
        </div>

        <ListEditor
          label="Or paste image URLs"
          value={images.filter((e) => e.kind === "url").map((e) => e.url)}
          onChange={(urls) => {
            setImages((prev) => {
              const fileImages = prev.filter((e): e is Extract<ImageEntry, { kind: "file" }> => e.kind === "file");
              const urlImages = urls.map((url) => ({ kind: "url" as const, url }));
              return [...fileImages, ...urlImages];
            });
          }}
          placeholder="https://example.com/image.jpg"
          hint="Add image URLs one at a time. First image is the primary photo."
        />

        {fieldErrors.images && (
          <p className="mt-1.5 text-xs font-medium text-destructive">
            {fieldErrors.images}
          </p>
        )}

        {images.length > 0 && (
          <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-5">
            {images.map((entry, i) => {
              const src = entry.kind === "file" ? entry.preview : entry.url;
              return (
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
                  {entry.kind === "file" && (
                    <span className="absolute left-1 bottom-1 rounded bg-green-600 px-1.5 py-0.5 text-[10px] font-bold text-white">
                      Local
                    </span>
                  )}
                  {i === 0 && (
                    <span className="absolute left-1 top-1 rounded bg-primary px-1.5 py-0.5 text-[10px] font-bold text-white">
                      Primary
                    </span>
                  )}
                  <button
                    type="button"
                    aria-label={`Remove image ${i + 1}`}
                    onClick={() => removeImage(i)}
                    className="absolute right-1 top-1 rounded-md bg-black/60 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    <FiTrash2 className="h-3.5 w-3.5" aria-hidden />
                  </button>
                </div>
              );
            })}
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
                { key: "isBestSeller", label: "Best seller (manual highlight)" },
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
          loading={saving || uploadingImages}
          leftIcon={!saving && !uploadingImages ? <FiSave className="h-4 w-4" aria-hidden /> : undefined}
        >
          {uploadingImages
            ? "Uploading images..."
            : mode === "edit"
              ? "Save changes"
              : "Create product"}
        </Button>
      </div>
    </div>
  );
}
