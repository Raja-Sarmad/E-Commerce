import { useQuery } from "@tanstack/react-query";
import type { Product, Category, Brand, BlogPost, Review } from "@/lib/types";
import type { ProductListResult, ProductQuery } from "@/lib/api/server";
import {
  getProducts,
  getProductBySlug,
  getCategories,
  getCategoryBySlug,
  getBrands,
  getBlogPosts,
  getBlogPostBySlug,
  searchProducts,
} from "@/lib/api/server";
import { apiGet } from "@/lib/api/client";

function toReview(r: Record<string, unknown>): Review {
  return {
    id: String(r._id ?? r.id ?? ""),
    userId: String(r.user ?? r.userId ?? ""),
    name: String(r.userName ?? r.name ?? "Customer"),
    rating: Number(r.rating ?? 5),
    title: String(r.title ?? ""),
    body: String(r.body ?? r.comment ?? ""),
    date: String(r.createdAt ?? r.date ?? new Date().toISOString()),
    verified: Boolean(r.verified ?? false),
    helpful: Number(r.helpful ?? r.helpfulCount ?? 0),
  };
}

export function useProductReviews(productId: string | undefined) {
  return useQuery<Review[]>({
    queryKey: ["reviews", productId],
    queryFn: async () => {
      if (!productId) return [];
      const env = await apiGet<Array<Record<string, unknown>>>(`/reviews/product/${productId}`);
      return (env.data ?? []).map(toReview);
    },
    enabled: !!productId,
  });
}

export function useProducts(query: ProductQuery = {}) {
  return useQuery<ProductListResult>({
    queryKey: ["products", query],
    queryFn: () => getProducts(query),
  });
}

export function useFeaturedProducts() {
  return useQuery<Product[]>({
    queryKey: ["products", "featured"],
    queryFn: () => getProducts({ featured: true, limit: 8 }).then((r) => r.products),
  });
}

export function useBestSellers() {
  return useQuery<Product[]>({
    queryKey: ["products", "best-sellers"],
    queryFn: () => getProducts({ bestSeller: true, limit: 8 }).then((r) => r.products),
  });
}

export function useNewArrivals() {
  return useQuery<Product[]>({
    queryKey: ["products", "new-arrivals"],
    queryFn: () => getProducts({ sort: "createdAt", limit: 8 }).then((r) => r.products),
  });
}

export function useTrendingProducts() {
  return useQuery<Product[]>({
    queryKey: ["products", "trending"],
    queryFn: () => getProducts({ trending: true, limit: 8 }).then((r) => r.products),
  });
}

export function useFlashSaleProducts() {
  return useQuery<Product[]>({
    queryKey: ["products", "flash-sale"],
    queryFn: () => getProducts({ onSale: true, sort: "-discountPercent", limit: 8 }).then((r) => r.products),
  });
}

export function useRecommendedProducts() {
  return useQuery<Product[]>({
    queryKey: ["products", "recommended"],
    queryFn: () => getProducts({ sort: "rating", limit: 8 }).then((r) => r.products),
  });
}

export function useProductBySlug(slug: string) {
  return useQuery({
    queryKey: ["product", slug],
    queryFn: () => getProductBySlug(slug),
    enabled: !!slug,
  });
}

export function useCategories() {
  return useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: getCategories,
  });
}

export function useCategoryBySlug(slug: string) {
  return useQuery({
    queryKey: ["category", slug],
    queryFn: () => getCategoryBySlug(slug),
    enabled: !!slug,
  });
}

export function useBrands() {
  return useQuery<Brand[]>({
    queryKey: ["brands"],
    queryFn: getBrands,
  });
}

export function useBlogPosts(limit = 9) {
  return useQuery<BlogPost[]>({
    queryKey: ["blog", "list", limit],
    queryFn: () => getBlogPosts(limit),
  });
}

export function useBlogPost(slug: string) {
  return useQuery({
    queryKey: ["blog", slug],
    queryFn: () => getBlogPostBySlug(slug),
    enabled: !!slug,
  });
}

export function useSearchProducts(query: string) {
  return useQuery<Product[]>({
    queryKey: ["products", "search", query],
    queryFn: () => searchProducts(query),
    enabled: query.trim().length >= 2,
  });
}
