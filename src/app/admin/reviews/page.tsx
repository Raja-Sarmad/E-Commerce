"use client";

import { useMemo, useState } from "react";
import { FiEye, FiMessageSquare, FiStar, FiTrash2 } from "react-icons/fi";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminAvatar } from "@/components/admin/AdminAvatar";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { FilterBar } from "@/components/admin/FilterBar";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { ExportButton } from "@/components/admin/ExportButton";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import { useToast } from "@/context/ToastProvider";
import { products } from "@/lib/data/products";
import { cn, formatDate, timeAgo } from "@/lib/utils";
import type { Review } from "@/lib/types";

const PER_PAGE = 10;

type FlatReview = Review & {
  productName: string;
  productSlug: string;
  status: "approved" | "hidden";
};

const allReviews: FlatReview[] = products.flatMap((p) =>
  p.reviews.map((r) => ({
    ...r,
    productName: p.name,
    productSlug: p.slug,
    status: "approved" as const,
  }))
);

function Stars({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <FiStar
          key={n}
          aria-hidden
          className={cn(
            "h-3.5 w-3.5",
            n <= rating ? "fill-warning text-warning" : "text-muted"
          )}
        />
      ))}
    </span>
  );
}

export default function AdminReviewsPage() {
  const { success, info } = useToast();
  const [reviews, setReviews] = useState<FlatReview[]>(allReviews);
  const [query, setQuery] = useState("");
  const [rating, setRating] = useState("all");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PER_PAGE);
  const [detailsTarget, setDetailsTarget] = useState<FlatReview | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<FlatReview | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return reviews.filter((r) => {
      const matchesQuery =
        !q ||
        r.name.toLowerCase().includes(q) ||
        r.title.toLowerCase().includes(q) ||
        r.productName.toLowerCase().includes(q) ||
        r.body.toLowerCase().includes(q);
      const matchesRating =
        rating === "all" ||
        (rating === "5" && r.rating === 5) ||
        (rating === "4" && r.rating === 4) ||
        (rating === "3plus" && r.rating >= 3);
      const matchesStatus = status === "all" || r.status === status;
      return matchesQuery && matchesRating && matchesStatus;
    });
  }, [reviews, query, rating, status]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageItems = filtered.slice((page - 1) * pageSize, page * pageSize);

  const toggleStatus = (review: FlatReview) => {
    const updated = {
      ...review,
      status: (review.status === "approved" ? "hidden" : "approved") as
        | "approved"
        | "hidden",
    };
    setReviews((prev) =>
      prev.map((r) => (r.id === review.id ? updated : r))
    );
    info(
      updated.status === "approved" ? "Approved" : "Hidden",
      updated.status === "approved"
        ? `Review by “${review.name}” is now visible.`
        : `Review by “${review.name}” is hidden from the store.`
    );
  };

  const remove = () => {
    if (!deleteTarget) return;
    setReviews((prev) =>
      prev.filter(
        (r) => !(r.id === deleteTarget.id && r.productSlug === deleteTarget.productSlug)
      )
    );
    success("Review removed", `Review by “${deleteTarget.name}” was deleted.`);
    setDeleteTarget(null);
  };

  const handlePageSize = (size: number) => {
    setPageSize(size);
    setPage(1);
  };

  const columns: Column<FlatReview>[] = [
    {
      key: "product",
      header: "Product",
      sortable: true,
      sortValue: (r) => r.productName,
      render: (r) => (
        <p className="max-w-[200px] truncate text-sm font-medium text-foreground">
          {r.productName}
        </p>
      ),
    },
    {
      key: "customer",
      header: "Customer",
      sortable: true,
      sortValue: (r) => r.name,
      render: (r) => (
        <div className="flex items-center gap-2.5">
          <AdminAvatar name={r.name} size="xs" />
          <span className="whitespace-nowrap font-medium text-foreground">
            {r.name}
          </span>
        </div>
      ),
    },
    {
      key: "rating",
      header: "Rating",
      align: "center",
      sortable: true,
      sortValue: (r) => r.rating,
      render: (r) => <Stars rating={r.rating} />,
    },
    {
      key: "title",
      header: "Title",
      sortable: true,
      sortValue: (r) => r.title,
      render: (r) => (
        <p className="max-w-[220px] truncate font-semibold text-foreground">
          {r.title}
        </p>
      ),
    },
    {
      key: "body",
      header: "Body",
      render: (r) => (
        <p className="max-w-[280px] truncate text-sm text-muted-foreground">
          {r.body}
        </p>
      ),
    },
    {
      key: "date",
      header: "Date",
      sortable: true,
      sortValue: (r) => r.date,
      render: (r) => (
        <div className="whitespace-nowrap">
          <p className="text-sm text-foreground">{formatDate(r.date)}</p>
          <p className="text-xs text-muted-foreground">{timeAgo(r.date)}</p>
        </div>
      ),
    },
    {
      key: "verified",
      header: "Verified",
      align: "center",
      sortable: true,
      sortValue: (r) => (r.verified ? 1 : 0),
      render: (r) =>
        r.verified ? (
          <Badge variant="success">Yes</Badge>
        ) : (
          <Badge variant="outline">No</Badge>
        ),
    },
    {
      key: "status",
      header: "Status",
      align: "center",
      sortable: true,
      sortValue: (r) => (r.status === "approved" ? 1 : 0),
      render: (r) => (
        <button
          type="button"
          onClick={() => toggleStatus(r)}
          aria-pressed={r.status === "approved"}
          className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
            r.status === "approved" ? "bg-primary" : "bg-muted"
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
              r.status === "approved" ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
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
            onClick={() => setDetailsTarget(r)}
            className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label={`View review by ${r.name}`}
          >
            <FiEye className="h-4 w-4" aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => setDeleteTarget(r)}
            className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
            aria-label={`Delete review by ${r.name}`}
          >
            <FiTrash2 className="h-4 w-4" aria-hidden />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Reviews"
        subtitle={`Moderate customer feedback — ${reviews.length} reviews total.`}
        breadcrumb={[{ label: "Reviews" }]}
        actions={
          <ExportButton
            filename="reviews"
            data={filtered.map((r) => ({
              Product: r.productName,
              Customer: r.name,
              Rating: r.rating,
              Title: r.title,
              Body: r.body,
              Date: formatDate(r.date),
              Verified: r.verified ? "Yes" : "No",
              Status: r.status,
              Helpful: r.helpful,
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
        searchPlaceholder="Search by customer, product or review..."
        leftSlot={
          <>
            <Select
              value={rating}
              onChange={(e) => {
                setRating(e.target.value);
                setPage(1);
              }}
              containerClassName="sm:w-40"
              className="h-10"
            >
              <option value="all">All ratings</option>
              <option value="5">5 stars</option>
              <option value="4">4 stars</option>
              <option value="3plus">3+ stars</option>
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
              <option value="approved">Approved</option>
              <option value="hidden">Hidden</option>
            </Select>
          </>
        }
      />

      <DataTable<FlatReview>
        columns={columns}
        rows={pageItems}
        rowKey={(r) => `${r.productSlug}-${r.id}`}
        pagination={{
          page,
          totalPages,
          totalItems: filtered.length,
          pageSize,
          onPageChange: setPage,
          onPageSizeChange: handlePageSize,
          pageSizeOptions: [10, 20, 50],
        }}
        empty={{
          icon: <FiMessageSquare className="h-7 w-7" aria-hidden />,
          title: "No reviews found",
          description: "Try adjusting your search or filters.",
        }}
      />

      <Modal
        open={detailsTarget !== null}
        onClose={() => setDetailsTarget(null)}
        title="Review details"
        subtitle={detailsTarget ? `Review by ${detailsTarget.name}` : undefined}
        size="md"
      >
        {detailsTarget && (
          <div className="space-y-5">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-sm text-muted-foreground">{detailsTarget.productName}</p>
                <h3 className="text-base font-bold text-foreground">
                  {detailsTarget.title}
                </h3>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1.5">
                <Stars rating={detailsTarget.rating} />
                <span className="text-xs text-muted-foreground">
                  {formatDate(detailsTarget.date)}
                </span>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-foreground">
              {detailsTarget.body}
            </p>
            <div className="flex flex-wrap items-center gap-2">
              {detailsTarget.verified ? (
                <Badge variant="success">Verified purchase</Badge>
              ) : (
                <Badge variant="outline">Unverified</Badge>
              )}
              <Badge variant="secondary">
                {detailsTarget.helpful} people found this helpful
              </Badge>
              <Badge variant={detailsTarget.status === "approved" ? "primary" : "warning"}>
                {detailsTarget.status}
              </Badge>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setDetailsTarget(null)}>
                Close
              </Button>
              <Button onClick={() => toggleStatus(detailsTarget)}>
                {detailsTarget.status === "approved" ? "Hide review" : "Approve review"}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={remove}
        title="Delete review?"
        description={`This will permanently remove the review by “${deleteTarget?.name}”. This action cannot be undone.`}
        confirmLabel="Delete"
      />
    </div>
  );
}
