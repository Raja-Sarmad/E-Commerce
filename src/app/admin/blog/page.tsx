"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  FiClock,
  FiEdit2,
  FiEye,
  FiFileText,
  FiPlus,
  FiTrash2,
} from "react-icons/fi";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminAvatar } from "@/components/admin/AdminAvatar";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { FilterBar } from "@/components/admin/FilterBar";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { ExportButton } from "@/components/admin/ExportButton";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { toast } from "@/hooks/use-toast";
import {
  useGetAdminBlogPostsQuery,
  useCreateBlogPostMutation,
  useUpdateBlogPostMutation,
  useDeleteBlogPostMutation,
  type AdminBlogPost,
} from "@/lib/rtk/adminApi";
import { formatDate, formatNumber, slugify } from "@/lib/utils";

const PER_PAGE = 8;

const blogCategories = ["Buying Guides", "Beauty & Care", "Home & Living", "Fashion", "Sports & Outdoors", "Lifestyle"];

type BlogForm = {
  title: string;
  category: string;
  status: string;
  coverImage: string;
  excerpt: string;
  content: string;
  featured: boolean;
};

const emptyForm: BlogForm = {
  title: "",
  category: blogCategories[0],
  status: "draft",
  coverImage: "",
  excerpt: "",
  content: "",
  featured: false,
};

export default function AdminBlogPage() {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PER_PAGE);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<AdminBlogPost | null>(null);
  const [form, setForm] = useState<BlogForm>(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState<AdminBlogPost | null>(null);

  const { data, isLoading } = useGetAdminBlogPostsQuery({});
  const [createBlogPost] = useCreateBlogPostMutation();
  const [updateBlogPost] = useUpdateBlogPostMutation();
  const [deleteBlogPost] = useDeleteBlogPostMutation();

  const items = useMemo(() => data?.items ?? [], [data]);

  const categories = useMemo(
    () => [...new Set(items.map((p) => p.category))].sort(),
    [items]
  );

  const stats = useMemo(() => {
    const published = items.filter((p) => p.status === "published").length;
    const drafts = items.filter((p) => p.status === "draft").length;
    const views = items.reduce((sum, p) => sum + p.views, 0);
    return { published, drafts, views };
  }, [items]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((p) => {
      const matchesQuery =
        !q ||
        p.title.toLowerCase().includes(q) ||
        p.author.toLowerCase().includes(q);
      const matchesStatus = statusFilter === "all" || p.status === statusFilter;
      const matchesCategory =
        categoryFilter === "all" || p.category === categoryFilter;
      return matchesQuery && matchesStatus && matchesCategory;
    });
  }, [items, query, statusFilter, categoryFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageItems = filtered.slice((page - 1) * pageSize, page * pageSize);

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setFormOpen(true);
  };

  const openEdit = (post: AdminBlogPost) => {
    setEditing(post);
    setForm({
      title: post.title,
      category: post.category,
      status: post.status,
      coverImage: post.coverImage,
      excerpt: post.excerpt,
      content: Array.isArray(post.content) ? post.content.join("\n") : post.content,
      featured: !!post.featured,
    });
    setFormOpen(true);
  };

  const save = async () => {
    const title = form.title.trim();
    if (!title) {
      toast.warning("Title required", "Please enter a post title.");
      return;
    }
    const paragraphs = form.content
      .split("\n")
      .map((p) => p.trim())
      .filter(Boolean);
    const slug = slugify(title);
    try {
      if (editing) {
        await updateBlogPost({
          id: editing._id,
          body: {
            title,
            slug,
            category: form.category,
            status: form.status,
            coverImage: form.coverImage.trim() || editing.coverImage,
            excerpt: form.excerpt.trim(),
            content: paragraphs.join("\n"),
            featured: form.featured,
          },
        }).unwrap();
        toast.success("Post saved", `"${title}" was updated.`);
      } else {
        await createBlogPost({
          title,
          slug,
          excerpt: form.excerpt.trim(),
          content: paragraphs.join("\n"),
          coverImage:
            form.coverImage.trim() ||
            `https://picsum.photos/seed/blog-${slug}/900/520`,
          category: form.category,
          author: "Admin",
          featured: form.featured,
          status: form.status,
        }).unwrap();
        toast.success("Post created", `"${title}" was added.`);
      }
      setFormOpen(false);
    } catch {
      toast.error("Error", "Something went wrong. Please try again.");
    }
  };

  const remove = async () => {
    if (!deleteTarget) return;
    try {
      await deleteBlogPost(deleteTarget._id).unwrap();
      toast.success("Post removed", `"${deleteTarget.title}" was deleted.`);
    } catch {
      toast.error("Error", "Failed to delete post.");
    }
    setDeleteTarget(null);
  };

  const handlePageSize = (size: number) => {
    setPageSize(size);
    setPage(1);
  };

  const columns: Column<AdminBlogPost>[] = [
    {
      key: "post",
      header: "Post",
      sortable: true,
      sortValue: (p) => p.title,
      render: (p) => (
        <div className="flex items-center gap-3">
          <AdminAvatar name={p.title} src={p.coverImage} size="sm" />
          <div className="min-w-0">
            <Link
              href={`/blog/${p.slug}`}
              className="block max-w-[240px] truncate font-semibold text-foreground hover:text-primary"
            >
              {p.title}
            </Link>
            <p className="max-w-[260px] truncate text-xs text-muted-foreground">
              {p.excerpt}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "category",
      header: "Category",
      sortable: true,
      sortValue: (p) => p.category,
      render: (p) => <Badge variant="secondary">{p.category}</Badge>,
    },
    {
      key: "author",
      header: "Author",
      sortable: true,
      sortValue: (p) => p.author,
      render: (p) => (
        <span className="whitespace-nowrap text-muted-foreground">
          {p.author}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      align: "center",
      sortable: true,
      sortValue: (p) => p.status,
      render: (p) => <StatusBadge status={p.status} />,
    },
    {
      key: "views",
      header: "Views",
      align: "right",
      sortable: true,
      sortValue: (p) => p.views,
      render: (p) => (
        <span className="whitespace-nowrap font-semibold text-foreground">
          {formatNumber(p.views)}
        </span>
      ),
    },
    {
      key: "date",
      header: "Date",
      align: "right",
      sortable: true,
      sortValue: (p) => p.createdAt,
      render: (p) => (
        <span className="whitespace-nowrap text-muted-foreground">
          {formatDate(p.createdAt)}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      render: (p) => (
        <div className="flex justify-end gap-1">
          <Link
            href={`/blog/${p.slug}`}
            className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label={`View ${p.title}`}
          >
            <FiEye className="h-4 w-4" aria-hidden />
          </Link>
          <button
            type="button"
            onClick={() => openEdit(p)}
            className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label={`Edit ${p.title}`}
          >
            <FiEdit2 className="h-4 w-4" aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => setDeleteTarget(p)}
            className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
            aria-label={`Delete ${p.title}`}
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
        title="Blog"
        subtitle={`Manage your articles — ${data?.total ?? items.length} posts total.`}
        breadcrumb={[{ label: "Blog" }]}
        actions={
          <>
            <ExportButton
              filename="blog-posts"
              data={filtered.map((p) => ({
                Title: p.title,
                Slug: p.slug,
                Category: p.category,
                Author: p.author,
                Status: p.status,
                Views: p.views,
                Featured: p.featured ? "Yes" : "No",
                Date: p.createdAt,
              }))}
              disabled={filtered.length === 0}
            />
            <Button size="sm" onClick={openAdd}>
              <FiPlus className="h-4 w-4" aria-hidden />
              Add post
            </Button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="flex items-center gap-4 p-5">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-success/10 text-success">
            <FiFileText className="h-5 w-5" aria-hidden />
          </span>
          <div>
            <p className="text-sm text-muted-foreground">Published</p>
            <p className="text-2xl font-extrabold text-foreground">
              {formatNumber(stats.published)}
            </p>
          </div>
        </Card>
        <Card className="flex items-center gap-4 p-5">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-warning/15 text-warning">
            <FiClock className="h-5 w-5" aria-hidden />
          </span>
          <div>
            <p className="text-sm text-muted-foreground">Drafts</p>
            <p className="text-2xl font-extrabold text-foreground">
              {formatNumber(stats.drafts)}
            </p>
          </div>
        </Card>
        <Card className="flex items-center gap-4 p-5">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <FiEye className="h-5 w-5" aria-hidden />
          </span>
          <div>
            <p className="text-sm text-muted-foreground">Total views</p>
            <p className="text-2xl font-extrabold text-foreground">
              {formatNumber(stats.views)}
            </p>
          </div>
        </Card>
      </div>

      <FilterBar
        searchValue={query}
        onSearchChange={(v) => {
          setQuery(v);
          setPage(1);
        }}
        searchPlaceholder="Search by title or author..."
        leftSlot={
          <>
            <Select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              containerClassName="sm:w-40"
              className="h-10"
            >
              <option value="all">All statuses</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="scheduled">Scheduled</option>
            </Select>
            <Select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setPage(1);
              }}
              containerClassName="sm:w-44"
              className="h-10"
            >
              <option value="all">All categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
          </>
        }
      />

      {isLoading ? (
        <div className="flex items-center justify-center py-20 text-muted-foreground">
          Loading posts…
        </div>
      ) : (
        <DataTable<AdminBlogPost>
          columns={columns}
          rows={pageItems}
          rowKey={(p) => p._id}
          pagination={{
            page,
            totalPages,
            totalItems: filtered.length,
            pageSize,
            onPageChange: setPage,
            onPageSizeChange: handlePageSize,
            pageSizeOptions: [8, 16, 24],
          }}
          empty={{
            icon: <FiFileText className="h-7 w-7" aria-hidden />,
            title: "No posts found",
            description: "Try adjusting your search or filters, or create a new post.",
            actionLabel: "Add post",
            onAction: openAdd,
          }}
        />
      )}

      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editing ? "Edit post" : "Add post"}
        subtitle={
          editing ? `Update "${editing.title}".` : "Create a new blog post."
        }
        size="lg"
      >
        <div className="space-y-4">
          <Input
            label="Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="e.g. How to Choose the Perfect Wireless Headphones"
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Select
              label="Category"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            >
              {blogCategories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
            <Select
              label="Status"
              value={form.status}
              onChange={(e) =>
                setForm({ ...form, status: e.target.value })
              }
            >
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="scheduled">Scheduled</option>
            </Select>
          </div>
          <Input
            label="Cover image URL"
            value={form.coverImage}
            onChange={(e) => setForm({ ...form, coverImage: e.target.value })}
            placeholder="https://..."
            hint="Leave empty to use a placeholder image."
          />
          <Textarea
            label="Excerpt"
            value={form.excerpt}
            onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
            placeholder="Short summary shown on the blog index."
            containerClassName="min-h-[90px]"
          />
          <Textarea
            label="Content"
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            placeholder={"Write one paragraph per line.\nParagraph one…\nParagraph two…"}
            containerClassName="min-h-[160px]"
            hint="Each line is stored as one paragraph."
          />
          <div className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3">
            <div>
              <p className="text-sm font-medium text-foreground">
                Featured post
              </p>
              <p className="text-xs text-muted-foreground">
                Show this post at the top of the blog.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setForm({ ...form, featured: !form.featured })}
              aria-pressed={form.featured}
              className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
                form.featured ? "bg-primary" : "bg-muted"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                  form.featured ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setFormOpen(false)}>
              Cancel
            </Button>
            <Button onClick={save}>{editing ? "Save changes" : "Add post"}</Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={remove}
        title="Delete post?"
        description={`This will permanently remove "${deleteTarget?.title}". This action cannot be undone.`}
        confirmLabel="Delete"
      />
    </div>
  );
}
