import { createApi, fetchBaseQuery, type BaseQueryFn, type FetchArgs, type FetchBaseQueryError, type FetchBaseQueryMeta } from "@reduxjs/toolkit/query/react";
import { API_URL } from "../api/config";
import { DEFAULT_STORE_SLUG } from "../store/config";
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
    const state = getState() as RootState;
    const token = state.auth.accessToken;
    if (token) headers.set("Authorization", `Bearer ${token}`);
    const storeSlug = state.store?.slug || DEFAULT_STORE_SLUG;
    headers.set("X-Store-Slug", storeSlug);
    return headers;
  },
});

// Share a refresh only within the same Redux store. Concurrent 401 responses
// must not rotate the refresh cookie independently.
const pendingRefreshes = new WeakMap<object, Promise<void>>();

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

function storeAccessTokenFromResult(
  api: { dispatch: (action: unknown) => void },
  result: { data?: unknown }
) {
  const envelope = result.data as ApiEnvelope | undefined;
  if (envelope?.accessToken) {
    api.dispatch(setAccessToken(envelope.accessToken));
  }
}

export const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError,
  Record<string, unknown>,
  FetchBaseQueryMeta
> = async (args, api, extraOptions) => {
  const getToken = () => (api.getState() as RootState).auth.accessToken;
  const requestToken = getToken();
  let result = await rawBaseQuery(args, api, extraOptions);
  let error = result.error as FetchBaseQueryError | undefined;

  const requestUrl = typeof args === "string" ? args : args.url;
  const isAuthRequest = requestUrl.startsWith("/auth/") && requestUrl !== "/auth/logout";

  if (error && error.status === 401 && !isAuthRequest) {
    if (getToken() === requestToken) {
      let refresh = pendingRefreshes.get(api.dispatch);
      if (!refresh) {
        refresh = (async () => {
          const refreshToken = getToken();
          const refreshResult = await rawBaseQuery(
            { url: "/auth/refresh-token", method: "POST" },
            api,
            extraOptions
          );
          // A login or logout completed while this request was in flight.
          // Its session takes precedence over this older refresh response.
          if (getToken() !== refreshToken) return;
          if (refreshResult.data) {
            storeAccessTokenFromResult(api, refreshResult);
          } else if (refreshResult.error?.status === 401 || refreshResult.error?.status === 403) {
            api.dispatch(clearAuthCookies());
          }
        })().finally(() => pendingRefreshes.delete(api.dispatch));
        pendingRefreshes.set(api.dispatch, refresh);
      }
      await refresh;
    }

    if (getToken()) {
      result = await rawBaseQuery(args, api, extraOptions);
      error = result.error as FetchBaseQueryError | undefined;
    }
  }

  if (error) {
    return { error };
  }

  storeAccessTokenFromResult(api, result as { data?: unknown });

  return unwrapResponse(result as { data?: ApiEnvelope | unknown }, undefined);
};

export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  keepUnusedDataFor: 120,
  refetchOnMountOrArgChange: 60,
  refetchOnFocus: false,
  refetchOnReconnect: true,
  tagTypes: ["Auth", "User", "Products", "Product", "Categories", "Brands", "Media", "Orders", "Dashboard", "Users", "Reviews", "Blog", "Banners", "Reels", "Settings", "Wishlist", "Coupons", "Shipping", "Payments", "Stores"],
  endpoints: () => ({}),
});

export function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
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
    const e = err as { status: number | string; data?: { message?: string } };
    if (e.status === 401) return "Your session has expired. Please log in again.";
    if (e.status === 403) return "You do not have permission to perform this action.";
    if (e.status === 404) return "The requested resource was not found.";
    if (e.status === 408 || e.status === "TIMEOUT_ERROR") return "The request timed out. Please try again.";
    if (e.status === 0 || e.status === "FETCH_ERROR") return "Network error — could not reach the server. Please check your connection and try again.";
    if (e.data?.message) return e.data.message;
  }
  return "Something went wrong. Please try again.";
}
