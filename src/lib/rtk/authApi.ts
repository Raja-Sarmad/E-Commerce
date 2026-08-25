import { baseApi } from "./baseApi";
import { normalizeUser, setUser } from "./authSlice";
import type { Order, OrderStatus, OrderItem, User } from "../types";

export type AuthResponse = User;

type RegisterPayload = { name: string; email: string; password: string; phone?: string };
type LoginPayload = { email: string; password: string };

export function normalizeOrder(raw: Record<string, unknown>): Order {
  const rawItems = Array.isArray(raw.items) ? (raw.items as Array<Record<string, unknown>>) : [];
  const items: OrderItem[] = rawItems.map((it) => {
    const img = it.image ? String(it.image) : Array.isArray(it.images) ? String((it.images as string[])[0]) : "";
    return {
      productId: String(it.product ?? it.productId ?? ""),
      name: String(it.name ?? "Product"),
      image: img,
      price: Number(it.price ?? 0),
      quantity: Number(it.quantity ?? 1),
    };
  });
  const subtotal = Number(raw.subtotal ?? items.reduce((s, i) => s + i.price * i.quantity, 0));
  const discount = Number(raw.discount ?? 0);
  const shipping = Number(raw.shipping ?? raw.shippingCost ?? 0);
  const tax = Number(raw.tax ?? 0);
  const total = Number(raw.total ?? subtotal - discount + shipping + tax);
  return {
    id: String(raw._id ?? raw.id ?? ""),
    number: String(raw.number ?? "N/A"),
    items,
    subtotal,
    discount,
    shipping,
    tax,
    total,
    couponCode: raw.couponCode ? String(raw.couponCode) : undefined,
    shippingAddress: (raw.shippingAddress as Order["shippingAddress"]) ?? ({} as Order["shippingAddress"]),
    billingAddress: (raw.billingAddress as Order["billingAddress"]) ?? ({} as Order["billingAddress"]),
    paymentMethod: String(raw.paymentMethod ?? ""),
    deliveryMethod: String(raw.deliveryMethod ?? ""),
    status: (raw.status as OrderStatus) ?? "pending",
    createdAt: String(raw.createdAt ?? new Date().toISOString()),
    estimatedDelivery: raw.estimatedDelivery ? String(raw.estimatedDelivery) : "",
  };
}

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<AuthResponse, LoginPayload>({
      query: (body) => ({ url: "/auth/login", method: "POST", body }),
      transformResponse: (raw: unknown) => normalizeUser(raw as Record<string, unknown>) as User,
      invalidatesTags: ["Auth"],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data: user } = await queryFulfilled;
          if (user) {
            dispatch(setUser(user));
            dispatch(authApi.util.upsertQueryData("getMe", undefined, user));
          }
        } catch {
          // login failed — no cache update
        }
      },
    }),
    register: builder.mutation<AuthResponse, RegisterPayload>({
      query: (body) => ({ url: "/auth/register", method: "POST", body }),
      transformResponse: (raw: unknown) => normalizeUser(raw as Record<string, unknown>) as User,
      invalidatesTags: ["Auth"],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data: user } = await queryFulfilled;
          if (user) {
            dispatch(setUser(user));
            dispatch(authApi.util.upsertQueryData("getMe", undefined, user));
          }
        } catch {
          // register failed — no cache update
        }
      },
    }),
    logout: builder.mutation<void, void>({
      query: () => ({ url: "/auth/logout", method: "POST" }),
      invalidatesTags: ["Auth"],
    }),
    getMe: builder.query<User | null, void>({
      query: () => ({ url: "/users/me" }),
      transformResponse: (raw: unknown) => normalizeUser(raw as Record<string, unknown>) as User | null,
      providesTags: ["Auth", "User"],
    }),
    updateProfile: builder.mutation<User, Partial<Record<string, unknown>>>({
      query: (body) => ({ url: "/users/me", method: "PATCH", body }),
      transformResponse: (raw: unknown) => normalizeUser(raw as Record<string, unknown>) as User,
      invalidatesTags: ["Auth", "User"],
    }),
    updatePassword: builder.mutation<{ message?: string }, { currentPassword: string; newPassword: string }>({
      query: (body) => ({ url: "/users/me/password", method: "PATCH", body }),
    }),
    getMyOrders: builder.query<Order[], void>({
      query: () => ({ url: "/orders/my-orders" }),
      transformResponse: (raw: unknown) =>
        ((raw as Array<Record<string, unknown>>) ?? []).map(normalizeOrder),
      providesTags: ["Orders"],
    }),
    createOrder: builder.mutation<Order, Record<string, unknown>>({
      query: (body) => ({ url: "/orders", method: "POST", body }),
      transformResponse: (raw: unknown) => normalizeOrder(raw as Record<string, unknown>),
      invalidatesTags: ["Orders", "Dashboard"],
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
  useGetMeQuery,
  useUpdateProfileMutation,
  useUpdatePasswordMutation,
  useGetMyOrdersQuery,
  useCreateOrderMutation,
} = authApi;
