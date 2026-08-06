"use client";

import { useMemo, useState, type ReactNode } from "react";
import { FiBookOpen, FiCheck, FiEdit2, FiHelpCircle, FiPlus, FiTrash2 } from "react-icons/fi";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Modal } from "@/components/ui/Modal";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { FilterBar } from "@/components/admin/FilterBar";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { ExportButton } from "@/components/admin/ExportButton";
import { useToast } from "@/context/ToastProvider";
import { adminFaqs, faqCategories, generateId, type AdminFaq } from "@/lib/data/admin";
import { formatNumber } from "@/lib/utils";
import { cn } from "@/lib/utils";

const PER_PAGE = 8;

type FaqForm = {
  category: string;
  question: string;
  answer: string;
  order: string;
  active: boolean;
};

const emptyForm: FaqForm = {
  category: faqCategories[0],
  question: "",
  answer: "",
  order: "1",
  active: true,
};

function StatCard({
  icon,
  label,
  value,
  className,
}: {
  icon: ReactNode;
  label: string;
  value: number;
  className?: string;
}) {
  return (
    <Card className="flex items-center gap-4 p-5">
      <span
        className={cn(
          "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
          className
        )}
      >
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-2xl font-extrabold text-foreground">{formatNumber(value)}</p>
        <p className="truncate text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
      </div>
    </Card>
  );
}

export default function AdminFaqPage() {
  const { success, info, warning } = useToast();
  const [items, setItems] = useState<AdminFaq[]>(adminFaqs);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PER_PAGE);
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FaqForm>(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState<AdminFaq | null>(null);

  const stats = useMemo(
    () => ({
      total: items.length,
      active: items.filter((f) => f.active).length,
      categories: faqCategories.length,
    }),
    [items]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((f) => {
      const matchesQuery =
        !q ||
        f.question.toLowerCase().includes(q) ||
        f.answer.toLowerCase().includes(q);
      const matchesCategory = category === "all" || f.category === category;
      return matchesQuery && matchesCategory;
    });
  }, [items, query, category]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageItems = filtered.slice((page - 1) * pageSize, page * pageSize);

  const openAdd = () => {
    setForm({ ...emptyForm, order: String(items.length + 1) });
    setEditingId(null);
    setFormOpen(true);
  };

  const openEdit = (faq: AdminFaq) => {
    setForm({
      category: faq.category,
      question: faq.question,
      answer: faq.answer,
      order: String(faq.order),
      active: faq.active,
    });
    setEditingId(faq.id);
    setFormOpen(true);
  };

  const saveFaq = () => {
    if (!form.question.trim() || !form.answer.trim()) {
      warning("Missing fields", "Question and answer are required.");
      return;
    }
    const order = Number(form.order) || 0;
    if (editingId) {
      setItems((prev) =>
        prev.map((f) =>
          f.id === editingId
            ? {
                ...f,
                category: form.category,
                question: form.question.trim(),
                answer: form.answer.trim(),
                order,
                active: form.active,
              }
            : f
        )
      );
      success("FAQ updated", "The FAQ entry was updated.");
    } else {
      const created: AdminFaq = {
        id: generateId("fq"),
        category: form.category,
        question: form.question.trim(),
        answer: form.answer.trim(),
        order,
        active: form.active,
      };
      setItems((prev) => [...prev, created]);
      success("FAQ added", "A new FAQ entry was created.");
    }
    setFormOpen(false);
  };

  const toggleActive = (faq: AdminFaq) => {
    const updated = { ...faq, active: !faq.active };
    setItems((prev) => prev.map((f) => (f.id === faq.id ? updated : f)));
    info(
      updated.active ? "FAQ activated" : "FAQ deactivated",
      `“${faq.question}” is now ${updated.active ? "visible" : "hidden"}.`
    );
  };

  const removeFaq = () => {
    if (!deleteTarget) return;
    setItems((prev) => prev.filter((f) => f.id !== deleteTarget.id));
    setDeleteTarget(null);
    success("FAQ deleted", `“${deleteTarget.question}” was removed.`);
  };

  const columns: Column<AdminFaq>[] = [
    {
      key: "category",
      header: "Category",
      render: (f) => <Badge variant="primary">{f.category}</Badge>,
    },
    {
      key: "question",
      header: "Question",
      sortable: true,
      sortValue: (f) => f.question,
      render: (f) => (
        <span className="max-w-[280px] truncate font-medium text-foreground">{f.question}</span>
      ),
    },
    {
      key: "answer",
      header: "Answer",
      render: (f) => (
        <span className="block max-w-[320px] truncate text-muted-foreground">{f.answer}</span>
      ),
    },
    {
      key: "order",
      header: "Order",
      align: "center",
      sortable: true,
      sortValue: (f) => f.order,
      render: (f) => (
        <span className="rounded-lg bg-muted px-2.5 py-1 font-mono text-xs font-semibold text-foreground">
          {f.order}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      align: "center",
      render: (f) => (
        <button
          type="button"
          role="switch"
          aria-checked={f.active}
          onClick={() => toggleActive(f)}
          className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
            f.active ? "bg-primary" : "bg-muted"
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
              f.active ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      render: (f) => (
        <div className="flex justify-end gap-1">
          <button
            type="button"
            onClick={() => openEdit(f)}
            className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label={`Edit ${f.question}`}
          >
            <FiEdit2 className="h-4 w-4" aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => setDeleteTarget(f)}
            className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
            aria-label={`Delete ${f.question}`}
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
        title="FAQ Management"
        subtitle={`Create and manage frequently asked questions — ${stats.total} FAQs total.`}
        breadcrumb={[{ label: "FAQ" }]}
        actions={
          <>
            <ExportButton
              filename="faqs"
              data={filtered.map((f) => ({
                Category: f.category,
                Question: f.question,
                Answer: f.answer,
                Order: f.order,
                Active: f.active ? "Yes" : "No",
              }))}
              disabled={filtered.length === 0}
            />
            <Button size="sm" onClick={openAdd}>
              <FiPlus className="h-4 w-4" aria-hidden />
              Add FAQ
            </Button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          icon={<FiHelpCircle className="h-5 w-5" aria-hidden />}
          label="Total FAQs"
          value={stats.total}
          className="bg-primary/10 text-primary"
        />
        <StatCard
          icon={<FiCheck className="h-5 w-5" aria-hidden />}
          label="Active"
          value={stats.active}
          className="bg-success/10 text-success"
        />
        <StatCard
          icon={<FiBookOpen className="h-5 w-5" aria-hidden />}
          label="Categories"
          value={stats.categories}
          className="bg-info/10 text-info"
        />
      </div>

      <FilterBar
        searchValue={query}
        onSearchChange={(v) => {
          setQuery(v);
          setPage(1);
        }}
        searchPlaceholder="Search by question or answer..."
        leftSlot={
          <Select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setPage(1);
            }}
            containerClassName="sm:w-52"
            className="h-10"
          >
            <option value="all">All categories</option>
            {faqCategories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
        }
      />

      <DataTable<AdminFaq>
        columns={columns}
        rows={pageItems}
        rowKey={(f) => f.id}
        pagination={{
          page,
          totalPages,
          totalItems: filtered.length,
          pageSize,
          onPageChange: setPage,
          onPageSizeChange: (size) => {
            setPageSize(size);
            setPage(1);
          },
          pageSizeOptions: [8, 16, 24],
        }}
        empty={{
          icon: <FiHelpCircle className="h-7 w-7" aria-hidden />,
          title: "No FAQs found",
          description: "Try adjusting your search or filters.",
        }}
      />

      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editingId ? "Edit FAQ" : "Add FAQ"}
        subtitle={
          editingId
            ? "Update the question, answer and visibility."
            : "Create a new entry for your help center."
        }
        size="md"
      >
        <div className="space-y-4">
          <Select
            label="Category"
            value={form.category}
            onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
          >
            {faqCategories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
          <Input
            label="Question"
            value={form.question}
            onChange={(e) => setForm((prev) => ({ ...prev, question: e.target.value }))}
            placeholder="e.g. How long does shipping take?"
          />
          <Textarea
            label="Answer"
            value={form.answer}
            onChange={(e) => setForm((prev) => ({ ...prev, answer: e.target.value }))}
            placeholder="Write the answer..."
            rows={5}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Order"
              type="number"
              min={0}
              value={form.order}
              onChange={(e) => setForm((prev) => ({ ...prev, order: e.target.value }))}
            />
            <div className="flex items-end pb-1">
              <div className="flex w-full items-center justify-between rounded-lg border border-border bg-card px-4 py-3 shadow-sm">
                <span className="text-sm font-medium text-foreground">Active</span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={form.active}
                  onClick={() => setForm((prev) => ({ ...prev, active: !prev.active }))}
                  className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
                    form.active ? "bg-primary" : "bg-muted"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                      form.active ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="outline" onClick={() => setFormOpen(false)}>
            Cancel
          </Button>
          <Button onClick={saveFaq}>{editingId ? "Save changes" : "Add FAQ"}</Button>
        </div>
      </Modal>

      <ConfirmDialog
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={removeFaq}
        title="Delete FAQ?"
        description={`This will permanently remove “${deleteTarget?.question}” from your help center. This action cannot be undone.`}
        confirmLabel="Delete"
      />
    </div>
  );
}
