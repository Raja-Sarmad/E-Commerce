import { baseApi } from "./baseApi";
import type { Product, Category, Brand, BlogPost, Review } from "../types";

type ListMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

type ProductListResult = {
  products: Product[];
  meta: ListMeta;
};

type ProductQuery = {
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

function buildProductQuery(query: ProductQuery): Record<string, string> {
  const q: Record<string, string> = { sort: query.sort ?? "position" };
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

function normalizeProduct(p: Record<string, unknown>): Product {
  const _id = p._id ?? p.id;
  return {
    id: String(_id ?? ""),
    slug: String(p.slug ?? ""),
    name: String(p.name ?? ""),
    brand: String(p.brand ?? ""),
    category: String(p.category ?? ""),
    categorySlug: String(p.categorySlug ?? ""),
    description: String(p.description ?? ""),
    features: Array.isArray(p.features) ? (p.features as string[]) : [],
    specifications: (p.specifications as Record<string, string>) ?? {},
    price: Number(p.price ?? 0),
    compareAtPrice: p.compareAtPrice ? Number(p.compareAtPrice) : undefined,
    images: Array.isArray(p.images) ? (p.images as string[]) : [],
    rating: Number(p.rating ?? 0),
    reviewsCount: Number(p.reviewsCount ?? 0),
    stock: Number(p.stock ?? 0),
    sku: String(p.sku ?? ""),
    tags: Array.isArray(p.tags) ? (p.tags as string[]) : [],
    isFeatured: Boolean(p.isFeatured),
    isBestSeller: Boolean(p.isBestSeller),
    isNew: Boolean(p.isNew),
    isTrending: Boolean(p.isTrending),
    onSale: Boolean(p.onSale),
    discountPercent: Number(p.discountPercent ?? 0),
    colors: Array.isArray(p.colors) ? (p.colors as string[]) : [],
    sizes: Array.isArray(p.sizes) ? (p.sizes as string[]) : undefined,
    position: Number(p.position ?? 0),
    createdAt: String(p.createdAt ?? ""),
    reviews: [],
  } as Product;
}

function normalizeCategory(c: Record<string, unknown>): Category {
  return {
    id: String(c._id ?? c.id ?? ""),
    slug: String(c.slug ?? ""),
    name: String(c.name ?? ""),
    description: String(c.description ?? ""),
    image: String(c.image ?? ""),
    icon: c.icon ? String(c.icon) : undefined,
    count: typeof c.count === "number" ? c.count : 0,
    featured: Boolean(c.featured),
  };
}

function normalizeBrand(b: Record<string, unknown>): Brand {
  return {
    id: String(b._id ?? b.id ?? ""),
    name: String(b.name ?? ""),
    logo: String(b.logo ?? ""),
  };
}

function normalizeBlogPost(b: Record<string, unknown>): BlogPost {
  return {
    id: String(b._id ?? b.id ?? ""),
    slug: String(b.slug ?? ""),
    title: String(b.title ?? ""),
    excerpt: String(b.excerpt ?? ""),
    content: Array.isArray(b.content) ? (b.content as string[]) : b.content ? [String(b.content)] : [],
    coverImage: String(b.coverImage ?? ""),
    category: String(b.category ?? ""),
    author: String(b.author ?? ""),
    authorAvatar: String(b.authorAvatar ?? ""),
    date: String(b.createdAt ?? b.date ?? ""),
    readTime: Number(b.readTime ?? 3),
    tags: Array.isArray(b.tags) ? (b.tags as string[]) : [],
    featured: Boolean(b.featured),
  };
}

function normalizeReview(r: Record<string, unknown>): Review {
  return {
    id: String(r._id ?? r.id ?? ""),
    userId: String(r.user ?? r.userId ?? ""),
    name: String(r.userName ?? r.name ?? "Customer"),
    rating: Number(r.rating ?? 5),
    title: String(r.title ?? ""),
    body: String(r.body ?? r.comment ?? ""),
    date: String(r.createdAt ?? r.date ?? ""),
    verified: Boolean(r.verified ?? false),
    helpful: Number(r.helpful ?? r.helpfulCount ?? 0),
  };
}

export const storefrontApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getStorefrontProducts: builder.query<ProductListResult, ProductQuery>({
      query: (query) => {
        const qs = new URLSearchParams(buildProductQuery(query));
        return { url: `/products${qs.toString() ? `?${qs.toString()}` : ""}` };
      },
      transformResponse: (raw: unknown) => {
        const envelope = raw as { data?: unknown; meta?: unknown };
        const items = Array.isArray(envelope?.data)
          ? (envelope.data as Array<Record<string, unknown>>)
          : Array.isArray(raw)
            ? (raw as Array<Record<string, unknown>>)
            : [];
        const products = items.map(normalizeProduct);
        const meta = (envelope?.meta as ListMeta) ?? {
          page: 1,
          limit: 12,
          total: products.length,
          totalPages: 1,
        };
        return { products, meta };
      },
      providesTags: ["Products"],
    }),

    getStorefrontProductBySlug: builder.query<
      (Product & { related: Product[] }) | null,
      string
    >({
      query: (slug) => ({ url: `/products/slug/${slug}` }),
      transformResponse: (raw: unknown) => {
        const envelope = raw as { data?: Record<string, unknown> };
        const data = envelope?.data;
        if (!data) return null;
        const product = normalizeProduct(data);
        const related = Array.isArray(data.related)
          ? (data.related as Array<Record<string, unknown>>).map(normalizeProduct)
          : [];
        return { ...product, related };
      },
      providesTags: (_res, _err, slug) => [{ type: "Products", id: slug }],
    }),

    getStorefrontCategories: builder.query<Category[], void>({
      query: () => ({ url: "/categories/all" }),
      transformResponse: (raw: unknown) => {
        const envelope = raw as { data?: unknown };
        const items = Array.isArray(envelope?.data)
          ? (envelope.data as Array<Record<string, unknown>>)
          : Array.isArray(raw)
            ? (raw as Array<Record<string, unknown>>)
            : [];
        return items.map(normalizeCategory);
      },
      providesTags: ["Categories"],
    }),

    getStorefrontCategoryBySlug: builder.query<Category | null, string>({
      query: (slug) => ({ url: `/categories/slug/${slug}` }),
      transformResponse: (raw: unknown) => {
        const envelope = raw as { data?: Record<string, unknown> };
        return envelope?.data ? normalizeCategory(envelope.data) : null;
      },
      providesTags: (_res, _err, slug) => [
        { type: "Categories", id: slug },
      ],
    }),

    getStorefrontBrands: builder.query<Brand[], void>({
      query: () => ({ url: "/brands/all" }),
      transformResponse: (raw: unknown) => {
        const envelope = raw as { data?: unknown };
        const items = Array.isArray(envelope?.data)
          ? (envelope.data as Array<Record<string, unknown>>)
          : Array.isArray(raw)
            ? (raw as Array<Record<string, unknown>>)
            : [];
        return items.map(normalizeBrand);
      },
      providesTags: ["Brands"],
    }),

    getStorefrontBlogPosts: builder.query<BlogPost[], number>({
      query: (limit = 9) => ({ url: `/blog?limit=${limit}` }),
      transformResponse: (raw: unknown) => {
        const envelope = raw as { data?: unknown };
        const items = Array.isArray(envelope?.data)
          ? (envelope.data as Array<Record<string, unknown>>)
          : Array.isArray(raw)
            ? (raw as Array<Record<string, unknown>>)
            : [];
        return items.map(normalizeBlogPost);
      },
      providesTags: ["Blog"],
    }),

    getStorefrontBlogPostBySlug: builder.query<BlogPost | null, string>({
      query: (slug) => ({ url: `/blog/slug/${slug}` }),
      transformResponse: (raw: unknown) => {
        const envelope = raw as { data?: Record<string, unknown> };
        return envelope?.data ? normalizeBlogPost(envelope.data) : null;
      },
      providesTags: (_res, _err, slug) => [{ type: "Blog", id: slug }],
    }),

    getStorefrontBanners: builder.query<Array<Record<string, unknown>>, void>({
      query: () => ({ url: "/banners" }),
      transformResponse: (raw: unknown) => {
        const envelope = raw as { data?: unknown };
        return Array.isArray(envelope?.data)
          ? (envelope.data as Array<Record<string, unknown>>)
          : Array.isArray(raw)
            ? (raw as Array<Record<string, unknown>>)
            : [];
      },
      providesTags: ["Banners"],
    }),

    getStorefrontFaqs: builder.query<Array<Record<string, unknown>>, void>({
      query: () => ({ url: "/faqs" }),
      transformResponse: (raw: unknown) => {
        const envelope = raw as { data?: unknown };
        return Array.isArray(envelope?.data)
          ? (envelope.data as Array<Record<string, unknown>>)
          : Array.isArray(raw)
            ? (raw as Array<Record<string, unknown>>)
            : [];
      },
    }),

    getStorefrontFaqCategories: builder.query<string[], void>({
      query: () => ({ url: "/faqs/categories" }),
      transformResponse: (raw: unknown) => {
        const envelope = raw as { data?: unknown };
        return Array.isArray(envelope?.data)
          ? (envelope.data as string[])
          : Array.isArray(raw)
            ? (raw as string[])
            : [];
      },
    }),

    getProductReviews: builder.query<Review[], string>({
      query: (productId) => ({ url: `/reviews/product/${productId}` }),
      transformResponse: (raw: unknown) => {
        const envelope = raw as { data?: unknown };
        const items = Array.isArray(envelope?.data)
          ? (envelope.data as Array<Record<string, unknown>>)
          : Array.isArray(raw)
            ? (raw as Array<Record<string, unknown>>)
            : [];
        return items.map(normalizeReview);
      },
      providesTags: (_res, _err, productId) => [
        { type: "Reviews", id: productId },
      ],
    }),

    getStorefrontShippingZones: builder.query<
      Array<Record<string, unknown>>,
      void
    >({
      query: () => ({ url: "/shipping/zones" }),
      transformResponse: (raw: unknown) => {
        const envelope = raw as { data?: unknown };
        return Array.isArray(envelope?.data)
          ? (envelope.data as Array<Record<string, unknown>>)
          : [];
      },
      providesTags: ["Shipping"],
    }),

    getStorefrontShippingMethods: builder.query<
      Array<Record<string, unknown>>,
      void
    >({
      query: () => ({ url: "/shipping/methods" }),
      transformResponse: (raw: unknown) => {
        const envelope = raw as { data?: unknown };
        return Array.isArray(envelope?.data)
          ? (envelope.data as Array<Record<string, unknown>>)
          : [];
      },
      providesTags: ["Shipping"],
    }),

    getStorefrontPaymentMethods: builder.query<
      Array<Record<string, unknown>>,
      void
    >({
      query: () => ({ url: "/payments/methods" }),
      transformResponse: (raw: unknown) => {
        const envelope = raw as { data?: unknown };
        return Array.isArray(envelope?.data)
          ? (envelope.data as Array<Record<string, unknown>>)
          : [];
      },
      providesTags: ["Payments"],
    }),

    getStorefrontSettings: builder.query<Record<string, unknown>, void>({
      query: () => ({ url: "/settings" }),
      transformResponse: (raw: unknown) => {
        const envelope = raw as { data?: Record<string, unknown> };
        return envelope?.data ?? (raw as Record<string, unknown>);
      },
      providesTags: ["Settings"],
    }),

    submitContactMessage: builder.mutation<
      void,
      { name: string; email: string; subject: string; message: string }
    >({
      query: (body) => ({ url: "/messages/contact", method: "POST", body }),
    }),

    subscribeNewsletter: builder.mutation<void, { email: string }>({
      query: (body) => ({
        url: "/newsletter/subscribe",
        method: "POST",
        body,
      }),
    }),

    validateCoupon: builder.mutation<
      Record<string, unknown>,
      { code: string }
    >({
      query: (body) => ({
        url: "/coupons/validate",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Coupons"],
    }),
  }),
});

export const {
  useGetStorefrontProductsQuery,
  useGetStorefrontProductBySlugQuery,
  useGetStorefrontCategoriesQuery,
  useGetStorefrontCategoryBySlugQuery,
  useGetStorefrontBrandsQuery,
  useGetStorefrontBlogPostsQuery,
  useGetStorefrontBlogPostBySlugQuery,
  useGetStorefrontBannersQuery,
  useGetStorefrontFaqsQuery,
  useGetStorefrontFaqCategoriesQuery,
  useGetProductReviewsQuery,
  useGetStorefrontShippingZonesQuery,
  useGetStorefrontShippingMethodsQuery,
  useGetStorefrontPaymentMethodsQuery,
  useGetStorefrontSettingsQuery,
  useSubmitContactMessageMutation,
  useSubscribeNewsletterMutation,
  useValidateCouponMutation,
} = storefrontApi;
