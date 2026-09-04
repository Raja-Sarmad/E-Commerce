import { baseApi } from "./baseApi";
import type { Product, Order, User } from "../types";

export type AdminOverview = {
  revenue?: number;
  averageOrderValue?: number;
  orders?: number;
  customers?: number;
  products?: number;
  lowStock?: number;
  outOfStock?: number;
  pendingVendors?: number;
  reviews?: number;
};

export type RevenuePoint = { label: string; key: string; value: number };
export type CategorySalesPoint = { name: string; value: number; orders: number };
export type DailyOrderPoint = { label: string; date: string; value: number };
export type TopProduct = { _id: string; name: string; price: number; rating: number; reviewsCount: number; totalSold?: number; revenue?: number; images?: string[]; stock: number };
export type RecentOrder = { _id: string; number: string; total: number; status: string; createdAt: string; user?: { name?: string; email?: string } };
export type RecentReview = { _id: string; name: string; rating: number; body: string; createdAt: string; product?: { name?: string; slug?: string } };
export type ActivityItem = { _id: string; type: string; user: string; action: string; details: string; level: string; createdAt: string };
export type RevenueComparison = {
  revenue: { thisMonth: number; lastMonth: number; change: number };
  yearlyRevenue: { thisYear: number; lastYear: number; change: number };
  orders: { thisMonth: number; lastMonth: number; change: number };
  customers: { thisMonth: number; lastMonth: number; change: number };
};

export type ListResponse<T> = {
  items: T[];
  total: number;
  page: number;
  totalPages: number;
};

export type AdminCategory = { _id: string; name: string; slug: string; description: string; image: string; icon?: string; count: number; featured: boolean; isActive: boolean; parent?: string; order: number };
export type AdminBrand = { _id: string; name: string; slug: string; logo: string; description: string; isActive: boolean };
export type AdminBanner = { _id: string; title: string; position: string; image: string; link: string; subtitle: string; startsAt?: string; endsAt?: string; active: boolean; views: number; clicks: number };
export type AdminBlogPost = { _id: string; title: string; slug: string; excerpt: string; content: string; coverImage: string; category: string; author: string; authorAvatar: string; readTime: number; tags: string[]; featured: boolean; status: string; views: number; scheduledAt?: string; createdAt: string };
export type AdminVendor = { _id: string; user?: string; name: string; logo: string; email: string; phone: string; description: string; rating: number; verified: boolean; status: string; productsCount: number; totalEarnings: number; pendingPayout: number; commissionRate: number; createdAt: string };
export type AdminReview = { _id: string; product?: { name: string; slug: string }; user?: { name: string; email: string }; name: string; rating: number; title: string; body: string; verified: boolean; helpful: number; status: string; createdAt: string };
export type AdminFaq = { _id: string; category: string; question: string; answer: string; order: number; active: boolean };
export type AdminSubscriber = { _id: string; email: string; name: string; source: string; status: string; createdAt: string };
export type AdminMessage = { _id: string; name: string; email: string; subject: string; message: string; status: string; starred: boolean; createdAt: string };
export type AdminNotification = { _id: string; type: string; title: string; message: string; link?: string; read: boolean; createdAt: string };
export type AdminCoupon = { _id: string; code: string; type: string; value: number; minSpend: number; maxDiscount: number; maxUses: number; usedCount: number; expiresAt?: string; active: boolean };
export type AdminShippingZone = { _id: string; name: string; regions: string; baseRate: number; freeAbove: number; methods: string[]; active: boolean };
export type AdminShippingMethod = { _id: string; name: string; zone: string; price: number; eta: string; active: boolean };
export type AdminPaymentMethod = { _id: string; name: string; description: string; enabled: boolean; icon: string; settings: Record<string, string> };
export type AdminTransaction = { _id: string; reference: string; orderNumber: string; customer: string; amount: number; fee: number; method: string; status: string; createdAt: string };
export type AdminRole = { _id: string; name: string; description: string; members: number; color: string; permissions: Record<string, string[]> };
export type AdminPage = { _id: string; title: string; slug: string; content: string; status: string; createdAt: string };
export type AdminSettings = Record<string, unknown>;
export type InventoryEntry = { _id: string; product?: { name: string; sku: string }; adjustment: number; previousStock: number; newStock: number; reason: string; user?: { name: string }; createdAt: string };
export type AdminLog = { _id: string; type: string; user?: string; action: string; details: string; ip: string; level: string; createdAt: string };

type ProductPayload = Record<string, unknown> | FormData;

function buildQs(params: Record<string, string | number | undefined>): string {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== "" && v !== null) qs.set(k, String(v));
  });
  return qs.toString() ? `?${qs.toString()}` : "";
}

function parseListResponse<T>(
  raw: unknown,
  responseMeta?: unknown,
  mapId = false
): ListResponse<T> {
  const envelope = raw as {
    data?: unknown;
    meta?: { page?: number; limit?: number; total?: number; totalPages?: number };
  };
  const data = envelope?.data ?? raw;
  const rows = Array.isArray(data) ? data : [];
  const items = (mapId
    ? rows.map((item) => {
        const row = item as Record<string, unknown>;
        const { _id, ...rest } = row;
        return { ...rest, id: String(_id ?? row.id ?? "") } as T;
      })
    : rows) as T[];
  const meta =
    (envelope?.meta as typeof envelope.meta | undefined) ??
    (responseMeta as typeof envelope.meta | undefined);
  const total = meta?.total ?? items.length;
  const page = meta?.page ?? 1;
  const limit = meta?.limit ?? (items.length || 1);
  const totalPages = meta?.totalPages ?? Math.max(1, Math.ceil(total / limit));
  return { items, total, page, totalPages };
}

function toItemList<T>(raw: unknown): ListResponse<T> {
  return parseListResponse<T>(raw);
}

export const adminApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /* ── Analytics / Dashboard ─────────────────────────────────── */
    getDashboardOverview: builder.query<AdminOverview, void>({
      query: () => ({ url: "/analytics/overview" }),
      providesTags: ["Dashboard"],
    }),
    getRevenueSeries: builder.query<RevenuePoint[], number | void>({
      query: (months) => ({ url: `/analytics/revenue-series${months ? `?months=${months}` : ""}` }),
      transformResponse: (raw: unknown) => (raw as RevenuePoint[]) ?? [],
      providesTags: ["Dashboard"],
    }),
    getSalesByCategory: builder.query<CategorySalesPoint[], void>({
      query: () => ({ url: "/analytics/sales-by-category" }),
      transformResponse: (raw: unknown) => (raw as CategorySalesPoint[]) ?? [],
      providesTags: ["Dashboard"],
    }),
    getDailyOrders: builder.query<DailyOrderPoint[], void>({
      query: () => ({ url: "/analytics/daily-orders" }),
      transformResponse: (raw: unknown) => (raw as DailyOrderPoint[]) ?? [],
      providesTags: ["Dashboard"],
    }),
    getTopProducts: builder.query<TopProduct[], void>({
      query: () => ({ url: "/analytics/top-products" }),
      transformResponse: (raw: unknown) => (raw as TopProduct[]) ?? [],
      providesTags: ["Dashboard"],
    }),
    getLowStock: builder.query<Array<{ _id: string; name: string; price: number; stock: number; sku?: string }>, void>({
      query: () => ({ url: "/analytics/low-stock" }),
      transformResponse: (raw: unknown) => (raw as Array<{ _id: string; name: string; price: number; stock: number; sku?: string }>) ?? [],
      providesTags: ["Dashboard"],
    }),
    getRecentOrders: builder.query<RecentOrder[], void>({
      query: () => ({ url: "/analytics/recent-orders" }),
      transformResponse: (raw: unknown) => (raw as RecentOrder[]) ?? [],
      providesTags: ["Orders", "Dashboard"],
    }),
    getRecentReviews: builder.query<RecentReview[], void>({
      query: () => ({ url: "/analytics/recent-reviews" }),
      transformResponse: (raw: unknown) => (raw as RecentReview[]) ?? [],
      providesTags: ["Dashboard"],
    }),
    getRecentActivity: builder.query<ActivityItem[], number | void>({
      query: (limit) => ({ url: `/analytics/recent-activity${limit ? `?limit=${limit}` : ""}` }),
      transformResponse: (raw: unknown) => (raw as ActivityItem[]) ?? [],
      providesTags: ["Dashboard"],
    }),
    getRevenueComparison: builder.query<RevenueComparison, void>({
      query: () => ({ url: "/analytics/revenue-comparison" }),
      providesTags: ["Dashboard"],
    }),

    /* ── Products ──────────────────────────────────────────────── */
    getAdminProducts: builder.query<ListResponse<Product>, Record<string, string | number | undefined>>({
      query: (params) => ({ url: `/products/admin/list${buildQs(params)}` }),
      transformResponse: (raw: unknown) => {
        const data = (raw as { data?: unknown })?.data ?? raw;
        const items = (Array.isArray(data) ? data : []).map((p) => {
          const { _id, ...rest } = p as Record<string, unknown>;
          return { ...rest, id: String(_id ?? ""), position: (rest as Record<string, unknown>).position ?? 0 } as unknown as Product;
        });
        return { items, total: items.length, page: 1, totalPages: 1 };
      },
      providesTags: ["Products"],
    }),
    getProduct: builder.query<Product, string>({
      query: (id) => ({ url: `/products/admin/${id}` }),
      transformResponse: (raw: unknown) => {
        const d = (raw as { data?: Record<string, unknown> })?.data ?? (raw as Record<string, unknown>);
        const { _id, ...rest } = d;
        return { ...rest, id: String(_id ?? ""), position: rest.position ?? 0 } as unknown as Product;
      },
      providesTags: (_res, _err, id) => [{ type: "Product", id }],
    }),
    createProduct: builder.mutation<Product, ProductPayload>({
      query: (body) => {
        const form = body instanceof FormData ? body : undefined;
        return { url: "/products/admin", method: "POST", body: form ?? body };
      },
      invalidatesTags: ["Products", "Dashboard", "Categories", "Brands"],
    }),
    updateProduct: builder.mutation<Product, { id: string; body: ProductPayload }>({
      query: ({ id, body }) => {
        const form = body instanceof FormData ? body : undefined;
        return { url: `/products/admin/${id}`, method: "PATCH", body: form ?? body };
      },
      invalidatesTags: ["Products", "Product", "Dashboard", "Categories", "Brands"],
    }),
    deleteProduct: builder.mutation<unknown, string>({
      query: (id) => ({ url: `/products/admin/${id}`, method: "DELETE" }),
      invalidatesTags: ["Products", "Dashboard", "Categories"],
    }),

    /* ── Orders ────────────────────────────────────────────────── */
    getOrders: builder.query<ListResponse<Order>, Record<string, string | number | undefined>>({
      query: (params) => ({ url: `/orders/admin/list${buildQs(params)}` }),
      transformResponse: (raw: unknown, meta) => parseListResponse<Order>(raw, meta, true),
      providesTags: ["Orders"],
    }),
    getOrderDetail: builder.query<Record<string, unknown>, string>({
      query: (number) => ({ url: `/orders/admin/number/${number}` }),
      transformResponse: (raw: unknown) => ((raw as { data?: unknown })?.data ?? raw) as Record<string, unknown>,
      providesTags: (_res, _err, number) => [{ type: "Orders", id: number }],
    }),
    updateOrderStatus: builder.mutation<unknown, { id: string; status: string; note?: string }>({
      query: ({ id, ...body }) => ({ url: `/orders/admin/${id}/status`, method: "PATCH", body }),
      invalidatesTags: ["Orders", "Dashboard"],
    }),
    addOrderTracking: builder.mutation<unknown, { id: string; carrier: string; trackingNumber: string }>({
      query: ({ id, ...body }) => ({ url: `/orders/admin/${id}/tracking`, method: "PATCH", body }),
      invalidatesTags: ["Orders"],
    }),

    /* ── Users / Customers ─────────────────────────────────────── */
    getUsers: builder.query<ListResponse<User>, Record<string, string | number | undefined>>({
      query: (params) => ({ url: `/users${buildQs(params)}` }),
      transformResponse: (raw: unknown, meta) => parseListResponse<User>(raw, meta, true),
      providesTags: ["Users"],
    }),
    deleteUser: builder.mutation<unknown, string>({
      query: (id) => ({ url: `/users/${id}`, method: "DELETE" }),
      invalidatesTags: ["Users"],
    }),

    /* ── Categories ────────────────────────────────────────────── */
    getAdminCategories: builder.query<ListResponse<AdminCategory>, Record<string, string | number | undefined>>({
      query: () => ({ url: `/categories/admin/list` }),
      transformResponse: (raw: unknown) => {
        const data = (raw as { data?: unknown })?.data ?? raw;
        const items = (Array.isArray(data) ? data : []) as AdminCategory[];
        return { items, total: items.length, page: 1, totalPages: 1 };
      },
      providesTags: ["Categories"],
    }),
    createCategory: builder.mutation<AdminCategory, Partial<AdminCategory>>({
      query: (body) => ({ url: "/categories", method: "POST", body }),
      invalidatesTags: ["Categories", "Dashboard"],
    }),
    updateCategory: builder.mutation<AdminCategory, { id: string; body: Partial<AdminCategory> }>({
      query: ({ id, body }) => ({ url: `/categories/${id}`, method: "PATCH", body }),
      invalidatesTags: ["Categories"],
    }),
    deleteCategory: builder.mutation<unknown, string>({
      query: (id) => ({ url: `/categories/${id}`, method: "DELETE" }),
      invalidatesTags: ["Categories", "Dashboard"],
    }),

    /* ── Brands ────────────────────────────────────────────────── */
    getAdminBrands: builder.query<ListResponse<AdminBrand>, Record<string, string | number | undefined>>({
      query: (params) => ({ url: `/brands${buildQs(params)}` }),
      transformResponse: (raw: unknown) => {
        const data = (raw as { data?: unknown })?.data ?? raw;
        const items = (Array.isArray(data) ? data : []) as AdminBrand[];
        return { items, total: items.length, page: 1, totalPages: 1 };
      },
      providesTags: ["Brands"],
    }),
    createBrand: builder.mutation<AdminBrand, Partial<AdminBrand>>({
      query: (body) => ({ url: "/brands", method: "POST", body }),
      invalidatesTags: ["Brands"],
    }),
    updateBrand: builder.mutation<AdminBrand, { id: string; body: Partial<AdminBrand> }>({
      query: ({ id, body }) => ({ url: `/brands/${id}`, method: "PATCH", body }),
      invalidatesTags: ["Brands"],
    }),
    deleteBrand: builder.mutation<unknown, string>({
      query: (id) => ({ url: `/brands/${id}`, method: "DELETE" }),
      invalidatesTags: ["Brands"],
    }),

    /* ── Banners ───────────────────────────────────────────────── */
    getAdminBanners: builder.query<ListResponse<AdminBanner>, Record<string, string | number | undefined>>({
      query: (params) => ({ url: `/banners/admin/list${buildQs(params)}` }),
      transformResponse: (raw: unknown) => {
        const data = (raw as { data?: unknown })?.data ?? raw;
        const items = (Array.isArray(data) ? data : []) as AdminBanner[];
        return { items, total: items.length, page: 1, totalPages: 1 };
      },
      providesTags: ["Banners"],
    }),
    createBanner: builder.mutation<AdminBanner, Partial<AdminBanner>>({
      query: (body) => ({ url: "/banners/admin", method: "POST", body }),
      invalidatesTags: ["Banners"],
    }),
    updateBanner: builder.mutation<AdminBanner, { id: string; body: Partial<AdminBanner> }>({
      query: ({ id, body }) => ({ url: `/banners/admin/${id}`, method: "PATCH", body }),
      invalidatesTags: ["Banners"],
    }),
    deleteBanner: builder.mutation<unknown, string>({
      query: (id) => ({ url: `/banners/admin/${id}`, method: "DELETE" }),
      invalidatesTags: ["Banners"],
    }),

    /* ── Blog ──────────────────────────────────────────────────── */
    getAdminBlogPosts: builder.query<ListResponse<AdminBlogPost>, Record<string, string | number | undefined>>({
      query: (params) => ({ url: `/blog/admin/list${buildQs(params)}` }),
      transformResponse: (raw: unknown) => parseListResponse<AdminBlogPost>(raw),
      providesTags: ["Blog"],
    }),
    createBlogPost: builder.mutation<AdminBlogPost, Partial<AdminBlogPost>>({
      query: (body) => ({ url: "/blog/admin", method: "POST", body }),
      invalidatesTags: ["Blog"],
    }),
    updateBlogPost: builder.mutation<AdminBlogPost, { id: string; body: Partial<AdminBlogPost> }>({
      query: ({ id, body }) => ({ url: `/blog/admin/${id}`, method: "PATCH", body }),
      invalidatesTags: ["Blog"],
    }),
    deleteBlogPost: builder.mutation<unknown, string>({
      query: (id) => ({ url: `/blog/admin/${id}`, method: "DELETE" }),
      invalidatesTags: ["Blog"],
    }),

    /* ── Vendors ───────────────────────────────────────────────── */
    getAdminVendors: builder.query<ListResponse<AdminVendor>, Record<string, string | number | undefined>>({
      query: (params) => ({ url: `/vendors${buildQs(params)}` }),
      transformResponse: (raw: unknown) => {
        const data = (raw as { data?: unknown })?.data ?? raw;
        const items = (Array.isArray(data) ? data : []) as AdminVendor[];
        return { items, total: items.length, page: 1, totalPages: 1 };
      },
      providesTags: ["Dashboard"],
    }),
    updateVendorStatus: builder.mutation<unknown, { id: string; status: string }>({
      query: ({ id, status }) => ({ url: `/vendors/${id}/status`, method: "PATCH", body: { status } }),
      invalidatesTags: ["Dashboard"],
    }),
    deleteVendor: builder.mutation<unknown, string>({
      query: (id) => ({ url: `/vendors/${id}`, method: "DELETE" }),
      invalidatesTags: ["Dashboard"],
    }),

    /* ── Reviews ───────────────────────────────────────────────── */
    getAdminReviews: builder.query<ListResponse<AdminReview>, Record<string, string | number | undefined>>({
      query: (params) => ({ url: `/reviews/admin/list${buildQs(params)}` }),
      transformResponse: (raw: unknown) => parseListResponse<AdminReview>(raw),
      providesTags: ["Reviews"],
    }),
    moderateReview: builder.mutation<unknown, { id: string; status: string }>({
      query: ({ id, status }) => ({ url: `/reviews/admin/${id}/moderate`, method: "PATCH", body: { status } }),
      invalidatesTags: ["Reviews", "Dashboard"],
    }),

    /* ── FAQs ──────────────────────────────────────────────────── */
    getAdminFaqs: builder.query<ListResponse<AdminFaq>, Record<string, string | number | undefined>>({
      query: (params) => ({ url: `/faqs/admin/list${buildQs(params)}` }),
      transformResponse: (raw: unknown) => {
        const data = (raw as { data?: unknown })?.data ?? raw;
        const items = (Array.isArray(data) ? data : []) as AdminFaq[];
        return { items, total: items.length, page: 1, totalPages: 1 };
      },
      providesTags: ["Settings"],
    }),
    createFaq: builder.mutation<AdminFaq, Partial<AdminFaq>>({
      query: (body) => ({ url: "/faqs/admin", method: "POST", body }),
      invalidatesTags: ["Settings"],
    }),
    updateFaq: builder.mutation<AdminFaq, { id: string; body: Partial<AdminFaq> }>({
      query: ({ id, body }) => ({ url: `/faqs/admin/${id}`, method: "PATCH", body }),
      invalidatesTags: ["Settings"],
    }),
    deleteFaq: builder.mutation<unknown, string>({
      query: (id) => ({ url: `/faqs/admin/${id}`, method: "DELETE" }),
      invalidatesTags: ["Settings"],
    }),

    /* ── Newsletter ────────────────────────────────────────────── */
    getAdminSubscribers: builder.query<ListResponse<AdminSubscriber>, Record<string, string | number | undefined>>({
      query: (params) => ({ url: `/newsletter${buildQs(params)}` }),
      transformResponse: (raw: unknown) => parseListResponse<AdminSubscriber>(raw),
      providesTags: ["Settings"],
    }),
    deleteSubscriber: builder.mutation<unknown, string>({
      query: (id) => ({ url: `/newsletter/${id}`, method: "DELETE" }),
      invalidatesTags: ["Settings"],
    }),

    /* ── Messages ──────────────────────────────────────────────── */
    getAdminMessages: builder.query<ListResponse<AdminMessage>, Record<string, string | number | undefined>>({
      query: (params) => ({ url: `/messages/admin/list${buildQs(params)}` }),
      transformResponse: (raw: unknown) => parseListResponse<AdminMessage>(raw),
      providesTags: ["Settings"],
    }),
    updateMessage: builder.mutation<AdminMessage, { id: string; body: Partial<AdminMessage> }>({
      query: ({ id, body }) => ({ url: `/messages/admin/${id}`, method: "PATCH", body }),
      invalidatesTags: ["Settings"],
    }),
    deleteMessage: builder.mutation<unknown, string>({
      query: (id) => ({ url: `/messages/admin/${id}`, method: "DELETE" }),
      invalidatesTags: ["Settings"],
    }),

    /* ── Notifications ─────────────────────────────────────────── */
    getAdminNotifications: builder.query<ListResponse<AdminNotification>, Record<string, string | number | undefined>>({
      query: (params) => ({ url: `/notifications${buildQs(params)}` }),
      transformResponse: (raw: unknown) => {
        const envelope = raw as {
          data?: unknown;
          notifications?: unknown;
          meta?: { page?: number; limit?: number; total?: number; totalPages?: number };
        };
        const data = envelope?.data ?? envelope?.notifications ?? raw;
        const rows = Array.isArray(data) ? data : [];
        const meta = envelope?.meta;
        const total = meta?.total ?? rows.length;
        const page = meta?.page ?? 1;
        const limit = meta?.limit ?? (rows.length || 1);
        return {
          items: rows as AdminNotification[],
          total,
          page,
          totalPages: meta?.totalPages ?? Math.max(1, Math.ceil(total / limit)),
        };
      },
      providesTags: ["Dashboard"],
    }),
    markNotificationRead: builder.mutation<unknown, string>({
      query: (id) => ({ url: `/notifications/${id}/read`, method: "PATCH" }),
      invalidatesTags: ["Dashboard"],
    }),
    markAllNotificationsRead: builder.mutation<unknown, void>({
      query: () => ({ url: "/notifications/me/read-all", method: "PATCH" }),
      invalidatesTags: ["Dashboard"],
    }),
    deleteNotification: builder.mutation<unknown, string>({
      query: (id) => ({ url: `/notifications/${id}`, method: "DELETE" }),
      invalidatesTags: ["Dashboard"],
    }),

    /* ── Coupons ───────────────────────────────────────────────── */
    getAdminCoupons: builder.query<ListResponse<AdminCoupon>, Record<string, string | number | undefined>>({
      query: (params) => ({ url: `/coupons${buildQs(params)}` }),
      transformResponse: (raw: unknown) => parseListResponse<AdminCoupon>(raw),
    }),
    createCoupon: builder.mutation<AdminCoupon, Partial<AdminCoupon>>({
      query: (body) => ({ url: "/coupons", method: "POST", body }),
      invalidatesTags: ["Coupons"],
    }),
    updateCoupon: builder.mutation<AdminCoupon, { id: string; body: Partial<AdminCoupon> }>({
      query: ({ id, body }) => ({ url: `/coupons/${id}`, method: "PATCH", body }),
      invalidatesTags: ["Coupons"],
    }),
    deleteCoupon: builder.mutation<unknown, string>({
      query: (id) => ({ url: `/coupons/${id}`, method: "DELETE" }),
      invalidatesTags: ["Coupons"],
    }),

    /* ── Shipping ──────────────────────────────────────────────── */
    getAdminShippingZones: builder.query<ListResponse<AdminShippingZone>, Record<string, string | number | undefined>>({
      query: (params) => ({ url: `/shipping/admin/zones${buildQs(params)}` }),
      transformResponse: (raw: unknown) => {
        const data = (raw as { data?: unknown })?.data ?? raw;
        const items = (Array.isArray(data) ? data : []) as AdminShippingZone[];
        return { items, total: items.length, page: 1, totalPages: 1 };
      },
      providesTags: ["Shipping"],
    }),
    createShippingZone: builder.mutation<AdminShippingZone, Partial<AdminShippingZone>>({
      query: (body) => ({ url: "/shipping/admin/zones", method: "POST", body }),
      invalidatesTags: ["Shipping"],
    }),
    updateShippingZone: builder.mutation<AdminShippingZone, { id: string; body: Partial<AdminShippingZone> }>({
      query: ({ id, body }) => ({ url: `/shipping/admin/zones/${id}`, method: "PATCH", body }),
      invalidatesTags: ["Shipping"],
    }),
    deleteShippingZone: builder.mutation<unknown, string>({
      query: (id) => ({ url: `/shipping/admin/zones/${id}`, method: "DELETE" }),
      invalidatesTags: ["Shipping"],
    }),
    getAdminShippingMethods: builder.query<ListResponse<AdminShippingMethod>, Record<string, string | number | undefined>>({
      query: (params) => ({ url: `/shipping/admin/methods${buildQs(params)}` }),
      transformResponse: (raw: unknown) => {
        const data = (raw as { data?: unknown })?.data ?? raw;
        const items = (Array.isArray(data) ? data : []) as AdminShippingMethod[];
        return { items, total: items.length, page: 1, totalPages: 1 };
      },
      providesTags: ["Shipping"],
    }),
    createShippingMethod: builder.mutation<AdminShippingMethod, Partial<AdminShippingMethod>>({
      query: (body) => ({ url: "/shipping/admin/methods", method: "POST", body }),
      invalidatesTags: ["Shipping"],
    }),
    updateShippingMethod: builder.mutation<AdminShippingMethod, { id: string; body: Partial<AdminShippingMethod> }>({
      query: ({ id, body }) => ({ url: `/shipping/admin/methods/${id}`, method: "PATCH", body }),
      invalidatesTags: ["Shipping"],
    }),
    deleteShippingMethod: builder.mutation<unknown, string>({
      query: (id) => ({ url: `/shipping/admin/methods/${id}`, method: "DELETE" }),
      invalidatesTags: ["Shipping"],
    }),

    /* ── Payments ──────────────────────────────────────────────── */
    getAdminPaymentMethods: builder.query<ListResponse<AdminPaymentMethod>, void>({
      query: () => ({ url: "/payments/admin/methods" }),
      transformResponse: (raw: unknown) => {
        const data = (raw as { data?: unknown })?.data ?? raw;
        const items = (Array.isArray(data) ? data : []) as AdminPaymentMethod[];
        return { items, total: items.length, page: 1, totalPages: 1 };
      },
      providesTags: ["Payments"],
    }),
    updatePaymentMethod: builder.mutation<AdminPaymentMethod, { id: string; body: Partial<AdminPaymentMethod> }>({
      query: ({ id, body }) => ({ url: `/payments/admin/methods/${id}`, method: "PATCH", body }),
      invalidatesTags: ["Payments"],
    }),
    getAdminTransactions: builder.query<ListResponse<AdminTransaction>, Record<string, string | number | undefined>>({
      query: (params) => ({ url: `/payments/admin/transactions${buildQs(params)}` }),
      transformResponse: (raw: unknown) => parseListResponse<AdminTransaction>(raw),
      providesTags: ["Payments"],
    }),
    updateTransactionStatus: builder.mutation<unknown, { id: string; status: string }>({
      query: ({ id, status }) => ({ url: `/payments/admin/transactions/${id}/status`, method: "PATCH", body: { status } }),
      invalidatesTags: ["Payments"],
    }),

    /* ── Roles ─────────────────────────────────────────────────── */
    getAdminRoles: builder.query<ListResponse<AdminRole>, void>({
      query: () => ({ url: "/roles" }),
      transformResponse: (raw: unknown) => {
        const data = (raw as { data?: unknown })?.data ?? raw;
        const items = (Array.isArray(data) ? data : []) as AdminRole[];
        return { items, total: items.length, page: 1, totalPages: 1 };
      },
      providesTags: ["Settings"],
    }),
    createRole: builder.mutation<AdminRole, Partial<AdminRole>>({
      query: (body) => ({ url: "/roles", method: "POST", body }),
      invalidatesTags: ["Settings"],
    }),
    updateRole: builder.mutation<AdminRole, { id: string; body: Partial<AdminRole> }>({
      query: ({ id, body }) => ({ url: `/roles/${id}`, method: "PATCH", body }),
      invalidatesTags: ["Settings"],
    }),
    deleteRole: builder.mutation<unknown, string>({
      query: (id) => ({ url: `/roles/${id}`, method: "DELETE" }),
      invalidatesTags: ["Settings"],
    }),

    /* ── Pages (CMS) ──────────────────────────────────────────── */
    getAdminPages: builder.query<ListResponse<AdminPage>, Record<string, string | number | undefined>>({
      query: (params) => ({ url: `/pages${buildQs(params)}` }),
      transformResponse: (raw: unknown) => {
        const data = (raw as { data?: unknown })?.data ?? raw;
        const items = (Array.isArray(data) ? data : []) as AdminPage[];
        return { items, total: items.length, page: 1, totalPages: 1 };
      },
      providesTags: ["Settings"],
    }),
    createPage: builder.mutation<AdminPage, Partial<AdminPage>>({
      query: (body) => ({ url: "/pages", method: "POST", body }),
      invalidatesTags: ["Settings"],
    }),
    updatePage: builder.mutation<AdminPage, { id: string; body: Partial<AdminPage> }>({
      query: ({ id, body }) => ({ url: `/pages/${id}`, method: "PATCH", body }),
      invalidatesTags: ["Settings"],
    }),
    deletePage: builder.mutation<unknown, string>({
      query: (id) => ({ url: `/pages/${id}`, method: "DELETE" }),
      invalidatesTags: ["Settings"],
    }),

    /* ── Settings ──────────────────────────────────────────────── */
    getSettings: builder.query<AdminSettings, void>({
      query: () => ({ url: "/settings" }),
      transformResponse: (raw: unknown) => ((raw as { data?: unknown })?.data ?? raw) as AdminSettings,
      providesTags: ["Settings"],
    }),
    updateSettings: builder.mutation<AdminSettings, Partial<AdminSettings>>({
      query: (body) => ({ url: "/settings", method: "PATCH", body }),
      invalidatesTags: ["Settings"],
    }),

    /* ── Inventory ─────────────────────────────────────────────── */
    getInventoryLowStock: builder.query<Array<{ _id: string; name: string; price: number; stock: number; sku?: string }>, void>({
      query: () => ({ url: "/inventory/low-stock" }),
      transformResponse: (raw: unknown) => ((raw as { data?: unknown })?.data ?? raw) as Array<{ _id: string; name: string; price: number; stock: number; sku?: string }>,
      providesTags: ["Products"],
    }),
    getInventoryHistory: builder.query<ListResponse<InventoryEntry>, Record<string, string | number | undefined>>({
      query: (params) => ({ url: `/inventory/history${buildQs(params)}` }),
      transformResponse: (raw: unknown) => parseListResponse<InventoryEntry>(raw),
      providesTags: ["Products"],
    }),
    adjustInventory: builder.mutation<unknown, { productId: string; adjustment: number; reason?: string }>({
      query: ({ productId, ...body }) => ({ url: `/inventory/adjust/${productId}`, method: "POST", body }),
      invalidatesTags: ["Products", "Dashboard"],
    }),

    /* ── Media ─────────────────────────────────────────────────── */
    uploadMedia: builder.mutation<Record<string, unknown>, FormData>({
      query: (form) => ({ url: "/media/upload", method: "POST", body: form }),
      invalidatesTags: ["Media"],
    }),
    getMedia: builder.query<Array<Record<string, unknown>>, Record<string, string | number | undefined>>({
      query: (params) => ({ url: `/media${buildQs(params)}` }),
      transformResponse: (raw: unknown) => ((Array.isArray(raw) ? raw : (raw as { data?: unknown })?.data ?? []) as Array<Record<string, unknown>>),
      providesTags: ["Media"],
    }),
    deleteMedia: builder.mutation<unknown, string>({
      query: (id) => ({ url: `/media/${id}`, method: "DELETE" }),
      invalidatesTags: ["Media"],
    }),

    /* ── Logs ──────────────────────────────────────────────────── */
    getAdminLogs: builder.query<ListResponse<AdminLog>, Record<string, string | number | undefined>>({
      query: (params) => ({ url: `/logs${buildQs(params)}` }),
      transformResponse: (raw: unknown, meta) => parseListResponse<AdminLog>(raw, meta),
      providesTags: ["Settings"],
    }),
    clearLogs: builder.mutation<unknown, void>({
      query: () => ({ url: "/logs", method: "DELETE" }),
      invalidatesTags: ["Settings"],
    }),

    /* ── Reports ───────────────────────────────────────────────── */
    getSalesReport: builder.query<Record<string, unknown>, Record<string, string | number | undefined>>({
      query: (params) => ({ url: `/reports/sales${buildQs(params)}` }),
      transformResponse: (raw: unknown) => ((raw as { data?: unknown })?.data ?? raw) as Record<string, unknown>,
      providesTags: ["Dashboard"],
    }),
    getInventoryReport: builder.query<Record<string, unknown>, Record<string, string | number | undefined>>({
      query: (params) => ({ url: `/reports/inventory${buildQs(params)}` }),
      transformResponse: (raw: unknown) => ((raw as { data?: unknown })?.data ?? raw) as Record<string, unknown>,
      providesTags: ["Dashboard"],
    }),
    getCustomerReport: builder.query<Record<string, unknown>, Record<string, string | number | undefined>>({
      query: (params) => ({ url: `/reports/customers${buildQs(params)}` }),
      transformResponse: (raw: unknown) => ((raw as { data?: unknown })?.data ?? raw) as Record<string, unknown>,
      providesTags: ["Dashboard"],
    }),
    getPaymentsReport: builder.query<Record<string, unknown>, Record<string, string | number | undefined>>({
      query: (params) => ({ url: `/reports/payments${buildQs(params)}` }),
      transformResponse: (raw: unknown) => ((raw as { data?: unknown })?.data ?? raw) as Record<string, unknown>,
      providesTags: ["Dashboard"],
    }),
    getVendorReport: builder.query<Record<string, unknown>, Record<string, string | number | undefined>>({
      query: (params) => ({ url: `/reports/vendors${buildQs(params)}` }),
      transformResponse: (raw: unknown) => ((raw as { data?: unknown })?.data ?? raw) as Record<string, unknown>,
      providesTags: ["Dashboard"],
    }),
  }),
});

export const {
  // Analytics / Dashboard
  useGetDashboardOverviewQuery,
  useGetRevenueSeriesQuery,
  useGetSalesByCategoryQuery,
  useGetDailyOrdersQuery,
  useGetTopProductsQuery,
  useGetLowStockQuery,
  useGetRecentOrdersQuery,
  useGetRecentReviewsQuery,
  useGetRecentActivityQuery,
  useGetRevenueComparisonQuery,
  // Products
  useGetAdminProductsQuery,
  useGetProductQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  // Orders
  useGetOrdersQuery,
  useGetOrderDetailQuery,
  useUpdateOrderStatusMutation,
  useAddOrderTrackingMutation,
  // Users
  useGetUsersQuery,
  useDeleteUserMutation,
  // Categories
  useGetAdminCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  // Brands
  useGetAdminBrandsQuery,
  useCreateBrandMutation,
  useUpdateBrandMutation,
  useDeleteBrandMutation,
  // Banners
  useGetAdminBannersQuery,
  useCreateBannerMutation,
  useUpdateBannerMutation,
  useDeleteBannerMutation,
  // Blog
  useGetAdminBlogPostsQuery,
  useCreateBlogPostMutation,
  useUpdateBlogPostMutation,
  useDeleteBlogPostMutation,
  // Vendors
  useGetAdminVendorsQuery,
  useUpdateVendorStatusMutation,
  useDeleteVendorMutation,
  // Reviews
  useGetAdminReviewsQuery,
  useModerateReviewMutation,
  // FAQs
  useGetAdminFaqsQuery,
  useCreateFaqMutation,
  useUpdateFaqMutation,
  useDeleteFaqMutation,
  // Newsletter
  useGetAdminSubscribersQuery,
  useDeleteSubscriberMutation,
  // Messages
  useGetAdminMessagesQuery,
  useUpdateMessageMutation,
  useDeleteMessageMutation,
  // Notifications
  useGetAdminNotificationsQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
  useDeleteNotificationMutation,
  // Coupons
  useGetAdminCouponsQuery,
  useCreateCouponMutation,
  useUpdateCouponMutation,
  useDeleteCouponMutation,
  // Shipping
  useGetAdminShippingZonesQuery,
  useCreateShippingZoneMutation,
  useUpdateShippingZoneMutation,
  useDeleteShippingZoneMutation,
  useGetAdminShippingMethodsQuery,
  useCreateShippingMethodMutation,
  useUpdateShippingMethodMutation,
  useDeleteShippingMethodMutation,
  // Payments
  useGetAdminPaymentMethodsQuery,
  useUpdatePaymentMethodMutation,
  useGetAdminTransactionsQuery,
  useUpdateTransactionStatusMutation,
  // Roles
  useGetAdminRolesQuery,
  useCreateRoleMutation,
  useUpdateRoleMutation,
  useDeleteRoleMutation,
  // Pages
  useGetAdminPagesQuery,
  useCreatePageMutation,
  useUpdatePageMutation,
  useDeletePageMutation,
  // Settings
  useGetSettingsQuery,
  useUpdateSettingsMutation,
  // Inventory
  useGetInventoryLowStockQuery,
  useGetInventoryHistoryQuery,
  useAdjustInventoryMutation,
  // Media
  useUploadMediaMutation,
  useGetMediaQuery,
  useDeleteMediaMutation,
  // Logs
  useGetAdminLogsQuery,
  useClearLogsMutation,
  // Reports
  useGetSalesReportQuery,
  useGetInventoryReportQuery,
  useGetCustomerReportQuery,
  useGetPaymentsReportQuery,
  useGetVendorReportQuery,
} = adminApi;
