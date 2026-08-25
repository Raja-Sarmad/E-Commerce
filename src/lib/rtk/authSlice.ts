import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { User } from "../types";

export function normalizeUser(raw: Record<string, unknown> | null | undefined): User | null {
  if (!raw) return null;
  const id = raw._id ?? raw.id;
  if (!id) return null;
  return {
    id: String(id),
    name: String(raw.name ?? ""),
    email: String(raw.email ?? ""),
    avatar: raw.avatar ? String(raw.avatar) : undefined,
    phone: raw.phone ? String(raw.phone) : undefined,
    address: (raw.address as User["address"]) || undefined,
    role: (raw.role as User["role"]) ?? "customer",
    joinedAt: raw.joinedAt
      ? String(raw.joinedAt)
      : raw.createdAt
        ? String(raw.createdAt)
        : new Date().toISOString(),
    ordersCount: Number(raw.ordersCount ?? 0),
    totalSpent: Number(raw.totalSpent ?? 0),
  };
}

const ACCESS_TOKEN_KEY = "novamart_access_token";

type AuthState = {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  hasHydrated: boolean;
};

const initialState: AuthState = {
  user: null,
  accessToken: null,
  isAuthenticated: false,
  hasHydrated: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
      state.hasHydrated = true;
    },
    setAccessToken: (state, action: PayloadAction<string | null>) => {
      state.accessToken = action.payload;
      if (typeof window !== "undefined") {
        if (action.payload) sessionStorage.setItem(ACCESS_TOKEN_KEY, action.payload);
        else sessionStorage.removeItem(ACCESS_TOKEN_KEY);
      }
    },
    hydrateAccessToken: (state) => {
      if (typeof window === "undefined") return;
      state.accessToken = sessionStorage.getItem(ACCESS_TOKEN_KEY);
    },
    setHydrated: (state) => {
      state.hasHydrated = true;
    },
    clearAuthCookies: (state) => {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
      state.hasHydrated = true;
      if (typeof window !== "undefined") {
        sessionStorage.removeItem(ACCESS_TOKEN_KEY);
      }
    },
  },
});

export const { setUser, setAccessToken, hydrateAccessToken, setHydrated, clearAuthCookies } = authSlice.actions;
export default authSlice.reducer;
