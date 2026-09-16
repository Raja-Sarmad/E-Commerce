"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FiChevronRight } from "react-icons/fi";
import { useSelector } from "react-redux";
import { Drawer } from "@/components/ui/Drawer";
import { useGetMeQuery } from "@/lib/rtk/authApi";
import { useGetStorefrontCategoriesQuery } from "@/lib/rtk/storefrontApi";
import { CurrencySelector } from "@/components/layout/CurrencySelector";
import { selectCartCount } from "@/lib/rtk/cartSlice";
import { useMounted } from "@/hooks/use-mounted";
import { cn } from "@/lib/utils";

type MobileNavProps = {
  open: boolean;
  onClose: () => void;
};

export function MobileNav({ open, onClose }: MobileNavProps) {
  const pathname = usePathname();
  const mounted = useMounted();
  const cartCount = useSelector(selectCartCount);
  const { data: user } = useGetMeQuery();
  const { data: categories = [] } = useGetStorefrontCategoriesQuery();
  const isAdmin =
    user &&
    ["admin", "super_admin", "manager", "editor", "vendor", "staff"].includes(
      user.role ?? ""
    );

  return (
    <Drawer
      open={open}
      onClose={onClose}
      side="left"
      size="sm"
      title="Menu"
      subtitle="NovaMart"
    >
      <div className="flex flex-col gap-6">
        <CurrencySelector minimal />

        <nav aria-label="Mobile primary">
          <ul className="space-y-1">
            <li>
              <Link
                href="/#catalog"
                onClick={onClose}
                className={cn(
                  "flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-normal transition-colors",
                  pathname === "/"
                    ? "bg-muted text-foreground"
                    : "text-foreground hover:bg-muted"
                )}
              >
                Catalog
                <FiChevronRight className="h-4 w-4 text-muted-foreground" aria-hidden />
              </Link>
            </li>
            <li>
              <Link
                href="/search"
                onClick={onClose}
                className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-normal text-foreground transition-colors hover:bg-muted"
              >
                Search
                <FiChevronRight className="h-4 w-4 text-muted-foreground" aria-hidden />
              </Link>
            </li>
            {!isAdmin && (
              <li>
                <Link
                  href="/cart"
                  onClick={onClose}
                  className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-normal text-foreground transition-colors hover:bg-muted"
                >
                  Cart ({mounted ? cartCount : 0})
                  <FiChevronRight className="h-4 w-4 text-muted-foreground" aria-hidden />
                </Link>
              </li>
            )}
            {isAdmin ? (
              <li>
                <Link
                  href="/admin"
                  onClick={onClose}
                  className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-normal text-foreground transition-colors hover:bg-muted"
                >
                  Admin
                  <FiChevronRight className="h-4 w-4 text-muted-foreground" aria-hidden />
                </Link>
              </li>
            ) : user ? (
              <li>
                <Link
                  href="/account/profile"
                  onClick={onClose}
                  className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-normal text-foreground transition-colors hover:bg-muted"
                >
                  Account
                  <FiChevronRight className="h-4 w-4 text-muted-foreground" aria-hidden />
                </Link>
              </li>
            ) : (
              <li>
                <Link
                  href="/login"
                  onClick={onClose}
                  className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-normal text-foreground transition-colors hover:bg-muted"
                >
                  Log in
                  <FiChevronRight className="h-4 w-4 text-muted-foreground" aria-hidden />
                </Link>
              </li>
            )}
          </ul>
        </nav>

        {categories.length > 0 && (
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Categories
            </p>
            <div className="grid grid-cols-2 gap-2">
              {categories.slice(0, 8).map((category) => (
                <Link
                  key={category.id}
                  href={`/shop?category=${category.slug}`}
                  onClick={onClose}
                  className="rounded-lg border border-border px-3 py-2.5 text-sm font-normal text-foreground transition-colors hover:bg-muted"
                >
                  {category.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </Drawer>
  );
}
