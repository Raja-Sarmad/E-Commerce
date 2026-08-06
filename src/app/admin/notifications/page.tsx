"use client";

import { useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import {
  FiBell,
  FiCheck,
  FiPackage,
  FiShoppingBag,
  FiStar,
  FiTrash2,
  FiUsers,
} from "react-icons/fi";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { FilterBar } from "@/components/admin/FilterBar";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/context/ToastProvider";
import { notifications } from "@/lib/data/admin";
import type {
  AdminNotification,
  NotificationType,
} from "@/lib/data/admin";
import { cn } from "@/lib/utils";

const typeStyles: Record<
  NotificationType,
  { icon: ReactNode; className: string }
> = {
  order: {
    icon: <FiShoppingBag className="h-5 w-5" aria-hidden />,
    className: "bg-primary/10 text-primary",
  },
  review: {
    icon: <FiStar className="h-5 w-5" aria-hidden />,
    className: "bg-warning/15 text-warning",
  },
  stock: {
    icon: <FiPackage className="h-5 w-5" aria-hidden />,
    className: "bg-destructive/10 text-destructive",
  },
  customer: {
    icon: <FiUsers className="h-5 w-5" aria-hidden />,
    className: "bg-info/10 text-info",
  },
  system: {
    icon: <FiBell className="h-5 w-5" aria-hidden />,
    className: "bg-muted text-muted-foreground",
  },
};

export default function AdminNotificationsPage() {
  const { success, info } = useToast();
  const [items, setItems] = useState<AdminNotification[]>(notifications);
  const [typeFilter, setTypeFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [deleteTarget, setDeleteTarget] =
    useState<AdminNotification | null>(null);

  const unreadCount = useMemo(
    () => items.filter((n) => !n.read).length,
    [items]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((n) => {
      const matchesType = typeFilter === "all" || n.type === typeFilter;
      const matchesQuery =
        !q ||
        n.title.toLowerCase().includes(q) ||
        n.message.toLowerCase().includes(q);
      return matchesType && matchesQuery;
    });
  }, [items, typeFilter, query]);

  const markAllRead = () => {
    if (unreadCount === 0) return;
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
    success("All read", "All notifications were marked as read.");
  };

  const toggleRead = (n: AdminNotification) => {
    const updated = { ...n, read: !n.read };
    setItems((prev) => prev.map((item) => (item.id === n.id ? updated : item)));
    info(
      updated.read ? "Marked as read" : "Marked as unread",
      `“${n.title}”`
    );
  };

  const remove = () => {
    if (!deleteTarget) return;
    setItems((prev) => prev.filter((n) => n.id !== deleteTarget.id));
    success("Notification removed", `“${deleteTarget.title}” was deleted.`);
    setDeleteTarget(null);
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Notifications"
        subtitle={`Stay up to date — ${unreadCount} unread of ${items.length} notifications.`}
        breadcrumb={[{ label: "Notifications" }]}
        actions={
          <>
            <Badge variant={unreadCount > 0 ? "primary" : "outline"} dot>
              {unreadCount} unread
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={markAllRead}
              disabled={unreadCount === 0}
            >
              <FiCheck className="h-4 w-4" aria-hidden />
              Mark all as read
            </Button>
          </>
        }
      />

      <FilterBar
        searchValue={query}
        onSearchChange={setQuery}
        searchPlaceholder="Search by title or message..."
        leftSlot={
          <Select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            containerClassName="sm:w-44"
            className="h-10"
          >
            <option value="all">All types</option>
            <option value="order">Orders</option>
            <option value="review">Reviews</option>
            <option value="stock">Stock</option>
            <option value="customer">Customers</option>
            <option value="system">System</option>
          </Select>
        }
      />

      {filtered.length === 0 ? (
        <EmptyState
          icon={<FiBell className="h-7 w-7" aria-hidden />}
          title="No notifications"
          description="You're all caught up. New notifications will appear here."
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((n) => {
            const style = typeStyles[n.type];
            return (
              <Card key={n.id} className="p-4">
                <div className="flex items-start gap-3">
                  <span
                    className={cn(
                      "mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                      style.className
                    )}
                  >
                    {style.icon}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-2">
                        {!n.read && (
                          <span
                            className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary"
                            aria-label="Unread"
                          />
                        )}
                        <p className="truncate font-semibold text-foreground">
                          {n.title}
                        </p>
                      </div>
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {n.time}
                      </span>
                    </div>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      {n.message}
                    </p>
                    <div className="mt-3 flex items-center gap-2">
                      {n.link && (
                        <Link
                          href={n.link}
                          className="rounded-lg px-2 py-1 text-xs font-semibold text-primary transition-colors hover:bg-primary/10"
                        >
                          View details
                        </Link>
                      )}
                      <button
                        type="button"
                        onClick={() => toggleRead(n)}
                        className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                        aria-label={
                          n.read ? "Mark as unread" : "Mark as read"
                        }
                      >
                        <FiCheck className="h-4 w-4" aria-hidden />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(n)}
                        className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                        aria-label={`Delete ${n.title}`}
                      >
                        <FiTrash2 className="h-4 w-4" aria-hidden />
                      </button>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <ConfirmDialog
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={remove}
        title="Delete notification?"
        description={`This will permanently remove “${deleteTarget?.title}”. This action cannot be undone.`}
        confirmLabel="Delete"
      />
    </div>
  );
}
