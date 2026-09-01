"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FiBarChart2, FiChevronRight, FiUser } from "react-icons/fi";
import { useSelector } from "react-redux";
import { Drawer } from "@/components/ui/Drawer";
import { Logo } from "./Logo";
import { useGetMeQuery } from "@/lib/rtk/authApi";
import { useGetStorefrontCategoriesQuery } from "@/lib/rtk/storefrontApi";
import { navLinks } from "@/lib/site";
import { CurrencySelector } from "@/components/layout/CurrencySelector";
import { cn } from "@/lib/utils";

type MobileNavProps = {
  open: boolean;
  onClose: () => void;
};

export function MobileNav({ open, onClose }: MobileNavProps) {
  const pathname = usePathname();
  const { data: user } = useGetMeQuery();
  const { data: categories = [] } = useGetStorefrontCategoriesQuery();
  const isAdmin = user && ["admin", "super_admin", "manager", "editor", "vendor"].includes(user.role);

  return (
    <Drawer
      open={open}
      onClose={onClose}
      side="left"
      size="sm"
      title="Navigation"
      subtitle="Explore NovaMart"
    >
      <div className="flex flex-col gap-6">
        <CurrencySelector />
        {!user && (
          <Link
            href="/login"
            onClick={onClose}
            className="flex items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary-strong"
          >
            <FiUser className="h-4 w-4" aria-hidden />
            Sign in / Register
          </Link>
        )}
        {user && (
          <Link
            href="/account/profile"
            onClick={onClose}
            className="flex items-center gap-3 rounded-xl border border-border bg-card p-3"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/15 text-sm font-bold text-primary">
              {user.name.charAt(0)}
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold text-foreground">
                {user.name}
              </span>
              <span className="block truncate text-xs text-muted-foreground">
                {user.email}
              </span>
            </span>
            <FiChevronRight
              className="ml-auto h-4 w-4 text-muted-foreground"
              aria-hidden
            />
          </Link>
        )}

        {isAdmin && (
          <Link
            href="/admin"
            onClick={onClose}
            className="flex items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary-strong"
          >
            <FiBarChart2 className="h-4 w-4" aria-hidden />
            Admin dashboard
          </Link>
        )}

        <nav aria-label="Mobile primary">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Menu
          </p>
          <ul className="space-y-1">
            {navLinks.map((link) => {
              const active = pathname === link.href;
              return (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    onClick={onClose}
                    className={cn(
                      "flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                      active
                        ? "bg-primary/10 text-primary"
                        : "text-foreground hover:bg-muted"
                    )}
                  >
                    {link.label}
                    <FiChevronRight
                      className="h-4 w-4 text-muted-foreground"
                      aria-hidden
                    />
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Categories
          </p>
          <div className="grid grid-cols-2 gap-2">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/shop?category=${category.slug}`}
                onClick={onClose}
                className="rounded-lg border border-border bg-card px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:border-primary/40 hover:text-primary"
              >
                {category.name}
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-2 border-t border-border pt-5">
          <Logo size="sm" />
          <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
            Premium products, fast shipping, easy returns. Shop the NovaMart
            difference today.
          </p>
        </div>
      </div>
    </Drawer>
  );
}
