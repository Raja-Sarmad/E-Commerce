"use client";

import { useMemo, useState, type ReactNode } from "react";
import { FiCheck, FiDollarSign, FiEye, FiPackage, FiPlus, FiStar, FiUserCheck, FiUsers } from "react-icons/fi";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Modal } from "@/components/ui/Modal";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminAvatar } from "@/components/admin/AdminAvatar";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { FilterBar } from "@/components/admin/FilterBar";
import { ExportButton } from "@/components/admin/ExportButton";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { toast } from "@/hooks/use-toast";
import {
  useGetAdminVendorsQuery,
  useUpdateVendorStatusMutation,
  useDeleteVendorMutation,
} from "@/lib/rtk/adminApi";
import type { AdminVendor } from "@/lib/rtk/adminApi";
import { formatDate, formatPrice } from "@/lib/utils";

const PER_PAGE = 8;

type Vendor = {
  id: string;
  name: string;
  logo: string;
  email: string;
  phone: string;
  productsCount: number;
  totalEarnings: number;
  pendingPayout: number;
  rating: number;
  verified: boolean;
  joinedAt: string;
  status: "active" | "pending" | "suspended";
  description: string;
};

function toVendor(v: AdminVendor): Vendor {
  return {
    id: v._id,
    name: v.name,
    logo: v.logo,
    email: v.email,
    phone: v.phone,
    productsCount: v.productsCount,
    totalEarnings: v.totalEarnings,
    pendingPayout: v.pendingPayout,
    rating: v.rating,
    verified: v.verified,
    joinedAt: v.createdAt,
    status: v.status as Vendor["status"],
    description: v.description,
  };
}

function StatCard({
  icon,
  label,
  value,
  tone,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  tone: string;
}) {
  return (
    <Card className="p-5">
      <div className="flex items-center gap-3">
        <span
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${tone}`}
        >
          {icon}
        </span>
        <div className="min-w-0">
          <p className="truncate text-xl font-extrabold text-foreground">{value}</p>
          <p className="truncate text-xs text-muted-foreground">{label}</p>
        </div>
      </div>
    </Card>
  );
}

export default function AdminVendorsPage() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PER_PAGE);
  const [viewVendor, setViewVendor] = useState<Vendor | null>(null);

  const { data, isLoading } = useGetAdminVendorsQuery({
    page,
    limit: pageSize,
    search: query || undefined,
    status: status !== "all" ? status : undefined,
  });
  const [updateVendorStatus] = useUpdateVendorStatusMutation();
  const [deleteVendor] = useDeleteVendorMutation();

  const vendors = useMemo(() => {
    return (data?.items ?? []).map(toVendor);
  }, [data]);

  const activeCount = vendors.filter((v) => v.status === "active").length;
  const pendingCount = vendors.filter((v) => v.status === "pending").length;
  const totalEarnings = vendors.reduce((sum, v) => sum + v.totalEarnings, 0);
  const totalPayout = vendors.reduce((sum, v) => sum + v.pendingPayout, 0);

  const filtered = vendors;

  const totalPages = data?.totalPages ?? Math.max(1, Math.ceil((data?.total ?? 0) / pageSize));
  const totalItems = data?.total ?? filtered.length;

  const handlePageSize = (size: number) => {
    setPageSize(size);
    setPage(1);
  };

  const changeStatus = (id: string, next: Vendor["status"]) => {
    updateVendorStatus({ id, status: next })
      .unwrap()
      .then(() => {
        const vendor = vendors.find((v) => v.id === id);
        toast.info("Status updated", `"${vendor?.name}" is now ${next}.`);
      })
      .catch(() => {
        toast.warning("Error", "Failed to update vendor status.");
      });
  };

  const columns: Column<Vendor>[] = [
    {
      key: "vendor",
      header: "Vendor",
      sortable: true,
      sortValue: (v) => v.name,
      render: (v) => (
        <div className="flex items-center gap-3">
          <AdminAvatar name={v.name} src={v.logo} size="sm" />
          <div className="min-w-0">
            <p className="truncate font-semibold text-foreground">{v.name}</p>
            <p className="max-w-[220px] truncate text-xs text-muted-foreground">
              {v.description}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "contact",
      header: "Contact",
      render: (v) => (
        <span className="max-w-[200px] truncate text-muted-foreground">{v.email}</span>
      ),
    },
    {
      key: "products",
      header: "Products",
      align: "center",
      sortable: true,
      sortValue: (v) => v.productsCount,
      render: (v) => (
        <span className="font-bold text-foreground">{v.productsCount}</span>
      ),
    },
    {
      key: "earnings",
      header: "Earnings",
      align: "right",
      sortable: true,
      sortValue: (v) => v.totalEarnings,
      render: (v) => (
        <span className="font-bold text-foreground">
          {formatPrice(v.totalEarnings)}
        </span>
      ),
    },
    {
      key: "payout",
      header: "Pending payout",
      align: "right",
      sortable: true,
      sortValue: (v) => v.pendingPayout,
      render: (v) => (
        <span className="font-semibold text-warning">
          {formatPrice(v.pendingPayout)}
        </span>
      ),
    },
    {
      key: "rating",
      header: "Rating",
      align: "center",
      sortable: true,
      sortValue: (v) => v.rating,
      render: (v) =>
        v.rating > 0 ? (
          <span className="flex items-center justify-center gap-1 whitespace-nowrap text-foreground">
            <FiStar className="h-3.5 w-3.5 text-warning" aria-hidden />
            {v.rating.toFixed(1)}
          </span>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
    {
      key: "status",
      header: "Status",
      align: "center",
      sortable: true,
      sortValue: (v) => v.status,
      render: (v) => <StatusBadge status={v.status} className="capitalize" />,
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      render: (v) => (
        <div className="flex items-center justify-end gap-1">
          <Select
            value={v.status}
            onChange={(e) => changeStatus(v.id, e.target.value as Vendor["status"])}
            containerClassName="w-28"
            className="h-8 text-xs"
            aria-label={`Change status for ${v.name}`}
          >
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="suspended">Suspended</option>
          </Select>
          <button
            type="button"
            onClick={() => setViewVendor(v)}
            className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label={`View ${v.name}`}
          >
            <FiEye className="h-4 w-4" aria-hidden />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Vendors"
        subtitle={`Manage marketplace vendors — ${totalItems} total, ${pendingCount} awaiting approval.`}
        breadcrumb={[{ label: "Vendors" }]}
        actions={
          <>
            <ExportButton
              filename="vendors"
              data={filtered.map((v) => ({
                Name: v.name,
                Email: v.email,
                Phone: v.phone,
                Products: v.productsCount,
                Earnings: v.totalEarnings,
                "Pending payout": v.pendingPayout,
                Rating: v.rating,
                Status: v.status,
                Verified: v.verified ? "Yes" : "No",
              }))}
              disabled={filtered.length === 0}
            />
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={<FiUserCheck className="h-5 w-5" aria-hidden />}
          label="Active vendors"
          value={String(activeCount)}
          tone="bg-success/10 text-success"
        />
        <StatCard
          icon={<FiUsers className="h-5 w-5" aria-hidden />}
          label="Pending approvals"
          value={String(pendingCount)}
          tone="bg-warning/15 text-warning"
        />
        <StatCard
          icon={<FiDollarSign className="h-5 w-5" aria-hidden />}
          label="Total earnings"
          value={formatPrice(totalEarnings)}
          tone="bg-primary/10 text-primary"
        />
        <StatCard
          icon={<FiPackage className="h-5 w-5" aria-hidden />}
          label="Pending payout"
          value={formatPrice(totalPayout)}
          tone="bg-info/10 text-info"
        />
      </div>

      <FilterBar
        searchValue={query}
        onSearchChange={(v) => {
          setQuery(v);
          setPage(1);
        }}
        searchPlaceholder="Search by name, email or description..."
        leftSlot={
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
            <option value="pending">Pending</option>
            <option value="suspended">Suspended</option>
          </Select>
        }
      />

      <DataTable<Vendor>
        columns={columns}
        rows={filtered}
        rowKey={(v) => v.id}
        loading={isLoading}
        pagination={{
          page,
          totalPages,
          totalItems,
          pageSize,
          onPageChange: setPage,
          onPageSizeChange: handlePageSize,
          pageSizeOptions: [8, 16, 24],
        }}
        empty={{
          icon: <FiUsers className="h-7 w-7" aria-hidden />,
          title: "No vendors found",
          description: "Try adjusting your search or filters.",
        }}
      />

      <Modal
        open={viewVendor !== null}
        onClose={() => setViewVendor(null)}
        title={viewVendor?.name ?? "Vendor"}
        subtitle={viewVendor?.email}
        size="xl"
      >
        {viewVendor && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <AdminAvatar name={viewVendor.name} src={viewVendor.logo} size="lg" />
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge status={viewVendor.status} className="capitalize" />
                    {viewVendor.verified && (
                      <Badge variant="success">
                        <FiCheck className="h-3 w-3" aria-hidden />
                        Verified
                      </Badge>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Joined {formatDate(viewVendor.joinedAt)} · {viewVendor.phone}
                  </p>
                  <p className="mt-1 max-w-md text-sm text-muted-foreground">
                    {viewVendor.description}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {viewVendor.status !== "active" && (
                  <Button
                    variant="success"
                    size="sm"
                    onClick={() => {
                      changeStatus(viewVendor.id, "active");
                      setViewVendor((v) => (v ? { ...v, status: "active" } : v));
                    }}
                  >
                    <FiCheck className="h-4 w-4" aria-hidden />
                    Approve
                  </Button>
                )}
                {viewVendor.status !== "suspended" && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      changeStatus(viewVendor.id, "suspended");
                      setViewVendor((v) => (v ? { ...v, status: "suspended" } : v));
                    }}
                  >
                    Suspend
                  </Button>
                )}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <Card className="p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Earnings
                </p>
                <p className="mt-1 text-xl font-extrabold text-foreground">
                  {formatPrice(viewVendor.totalEarnings)}
                </p>
              </Card>
              <Card className="p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Pending payout
                </p>
                <p className="mt-1 text-xl font-extrabold text-warning">
                  {formatPrice(viewVendor.pendingPayout)}
                </p>
              </Card>
              <Card className="p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Rating
                </p>
                <p className="mt-1 flex items-center gap-1 text-xl font-extrabold text-foreground">
                  {viewVendor.rating > 0 ? (
                    <>
                      <FiStar className="h-4 w-4 text-warning" aria-hidden />
                      {viewVendor.rating.toFixed(1)}
                    </>
                  ) : (
                    "—"
                  )}
                </p>
              </Card>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
