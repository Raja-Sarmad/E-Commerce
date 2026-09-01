"use client";

import { useMemo, useState } from "react";
import { FiCreditCard } from "react-icons/fi";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";
import { Modal } from "@/components/ui/Modal";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { FilterBar } from "@/components/admin/FilterBar";
import { DateRangeFilter } from "@/components/admin/DateRangeFilter";
import { dateRangeFromPreset, type DateRangePreset } from "@/lib/admin-filters";
import { ExportButton } from "@/components/admin/ExportButton";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { toast } from "@/hooks/use-toast";
import {
  useGetAdminPaymentMethodsQuery,
  useGetAdminTransactionsQuery,
  useUpdatePaymentMethodMutation,
  type AdminPaymentMethod,
  type AdminTransaction,
} from "@/lib/rtk/adminApi";
import { formatDate } from "@/lib/utils";
import { useFormatPrice } from "@/hooks/use-format-price";

const PER_PAGE = 8;

const cardLikeIcons = ["stripe", "paypal", "applepay", "googlepay"];

function methodGlyph(method: AdminPaymentMethod) {
  if (cardLikeIcons.includes(method.icon)) {
    return <FiCreditCard className="h-5 w-5" aria-hidden />;
  }
  return (
    <span className="text-sm font-extrabold">
      {method.name
        .split(" ")
        .map((w) => w.charAt(0))
        .slice(0, 3)
        .join("")
        .toUpperCase()}
    </span>
  );
}

function prettyKey(key: string) {
  return key
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/^./, (c) => c.toUpperCase());
}

export default function AdminPaymentsPage() {
  const formatPrice = useFormatPrice();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [dateRange, setDateRange] = useState<DateRangePreset>("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PER_PAGE);
  const [configureTarget, setConfigureTarget] = useState<AdminPaymentMethod | null>(null);

  const dates = useMemo(() => dateRangeFromPreset(dateRange), [dateRange]);

  const { data: methodsData, isLoading: methodsLoading } = useGetAdminPaymentMethodsQuery();
  const { data: transactionsData, isLoading: transactionsLoading } = useGetAdminTransactionsQuery({
    page,
    limit: pageSize,
    search: query || undefined,
    status: status !== "all" ? status : undefined,
    ...dates,
  });
  const [updatePaymentMethod] = useUpdatePaymentMethodMutation();

  const methods = useMemo(() => methodsData?.items ?? [], [methodsData]);

  const toggleMethod = async (method: AdminPaymentMethod) => {
    try {
      await updatePaymentMethod({
        id: method._id,
        body: { enabled: !method.enabled },
      }).unwrap();
      toast.info(
        !method.enabled ? "Method enabled" : "Method disabled",
        `${method.name} is now ${!method.enabled ? "active" : "inactive"}.`
      );
    } catch {
      toast.error("Update failed", "Could not update payment method.");
    }
  };

  const pageItems = transactionsData?.items ?? [];
  const totalPages = transactionsData?.totalPages ?? 1;

  const columns: Column<AdminTransaction>[] = [
    {
      key: "reference",
      header: "Reference",
      render: (t) => (
        <span className="font-mono text-sm font-bold text-foreground">{t.reference}</span>
      ),
    },
    {
      key: "order",
      header: "Order",
      render: (t) => <span className="text-muted-foreground">#{t.orderNumber}</span>,
    },
    {
      key: "customer",
      header: "Customer",
      render: (t) => <span className="font-medium text-foreground">{t.customer}</span>,
    },
    {
      key: "amount",
      header: "Amount",
      align: "right",
      sortable: true,
      sortValue: (t) => t.amount,
      render: (t) => <span className="font-bold text-foreground">{formatPrice(t.amount)}</span>,
    },
    {
      key: "fee",
      header: "Fee",
      align: "right",
      sortable: true,
      sortValue: (t) => t.fee,
      render: (t) => <span className="text-muted-foreground">{formatPrice(t.fee)}</span>,
    },
    {
      key: "method",
      header: "Method",
      render: (t) => <Badge variant="secondary">{t.method}</Badge>,
    },
    {
      key: "status",
      header: "Status",
      render: (t) => <StatusBadge status={t.status} />,
    },
    {
      key: "date",
      header: "Date",
      sortable: true,
      sortValue: (t) => t.createdAt,
      render: (t) => <span className="text-muted-foreground">{formatDate(t.createdAt)}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Payments"
        subtitle={`Manage your payment methods and review recent transactions.`}
        breadcrumb={[{ label: "Payments" }]}
      />

      <section className="space-y-4">
        <h2 className="text-lg font-bold text-foreground">Payment methods</h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {methods.map((method) => (
            <Card key={method._id} className="flex flex-col p-5">
              <div className="flex items-start justify-between gap-4">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  {methodGlyph(method)}
                </span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={method.enabled}
                  onClick={() => toggleMethod(method)}
                  className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
                    method.enabled ? "bg-primary" : "bg-muted"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                      method.enabled ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
              <h3 className="mt-4 text-base font-bold text-foreground">{method.name}</h3>
              <p className="mt-1 flex-1 text-sm text-muted-foreground">{method.description}</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={() => setConfigureTarget(method)}
              >
                Configure
              </Button>
            </Card>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-bold text-foreground">Transactions</h2>
        <FilterBar
          searchValue={query}
          onSearchChange={(v) => {
            setQuery(v);
            setPage(1);
          }}
          searchPlaceholder="Search by reference, order or customer..."
          leftSlot={
            <>
              <DateRangeFilter
                value={dateRange}
                onChange={(v) => {
                  setDateRange(v);
                  setPage(1);
                }}
              />
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
                <option value="succeeded">Succeeded</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
                <option value="refunded">Refunded</option>
              </Select>
            </>
          }
          rightSlot={
            <ExportButton
              filename="transactions"
              data={pageItems.map((t) => ({
                Reference: t.reference,
                Order: t.orderNumber,
                Customer: t.customer,
                Amount: t.amount,
                Fee: t.fee,
                Method: t.method,
                Status: t.status,
                Date: t.createdAt,
              }))}
              disabled={pageItems.length === 0}
            />
          }
        />

        <DataTable<AdminTransaction>
          columns={columns}
          rows={pageItems}
          rowKey={(t) => t._id}
          pagination={{
            page,
            totalPages,
            totalItems: transactionsData?.total ?? pageItems.length,
            pageSize,
            onPageChange: setPage,
            onPageSizeChange: (size) => {
              setPageSize(size);
              setPage(1);
            },
            pageSizeOptions: [8, 16, 24],
          }}
          empty={{
            icon: <FiCreditCard className="h-7 w-7" aria-hidden />,
            title: "No transactions found",
            description: "Try adjusting your search or filters.",
          }}
        />
      </section>

      <Modal
        open={configureTarget !== null}
        onClose={() => setConfigureTarget(null)}
        title={configureTarget ? `Configure ${configureTarget.name}` : ""}
        subtitle={configureTarget?.description}
        size="md"
      >
        <div className="divide-y divide-border rounded-xl border border-border">
          {configureTarget && Object.keys(configureTarget.settings).length === 0 ? (
            <p className="p-4 text-sm text-muted-foreground">
              No configuration settings available for this payment method.
            </p>
          ) : (
            Object.entries(configureTarget?.settings ?? {}).map(([key, value]) => (
              <div
                key={key}
                className="flex items-center justify-between gap-4 px-4 py-3"
              >
                <span className="text-sm font-medium text-foreground">{prettyKey(key)}</span>
                <code className="max-w-[60%] truncate rounded bg-muted px-2 py-1 font-mono text-xs text-foreground">
                  {value}
                </code>
              </div>
            ))
          )}
        </div>
        <div className="mt-6 flex justify-end">
          <Button onClick={() => setConfigureTarget(null)}>Done</Button>
        </div>
      </Modal>
    </div>
  );
}
