"use client";

import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  FiBell,
  FiBox,
  FiCheck,
  FiChevronDown,
  FiCreditCard,
  FiExternalLink,
  FiGlobe,
  FiHome,
  FiImage,
  FiLogOut,
  FiMail,
  FiMenu,
  FiMessageSquare,
  FiMoon,
  FiPackage,
  FiPenTool,
  FiPlus,
  FiSearch,
  FiSettings,
  FiShoppingBag,
  FiStar,
  FiSun,
  FiTag,
  FiUser,
  FiUsers,
} from "react-icons/fi";
import { Badge } from "@/components/ui/Badge";
import { AdminAvatar } from "@/components/admin/AdminAvatar";
import { useGetMeQuery, useLogoutMutation } from "@/lib/rtk/authApi";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "@/lib/rtk/store";
import { clearAuthCookies } from "@/lib/rtk/authSlice";
import { baseApi } from "@/lib/rtk/baseApi";
import { useTheme } from "@/hooks/use-theme";
import { cn, timeAgo } from "@/lib/utils";
import {
  useGetAdminNotificationsQuery,
  useGetAdminMessagesQuery,
} from "@/lib/rtk/adminApi";

function useClickOutside(
  refs: (React.RefObject<HTMLDivElement | null> | null)[],
  onClose: () => void,
  active: boolean
) {
  useEffect(() => {
    if (!active) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      const inside = refs.some((ref) => ref?.current?.contains(target));
      if (!inside) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [active, refs, onClose]);
}

function Popover({
  trigger,
  open,
  onToggle,
  refs,
  align = "right",
  width = "w-80",
  children,
}: {
  trigger: ReactNode;
  open: boolean;
  onToggle: () => void;
  refs: (React.RefObject<HTMLDivElement | null> | null)[];
  align?: "left" | "right";
  width?: string;
  children: ReactNode;
}) {
  return (
    <div className="relative" ref={refs[0]}>
      {trigger}
      {open && (
        <div
          className={cn(
            "animate-scale-in absolute top-full z-50 mt-2 overflow-hidden rounded-2xl border border-border bg-card shadow-xl",
            align === "right" ? "right-0" : "left-0",
            width
          )}
        >
          {children}
        </div>
      )}
    </div>
  );
}

const languages = [
  { code: "en", label: "English" },
  { code: "fr", label: "Français" },
  { code: "es", label: "Español" },
  { code: "ar", label: "العربية" },
];

const quickActions = [
  { label: "Add product", href: "/admin/products/new", icon: FiPackage },
  { label: "New order", href: "/admin/orders", icon: FiShoppingBag },
  { label: "Write blog post", href: "/admin/blog", icon: FiPenTool },
  { label: "Create coupon", href: "/admin/coupons", icon: FiTag },
  { label: "Upload media", href: "/admin/media", icon: FiImage },
  { label: "Payment methods", href: "/admin/payments", icon: FiCreditCard },
];

export function AdminTopbar({
  onMenuClick,
  onToggleCollapse,
}: {
  onMenuClick: () => void;
  onToggleCollapse: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { data: user } = useGetMeQuery();
  const [logoutMutation] = useLogoutMutation();
  const { theme, toggleTheme } = useTheme();

  const [search, setSearch] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [msgOpen, setMsgOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [quickOpen, setQuickOpen] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const msgRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const langRef = useRef<HTMLDivElement>(null);
  const quickRef = useRef<HTMLDivElement>(null);

  useClickOutside([searchRef], () => setSearchOpen(false), searchOpen);
  useClickOutside([notifRef], () => setNotifOpen(false), notifOpen);
  useClickOutside([msgRef], () => setMsgOpen(false), msgOpen);
  useClickOutside([profileRef], () => setProfileOpen(false), profileOpen);
  useClickOutside([langRef], () => setLangOpen(false), langOpen);
  useClickOutside([quickRef], () => setQuickOpen(false), quickOpen);

  const { data: notifData } = useGetAdminNotificationsQuery();
  const { data: msgData } = useGetAdminMessagesQuery({});
  const notifications = Array.isArray(notifData) ? notifData : [];
  const contactMessages = Array.isArray(msgData?.items) ? msgData.items : [];

  const unread = notifications.filter((n) => !n.read).length;
  const unreadMessages = contactMessages.filter((m: Record<string, unknown>) => m.status === "unread").length;

  const currentPage = navTitle(pathname);

  const goTo = (href: string) => {
    setSearchOpen(false);
    setSearch("");
    router.push(href);
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-2 border-b border-border bg-card/90 px-4 backdrop-blur lg:px-6">
      <button
        type="button"
        onClick={onMenuClick}
        aria-label="Open navigation"
        className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground lg:hidden"
      >
        <FiMenu className="h-5 w-5" aria-hidden />
      </button>
      <button
        type="button"
        onClick={onToggleCollapse}
        aria-label="Toggle sidebar"
        className="hidden rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground lg:inline-flex"
      >
        <FiMenu className="h-5 w-5" aria-hidden />
      </button>

      <div className="hidden min-w-0 md:block">
        <p className="truncate text-sm font-bold text-foreground">{currentPage}</p>
        <Link
          href="/"
          className="flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-primary"
        >
          <FiHome className="h-3 w-3" aria-hidden />
          NovaMart storefront
        </Link>
      </div>

      <div className="ml-auto flex items-center gap-1.5">
        <div className="relative hidden lg:block" ref={searchRef}>
          <FiSearch
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setSearchOpen(true);
            }}
            onFocus={() => setSearchOpen(true)}
            placeholder="Search admin..."
            className="h-10 w-56 rounded-lg border border-border bg-muted/40 pl-9 pr-3 text-sm text-foreground transition-all placeholder:text-muted-foreground/70 focus:w-72 focus:border-ring focus:bg-card focus:outline-none focus:ring-2 focus:ring-ring/40"
            aria-label="Search admin"
          />
          {searchOpen && (
            <div className="animate-scale-in absolute right-0 top-full z-50 mt-2 w-96 overflow-hidden rounded-2xl border border-border bg-card shadow-xl">
              <div className="border-b border-border px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Quick navigation
              </div>
              <ul className="p-1.5">
                {[
                  { href: "/admin/products", icon: <FiBox className="h-4 w-4" aria-hidden />, title: "Products" },
                  { href: "/admin/orders", icon: <FiShoppingBag className="h-4 w-4" aria-hidden />, title: "Orders" },
                  { href: "/admin/customers", icon: <FiUsers className="h-4 w-4" aria-hidden />, title: "Customers" },
                  { href: "/admin/blog", icon: <FiPenTool className="h-4 w-4" aria-hidden />, title: "Blog posts" },
                  { href: "/admin/categories", icon: <FiPackage className="h-4 w-4" aria-hidden />, title: "Categories" },
                  { href: "/admin/settings", icon: <FiSettings className="h-4 w-4" aria-hidden />, title: "Settings" },
                ].filter((r) => !search.trim() || r.title.toLowerCase().includes(search.trim().toLowerCase())).map((r) => (
                    <li key={r.href}>
                      <button
                        type="button"
                        onClick={() => goTo(r.href)}
                        className="flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left transition-colors hover:bg-muted"
                      >
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                          {r.icon}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-semibold text-foreground">
                            {r.title}
                          </span>
                        </span>
                        <FiExternalLink
                          className="h-3.5 w-3.5 shrink-0 text-muted-foreground/50"
                          aria-hidden
                        />
                      </button>
                    </li>
                  ))}
              </ul>
            </div>
          )}
        </div>

        <Popover
          open={quickOpen}
          onToggle={() => setQuickOpen((v) => !v)}
          refs={[quickRef]}
          width="w-56"
          trigger={
            <button
              type="button"
              aria-label="Quick actions"
              onClick={() => setQuickOpen((v) => !v)}
              className={cn(
                "rounded-lg p-2 transition-colors hover:bg-muted hover:text-foreground",
                quickOpen ? "bg-muted text-foreground" : "text-muted-foreground"
              )}
            >
              <FiPlus className="h-5 w-5" aria-hidden />
            </button>
          }
        >
          <div className="border-b border-border px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Quick actions
          </div>
          <ul className="p-1.5">
            {quickActions.map((action) => (
              <li key={action.label}>
                <Link
                  href={action.href}
                  onClick={() => setQuickOpen(false)}
                  className="flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm text-foreground transition-colors hover:bg-muted"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <action.icon className="h-4 w-4" aria-hidden />
                  </span>
                  {action.label}
                </Link>
              </li>
            ))}
          </ul>
        </Popover>

        <Popover
          open={langOpen}
          onToggle={() => setLangOpen((v) => !v)}
          refs={[langRef]}
          width="w-44"
          trigger={
            <button
              type="button"
              aria-label="Change language"
              onClick={() => setLangOpen((v) => !v)}
              className={cn(
                "rounded-lg p-2 transition-colors hover:bg-muted hover:text-foreground",
                langOpen ? "bg-muted text-foreground" : "text-muted-foreground"
              )}
            >
              <FiGlobe className="h-5 w-5" aria-hidden />
            </button>
          }
        >
          <div className="border-b border-border px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Language
          </div>
          <ul className="p-1.5">
            {languages.map((lang) => (
              <li key={lang.code}>
                <button
                  type="button"
                  onClick={() => setLangOpen(false)}
                  className="flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-sm text-foreground transition-colors hover:bg-muted"
                >
                  {lang.label}
                  {lang.code === "en" && (
                    <FiCheck className="h-4 w-4 text-primary" aria-hidden />
                  )}
                </button>
              </li>
            ))}
          </ul>
        </Popover>

        <button
          type="button"
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          {theme === "dark" ? (
            <FiSun className="h-5 w-5" aria-hidden />
          ) : (
            <FiMoon className="h-5 w-5" aria-hidden />
          )}
        </button>

        <Popover
          open={notifOpen}
          onToggle={() => setNotifOpen((v) => !v)}
          refs={[notifRef]}
          trigger={
            <button
              type="button"
              aria-label="Notifications"
              onClick={() => setNotifOpen((v) => !v)}
              className={cn(
                "relative rounded-lg p-2 transition-colors hover:bg-muted hover:text-foreground",
                notifOpen ? "bg-muted text-foreground" : "text-muted-foreground"
              )}
            >
              <FiBell className="h-5 w-5" aria-hidden />
              {unread > 0 && (
                <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-white">
                  {unread}
                </span>
              )}
            </button>
          }
        >
          <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Notifications
            </p>
            <Link
              href="/admin/notifications"
              onClick={() => setNotifOpen(false)}
              className="text-xs font-semibold text-primary hover:text-primary-strong"
            >
              View all
            </Link>
          </div>
          <ul className="max-h-80 overflow-y-auto divide-y divide-border">
            {notifications.slice(0, 5).map((n) => (
              <li key={n._id}>
                <Link
                  href={n.link ?? "/admin/notifications"}
                  onClick={() => setNotifOpen(false)}
                  className="flex items-start gap-3 px-4 py-3 transition-colors hover:bg-muted"
                >
                  <span
                    className={cn(
                      "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                      n.type === "order"
                        ? "bg-primary/10 text-primary"
                        : n.type === "review"
                          ? "bg-warning/15 text-warning"
                          : n.type === "stock"
                            ? "bg-destructive/10 text-destructive"
                            : "bg-info/10 text-info"
                    )}
                  >
                    {n.type === "order" ? (
                      <FiShoppingBag className="h-4 w-4" aria-hidden />
                    ) : n.type === "review" ? (
                      <FiStar className="h-4 w-4" aria-hidden />
                    ) : n.type === "stock" ? (
                      <FiPackage className="h-4 w-4" aria-hidden />
                    ) : (
                      <FiBell className="h-4 w-4" aria-hidden />
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-foreground">
                      {n.title}
                    </span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {n.message}
                    </span>
                    <span className="mt-0.5 block text-[11px] text-muted-foreground/70">
                      {timeAgo(n.createdAt)}
                    </span>
                  </span>
                  {!n.read && (
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" aria-hidden />
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </Popover>

        <Popover
          open={msgOpen}
          onToggle={() => setMsgOpen((v) => !v)}
          refs={[msgRef]}
          trigger={
            <button
              type="button"
              aria-label="Messages"
              onClick={() => setMsgOpen((v) => !v)}
              className={cn(
                "relative rounded-lg p-2 transition-colors hover:bg-muted hover:text-foreground",
                msgOpen ? "bg-muted text-foreground" : "text-muted-foreground"
              )}
            >
              <FiMessageSquare className="h-5 w-5" aria-hidden />
              {unreadMessages > 0 && (
                <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-white">
                  {unreadMessages}
                </span>
              )}
            </button>
          }
        >
          <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Messages
            </p>
            <Link
              href="/admin/messages"
              onClick={() => setMsgOpen(false)}
              className="text-xs font-semibold text-primary hover:text-primary-strong"
            >
              View all
            </Link>
          </div>
          <ul className="max-h-80 divide-y divide-border overflow-y-auto">
            {contactMessages.slice(0, 5).map((m: Record<string, unknown>) => (
              <li key={String(m._id)}>
                <Link
                  href="/admin/messages"
                  onClick={() => setMsgOpen(false)}
                  className="flex items-start gap-3 px-4 py-3 transition-colors hover:bg-muted"
                >
                  <AdminAvatar name={String(m.name ?? "")} size="sm" />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center justify-between gap-2">
                      <span className="truncate text-sm font-semibold text-foreground">
                        {String(m.name ?? "")}
                      </span>
                      <span className="shrink-0 text-[11px] text-muted-foreground/70">
                        {timeAgo(String(m.createdAt ?? ""))}
                      </span>
                    </span>
                    <span className="block truncate text-xs font-medium text-foreground">
                      {String(m.subject ?? "")}
                    </span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {String(m.message ?? "")}
                    </span>
                  </span>
                  {m.status === "unread" && (
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" aria-hidden />
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </Popover>

        <div className="mx-1 hidden h-6 w-px bg-border sm:block" aria-hidden />

        <Popover
          open={profileOpen}
          onToggle={() => setProfileOpen((v) => !v)}
          refs={[profileRef]}
          width="w-64"
          trigger={
            <button
              type="button"
              aria-label="Profile menu"
              onClick={() => setProfileOpen((v) => !v)}
              className="flex items-center gap-2 rounded-lg p-1.5 transition-colors hover:bg-muted"
            >
              <AdminAvatar name={user?.name ?? "Admin"} size="sm" />
              <span className="hidden text-left sm:block">
                <span className="block max-w-[120px] truncate text-sm font-semibold text-foreground">
                  {user?.name ?? "Admin"}
                </span>
                <span className="block text-xs text-muted-foreground">Administrator</span>
              </span>
              <FiChevronDown className="hidden h-4 w-4 text-muted-foreground sm:block" aria-hidden />
            </button>
          }
        >
          <div className="border-b border-border px-4 py-3">
            <p className="truncate text-sm font-bold text-foreground">
              {user?.name ?? "Admin"}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {user?.email ?? "admin@novamart.com"}
            </p>
          </div>
          <ul className="p-1.5">
            {[
              { label: "My profile", href: "/admin/settings", icon: FiUser },
              { label: "Account settings", href: "/admin/settings", icon: FiSettings },
              { label: "Inbox", href: "/admin/messages", icon: FiMail },
            ].map((item) => (
              <li key={item.label}>
                <Link
                  href={item.href}
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-foreground transition-colors hover:bg-muted"
                >
                  <item.icon className="h-4 w-4 text-muted-foreground" aria-hidden />
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="border-t border-border p-1.5">
            <button
              type="button"
              onClick={async () => {
                try {
                  await logoutMutation().unwrap();
                } catch {
                  // Ignore errors — clear local state anyway
                }
                dispatch(clearAuthCookies());
                dispatch(baseApi.util.resetApiState());
                router.push("/login");
              }}
              className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
            >
              <FiLogOut className="h-4 w-4" aria-hidden />
              Sign out
            </button>
          </div>
        </Popover>
      </div>
    </header>
  );
}

function navTitle(pathname: string): string {
  if (pathname === "/admin") return "Dashboard";
  const segment = pathname.replace("/admin/", "").split("/")[0];
  if (!segment) return "Dashboard";
  const map: Record<string, string> = {
    products: "Products",
    categories: "Categories",
    brands: "Brands",
    orders: "Orders",
    payments: "Payments",
    shipping: "Shipping",
    coupons: "Coupons",
    customers: "Customers",
    vendors: "Vendors",
    inventory: "Inventory",
    reviews: "Reviews",
    blog: "Blog",
    banners: "Banners",
    pages: "Pages",
    faq: "FAQ",
    newsletter: "Newsletter",
    messages: "Messages",
    notifications: "Notifications",
    analytics: "Analytics",
    reports: "Reports",
    roles: "Roles & Permissions",
    media: "Media Library",
    settings: "Settings",
    logs: "Logs",
  };
  return map[segment] ?? segment;
}
