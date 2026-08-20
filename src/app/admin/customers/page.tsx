"use client";

import { useMemo, useState } from "react";
import { FiCheck, FiEye, FiMail, FiUsers, FiX } from "react-icons/fi";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";
import { Modal } from "@/components/ui/Modal";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminAvatar } from "@/components/admin/AdminAvatar";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { FilterBar } from "@/components/admin/FilterBar";
import { ExportButton } from "@/components/admin/ExportButton";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { toast } from "@/hooks/use-toast";
import { useGetUsersQuery } from "@/lib/rtk/adminApi";
import { formatDate, formatNumber, formatPrice } from "@/lib/utils";
import type { User } from "@/lib/types";

const PER_PAGE = 8;

type TierVariant =
  | "default"
  | "primary"
  | "secondary"
  | "accent"
  | "success"
  | "destructive"
  | "warning"
  | "info"
  | "outline";

type CustomerTier = "Bronze" | "Silver" | "Gold" | "Platinum";

const tierVariants: Record<CustomerTier, TierVariant> = {
  Bronze: "secondary",
  Silver: "default",
  Gold: "warning",
  Platinum: "primary",
};

type CustomerExtras = {
  loyaltyPoints: number;
  tier: CustomerTier;
  notes: string;
  status: "active" | "blocked";
  cartHistory: { id: string; date: string; items: number; total: number; converted: boolean }[];
};

const defaultExtras = (): CustomerExtras => ({
  loyaltyPoints: 0,
  tier: "Bronze",
  notes: "",
  status: "active",
  cartHistory: [],
});

type CustomerRow = User & { extras: CustomerExtras };

export default function AdminCustomersPage() {
  const [query, setQuery] = useState("");
  const [tier, setTier] = useState("all");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PER_PAGE);
  const [extras, setExtras] = useState<Record<string, CustomerExtras>>({});
  const [viewUser, setViewUser] = useState<User | null>(null);

  const { data, isLoading } = useGetUsersQuery({
    page,
    limit: pageSize,
    search: query || undefined,
    role: "customer",
  });

  const rows = useMemo<CustomerRow[]>(() => {
    const items = data?.items ?? [];
    return items.map((u) => ({
      ...u,
      extras: extras[u.id] ?? defaultExtras(),
    }));
  }, [data, extras]);

  const tiers = useMemo(
    () => [...new Set(rows.map((r) => r.extras.tier))].sort(),
    [rows]
  );

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      const matchesTier = tier === "all" || r.extras.tier === tier;
      const matchesStatus = status === "all" || r.extras.status === status;
      return matchesTier && matchesStatus;
    });
  }, [rows, tier, status]);

  const totalPages = data?.totalPages ?? Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageItems = filtered;

  const handlePageSize = (size: number) => {
    setPageSize(size);
    setPage(1);
  };

  const toggleBlock = (id: string, name: string) => {
    const current = extras[id] ?? defaultExtras();
    const nextStatus = current.status === "active" ? "blocked" : "active";
    setExtras((prev) => ({
      ...prev,
      [id]: { ...current, status: nextStatus },
    }));
    if (nextStatus === "blocked") {
      toast.warning("Customer blocked", `${name} can no longer place orders.`);
    } else {
      toast.success("Customer unblocked", `${name} can now place orders.`);
    }
  };

  const columns: Column<CustomerRow>[] = [
    {
      key: "customer",
      header: "Customer",
      sortable: true,
      sortValue: (r) => r.name,
      render: (r) => (
        <div className="flex items-center gap-3">
          <AdminAvatar name={r.name} src={r.avatar} size="sm" />
          <div className="min-w-0">
            <p className="truncate font-semibold text-foreground">{r.name}</p>
            <p className="truncate text-xs text-muted-foreground">{r.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "joined",
      header: "Joined",
      sortable: true,
      sortValue: (r) => (r as unknown as { createdAt?: string }).createdAt ?? "",
      render: (r) => (
        <span className="whitespace-nowrap text-muted-foreground">
          {formatDate((r as unknown as { createdAt?: string }).createdAt ?? "")}
        </span>
      ),
    },
    {
      key: "orders",
      header: "Orders",
      align: "center",
      sortable: true,
      sortValue: (r) => r.ordersCount,
      render: (r) => (
        <span className="font-bold text-foreground">{r.ordersCount}</span>
      ),
    },
    {
      key: "spent",
      header: "Total spent",
      align: "right",
      sortable: true,
      sortValue: (r) => r.totalSpent,
      render: (r) => (
        <span className="font-bold text-foreground">
          {formatPrice(r.totalSpent)}
        </span>
      ),
    },
    {
      key: "tier",
      header: "Tier",
      align: "center",
      sortable: true,
      sortValue: (r) => r.extras.tier,
      render: (r) => (
        <Badge variant={tierVariants[r.extras.tier]}>{r.extras.tier}</Badge>
      ),
    },
    {
      key: "status",
      header: "Status",
      align: "center",
      sortable: true,
      sortValue: (r) => r.extras.status,
      render: (r) => (
        <StatusBadge status={r.extras.status} className="capitalize" />
      ),
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      render: (r) => (
        <div className="flex justify-end gap-1">
          <button
            type="button"
            onClick={() => setViewUser(r)}
            className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label={`View ${r.name}`}
          >
            <FiEye className="h-4 w-4" aria-hidden />
          </button>
        </div>
      ),
    },
  ];

  const viewExtras = viewUser ? extras[viewUser.id] ?? defaultExtras() : null;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Customers"
        subtitle={`Manage your registered customers — ${data?.total ?? rows.length} customers total.`}
        breadcrumb={[{ label: "Customers" }]}
        actions={
          <ExportButton
            filename="customers"
            data={filtered.map((r) => ({
              Name: r.name,
              Email: r.email,
              Joined: formatDate((r as unknown as { createdAt?: string }).createdAt ?? ""),
              Orders: r.ordersCount,
              "Total spent": r.totalSpent,
              Tier: r.extras.tier,
              Status: r.extras.status,
              "Loyalty points": r.extras.loyaltyPoints,
            }))}
            disabled={filtered.length === 0}
          />
        }
      />

      <FilterBar
        searchValue={query}
        onSearchChange={(v) => {
          setQuery(v);
          setPage(1);
        }}
        searchPlaceholder="Search by name or email..."
        leftSlot={
          <>
            <Select
              value={tier}
              onChange={(e) => {
                setTier(e.target.value);
                setPage(1);
              }}
              containerClassName="sm:w-40"
              className="h-10"
            >
              <option value="all">All tiers</option>
              {tiers.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </Select>
            <Select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              containerClassName="sm:w-44"
              className="h-10"
            >
              <option value="all">All statuses</option>
              <option value="active">Active</option>
              <option value="blocked">Blocked</option>
            </Select>
          </>
        }
      />

      {isLoading ? (
        <div className="flex items-center justify-center py-20 text-muted-foreground">
          Loading customers…
        </div>
      ) : (
        <DataTable<CustomerRow>
          columns={columns}
          rows={pageItems}
          rowKey={(r) => r.id}
          pagination={{
            page,
            totalPages,
            totalItems: data?.total ?? filtered.length,
            pageSize,
            onPageChange: setPage,
            onPageSizeChange: handlePageSize,
            pageSizeOptions: [8, 16, 24],
          }}
          empty={{
            icon: <FiUsers className="h-7 w-7" aria-hidden />,
            title: "No customers found",
            description: "Try adjusting your search or filters.",
          }}
        />
      )}

      <Modal
        open={viewUser !== null}
        onClose={() => setViewUser(null)}
        title={viewUser?.name ?? "Customer"}
        subtitle={viewUser?.email}
        size="lg"
      >
        {viewUser && viewExtras && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <AdminAvatar name={viewUser.name} src={viewUser.avatar} size="lg" />
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={tierVariants[viewExtras.tier]}>
                      {viewExtras.tier} member
                    </Badge>
                    <StatusBadge status={viewExtras.status} />
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Joined {formatDate((viewUser as unknown as { createdAt?: string }).createdAt ?? "")} · {viewUser.ordersCount} orders ·{" "}
                    <span className="font-semibold text-foreground">
                      {formatPrice(viewUser.totalSpent)}
                    </span>{" "}
                    spent
                  </p>
                </div>
              </div>
              <Button
                variant={viewExtras.status === "active" ? "destructive" : "success"}
                size="sm"
                onClick={() => {
                  toggleBlock(viewUser.id, viewUser.name);
                }}
              >
                {viewExtras.status === "active" ? "Block customer" : "Unblock customer"}
              </Button>
            </div>

            {viewUser.address && (
              <div className="grid gap-4 sm:grid-cols-2">
                <Card className="p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Contact
                  </p>
                  <p className="mt-2 flex items-center gap-1.5 text-sm text-foreground">
                    <FiMail className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />
                    {viewUser.email}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {viewUser.phone ?? "No phone on file"}
                  </p>
                </Card>
                <Card className="p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Loyalty
                  </p>
                  <p className="mt-2 text-2xl font-extrabold text-foreground">
                    {formatNumber(viewExtras.loyaltyPoints)}
                  </p>
                  <p className="text-xs text-muted-foreground">points</p>
                </Card>
              </div>
            )}

            {viewExtras.cartHistory.length > 0 && (
              <div>
                <h3 className="mb-2 text-sm font-semibold text-foreground">
                  Cart history
                </h3>
                <div className="overflow-hidden rounded-xl border border-border">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
                        <tr className="border-b border-border">
                          <th className="px-4 py-2.5 font-semibold">Date</th>
                          <th className="px-4 py-2.5 text-center font-semibold">Items</th>
                          <th className="px-4 py-2.5 text-right font-semibold">Total</th>
                          <th className="px-4 py-2.5 text-center font-semibold">Converted</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {viewExtras.cartHistory.map((cart) => (
                          <tr key={cart.id}>
                            <td className="px-4 py-2.5 text-muted-foreground">
                              {formatDate(cart.date)}
                            </td>
                            <td className="px-4 py-2.5 text-center font-semibold text-foreground">
                              {cart.items}
                            </td>
                            <td className="px-4 py-2.5 text-right font-bold text-foreground">
                              {formatPrice(cart.total)}
                            </td>
                            <td className="px-4 py-2.5 text-center">
                              {cart.converted ? (
                                <span className="inline-flex items-center gap-1 text-success">
                                  <FiCheck className="h-4 w-4" aria-hidden />
                                  <span className="text-xs font-semibold">Yes</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-muted-foreground">
                                  <FiX className="h-4 w-4" aria-hidden />
                                  <span className="text-xs font-semibold">No</span>
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            <div>
              <h3 className="mb-2 text-sm font-semibold text-foreground">Notes</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {viewExtras.notes || "No notes recorded for this customer."}
              </p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
