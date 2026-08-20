"use client";

import { useMemo, useState, type ReactNode } from "react";
import { FiCheck, FiFileText, FiMail, FiSend, FiUsers, FiX } from "react-icons/fi";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Modal } from "@/components/ui/Modal";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminAvatar } from "@/components/admin/AdminAvatar";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { FilterBar } from "@/components/admin/FilterBar";
import { ExportButton } from "@/components/admin/ExportButton";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { toast } from "@/hooks/use-toast";
import {
  useGetAdminSubscribersQuery,
  useDeleteSubscriberMutation,
  type AdminSubscriber,
} from "@/lib/rtk/adminApi";
import { formatDate, formatNumber } from "@/lib/utils";
import { cn } from "@/lib/utils";

const PER_PAGE = 8;

const emailTemplates = [
  { id: "1", name: "Welcome", subject: "Welcome to NovaMart!", description: "Sent when a user subscribes.", category: "Onboarding", updatedAt: "2025-01-15T10:00:00Z" },
  { id: "2", name: "Weekly Digest", subject: "This week at NovaMart", description: "Weekly summary of deals and new arrivals.", category: "Marketing", updatedAt: "2025-03-01T10:00:00Z" },
  { id: "3", name: "Promo Blast", subject: "Don't miss our latest sale!", description: "Promotional email for seasonal campaigns.", category: "Promotions", updatedAt: "2025-02-20T10:00:00Z" },
];

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

export default function AdminNewsletterPage() {
  const [query, setQuery] = useState("");
  const [source, setSource] = useState("all");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PER_PAGE);
  const [composeOpen, setComposeOpen] = useState(false);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const { data: subscribersData, isLoading } = useGetAdminSubscribersQuery({});
  const [deleteSubscriber] = useDeleteSubscriberMutation();

  const items = useMemo(() => subscribersData?.items ?? [], [subscribersData]);

  const sources = useMemo(
    () => [...new Set(items.map((s) => s.source))].sort(),
    [items]
  );

  const stats = useMemo(
    () => ({
      total: items.length,
      active: items.filter((s) => s.status === "active").length,
      unsubscribed: items.filter((s) => s.status === "unsubscribed").length,
      templates: emailTemplates.length,
    }),
    [items]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((s) => {
      const matchesQuery =
        !q ||
        s.name.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q);
      const matchesSource = source === "all" || s.source === source;
      const matchesStatus = status === "all" || s.status === status;
      return matchesQuery && matchesSource && matchesStatus;
    });
  }, [items, query, source, status]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageItems = filtered.slice((page - 1) * pageSize, page * pageSize);

  const handleDelete = async (subscriber: AdminSubscriber) => {
    try {
      await deleteSubscriber(subscriber._id).unwrap();
      toast.success("Subscriber removed", `${subscriber.email} has been removed.`);
    } catch {
      toast.error("Failed", "Could not remove subscriber.");
    }
  };

  const sendCompose = () => {
    if (!subject.trim() || !message.trim()) {
      toast.warning("Missing fields", "Please add both a subject and a message.");
      return;
    }
    toast.success("Email queued", `"${subject.trim()}" will be sent to all subscribers.`);
    setSubject("");
    setMessage("");
    setComposeOpen(false);
  };

  const columns: Column<AdminSubscriber>[] = [
    {
      key: "subscriber",
      header: "Subscriber",
      render: (s) => (
        <div className="flex items-center gap-3">
          <AdminAvatar name={s.name} size="sm" />
          <div className="min-w-0">
            <p className="truncate font-semibold text-foreground">{s.name}</p>
            <p className="truncate text-xs text-muted-foreground">{s.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "email",
      header: "Email",
      render: (s) => (
        <span className="truncate font-mono text-xs text-muted-foreground">{s.email}</span>
      ),
    },
    {
      key: "source",
      header: "Source",
      render: (s) => <Badge variant="secondary">{s.source}</Badge>,
    },
    {
      key: "subscribed",
      header: "Subscribed",
      sortable: true,
      sortValue: (s) => s.createdAt,
      render: (s) => <span className="text-muted-foreground">{formatDate(s.createdAt)}</span>,
    },
    {
      key: "status",
      header: "Status",
      render: (s) => (
        <StatusBadge status={s.status} label={s.status === "active" ? "Active" : "Unsubscribed"} />
      ),
    },
    {
      key: "actions",
      header: "Action",
      align: "right",
      render: (s) =>
        s.status === "active" ? (
          <Button
            variant="outline"
            size="xs"
            leftIcon={<FiX className="h-3.5 w-3.5" aria-hidden />}
            onClick={() => handleDelete(s)}
          >
            Unsubscribe
          </Button>
        ) : (
          <Button
            variant="success"
            size="xs"
            leftIcon={<FiCheck className="h-3.5 w-3.5" aria-hidden />}
            onClick={() => handleDelete(s)}
          >
            Remove
          </Button>
        ),
    },
  ];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Newsletter"
        subtitle={`Manage subscribers and email templates — ${stats.total} subscribers total.`}
        breadcrumb={[{ label: "Newsletter" }]}
        actions={
          <>
            <ExportButton
              filename="subscribers"
              data={filtered.map((s) => ({
                Name: s.name,
                Email: s.email,
                Source: s.source,
                Subscribed: s.createdAt,
                Status: s.status,
              }))}
              disabled={filtered.length === 0}
            />
            <Button size="sm" onClick={() => setComposeOpen(true)}>
              <FiSend className="h-4 w-4" aria-hidden />
              Compose email
            </Button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={<FiUsers className="h-5 w-5" aria-hidden />}
          label="Total subscribers"
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
          icon={<FiX className="h-5 w-5" aria-hidden />}
          label="Unsubscribed"
          value={stats.unsubscribed}
          className="bg-warning/15 text-warning"
        />
        <StatCard
          icon={<FiFileText className="h-5 w-5" aria-hidden />}
          label="Email templates"
          value={stats.templates}
          className="bg-info/10 text-info"
        />
      </div>

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
              value={source}
              onChange={(e) => {
                setSource(e.target.value);
                setPage(1);
              }}
              containerClassName="sm:w-44"
              className="h-10"
            >
              <option value="all">All sources</option>
              {sources.map((s) => (
                <option key={s} value={s}>
                  {s}
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
              <option value="unsubscribed">Unsubscribed</option>
            </Select>
          </>
        }
      />

      <DataTable<AdminSubscriber>
        columns={columns}
        rows={pageItems}
        rowKey={(s) => s._id}
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
          icon: <FiMail className="h-7 w-7" aria-hidden />,
          title: "No subscribers found",
          description: "Try adjusting your search or filters.",
        }}
      />

      <section className="space-y-4">
        <h2 className="text-lg font-bold text-foreground">Email templates</h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {emailTemplates.map((template) => (
            <Card key={template.id} hover className="flex flex-col p-5">
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-bold text-foreground">{template.name}</h3>
                <Badge variant="primary">{template.category}</Badge>
              </div>
              <p className="mt-2 font-mono text-sm text-primary">{template.subject}</p>
              <p className="mt-1.5 flex-1 text-sm text-muted-foreground">
                {template.description}
              </p>
              <p className="mt-4 border-t border-border pt-3 text-xs text-muted-foreground">
                Updated {formatDate(template.updatedAt)}
              </p>
            </Card>
          ))}
        </div>
      </section>

      <Modal
        open={composeOpen}
        onClose={() => setComposeOpen(false)}
        title="Compose email"
        subtitle="Send a broadcast to all active subscribers."
        size="md"
      >
        <div className="space-y-4">
          <Input
            label="Subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="e.g. New arrivals this week"
          />
          <Textarea
            label="Message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Write your newsletter content..."
            rows={7}
          />
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="outline" onClick={() => setComposeOpen(false)}>
            Cancel
          </Button>
          <Button onClick={sendCompose} leftIcon={<FiSend className="h-4 w-4" aria-hidden />}>
            Send email
          </Button>
        </div>
      </Modal>
    </div>
  );
}
