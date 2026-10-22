"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminTopbar } from "@/components/admin/AdminTopbar";
import { AdminFooter } from "@/components/admin/AdminFooter";
import { Container } from "@/components/ui/Container";
import { useDispatch, useSelector } from "react-redux";
import { useGetMeQuery } from "@/lib/rtk/authApi";
import { selectCurrencyCode } from "@/lib/rtk/currencySlice";
import { selectStoreSlug, setStoreSlug } from "@/lib/rtk/storeSlice";
import { baseApi } from "@/lib/rtk/baseApi";
import type { AppDispatch } from "@/lib/rtk/store";
import { cn } from "@/lib/utils";
import { useMounted } from "@/hooks/use-mounted";
import { getStoreSlug } from "@/lib/store/config";

const ADMIN_ROLES = ["admin", "super_admin", "manager", "staff"];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const mounted = useMounted();
  const { data: user, isLoading } = useGetMeQuery();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const currency = useSelector(selectCurrencyCode);
  const storeSlug = useSelector(selectStoreSlug);
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const store = params.get("store")?.trim().toLowerCase();
    const nextStore =
      store === "cosmetic" ||
      store === "ecommerce" ||
      store === "store" ||
      store === "warqu"
        ? store
        : getStoreSlug();
    dispatch(setStoreSlug(nextStore));
    dispatch(baseApi.util.resetApiState());

    // Keep ?store= in the URL so refresh / share always opens the same tenant.
    if (store !== nextStore) {
      params.set("store", nextStore);
      const qs = params.toString();
      router.replace(`${window.location.pathname}${qs ? `?${qs}` : ""}`);
    }
  }, [dispatch, router]);

  useEffect(() => {
    if (!mounted || isLoading) return;
    if (!user) {
      router.replace(
        `/login?store=${storeSlug}&next=${encodeURIComponent(`/admin?store=${storeSlug}`)}`
      );
    } else if (!ADMIN_ROLES.includes(user.role ?? "")) {
      router.replace("/account/profile");
    }
  }, [mounted, user, isLoading, router, storeSlug]);

  if (!mounted || isLoading) {
    return (
      <Container className="py-20 text-center text-muted-foreground">
        Verifying admin access...
      </Container>
    );
  }

  if (!user || !ADMIN_ROLES.includes(user.role ?? "")) {
    return (
      <Container className="py-20 text-center text-muted-foreground">
        Verifying admin access...
      </Container>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <AdminSidebar
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />
      <div
        className={cn(
          "flex min-h-screen flex-col transition-all duration-300",
          collapsed ? "lg:pl-[72px]" : "lg:pl-64"
        )}
      >
        <AdminTopbar
          onMenuClick={() => setMobileOpen(true)}
          onToggleCollapse={() => setCollapsed((v) => !v)}
        />
        <main className="flex-1 p-4 lg:p-8">
          <div key={`${currency}-${storeSlug}`} className="mx-auto w-full max-w-7xl">
            {children}
          </div>
        </main>
        <AdminFooter />
      </div>
    </div>
  );
}
