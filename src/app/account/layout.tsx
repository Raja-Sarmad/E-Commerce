"use client";

import { useEffect, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  FiEdit2,
  FiHeart,
  FiLogOut,
  FiPackage,
  FiUser,
} from "react-icons/fi";
import { useGetMeQuery } from "@/lib/rtk/authApi";
import { useLogout } from "@/hooks/use-logout";
import { Container } from "@/components/ui/Container";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { cn } from "@/lib/utils";

const links = [
  { label: "Profile", href: "/account/profile", icon: FiUser },
  { label: "Edit profile", href: "/account/edit", icon: FiEdit2 },
  { label: "Orders", href: "/orders", icon: FiPackage },
  { label: "Wishlist", href: "/wishlist", icon: FiHeart },
];

export default function AccountLayout({ children }: { children: ReactNode }) {
  const { data: user, isLoading } = useGetMeQuery();
  const { logout } = useLogout();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) router.replace("/login");
  }, [user, isLoading, router]);

  if (!user) {
    return (
      <Container className="py-20 text-center text-muted-foreground">
        Loading your account...
      </Container>
    );
  }

  return (
    <Container className="py-6">
      <Breadcrumb items={[{ label: "My Account" }]} />
      <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
        <aside>
          <div className="rounded-2xl border border-border bg-card p-5 lg:sticky lg:top-28">
            <div className="flex items-center gap-3 border-b border-border pb-4">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/15 text-lg font-bold text-primary">
                {user.name.charAt(0)}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-foreground">{user.name}</p>
                <p className="truncate text-xs text-muted-foreground">{user.email}</p>
              </div>
            </div>
            <nav aria-label="Account" className="mt-4 space-y-1">
              {links.map((link) => {
                const active = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                      active
                        ? "bg-primary/10 text-primary"
                        : "text-foreground hover:bg-muted"
                    )}
                  >
                    <link.icon className="h-4 w-4" aria-hidden />
                    {link.label}
                  </Link>
                );
              })}
              <button
                type="button"
                onClick={() => void logout("/")}
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
              >
                <FiLogOut className="h-4 w-4" aria-hidden />
                Sign out
              </button>
            </nav>
          </div>
        </aside>
        <div className="min-w-0">{children}</div>
      </div>
    </Container>
  );
}
