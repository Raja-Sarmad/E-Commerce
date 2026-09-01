"use client";

import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  FiChevronDown,
  FiHeart,
  FiMenu,
  FiMoon,
  FiSearch,
  FiShoppingBag,
  FiSun,
  FiUser,
  FiX,
} from "react-icons/fi";
import { useSelector, useDispatch } from "react-redux";
import { Logo } from "./Logo";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { MobileNav } from "./MobileNav";
import { SearchOverlay } from "./SearchOverlay";
import { CartDrawer } from "./CartDrawer";
import { useTheme } from "@/hooks/use-theme";
import { useIsAdmin } from "@/hooks/use-is-admin";
import {
  useGetMeQuery,
} from "@/lib/rtk/authApi";
import { selectCartCount } from "@/lib/rtk/cartSlice";
import { selectWishlistItems } from "@/lib/rtk/wishlistSlice";
import { navLinks, siteConfig } from "@/lib/site";
import { useGetStorefrontCategoriesQuery } from "@/lib/rtk/storefrontApi";
import { CurrencySelector } from "@/components/layout/CurrencySelector";
import { useMounted } from "@/hooks/use-mounted";
import { cn, formatPrice } from "@/lib/utils";

export function Navbar() {
  const mounted = useMounted();
  const cartCount = useSelector(selectCartCount);
  const wishlistItems = useSelector(selectWishlistItems);
  const { theme, toggleTheme } = useTheme();
  const { data: user } = useGetMeQuery();
  const { data: categories = [] } = useGetStorefrontCategoriesQuery();
  const pathname = usePathname();
  const router = useRouter();

  const { isAdmin } = useIsAdmin();

  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setCartOpen(false);
  }, [pathname]);

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setSearchOpen(false);
    router.push(`/search?q=${encodeURIComponent(query.trim())}`);
  };

  const isHome = pathname === "/";

  return (
    <>
      <header className={cn("sticky top-0 z-50", isHome && !scrolled ? "bg-transparent" : "bg-card/90 backdrop-blur-md border-b border-border")}>
        <div className="transition-all duration-300">
          <Container>
            <div className="flex h-16 items-center gap-3 sm:h-[4.5rem] sm:gap-6">
              <button
                type="button"
                onClick={() => setMobileOpen(true)}
                aria-label="Open navigation menu"
                className="rounded-lg p-2 text-foreground transition-colors hover:bg-muted lg:hidden"
              >
                <FiMenu className="h-6 w-6" aria-hidden />
              </button>

              <Logo />

              <div className="hidden flex-1 items-center justify-center px-4 lg:flex">
                <form
                  onSubmit={handleSearch}
                  className="group relative w-full max-w-xl"
                  role="search"
                >
                  <FiSearch
                    className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground"
                    aria-hidden
                  />
                  <input
                    type="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => setSearchOpen(true)}
                    placeholder="Search products, brands and more..."
                    className="h-11 w-full rounded-full border border-border bg-muted/50 pr-4 pl-12 text-sm text-foreground shadow-sm transition-all placeholder:text-muted-foreground focus:border-primary focus:bg-card focus:outline-none focus:ring-2 focus:ring-primary/20"
                    aria-label="Search products"
                  />
                </form>
              </div>

              <div className="ml-auto flex items-center gap-1 lg:ml-0">
                <button
                  type="button"
                  onClick={() => setSearchOpen(true)}
                  aria-label="Search"
                  className="rounded-lg p-2.5 text-foreground transition-colors hover:bg-muted lg:hidden"
                >
                  <FiSearch className="h-5 w-5" aria-hidden />
                </button>

                <button
                  type="button"
                  onClick={toggleTheme}
                  aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
                  className="rounded-lg p-2.5 text-foreground transition-colors hover:bg-muted"
                >
                  {theme === "light" ? (
                    <FiMoon className="h-5 w-5" aria-hidden />
                  ) : (
                    <FiSun className="h-5 w-5" aria-hidden />
                  )}
                </button>

                <CurrencySelector compact className="hidden sm:block" />

                <Link
                  href="/wishlist"
                  aria-label={`Wishlist, ${mounted ? wishlistItems.length : 0} items`}
                  className="relative hidden rounded-lg p-2.5 text-foreground transition-colors hover:bg-muted sm:block"
                >
                  <FiHeart className="h-5 w-5" aria-hidden />
                  {mounted && wishlistItems.length > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
                      {wishlistItems.length}
                    </span>
                  )}
                </Link>

                <Link
                  href={mounted && user ? "/account/profile" : "/login"}
                  aria-label="Account"
                  className="hidden items-center gap-2 rounded-lg px-2.5 py-2 text-foreground transition-colors hover:bg-muted md:flex"
                >
                  {mounted && user ? (
                    <span className="relative flex h-8 w-8 items-center justify-center rounded-full bg-primary/15 text-sm font-bold text-primary">
                      {user.name.charAt(0)}
                    </span>
                  ) : (
                    <FiUser className="h-5 w-5" aria-hidden />
                  )}
                </Link>

                {isAdmin && (
                  <Link
                    href="/admin"
                    className="hidden rounded-lg px-2.5 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary/10 xl:block"
                  >
                    Admin
                  </Link>
                )}

                {!isAdmin && (
                  <button
                    type="button"
                    onClick={() => setCartOpen(true)}
                    aria-label={`Cart, ${mounted ? cartCount : 0} items`}
                    className="relative rounded-lg p-2.5 text-foreground transition-colors hover:bg-muted"
                  >
                    <FiShoppingBag className="h-5 w-5" aria-hidden />
                    {mounted && cartCount > 0 && (
                      <span className="animate-pulse-ring absolute -top-0.5 -right-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                        {cartCount}
                      </span>
                    )}
                  </button>
                )}
              </div>
            </div>

            <DesktopNav categories={categories} />
          </Container>
        </div>
      </header>

      <MobileNav
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />
      <SearchOverlay
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
      />
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}

function DesktopNav({ categories }: { categories: any[] }) {
  const [megaOpen, setMegaOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    setMegaOpen(false);
  }, [pathname]);

  const handleCategory = (slug: string) => {
    setMegaOpen(false);
    router.push(`/shop?category=${slug}`);
  };

  const renderLink = (label: string, href: string, index: number): ReactNode => {
    const active = pathname === href;
    if (label === "Categories") {
      return (
        <div
          key={label}
          className="relative"
          onMouseEnter={() => setMegaOpen(true)}
          onMouseLeave={() => setMegaOpen(false)}
        >
          <button
            type="button"
            className={cn(
              "flex items-center gap-1 py-2 text-sm font-medium transition-colors",
              active ? "text-primary" : "text-foreground/80 hover:text-primary"
            )}
            aria-expanded={megaOpen}
          >
            {label}
            <FiChevronDown
              className={cn("h-4 w-4 transition-transform", megaOpen && "rotate-180")}
              aria-hidden
            />
          </button>
          {megaOpen && (
            <div className="animate-fade-in absolute left-1/2 top-full w-[680px] -translate-x-1/2 pt-4">
              <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-xl">
                <div className="grid grid-cols-3 gap-6 p-6">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => handleCategory(category.slug)}
                      className="group flex items-start gap-3 text-left"
                    >
                      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-muted text-lg font-bold text-primary transition-colors group-hover:bg-primary/10">
                        {category.name.charAt(0)}
                      </span>
                      <span>
                        <span className="block text-sm font-semibold text-foreground transition-colors group-hover:text-primary">
                          {category.name}
                        </span>
                        <span className="mt-0.5 block text-xs text-muted-foreground">
                          {category.count} products
                        </span>
                      </span>
                    </button>
                  ))}
                </div>
                <div className="flex items-center justify-between border-t border-border bg-muted/40 px-6 py-4">
                  <p className="text-sm font-medium text-foreground">
                    Can&apos;t find what you need?
                  </p>
                  <Link
                    href="/shop"
                    onClick={() => setMegaOpen(false)}
                    className="text-sm font-semibold text-primary hover:text-primary-strong"
                  >
                    Browse all products
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      );
    }
    return (
      <Link
        key={label}
        href={href}
        className={cn(
          "py-2 text-sm font-medium transition-colors",
          active ? "text-primary" : "text-foreground/80 hover:text-primary"
        )}
      >
        {label}
      </Link>
    );
  };

  return (
    <nav
      aria-label="Primary"
      className="hidden h-11 items-center gap-7 border-t border-border lg:flex"
    >
      {navLinks.map((link, i) => renderLink(link.label, link.href, i))}
      <div className="ml-auto hidden items-center gap-4 xl:flex">
        <PromoPill />
        <Button href="/shop?sale=on" size="sm" variant="accent">
          Flash Sale
        </Button>
      </div>
    </nav>
  );
}

function PromoPill() {
  const mounted = useMounted();
  if (!mounted) {
    return (
      <span className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground">
        <span className="relative flex h-2 w-2">
          <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
        </span>
        Free shipping available
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground">
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
      </span>
      Free shipping over {formatPrice(siteConfig.freeShippingThreshold)}
    </span>
  );
}
