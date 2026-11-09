"use client";

import { useRef, useState, useEffect, useMemo, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import {
  FiAward,
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
  useGetAdminBrandsQuery,
  useCreateCategoryMutation,
} from "@/lib/rtk/adminApi";
import { getErrorMessage } from "@/lib/rtk/baseApi";
import { uploadFileToCloudinary } from "@/lib/cloudinary-upload";
import { slugify, sanitizePositiveDecimal, sanitizeWholeNumber } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { selectCurrencyMeta } from "@/lib/rtk/currencySlice";
import { selectStoreLabel, selectStoreSlug } from "@/lib/rtk/storeSlice";
import type { Product, ProductVariant } from "@/lib/types";

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

const WEAR_TYPE_OPTIONS = [
  {
    value: "stitched" as const,
    label: "Stitched",
    hint: "Ready-made / stitched outfit",
  },
  {
    value: "unstitched" as const,
    label: "Unstitched",
    hint: "Unstitched fabric / suit",
  },
  {
    value: "modelwear" as const,
    label: "Model Wear",
    hint: "Styled model-wear look",
  },
];

const emptyForm = {
  name: "",
  slug: "",
  brand: "",
  category: "",
  categorySlug: "",
  gender: "" as "" | "men" | "women" | "unisex",
  wearType: "" as "" | "stitched" | "unstitched" | "modelwear",
  description: "",
  materials: "",
  sizeGuide: "",
  shippingInfo: "",
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
  const currencyMeta = useSelector(selectCurrencyMeta);
  const storeLabel = useSelector(selectStoreLabel);
  const storeSlug = useSelector(selectStoreSlug);
  const router = useRouter();
  const { data: categoryData, isLoading: categoriesLoading } = useGetAdminCategoriesQuery({});
  const categories = useMemo(() => categoryData?.items ?? [], [categoryData]);
  const { data: brandData, isLoading: brandsLoading } = useGetAdminBrandsQuery({});
  const brands = useMemo(() => brandData?.items ?? [], [brandData]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [createProduct] = useCreateProductMutation();
  const [updateProduct] = useUpdateProductMutation();
  const [createCategory, { isLoading: creatingCategory }] = useCreateCategoryMutation();
  const [newCategoryName, setNewCategoryName] = useState("");

  // Convert USD (database) → active currency for display in input
  const usdToActive = (usd: number) => {
    if (!usd || !Number.isFinite(usd)) return "";
    const converted = usd * currencyMeta.rateFromUsd;
    const digits = currencyMeta.fractionDigits ?? 2;
    return converted.toFixed(digits);
  };

  // Convert active currency input value → USD for database storage
  const activeToUsd = (val: string) => {
    const num = Number(val);
    if (!Number.isFinite(num) || num <= 0) return 0;
    return num / currencyMeta.rateFromUsd;
  };

  // Format the currently-entered price for preview (no double-conversion)
  const previewPrice = (val: string) => {
    const num = Number(val);
    if (!num || !Number.isFinite(num)) return `${currencyMeta.symbol}0`;
    const digits = currencyMeta.fractionDigits ?? 2;
    return new Intl.NumberFormat(currencyMeta.locale, {
      style: "currency",
      currency: currencyMeta.code,
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    }).format(num);
  };

  const [form, setForm] = useState(() =>
    initial
      ? {
          name: initial.name,
          slug: initial.slug,
          brand: initial.brand,
          category: initial.category,
          categorySlug: initial.categorySlug,
          gender: initial.gender || "",
          wearType: (initial.wearType as typeof emptyForm.wearType) || "",
          description: initial.description,
          materials: initial.materials ?? "",
          sizeGuide: initial.sizeGuide ?? "",
          shippingInfo: initial.shippingInfo ?? "",
          features: [...initial.features],
          // stored as USD in DB, show in active currency
          price: usdToActive(initial.price),
          compareAtPrice: initial.compareAtPrice
            ? usdToActive(initial.compareAtPrice)
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

  const [variants, setVariants] = useState<ProductVariant[]>(() => {
    if (initial?.variants && initial.variants.length > 0) {
      return initial.variants.map((v) => ({ size: v.size, stock: v.stock }));
    }
    // Legacy product: has sizes but no per-size stock yet → start each at 0
    if (initial?.sizes?.length) {
      return initial.sizes.map((size) => ({ size, stock: 0 }));
    }
    return [];
  });

  const syncVariantsFromSizes = (sizes: string[]) => {
    setVariants((prev) => {
      const next = sizes.map((size) => {
        const existing = prev.find((v) => v.size === size);
        return existing ? { ...existing } : { size, stock: 0 };
      });
      return next;
    });
    // Also sync sizes back into form
    setForm((prevForm) => ({ ...prevForm, sizes }));
  };

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
    // Default the create form once async category options are available.
    // eslint-disable-next-line react-hooks/set-state-in-effect
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

  useEffect(() => {
    if (mode !== "create" || initial || brands.length === 0) return;
    // Default the create form once async brand options are available.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setForm((prev) => {
      if (prev.brand.trim()) return prev;
      return { ...prev, brand: brands[0].name };
    });
  }, [brands, mode, initial]);

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

  const addCategory = async () => {
    const name = newCategoryName.trim();
    if (!name) {
      toast.error("Category name required", "Enter a name for your category.");
      return;
    }
    try {
      const category = await createCategory({ name, isActive: true }).unwrap();
      set("category", category.name);
      set("categorySlug", category.slug);
      setNewCategoryName("");
      toast.success("Category created", `"${category.name}" is selected for this product.`);
    } catch (err) {
      toast.error("Could not create category", getErrorMessage(err));
    }
  };

  const hasCurrentCategory =
    !form.categorySlug ||
    categories.some((c) => c.slug === form.categorySlug);

  const hasCurrentBrand =
    !form.brand.trim() ||
    brands.some((b) => b.name.toLowerCase() === form.brand.trim().toLowerCase());

  const validate = () => {
    const errors: Record<string, string> = {};
    if (!form.name.trim()) errors.name = "Product name is required.";
    if (!form.brand.trim()) errors.brand = "Select a brand.";
    if (!form.category.trim()) errors.category = "Select a category.";
    if (storeSlug === "store" && !form.gender) errors.gender = "Choose who this product is for.";
    if (!form.wearType) errors.wearType = "Select stitched, unstitched, or model wear.";
    if (!form.price.trim() || Number(form.price) <= 0)
      errors.price = "Enter a valid price greater than 0.";
    if (!form.sku.trim()) errors.sku = "SKU is required.";
    if (form.sizes.length > 0 && variants.length === 0) {
      errors.variants = "Add stock for each size variant.";
    }
    if (form.sizes.length === 0 && (!form.stock.trim() || Number(form.stock) < 0)) {
      errors.stock = "Stock must be 0 or greater.";
    }
    if (form.sizes.length > 0 && variants.some((v) => v.stock < 0)) {
      errors.variants = "Variant stock must be 0 or greater.";
    }
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
    if (form.gender) formData.append("gender", form.gender);
    formData.append("wearType", form.wearType);
    formData.append("description", form.description.trim());
    formData.append("materials", form.materials.trim());
    formData.append("sizeGuide", form.sizeGuide.trim());
    formData.append("shippingInfo", form.shippingInfo.trim());
    // Convert active currency → USD before saving to database
    const priceUsd = activeToUsd(form.price);
    const compareAtPriceUsd = form.compareAtPrice ? activeToUsd(form.compareAtPrice) : 0;
    formData.append("price", String(Math.max(0, priceUsd)));
    if (form.compareAtPrice && compareAtPriceUsd > 0) {
      formData.append("compareAtPrice", String(Math.max(0, compareAtPriceUsd)));
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

    if (variants.length > 0) {
      const totalStock = variants.reduce((sum, v) => sum + (v.stock || 0), 0);
      formData.set("stock", String(totalStock));
      formData.append("variants", JSON.stringify(variants));
    }

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
      router.push(`/admin/products?store=${storeSlug}`);
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

  /** First image is what Sab Pehno / storefront cards & PDP show. */
  const setDisplayImage = (index: number) => {
    if (index <= 0) return;
    setImages((prev) => {
      const next = [...prev];
      const [picked] = next.splice(index, 1);
      next.unshift(picked);
      return next;
    });
    toast.success("Display image updated", "This photo will show on the storefront first.");
  };

  const toggleFlag = (key: keyof typeof emptyForm) => {
    if (key === "isFeatured" || key === "isBestSeller" || key === "isNew" || key === "isTrending" || key === "onSale") {
      set(key, !form[key]);
    }
  };

  return (
    <div className="space-y-6">
      <div
        className={`rounded-xl border px-4 py-3 text-sm ${
          storeSlug === "cosmetic"
            ? "border-emerald-300 bg-emerald-50 text-emerald-900"
            : "border-primary/30 bg-primary/5 text-foreground"
        }`}
      >
        {mode === "edit" ? "Editing product in" : "New product will be added to"}{" "}
        <strong>{storeLabel}</strong>
        {storeSlug === "cosmetic"
          ? " — visible on the Veya cosmetic site only."
          : storeSlug === "store"
          ? " — visible on the Sab Pehno store only."
          : storeSlug === "warqu"
          ? " — visible on the Warqu site only."
          : " — visible on the NovaMart e-commerce site only."}
      </div>
      {Object.keys(fieldErrors).length > 0 && (
        <div role="alert" className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <p className="font-semibold">Please complete these fields:</p>
          <ul className="mt-1 list-inside list-disc">
            {Object.entries(fieldErrors).map(([field, message]) => (
              <li key={field}>{message}</li>
            ))}
          </ul>
        </div>
      )}
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

          <div className="sm:col-span-2">
            <p className="text-sm font-medium text-foreground">Product type</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Choose so customers know if this is stitched, unstitched, or model wear.
            </p>
            <div className="mt-3 grid gap-2 sm:grid-cols-3">
              {WEAR_TYPE_OPTIONS.map((opt) => {
                const selected = form.wearType === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => set("wearType", opt.value)}
                    className={cn(
                      "rounded-xl border px-4 py-3 text-left transition-colors",
                      selected
                        ? "border-primary bg-primary/10 text-primary ring-2 ring-primary/30"
                        : "border-border bg-card text-foreground hover:border-primary/40 hover:bg-muted/40"
                    )}
                    aria-pressed={selected}
                  >
                    <span className="block text-sm font-semibold">{opt.label}</span>
                    <span
                      className={cn(
                        "mt-0.5 block text-xs",
                        selected ? "text-primary/80" : "text-muted-foreground"
                      )}
                    >
                      {opt.hint}
                    </span>
                  </button>
                );
              })}
            </div>
            {fieldErrors.wearType ? (
              <p className="mt-1.5 text-xs font-medium text-destructive">{fieldErrors.wearType}</p>
            ) : null}
          </div>

          <Input
            label="Slug"
            value={form.slug}
            onChange={(e) => set("slug", e.target.value)}
            hint="Leave empty to auto-generate from name"
            leftIcon={<FiLink className="h-4 w-4" aria-hidden />}
            placeholder="aurora-wireless-headphones-pro"
          />
          {storeSlug === "store" && (
            <Select
              label="Shop section"
              value={form.gender}
              onChange={(e) => set("gender", e.target.value as typeof form.gender)}
              error={fieldErrors.gender}
              hint="This decides whether the product appears in Men, Women, or both."
            >
              <option value="">Choose a section</option>
              <option value="men">Men</option>
              <option value="women">Women</option>
              <option value="unisex">Unisex (Men & Women)</option>
            </Select>
          )}
          <div className="flex flex-col gap-1.5">
            {brands.length === 0 && !brandsLoading ? (
              <div className="rounded-xl border border-dashed border-border bg-muted/30 p-4">
                <p className="text-sm font-medium text-foreground">No brands yet</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Create a brand first, then choose it for your product.
                </p>
                <Button
                  href="/admin/brands"
                  variant="outline"
                  size="sm"
                  className="mt-3"
                  leftIcon={<FiPlus className="h-4 w-4" aria-hidden />}
                >
                  Add brand
                </Button>
              </div>
            ) : (
              <Select
                label="Brand"
                value={form.brand}
                onChange={(e) => set("brand", e.target.value)}
                error={fieldErrors.brand}
                hint={
                  brandsLoading
                    ? "Loading brands..."
                    : `${brands.length} brand${brands.length === 1 ? "" : "s"} available`
                }
                leftIcon={<FiAward className="h-4 w-4" aria-hidden />}
                disabled={brandsLoading || brands.length === 0}
              >
                <option value="" disabled>
                  Select a brand
                </option>
                {!hasCurrentBrand && form.brand && (
                  <option value={form.brand}>
                    {form.brand} (current)
                  </option>
                )}
                {brands.map((b) => (
                  <option key={b._id} value={b.name}>
                    {b.name}
                    {b.isActive === false ? " (inactive)" : ""}
                  </option>
                ))}
              </Select>
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            {categories.length === 0 && !categoriesLoading ? (
              <div className="rounded-xl border border-dashed border-border bg-muted/30 p-4">
                <p className="text-sm font-medium text-foreground">No categories yet</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Create your first category here without leaving this product.
                </p>
                <Input
                  name="newCategoryName"
                  label="New category name"
                  placeholder="e.g. T-Shirts"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  containerClassName="mt-3"
                />
                <Button
                  onClick={addCategory}
                  loading={creatingCategory}
                  variant="outline"
                  size="sm"
                  className="mt-3"
                  leftIcon={<FiPlus className="h-4 w-4" aria-hidden />}
                >
                  Create category
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
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
          <span>💱</span>
          <span>
            Entering prices in{" "}
            <strong className="text-foreground">{currencyMeta.label} ({currencyMeta.code})</strong>.
            The system will automatically convert to USD for storage.
            {currencyMeta.code !== "USD" && (
              <>
                {" "}Rate: 1 USD = {currencyMeta.rateFromUsd} {currencyMeta.code}
              </>
            )}
          </span>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label={`Price (${currencyMeta.code})`}
            type="text"
            inputMode="decimal"
            value={form.price}
            onChange={(e) => set("price", sanitizePositiveDecimal(e.target.value))}
            onKeyDown={(e) => {
              if (["-", "+", "e", "E"].includes(e.key)) e.preventDefault();
            }}
            onWheel={(e) => (e.target as HTMLInputElement).blur()}
            error={fieldErrors.price}
            placeholder={currencyMeta.code === "PKR" ? "27800" : "99.00"}
            leftIcon={<span className="text-xs font-semibold text-muted-foreground">{currencyMeta.symbol}</span>}
          />
          <Input
            label={`Compare-at price (${currencyMeta.code})`}
            type="text"
            inputMode="decimal"
            value={form.compareAtPrice}
            onChange={(e) => set("compareAtPrice", sanitizePositiveDecimal(e.target.value))}
            onKeyDown={(e) => {
              if (["-", "+", "e", "E"].includes(e.key)) e.preventDefault();
            }}
            onWheel={(e) => (e.target as HTMLInputElement).blur()}
            hint="Original price used to show a discount"
            placeholder={currencyMeta.code === "PKR" ? "35000" : "129.00"}
            leftIcon={<span className="text-xs font-semibold text-muted-foreground">{currencyMeta.symbol}</span>}
          />
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2 rounded-xl border border-border bg-muted/40 p-3">
          <span className="text-sm text-muted-foreground">Preview:</span>
          <span className="text-lg font-extrabold text-foreground">
            {form.price ? previewPrice(form.price) : `${currencyMeta.symbol}0`}
          </span>
          {form.compareAtPrice &&
            Number(form.compareAtPrice) > Number(form.price) && (
              <>
                <span className="text-sm text-muted-foreground line-through">
                  {previewPrice(form.compareAtPrice)}
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
          {currencyMeta.code !== "USD" && form.price && Number(form.price) > 0 && (
            <span className="ml-auto text-xs text-muted-foreground">
              ≈ ${activeToUsd(form.price).toFixed(2)} USD stored
            </span>
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
            value={
              form.sizes.length > 0
                ? String(variants.reduce((sum, v) => sum + (v.stock || 0), 0))
                : form.stock
            }
            onChange={(e) => set("stock", sanitizeWholeNumber(e.target.value))}
            onKeyDown={(e) => {
              if (["-", "+", "e", "E", "."].includes(e.key)) e.preventDefault();
            }}
            onWheel={(e) => (e.target as HTMLInputElement).blur()}
            error={fieldErrors.stock}
            placeholder="50"
            disabled={form.sizes.length > 0}
            hint={
              form.sizes.length > 0
                ? "Auto-calculated from stock per size below."
                : undefined
            }
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
        description="The first photo is the display image on the storefront (cards + product page). Other photos appear in the gallery."
      >
        <div className="mb-4 rounded-xl border border-amber-300/80 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          <p className="font-semibold">Display image = first photo</p>
          <p className="mt-1 text-amber-900/90">
            Customers see this on listing grids and as the main product shot. Click{" "}
            <strong>Set as display</strong> on any other photo to make it #1.
          </p>
        </div>

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
          hint="Order matters: the first image is the storefront display photo."
        />

        {fieldErrors.images && (
          <p className="mt-1.5 text-xs font-medium text-destructive">
            {fieldErrors.images}
          </p>
        )}

        {images.length > 0 && (
          <div className="mt-5 space-y-4">
            {(() => {
              const display = images[0];
              const displaySrc = display.kind === "file" ? display.preview : display.url;
              return (
                <div className="flex flex-col gap-4 rounded-2xl border-2 border-primary/40 bg-primary/5 p-4 sm:flex-row sm:items-center">
                  <div className="relative mx-auto aspect-[3/4] w-36 shrink-0 overflow-hidden rounded-xl border border-primary/30 bg-muted sm:mx-0 sm:w-40">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={displaySrc}
                      alt="Storefront display preview"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="min-w-0 text-center sm:text-left">
                    <p className="text-xs font-bold uppercase tracking-wider text-primary">
                      Storefront display
                    </p>
                    <p className="mt-1 text-sm font-semibold text-foreground">
                      This is what shoppers see first
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Listing cards, brand pages, and the main product image all use this photo.
                    </p>
                  </div>
                </div>
              );
            })()}

            <p className="text-xs font-medium text-muted-foreground">
              All photos · click <span className="text-foreground">Set as display</span> to change
              the storefront image
            </p>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {images.map((entry, i) => {
                const src = entry.kind === "file" ? entry.preview : entry.url;
                const isDisplay = i === 0;
                return (
                  <div
                    key={`${src}-${i}`}
                    className={cn(
                      "group relative overflow-hidden rounded-xl border bg-card",
                      isDisplay
                        ? "border-primary ring-2 ring-primary"
                        : "border-border"
                    )}
                  >
                    <div className="relative aspect-square">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={src}
                        alt={isDisplay ? "Display image" : `Gallery image ${i + 1}`}
                        className="h-full w-full object-cover"
                      />
                      {entry.kind === "file" && (
                        <span className="absolute bottom-1 left-1 rounded bg-green-600 px-1.5 py-0.5 text-[10px] font-bold text-white">
                          Local
                        </span>
                      )}
                      {isDisplay ? (
                        <span className="absolute left-1 top-1 rounded bg-primary px-1.5 py-0.5 text-[10px] font-bold text-white shadow">
                          Display
                        </span>
                      ) : (
                        <span className="absolute left-1 top-1 rounded bg-black/55 px-1.5 py-0.5 text-[10px] font-medium text-white">
                          Gallery
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
                    <div className="border-t border-border p-2">
                      {isDisplay ? (
                        <p className="text-center text-[11px] font-semibold text-primary">
                          Showing on storefront
                        </p>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setDisplayImage(i)}
                          className="w-full rounded-md bg-muted px-2 py-1.5 text-[11px] font-semibold text-foreground transition hover:bg-primary hover:text-white"
                        >
                          Set as display
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </SectionCard>

      <SectionCard title="Variants" description="Sizes with per-size stock. When sizes are set, stock is tracked per size.">
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
            onChange={syncVariantsFromSizes}
            placeholder="Type a size and press Enter"
            hint="Suggestions: S, M, L, XL, One Size"
          />
        </div>

        {form.sizes.length > 0 && (
          <div className="mt-5">
            <p className="mb-2 text-sm font-semibold text-foreground">
              Stock per size
              <span className="ml-1 font-normal text-muted-foreground">
                (total will be calculated automatically)
              </span>
            </p>
            {fieldErrors.variants && (
              <p className="mb-2 text-xs font-medium text-destructive">
                {fieldErrors.variants}
              </p>
            )}
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {variants.map((variant, i) => (
                <div
                  key={variant.size}
                  className="flex items-center gap-2 rounded-xl border border-border bg-muted/30 p-3"
                >
                  <span className="w-12 text-sm font-bold text-foreground">
                    {variant.size}
                  </span>
                  <Input
                    type="text"
                    inputMode="numeric"
                    value={variant.stock}
                    onChange={(e) => {
                      setVariants((prev) =>
                        prev.map((v, idx) =>
                          idx === i
                            ? {
                                ...v,
                                stock: Number(
                                  sanitizeWholeNumber(e.target.value) || 0
                                ),
                              }
                            : v
                        )
                      );
                    }}
                    onKeyDown={(e) => {
                      if (["-", "+", "e", "E", "."].includes(e.key)) e.preventDefault();
                    }}
                    aria-label={`Stock for size ${variant.size}`}
                    placeholder="0"
                    className="h-9"
                  />
                  <span className="text-xs text-muted-foreground">pcs</span>
                </div>
              ))}
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              Total stock:{" "}
              <span className="font-bold text-foreground">
                {variants.reduce((sum, v) => sum + (v.stock || 0), 0)}
              </span>{" "}
              pieces
            </p>
          </div>
        )}
      </SectionCard>

      <SectionCard
        title="Product page tabs"
        description="Optional content for Materials, Size & Fit, and Shipping tabs on the product page."
      >
        <div className="grid gap-4 sm:grid-cols-1">
          <Textarea
            label="Materials"
            value={form.materials}
            onChange={(e) => set("materials", e.target.value)}
            placeholder="Fabric composition, care instructions, material quality..."
          />
          <Textarea
            label="Size & fit guide"
            value={form.sizeGuide}
            onChange={(e) => set("sizeGuide", e.target.value)}
            placeholder="Runs true to size. Size up for relaxed fit..."
          />
          <Textarea
            label="Shipping & returns"
            value={form.shippingInfo}
            onChange={(e) => set("shippingInfo", e.target.value)}
            placeholder="Leave empty to use store defaults."
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
            hint="Shown as icon bullets under the Details tab"
          />
          <ListEditor
            label="Tags"
            value={form.tags}
            onChange={(next) => set("tags", next)}
            placeholder="Add a tag"
            hint="For the Store premium page, add the exact tag Premium. New arrival controls the New Arrival page; Top Selling shows products in the Store homepage Best Sellers section. A compare-at price above the selling price places it in Sales."
          />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {(
              [
                { key: "isFeatured", label: "Featured" },
                { key: "isBestSeller", label: "Top Selling (homepage)" },
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
          onClick={() => router.push(`/admin/products?store=${storeSlug}`)}
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
