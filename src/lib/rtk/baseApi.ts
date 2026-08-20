import { createApi, fetchBaseQuery, type BaseQueryFn, type FetchArgs, type FetchBaseQueryError, type FetchBaseQueryMeta } from "@reduxjs/toolkit/query/react";
import { API_URL } from "../api/config";
import { clearAuthCookies } from "./authSlice";

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
});

const unwrapResponse = (result: { data?: ApiEnvelope | unknown }, meta?: unknown) => {
  const envelope = result.data as ApiEnvelope | undefined;
  if (envelope && typeof envelope === "object" && "success" in envelope) {
    return { data: envelope.data as never, meta: envelope.meta as never };
  }
  return { data: result.data as never, meta: meta as never };
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

  return unwrapResponse(result as { data?: ApiEnvelope | unknown }, undefined);
};

export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Auth", "User", "Products", "Product", "Categories", "Brands", "Media", "Orders", "Dashboard", "Users", "Reviews", "Blog", "Banners", "Settings", "Wishlist", "Coupons", "Shipping", "Payments"],
  endpoints: () => ({}),
});

export function getErrorMessage(err: unknown): string {
  if (err && typeof err === "object" && "data" in err) {
    const data = (err as { data?: { message?: string } }).data;
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
