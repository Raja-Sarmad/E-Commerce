"use client";

import type { IconType } from "react-icons";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FiAward,
  FiBarChart2,
  FiBell,
  FiBox,
  FiCreditCard,
  FiEdit2,
  FiFileText,
  FiFolder,
  FiGrid,
  FiHelpCircle,
  FiHome,
  FiImage,
  FiLayout,
  FiList,
  FiMail,
  FiMessageSquare,
  FiPackage,
  FiSettings,
  FiShield,
  FiShoppingBag,
  FiStar,
  FiTag,
  FiTruck,
  FiUserCheck,
  FiUsers,
  FiX,
} from "react-icons/fi";
import { Badge } from "@/components/ui/Badge";
import { useGetMeQuery } from "@/lib/rtk/authApi";
import { cn } from "@/lib/utils";

type NavItem = {
  label: string;
  href: string;
  icon: IconType;
  badge?: number;
  badgeVariant?: "primary" | "destructive" | "warning";
  end?: boolean;
};

type NavGroup = {
  label: string;
  items: NavItem[];
};

const navGroups: NavGroup[] = [
  {
    label: "Overview",
    items: [{ label: "Dashboard", href: "/admin", icon: FiHome, end: true }],
  },
  {
    label: "Catalog",
    items: [
      { label: "Catalog overview", href: "/admin/catalog", icon: FiShoppingBag, end: true },
      { label: "Products", href: "/admin/products", icon: FiBox },
      { label: "Categories", href: "/admin/categories", icon: FiGrid },
      { label: "Brands", href: "/admin/brands", icon: FiAward },
    ],
  },
  {
    label: "Sales",
    items: [
      { label: "Orders", href: "/admin/orders", icon: FiShoppingBag },
      { label: "Payments", href: "/admin/payments", icon: FiCreditCard },
      { label: "Shipping", href: "/admin/shipping", icon: FiTruck },
      { label: "Coupons", href: "/admin/coupons", icon: FiTag },
    ],
  },
  {
    label: "Management",
    items: [
      { label: "Customers", href: "/admin/customers", icon: FiUsers },
      { label: "Vendors", href: "/admin/vendors", icon: FiUserCheck },
      { label: "Inventory", href: "/admin/inventory", icon: FiPackage },
      { label: "Reviews", href: "/admin/reviews", icon: FiStar },
    ],
  },
  {
    label: "Content",
    items: [
      { label: "Blog", href: "/admin/blog", icon: FiEdit2 },
      { label: "Banners", href: "/admin/banners", icon: FiImage },
      { label: "Pages", href: "/admin/pages", icon: FiLayout },
      { label: "FAQ", href: "/admin/faq", icon: FiHelpCircle },
    ],
  },
  {
    label: "Engagement",
    items: [
      { label: "Newsletter", href: "/admin/newsletter", icon: FiMail },
      { label: "Messages", href: "/admin/messages", icon: FiMessageSquare },
      { label: "Notifications", href: "/admin/notifications", icon: FiBell },
    ],
  },
  {
    label: "Insights",
    items: [
      { label: "Analytics", href: "/admin/analytics", icon: FiBarChart2 },
      { label: "Reports", href: "/admin/reports", icon: FiFileText },
    ],
  },
  {
    label: "System",
    items: [
      { label: "Roles & Permissions", href: "/admin/roles", icon: FiShield },
      { label: "Media Library", href: "/admin/media", icon: FiFolder },
      { label: "Settings", href: "/admin/settings", icon: FiSettings },
      { label: "Logs", href: "/admin/logs", icon: FiList },
    ],
  },
];

export function isAdminPathActive(pathname: string, item: NavItem) {
  if (item.href === "/admin") {
    return pathname === "/admin";
  }
  return pathname.startsWith(item.href);
}

function SidebarContent({
  collapsed,
  onNavigate,
}: {
  collapsed: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const { data: user } = useGetMeQuery();

  return (
    <div className="flex h-full flex-col">
      <div
        className={cn(
          "flex h-16 shrink-0 items-center gap-3 border-b border-border px-4",
          collapsed && "justify-center px-0"
        )}
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary font-extrabold text-primary-foreground">
          N
        </span>
        {!collapsed && (
          <div className="min-w-0">
            <p className="truncate text-sm font-extrabold tracking-tight text-foreground">
              NovaMart
            </p>
            <p className="truncate text-xs text-muted-foreground">Admin panel</p>
          </div>
        )}
      </div>

      <nav className="flex-1 space-y-5 overflow-y-auto p-3" aria-label="Admin">
        {navGroups.map((group) => (
          <div key={group.label}>
            {!collapsed && (
              <p className="mb-1.5 px-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                {group.label}
              </p>
            )}
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const active = isAdminPathActive(pathname, item);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onNavigate}
                      title={collapsed ? item.label : undefined}
                      className={cn(
                        "group flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                        collapsed && "justify-center px-0",
                        active
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                    >
                      <item.icon
                        className={cn("h-4 w-4 shrink-0", active && "text-primary-foreground")}
                        aria-hidden
                      />
                      {!collapsed && (
                        <>
                          <span className="min-w-0 flex-1 truncate">{item.label}</span>
                          {item.badge != null && item.badge > 0 && (
                            <Badge
                              variant={item.badgeVariant ?? "primary"}
                              className={cn(
                                "h-5 min-w-5 justify-center rounded-full px-1.5 text-[10px]",
                                active && "bg-white/20 text-white"
                              )}
                            >
                              {item.badge}
                            </Badge>
                          )}
                        </>
                      )}
                      {collapsed && item.badge != null && item.badge > 0 && (
                        <span
                          className={cn(
                            "absolute right-1.5 top-1 h-2 w-2 rounded-full",
                            item.badgeVariant === "destructive"
                              ? "bg-destructive"
                              : item.badgeVariant === "warning"
                                ? "bg-warning"
                                : "bg-primary"
                          )}
                        />
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div
        className={cn(
          "shrink-0 border-t border-border p-3",
          collapsed && "px-0 text-center"
        )}
      >
        <div
          className={cn(
            "flex items-center gap-3 rounded-xl bg-muted/50 p-2.5",
            collapsed && "justify-center p-1.5"
          )}
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/15 text-sm font-bold text-primary">
            {user?.name.charAt(0) ?? "A"}
          </span>
          {!collapsed && (
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-foreground">
                {user?.name ?? "Admin"}
              </p>
              <p className="truncate text-xs text-muted-foreground">Super admin</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function AdminSidebar({
  collapsed,
  mobileOpen,
  onMobileClose,
}: {
  collapsed: boolean;
  mobileOpen: boolean;
  onMobileClose: () => void;
}) {
  return (
    <>
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-border bg-card transition-all duration-300 lg:block",
          collapsed && "w-[72px]"
        )}
        aria-label="Admin navigation"
      >
        <SidebarContent collapsed={collapsed} />
      </aside>

      <div
        className={cn(
          "fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-opacity lg:hidden",
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={onMobileClose}
        aria-hidden
      />
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 border-r border-border bg-card transition-transform duration-300 lg:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
        aria-label="Admin mobile navigation"
      >
        <button
          type="button"
          onClick={onMobileClose}
          aria-label="Close navigation"
          className="absolute right-3 top-3.5 z-10 rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <FiX className="h-5 w-5" aria-hidden />
        </button>
        <SidebarContent collapsed={false} onNavigate={onMobileClose} />
      </div>
    </>
  );
}
