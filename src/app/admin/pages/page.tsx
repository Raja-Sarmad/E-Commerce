"use client";

import { useState } from "react";
import { FiEdit2, FiEye, FiFileText, FiPlus, FiTrash2 } from "react-icons/fi";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { useToast } from "@/context/ToastProvider";
import { formatDate } from "@/lib/utils";

type Page = {
  id: string;
  title: string;
  slug: string;
  section: "Main" | "Legal" | "Support";
  status: "published" | "draft";
  updatedAt: string;
};

const initialPages: Page[] = [
  { id: "pg-001", title: "About Us", slug: "about", section: "Main", status: "published", updatedAt: "2026-07-28T09:12:00Z" },
  { id: "pg-002", title: "Contact", slug: "contact", section: "Main", status: "published", updatedAt: "2026-07-21T14:40:00Z" },
  { id: "pg-003", title: "Terms of Service", slug: "terms", section: "Legal", status: "published", updatedAt: "2026-07-15T10:05:00Z" },
  { id: "pg-004", title: "Privacy Policy", slug: "privacy", section: "Legal", status: "published", updatedAt: "2026-07-15T10:08:00Z" },
  { id: "pg-005", title: "Shipping & Returns", slug: "shipping-returns", section: "Support", status: "published", updatedAt: "2026-07-02T16:22:00Z" },
  { id: "pg-006", title: "FAQ", slug: "faq", section: "Support", status: "draft", updatedAt: "2026-06-27T11:48:00Z" },
  { id: "pg-007", title: "Careers", slug: "careers", section: "Main", status: "draft", updatedAt: "2026-06-19T08:30:00Z" },
];

const emptyDraft = { title: "", slug: "", section: "Main" as Page["section"], status: "draft" as Page["status"], body: "" };

export default function AdminPagesPage() {
  const { toast, success, error } = useToast();
  const [pages, setPages] = useState<Page[]>(initialPages);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | Page["status"]>("all");
  const [sectionFilter, setSectionFilter] = useState<"all" | Page["section"]>("all");
  const [editing, setEditing] = useState<Page | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<Page | null>(null);
  const [draft, setDraft] = useState(emptyDraft);

  const filtered = pages.filter((p) => {
    const matchQuery =
      !query ||
      p.title.toLowerCase().includes(query.toLowerCase()) ||
      p.slug.toLowerCase().includes(query.toLowerCase());
    const matchStatus = statusFilter === "all" || p.status === statusFilter;
    const matchSection = sectionFilter === "all" || p.section === sectionFilter;
    return matchQuery && matchStatus && matchSection;
  });

  const openCreate = () => {
    setDraft(emptyDraft);
    setCreating(true);
  };

  const openEdit = (page: Page) => {
    setDraft({ title: page.title, slug: page.slug, section: page.section, status: page.status, body: "" });
    setEditing(page);
  };

  const save = () => {
    if (!draft.title.trim()) {
      error("Title required", "Enter a page title to continue.");
      return;
    }
    if (editing) {
      setPages((prev) =>
        prev.map((p) =>
          p.id === editing.id
            ? { ...p, title: draft.title, slug: draft.slug || draft.title.toLowerCase().replace(/[^a-z0-9]+/g, "-"), section: draft.section, status: draft.status, updatedAt: new Date().toISOString() }
            : p
        )
      );
      success("Page updated", `${draft.title} has been saved.`);
      setEditing(null);
    } else {
      const page: Page = {
        id: `pg-${String(pages.length + 1).padStart(3, "0")}`,
        title: draft.title,
        slug: draft.slug || draft.title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        section: draft.section,
        status: draft.status,
        updatedAt: new Date().toISOString(),
      };
      setPages((prev) => [page, ...prev]);
      success("Page created", `${page.title} has been added.`);
      setCreating(false);
    }
  };

  const confirmDelete = () => {
    if (!deleting) return;
    setPages((prev) => prev.filter((p) => p.id !== deleting.id));
    toast("info", "Page deleted", `${deleting.title} has been removed.`);
    setDeleting(null);
  };

  const toggleStatus = (page: Page) => {
    setPages((prev) =>
      prev.map((p) =>
        p.id === page.id
          ? { ...p, status: p.status === "published" ? "draft" : "published", updatedAt: new Date().toISOString() }
          : p
      )
    );
    success("Status changed", `${page.title} is now ${page.status === "published" ? "draft" : "published"}.`);
  };

  const columns: Column<Page>[] = [
    {
      key: "title",
      header: "Page",
      sortable: true,
      sortValue: (p) => p.title,
      render: (p) => (
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <FiFileText className="h-4 w-4" aria-hidden />
          </span>
          <div>
            <p className="font-semibold text-foreground">{p.title}</p>
            <p className="text-xs text-muted-foreground">/{p.slug}</p>
          </div>
        </div>
      ),
    },
    {
      key: "section",
      header: "Section",
      sortable: true,
      sortValue: (p) => p.section,
      render: (p) => (
        <span className="rounded-md bg-muted px-2 py-1 text-xs font-medium text-muted-foreground">
          {p.section}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      sortValue: (p) => p.status,
      render: (p) => (
        <Badge variant={p.status === "published" ? "success" : "secondary"}>
          {p.status}
        </Badge>
      ),
    },
    {
      key: "updatedAt",
      header: "Updated",
      sortable: true,
      sortValue: (p) => p.updatedAt,
      render: (p) => (
        <span className="text-sm text-muted-foreground">
          {formatDate(p.updatedAt)}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      align: "right",
      render: (p) => (
        <div className="flex items-center justify-end gap-1">
          <Button variant="ghost" size="sm" aria-label={`Preview ${p.title}`} onClick={() => toggleStatus(p)}>
            <FiEye className="h-4 w-4" aria-hidden />
          </Button>
          <Button variant="ghost" size="sm" aria-label={`Edit ${p.title}`} onClick={() => openEdit(p)}>
            <FiEdit2 className="h-4 w-4" aria-hidden />
          </Button>
          <Button variant="ghost" size="sm" aria-label={`Delete ${p.title}`} onClick={() => setDeleting(p)}>
            <FiTrash2 className="h-4 w-4 text-destructive" aria-hidden />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Pages"
        subtitle="Manage content pages for your storefront."
        breadcrumb={[{ label: "Pages" }]}
        actions={
          <Button
            size="sm"
            onClick={openCreate}
            leftIcon={<FiPlus className="h-4 w-4" aria-hidden />}
          >
            New page
          </Button>
        }
      />

      <Card className="overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between">
          <Input
            className="sm:max-w-xs"
            placeholder="Search pages…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
              className="h-9 rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none transition-colors focus:border-primary"
            >
              <option value="all">All statuses</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
            <select
              value={sectionFilter}
              onChange={(e) => setSectionFilter(e.target.value as typeof sectionFilter)}
              className="h-9 rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none transition-colors focus:border-primary"
            >
              <option value="all">All sections</option>
              <option value="Main">Main</option>
              <option value="Legal">Legal</option>
              <option value="Support">Support</option>
            </select>
          </div>
        </div>
        <DataTable<Page>
          columns={columns}
          rows={filtered}
          rowKey={(p) => p.id}
          cardClassName="border-0 rounded-none shadow-none"
          empty={{
            title: "No pages found",
            description: "Try adjusting your search or filters.",
          }}
        />
      </Card>

      <Modal
        open={creating || !!editing}
        onClose={() => {
          setCreating(false);
          setEditing(null);
        }}
        title={creating ? "Create page" : `Edit — ${editing?.title}`}
        subtitle="Pages are rendered on the public storefront."
        size="lg"
      >
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Title</label>
              <Input value={draft.title} onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))} placeholder="e.g. Our Story" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Slug</label>
              <Input value={draft.slug} onChange={(e) => setDraft((d) => ({ ...d, slug: e.target.value }))} placeholder="our-story" />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Section</label>
              <select
                value={draft.section}
                onChange={(e) => setDraft((d) => ({ ...d, section: e.target.value as Page["section"] }))}
                className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none transition-colors focus:border-primary"
              >
                <option value="Main">Main</option>
                <option value="Legal">Legal</option>
                <option value="Support">Support</option>
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Status</label>
              <select
                value={draft.status}
                onChange={(e) => setDraft((d) => ({ ...d, status: e.target.value as Page["status"] }))}
                className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none transition-colors focus:border-primary"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">Content</label>
            <Textarea
              rows={8}
              value={draft.body}
              onChange={(e) => setDraft((d) => ({ ...d, body: e.target.value }))}
              placeholder="Write the page content here…"
            />
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setCreating(false);
                setEditing(null);
              }}
            >
              Cancel
            </Button>
            <Button size="sm" onClick={save}>
              {creating ? "Create page" : "Save changes"}
            </Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleting}
        title="Delete page"
        description={`Delete "${deleting?.title}"? This cannot be undone.`}
        confirmLabel="Delete page"
        variant="destructive"
        onConfirm={confirmDelete}
        onClose={() => setDeleting(null)}
      />
    </div>
  );
}
