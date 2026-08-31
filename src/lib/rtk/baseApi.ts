import { createApi, fetchBaseQuery, type BaseQueryFn, type FetchArgs, type FetchBaseQueryError, type FetchBaseQueryMeta } from "@reduxjs/toolkit/query/react";
import { API_URL } from "../api/config";
import { clearAuthCookies, setAccessToken } from "./authSlice";
import type { RootState } from "./store";

export type ApiEnvelope = {
  success: boolean;
  statusCode: number;
  message: string;
  data?: unknown;
  meta?: unknown;
  accessToken?: string;
};

const rawBaseQuery = fetchBaseQuery({
  baseUrl: API_URL,
  credentials: "include",
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.accessToken;
    if (token) headers.set("Authorization", `Bearer ${token}`);
    return headers;
  },
});

const unwrapResponse = (result: { data?: ApiEnvelope | unknown }, meta?: unknown) => {
  const envelope = result.data as ApiEnvelope | undefined;
  if (envelope && typeof envelope === "object" && "success" in envelope) {
    return {
      data: (envelope.data ?? null) as never,
      meta: (envelope.meta ?? undefined) as never,
    };
  }
  return { data: (result.data ?? null) as never, meta: meta as never };
};

export const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError,
  Record<string, unknown>,
  FetchBaseQueryMeta
> = async (args, api, extraOptions) => {
  let result = await rawBaseQuery(args, api, extraOptions);
  let error = result.error as FetchBaseQueryError | undefined;

  if (error && error.status === 401) {
    const refreshResult = await rawBaseQuery(
      { url: "/auth/refresh-token", method: "POST" },
      api,
      extraOptions
    );

    if (refreshResult.data) {
      result = await rawBaseQuery(args, api, extraOptions);
      error = result.error as FetchBaseQueryError | undefined;
    } else {
      api.dispatch(clearAuthCookies());
    }
  }

  if (error) {
    return { error };
  }

  const envelope = (result as { data?: ApiEnvelope }).data;
  if (envelope?.accessToken) {
    api.dispatch(setAccessToken(envelope.accessToken));
  }

  return unwrapResponse(result as { data?: ApiEnvelope | unknown }, undefined);
};

export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  keepUnusedDataFor: 120,
  refetchOnMountOrArgChange: 60,
  refetchOnFocus: false,
  refetchOnReconnect: true,
  tagTypes: ["Auth", "User", "Products", "Product", "Categories", "Brands", "Media", "Orders", "Dashboard", "Users", "Reviews", "Blog", "Banners", "Settings", "Wishlist", "Coupons", "Shipping", "Payments"],
  endpoints: () => ({}),
});

export function getErrorMessage(err: unknown): string {
  if (err && typeof err === "object" && "data" in err) {
    const data = (err as {
      data?: {
        message?: string;
        details?: Array<{ field?: string; message?: string }>;
      };
    }).data;
    if (data?.details?.length) {
      const detailText = data.details
        .map((d) => d.message)
        .filter(Boolean)
        .join(" ");
      if (detailText) return detailText;
    }
    if (data?.message) return data.message;
  }
  if (err && typeof err === "object" && "status" in err) {
    const e = err as { status: number; data?: { message?: string } };
    if (e.status === 401) return "Your session has expired. Please log in again.";
    if (e.status === 403) return "You do not have permission to perform this action.";
    if (e.status === 404) return "The requested resource was not found.";
    if (e.status === 408) return "The request timed out. Please try again.";
    if (e.status === 0) return "Network error — could not reach the server.";
    if (e.data?.message) return e.data.message;
  }
  return "Something went wrong. Please try again.";
}
