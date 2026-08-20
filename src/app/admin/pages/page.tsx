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
import { toast } from "@/hooks/use-toast";
import { formatDate } from "@/lib/utils";
import {
  useGetAdminPagesQuery,
  useCreatePageMutation,
  useUpdatePageMutation,
  useDeletePageMutation,
  type AdminPage,
} from "@/lib/rtk/adminApi";
import { getErrorMessage } from "@/lib/rtk/baseApi";

type PageItem = AdminPage;

const emptyDraft = { title: "", slug: "", status: "draft" as PageItem["status"], content: "" };

export default function AdminPagesPage() {
  const { data, isLoading } = useGetAdminPagesQuery({});
  const [createPage] = useCreatePageMutation();
  const [updatePage] = useUpdatePageMutation();
  const [deletePage] = useDeletePageMutation();

  const pages: PageItem[] = data?.items ?? [];

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | string>("all");
  const [editing, setEditing] = useState<PageItem | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<PageItem | null>(null);
  const [draft, setDraft] = useState(emptyDraft);

  const filtered = pages.filter((p) => {
    const matchQuery =
      !query ||
      p.title.toLowerCase().includes(query.toLowerCase()) ||
      p.slug.toLowerCase().includes(query.toLowerCase());
    const matchStatus = statusFilter === "all" || p.status === statusFilter;
    return matchQuery && matchStatus;
  });

  const openCreate = () => {
    setDraft(emptyDraft);
    setCreating(true);
  };

  const openEdit = (page: PageItem) => {
    setDraft({ title: page.title, slug: page.slug, status: page.status, content: page.content ?? "" });
    setEditing(page);
  };

  const save = async () => {
    if (!draft.title.trim()) {
      toast.error("Title required", "Enter a page title to continue.");
      return;
    }
    try {
      if (editing) {
        await updatePage({
          id: editing._id,
          body: {
            title: draft.title,
            slug: draft.slug || draft.title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
            status: draft.status,
            content: draft.content,
          },
        }).unwrap();
        toast.success("Page updated", `${draft.title} has been saved.`);
        setEditing(null);
      } else {
        await createPage({
          title: draft.title,
          slug: draft.slug || draft.title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
          status: draft.status,
          content: draft.content,
        }).unwrap();
        toast.success("Page created", `${draft.title} has been added.`);
        setCreating(false);
      }
    } catch (err) {
      toast.error("Error", getErrorMessage(err));
    }
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    try {
      await deletePage(deleting._id).unwrap();
      toast.info("Page deleted", `${deleting.title} has been removed.`);
      setDeleting(null);
    } catch (err) {
      toast.error("Error", getErrorMessage(err));
    }
  };

  const toggleStatus = async (page: PageItem) => {
    const newStatus = page.status === "published" ? "draft" : "published";
    try {
      await updatePage({ id: page._id, body: { status: newStatus } }).unwrap();
      toast.success("Status changed", `${page.title} is now ${newStatus}.`);
    } catch (err) {
      toast.error("Error", getErrorMessage(err));
    }
  };

  const columns: Column<PageItem>[] = [
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
      key: "createdAt",
      header: "Created",
      sortable: true,
      sortValue: (p) => p.createdAt,
      render: (p) => (
        <span className="text-sm text-muted-foreground">
          {formatDate(p.createdAt)}
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
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-9 rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none transition-colors focus:border-primary"
            >
              <option value="all">All statuses</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
          </div>
        </div>
        <DataTable<PageItem>
          columns={columns}
          rows={filtered}
          rowKey={(p) => p._id}
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
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">Status</label>
            <select
              value={draft.status}
              onChange={(e) => setDraft((d) => ({ ...d, status: e.target.value as PageItem["status"] }))}
              className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none transition-colors focus:border-primary"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">Content</label>
            <Textarea
              rows={8}
              value={draft.content}
              onChange={(e) => setDraft((d) => ({ ...d, content: e.target.value }))}
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
