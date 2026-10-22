"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { FiEye, FiEyeOff, FiLock, FiMail } from "react-icons/fi";
import { AuthShell, AuthFooter } from "@/components/auth/AuthShell";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useDispatch } from "react-redux";
import { useLoginMutation, useGetMeQuery } from "@/lib/rtk/authApi";
import { baseApi, getErrorMessage } from "@/lib/rtk/baseApi";
import { setStoreSlug } from "@/lib/rtk/storeSlice";
import type { AppDispatch } from "@/lib/rtk/store";
import { toast } from "@/hooks/use-toast";

const demoCredentials = [
  { email: "admin@warqu.com", password: "Warqu@123456", role: "Warqu Admin", store: "warqu" },
  { email: "admin@store.com", password: "Store@123456", role: "Sab Pehno Admin", store: "store" },
  { email: "admin@sabpehno.com", password: "Admin@123456", role: "NovaMart Admin", store: "ecommerce" },
  { email: "john@example.com", password: "User@123456", role: "Customer", store: "ecommerce" },
];

function getRequestedAdminStore() {
  if (typeof window === "undefined") return "store";
  const params = new URLSearchParams(window.location.search);
  const store = params.get("store")?.trim().toLowerCase();
  if (
    store === "store" ||
    store === "ecommerce" ||
    store === "cosmetic" ||
    store === "warqu"
  ) {
    return store;
  }
  // Preserve tenant from ?next=/admin?store=warqu when store param was dropped.
  const next = params.get("next");
  if (next?.startsWith("/")) {
    try {
      const nested = new URL(next, window.location.origin).searchParams.get("store")?.trim().toLowerCase();
      if (
        nested === "store" ||
        nested === "ecommerce" ||
        nested === "cosmetic" ||
        nested === "warqu"
      ) {
        return nested;
      }
    } catch {
      /* ignore */
    }
  }
  return "store";
}

function getNextPath(store: string) {
  const fallback = `/admin?store=${store}`;
  if (typeof window === "undefined") return fallback;
  const params = new URLSearchParams(window.location.search);
  const next = params.get("next");
  if (!next?.startsWith("/") || next.startsWith("//")) return fallback;
  try {
    const url = new URL(next, window.location.origin);
    if (url.origin !== window.location.origin) return fallback;
    if (url.pathname === "/admin" || url.pathname.startsWith("/admin/")) {
      url.searchParams.set("store", store);
    }
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return fallback;
  }
}

export default function LoginPage() {
  const dispatch = useDispatch<AppDispatch>();
  const [loginMutation] = useLoginMutation();
  const { data: user } = useGetMeQuery();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [selectedStore, setSelectedStore] = useState(getRequestedAdminStore);

  const goAdminDashboard = useCallback(() => {
    dispatch(setStoreSlug(selectedStore));
    dispatch(baseApi.util.resetApiState());
    router.replace(getNextPath(selectedStore));
  }, [dispatch, router, selectedStore]);

  useEffect(() => {
    if (!user || loading) return;
    const adminRoles = ["admin", "super_admin", "manager", "staff"];
    if (adminRoles.includes(user.role ?? "")) {
      goAdminDashboard();
    } else {
      router.replace("/account/profile");
    }
  }, [user, loading, router, goAdminDashboard]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError("");
    if (!email.trim() || !password.trim()) {
      setFormError("Please enter your email and password.");
      return;
    }
    setLoading(true);
    try {
      const user = await loginMutation({ email: email.trim(), password }).unwrap();
      toast.success("Welcome back!", "You have signed in successfully.");
      const adminRoles = ["admin", "super_admin", "manager", "staff"];
      if (adminRoles.includes(user.role ?? "")) {
        dispatch(setStoreSlug(selectedStore));
        dispatch(baseApi.util.resetApiState());
        router.push(getNextPath(selectedStore));
      } else {
        router.push("/account/profile");
      }
    } catch (error) {
      const message = getErrorMessage(error);
      setFormError(message);
      toast.error("Sign in failed", message);
    }
    setLoading(false);
  };

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to your account to continue."
      footer={
        <AuthFooter
          text="Don't have an account?"
          linkLabel="Create one now"
          href="/register"
        />
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Email address"
          type="email"
          name="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          leftIcon={<FiMail className="h-4 w-4" aria-hidden />}
          required
        />
        <Input
          label="Password"
          type={showPassword ? "text" : "password"}
          name="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          leftIcon={<FiLock className="h-4 w-4" aria-hidden />}
          rightIcon={
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="text-muted-foreground hover:text-foreground"
            >
              {showPassword ? <FiEyeOff className="h-4 w-4" aria-hidden /> : <FiEye className="h-4 w-4" aria-hidden />}
            </button>
          }
          required
        />
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm text-foreground">
            <input type="checkbox" className="h-4 w-4 rounded border-border accent-primary" />
            Remember me
          </label>
          <a href="/forgot-password" className="text-sm font-semibold text-primary hover:text-primary-strong">
            Forgot password?
          </a>
        </div>
        {formError && (
          <p role="alert" className="rounded-lg bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive">
            {formError}
          </p>
        )}
        <Button type="submit" fullWidth size="lg" loading={loading}>
          {loading ? "Signing in..." : "Sign in"}
        </Button>
      </form>

      <div className="mt-6">
        <div className="flex items-center gap-3">
          <span className="h-px flex-1 bg-border" />
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Demo accounts
          </span>
          <span className="h-px flex-1 bg-border" />
        </div>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {demoCredentials.map((demo) => (
            <button
              key={`${demo.store}-${demo.email}`}
              type="button"
              onClick={() => {
                setEmail(demo.email);
                setPassword(demo.password);
                setSelectedStore(demo.store);
                setFormError("");
              }}
              className="rounded-xl border border-border bg-muted/40 px-3 py-2.5 text-left transition-all hover:border-primary/40 hover:bg-primary/5"
            >
              <p className="text-xs font-bold text-foreground">{demo.role}</p>
              <p className="truncate text-[11px] text-muted-foreground">
                {demo.email} / {demo.password}
              </p>
            </button>
          ))}
        </div>
      </div>
    </AuthShell>
  );
}
