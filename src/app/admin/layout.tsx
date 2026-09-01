"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminTopbar } from "@/components/admin/AdminTopbar";
import { AdminFooter } from "@/components/admin/AdminFooter";
import { Container } from "@/components/ui/Container";
import { useSelector } from "react-redux";
import { useGetMeQuery } from "@/lib/rtk/authApi";
import { selectCurrencyCode } from "@/lib/rtk/currencySlice";
import { cn } from "@/lib/utils";

const ADMIN_ROLES = ["admin", "super_admin", "manager", "staff"];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { data: user, isLoading } = useGetMeQuery();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const currency = useSelector(selectCurrencyCode);

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.replace("/login");
    } else if (!ADMIN_ROLES.includes(user.role ?? "")) {
      router.replace("/account/profile");
    }
  }, [user, isLoading, router]);

  if (isLoading) {
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
          <div key={currency} className="mx-auto w-full max-w-7xl">
            {children}
          </div>
        </main>
        <AdminFooter />
      </div>
    </div>
  );
}
