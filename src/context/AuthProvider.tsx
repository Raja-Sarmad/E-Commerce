"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { User } from "@/lib/types";

type AuthContextValue = {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const STORAGE_KEY = "novamart-user";

type StoredAuth = { user: User };

const demoUser: User = {
  id: "us-cust-1",
  name: "Rachel Greene",
  email: "rachel@novamart.com",
  avatar: "https://picsum.photos/seed/av-rg/80/80",
  phone: "+1 555 010 2233",
  address: {
    firstName: "Rachel",
    lastName: "Greene",
    address: "48 Rosewood Lane",
    city: "Austin",
    state: "TX",
    zip: "73301",
    country: "United States",
    phone: "+1 555 010 2233",
  },
  role: "customer",
  joinedAt: "2024-03-22T10:00:00Z",
  ordersCount: 7,
  totalSpent: 1284.2,
};

const demoAdmin: User = {
  id: "us-admin-1",
  name: "Admin User",
  email: "admin@novamart.com",
  avatar: "https://picsum.photos/seed/admin/80/80",
  role: "admin",
  joinedAt: "2023-01-15T10:00:00Z",
  ordersCount: 12,
  totalSpent: 3890.5,
};

function readStorage(): User | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredAuth;
    return parsed.user ?? null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setUser(readStorage());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (user) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ user }));
    } else {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, [user, hydrated]);

  const login = useCallback(async (email: string, password: string) => {
    await new Promise((resolve) => setTimeout(resolve, 600));
    const normalized = email.trim().toLowerCase();
    if (normalized === "admin@novamart.com" && password.length > 0) {
      setUser(demoAdmin);
      return true;
    }
    if (normalized === "rachel@novamart.com" || password.length >= 6) {
      setUser({ ...demoUser, email: normalized });
      return true;
    }
    return false;
  }, []);

  const register = useCallback(
    async (name: string, email: string, _password: string) => {
      await new Promise((resolve) => setTimeout(resolve, 600));
      setUser({
        ...demoUser,
        name,
        email: email.trim().toLowerCase(),
        id: `us-${Date.now()}`,
      });
      return true;
    },
    []
  );

  const logout = useCallback(() => setUser(null), []);

  const updateProfile = useCallback((data: Partial<User>) => {
    setUser((prev) => (prev ? { ...prev, ...data } : prev));
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: !!user,
      isAdmin: user?.role === "admin",
      login,
      register,
      logout,
      updateProfile,
    }),
    [user, login, register, logout, updateProfile]
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
