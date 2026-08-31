import { API_URL, API_TIMEOUT_MS } from "./config";

export type ApiEnvelope<T> = {
  success: boolean;
  statusCode: number;
  message: string;
  data?: T;
  meta?: Record<string, unknown> & { page?: number; limit?: number; total?: number; totalPages?: number };
  errors?: Record<string, string> | string[];
  accessToken?: string;
};

export class ApiError extends Error {
  statusCode: number;
  errors?: Record<string, string> | string[];

  constructor(message: string, statusCode = 500, errors?: Record<string, string> | string[]) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.errors = errors;
  }
}

type FetchOptions = RequestInit & {
  timeoutMs?: number;
};

export async function apiFetch<T>(path: string, options: FetchOptions = {}): Promise<ApiEnvelope<T>> {
  const { timeoutMs = API_TIMEOUT_MS, ...init } = options;
  const url = path.startsWith("http") ? path : `${API_URL}${path.startsWith("/") ? path : `/${path}`}`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      ...init,
      ...(typeof window !== "undefined" ? { signal: controller.signal } : {}),
      credentials: "include",
      headers: {
        Accept: "application/json",
        ...(init.body && typeof init.body === "string" && !(init.headers instanceof Headers) && !init.headers
          ? { "Content-Type": "application/json" }
          : {}),
        ...(init.headers ?? {}),
      },
    });

    let payload: ApiEnvelope<T> | null = null;
    const text = await res.text();
    if (text) {
      try {
        payload = JSON.parse(text) as ApiEnvelope<T>;
      } catch {
        payload = null;
      }
    }

    if (!res.ok || !payload?.success) {
      const message =
        payload?.message ?? (typeof payload === "object" && payload ? "Request failed" : `Request failed (${res.status})`);
      throw new ApiError(message, res.status, payload?.errors);
    }

    return payload;
  } catch (err) {
    if (err instanceof ApiError) throw err;
    if (err instanceof DOMException && err.name === "AbortError") {
      throw new ApiError("Request timed out. Please try again.", 408);
    }
    throw new ApiError("Network error — could not reach the server.", 0);
  } finally {
    clearTimeout(timer);
  }
}

export const apiGet = <T>(path: string, init: FetchOptions = {}) =>
  apiFetch<T>(path, { ...init, method: "GET", cache: "no-store" });

export const apiPost = <T>(path: string, body?: unknown, init: FetchOptions = {}) =>
  apiFetch<T>(path, {
    ...init,
    method: "POST",
    ...(body === undefined
      ? {}
      : { body: body instanceof FormData ? body : JSON.stringify(body) }),
    headers: body instanceof FormData ? { ...(init.headers ?? {}) } : { "Content-Type": "application/json", ...(init.headers ?? {}) },
  });

export const apiPatch = <T>(path: string, body?: unknown, init: FetchOptions = {}) =>
  apiFetch<T>(path, {
    ...init,
    method: "PATCH",
    ...(body === undefined
      ? {}
      : { body: body instanceof FormData ? body : JSON.stringify(body) }),
    headers: body instanceof FormData ? { ...(init.headers ?? {}) } : { "Content-Type": "application/json", ...(init.headers ?? {}) },
  });

export const apiDelete = <T>(path: string, init: FetchOptions = {}) =>
  apiFetch<T>(path, { ...init, method: "DELETE" });

export function unwrapData<T>(envelope: ApiEnvelope<T>): T | undefined {
  return envelope.data;
}

export function normalizeId<T extends { _id?: string }>(doc: T): T & { id: string } {
  const { _id, ...rest } = doc;
  return { ...rest, id: String(_id ?? "") } as T & { id: string };
}
