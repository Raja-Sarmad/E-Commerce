"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FiSearch } from "react-icons/fi";
import { useSelector } from "react-redux";
import { Logo } from "./Logo";
import { SearchOverlay } from "./SearchOverlay";
import { CartDrawer } from "./CartDrawer";
import { useIsAdmin } from "@/hooks/use-is-admin";
import { useGetMeQuery } from "@/lib/rtk/authApi";
import { selectCartCount } from "@/lib/rtk/cartSlice";
import { CurrencySelector } from "@/components/layout/CurrencySelector";
import { useMounted } from "@/hooks/use-mounted";

export function Navbar() {
  const mounted = useMounted();
  const cartCount = useSelector(selectCartCount);
  const { data: user } = useGetMeQuery();
  const pathname = usePathname();
  const router = useRouter();
  const { isAdmin } = useIsAdmin();

  const [searchOpen, setSearchOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    setCartOpen(false);
  }, [pathname]);

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    router.push(`/search?q=${encodeURIComponent(query.trim())}`);
  };

  const cartLabel = mounted ? `Cart (${cartCount})` : "Cart";

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-border/80 bg-card">
        <div className="mx-auto w-full max-w-7xl px-3 sm:px-4 lg:px-5">
          <div className="grid h-16 grid-cols-[1fr_auto_1fr] items-center gap-2 lg:h-[4.5rem] lg:gap-3">
            <div className="flex min-w-0 items-center gap-3 sm:gap-4">
              <Link
                href="/#catalog"
                className="shrink-0 text-sm font-normal text-foreground transition-opacity hover:opacity-70"
              >
                Catalog
              </Link>

              <form
                onSubmit={handleSearch}
                className="relative hidden w-[148px] shrink-0 sm:block sm:w-[168px] lg:w-[188px]"
                role="search"
              >
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onFocus={() => setSearchOpen(true)}
                  placeholder=""
                  aria-label="Search"
                  className="h-9 w-full rounded-full border border-border/80 bg-transparent pr-9 pl-4 text-sm text-foreground transition-colors focus:border-foreground/30 focus:outline-none"
                />
                <button
                  type="submit"
                  aria-label="Search"
                  className="absolute top-1/2 right-2.5 -translate-y-1/2 text-foreground/70 transition-colors hover:text-foreground"
                >
                  <FiSearch className="h-3.5 w-3.5" aria-hidden />
                </button>
              </form>

              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                aria-label="Search"
                className="shrink-0 p-1 text-foreground transition-opacity hover:opacity-70 sm:hidden"
              >
                <FiSearch className="h-4 w-4" aria-hidden />
              </button>
            </div>

            <Logo variant="script" className="shrink-0" />

            <div className="flex min-w-0 items-center justify-end gap-3 sm:gap-4">
              <CurrencySelector minimal />

              {isAdmin ? (
                <Link
                  href="/admin"
                  className="shrink-0 text-sm font-normal text-foreground transition-opacity hover:opacity-70"
                >
                  Admin
                </Link>
              ) : mounted && user ? (
                <Link
                  href="/account/profile"
                  className="shrink-0 text-sm font-normal text-foreground transition-opacity hover:opacity-70"
                >
                  Account
                </Link>
              ) : (
                <Link
                  href="/login"
                  className="shrink-0 text-sm font-normal text-foreground transition-opacity hover:opacity-70"
                >
                  Log in
                </Link>
              )}

              {!isAdmin && (
                <button
                  type="button"
                  onClick={() => setCartOpen(true)}
                  aria-label={`Open cart, ${mounted ? cartCount : 0} items`}
                  className="shrink-0 text-sm font-normal text-foreground transition-opacity hover:opacity-70"
                >
                  {cartLabel}
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}
