import { apiGet, normalizeId, unwrapData } from "./client";
import type { Product, Category, Brand, BlogPost } from "../types";

export type ListMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type ProductListResult = {
  products: Product[];
  meta: ListMeta;
};

export type ProductQuery = {
  search?: string;
  category?: string;
  categorySlug?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  featured?: boolean;
  bestSeller?: boolean;
  trending?: boolean;
  onSale?: boolean;
  inStock?: boolean;
  page?: number;
  limit?: number;
  sort?: string;
};

const DEFAULT_SORT = "position";

function buildProductQuery(query: ProductQuery): Record<string, string> {
  const q: Record<string, string> = { sort: query.sort ?? DEFAULT_SORT };
  if (query.search) q.search = query.search;
  if (query.category) q.category = query.category;
  if (query.categorySlug) q.categorySlug = query.categorySlug;
  if (query.brand) q.brand = query.brand;
  if (query.minPrice !== undefined) q.minPrice = String(query.minPrice);
  if (query.maxPrice !== undefined) q.maxPrice = String(query.maxPrice);
  if (query.featured) q.featured = "true";
  if (query.bestSeller) q.bestSeller = "true";
  if (query.trending) q.trending = "true";
  if (query.onSale) q.onSale = "true";
  if (query.inStock) q.inStock = "true";
  if (query.page) q.page = String(query.page);
  if (query.limit) q.limit = String(query.limit);
  return q;
}

function toQueryString(q: Record<string, string>) {
  const params = new URLSearchParams(q);
  return params.toString();
}

export type ApiProduct = Product & { _id?: string };

function toProduct(p: ApiProduct): Product {
  const { _id, ...rest } = p;
  return { ...rest, id: String(_id ?? ""), position: (rest as Record<string, unknown>).position ?? 0 } as Product;
}

export async function getProducts(query: ProductQuery = {}): Promise<ProductListResult> {
  const qs = toQueryString(buildProductQuery(query));
  const env = await apiGet<ApiProduct[]>(`/products${qs ? `?${qs}` : ""}`);
  const products = (env.data ?? []).map(toProduct);
  const meta = env.meta as unknown as ListMeta | undefined;
  return {
    products,
    meta: { page: 1, limit: 12, total: products.length, totalPages: 1, ...(meta ?? {}) },
  };
}

async function getFlagged(extra: Partial<ProductQuery>, limit = 8): Promise<Product[]> {
  const res = await getProducts({ ...extra, limit });
  return res.products;
}

/** Use flagged products when available; otherwise show latest active catalog items. */
async function getFlaggedOrLatest(
  flags: Partial<ProductQuery>,
  fallbackSort = "-createdAt"
): Promise<Product[]> {
  const flagged = await getFlagged(flags);
  if (flagged.length > 0) return flagged;
  const latest = await getProducts({ sort: fallbackSort, limit: 8 });
  return latest.products;
}

export async function getFeaturedProducts(): Promise<Product[]> {
  return getFlaggedOrLatest({ featured: true });
}

export async function getBestSellers(): Promise<Product[]> {
  return getFlaggedOrLatest({ bestSeller: true });
}

export async function getNewArrivals(): Promise<Product[]> {
  return getProducts({ sort: "-createdAt", limit: 8 }).then((r) => r.products);
}

export async function getTrendingProducts(): Promise<Product[]> {
  return getFlaggedOrLatest({ trending: true });
}

export async function getFlashSaleProducts(): Promise<Product[]> {
  const onSale = await getFlagged({ onSale: true, sort: "-discountPercent" });
  if (onSale.length > 0) return onSale;
  return getProducts({ sort: "-createdAt", limit: 8 }).then((r) => r.products);
}

export async function getRecommendedProducts(): Promise<Product[]> {
  return getProducts({ sort: "-rating", limit: 8 }).then((r) => r.products);
}

export type ProductDetail = Product & { related: Product[] };

export async function getProductBySlug(slug: string): Promise<ProductDetail | null> {
  try {
    const env = await apiGet<Record<string, unknown>>(`/products/slug/${slug}`);
    const data = env.data as unknown as (ProductDetail & { _id?: string }) | undefined;
    if (!data) return null;
    const { related, ...rest } = data as Record<string, unknown>;
    const product = toProduct(rest as ApiProduct);
    const relatedProducts = Array.isArray(related)
      ? (related as unknown as Array<Record<string, unknown>>).map((r) => {
          const { _id: rid, ...rRest } = r;
          return { ...rRest, id: String(rid ?? ""), position: (rRest as Record<string, unknown>).position ?? 0 } as Product;
        })
      : [];
    return { ...product, related: relatedProducts };
  } catch (err: unknown) {
    const status = err && typeof err === "object" && "statusCode" in err ? (err as { statusCode: number }).statusCode : undefined;
    if (status === 404) return null;
    throw err;
  }
}

export async function searchProducts(query: string): Promise<Product[]> {
  const res = await getProducts({ search: query, limit: 24 });
  return res.products;
}

export async function getCategories(): Promise<Category[]> {
  try {
    const env = await apiGet<Array<Category & { _id?: string }>>(`/categories/all`);
    return (env.data ?? []).map((c) => ({
      ...normalizeId(c),
      count: typeof c.count === "number" ? c.count : 0,
    }));
  } catch {
    return [];
  }
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  try {
    const env = await apiGet<Category & { _id?: string }>(`/categories/slug/${slug}`);
    return env.data ? normalizeId(env.data) : null;
  } catch {
    return null;
  }
}

export async function getBrands(): Promise<Brand[]> {
  try {
    const env = await apiGet<Array<Brand & { _id?: string }>>(`/brands/all`);
    return (env.data ?? []).map(normalizeId);
  } catch {
    return [];
  }
}

export async function getBlogPosts(limit = 9): Promise<BlogPost[]> {
  try {
    const env = await apiGet<Array<BlogPost & { _id?: string }>>(`/blog?limit=${limit}`);
    return (env.data ?? []).map(normalizeId);
  } catch {
    return [];
  }
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  try {
    const env = await apiGet<BlogPost & { _id?: string }>(`/blog/slug/${slug}`);
    return env.data ? normalizeId(env.data) : null;
  } catch {
    return null;
  }
}

export async function getOrdersForUser(): Promise<unknown[]> {
  try {
    const env = await apiGet<unknown[]>(`/orders/my-orders`);
    return env.data ?? [];
  } catch {
    return [];
  }
}

export { unwrapData };
