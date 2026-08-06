"use client";

import { useMemo, useState } from "react";
import {
  FiAlertCircle,
  FiList,
  FiLogIn,
  FiTrash2,
  FiTriangle,
} from "react-icons/fi";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { FilterBar } from "@/components/admin/FilterBar";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { ExportButton } from "@/components/admin/ExportButton";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/context/ToastProvider";
import { logs } from "@/lib/data/admin";
import type { LogEntry } from "@/lib/data/admin";
import { formatDate, formatNumber } from "@/lib/utils";

const PER_PAGE = 10;

const typeVariant: Record<
  LogEntry["type"],
  "primary" | "info" | "destructive" | "outline"
> = {
  login: "primary",
  activity: "info",
  error: "destructive",
  audit: "outline",
};

const levelStatus: Record<LogEntry["level"], string> = {
  info: "info",
  warning: "warning",
  error: "failed",
  success: "succeeded",
};

export default function AdminLogsPage() {
  const { success } = useToast();
  const [items, setItems] = useState<LogEntry[]>(logs);
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [levelFilter, setLevelFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PER_PAGE);
  const [clearOpen, setClearOpen] = useState(false);

  const stats = useMemo(
    () => ({
      total: items.length,
      errors: items.filter((l) => l.level === "error").length,
      warnings: items.filter((l) => l.level === "warning").length,
      logins: items.filter((l) => l.type === "login").length,
    }),
    [items]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((l) => {
      const matchesQuery =
        !q ||
        l.user.toLowerCase().includes(q) ||
        l.action.toLowerCase().includes(q) ||
        l.details.toLowerCase().includes(q) ||
        l.ip.toLowerCase().includes(q);
      const matchesType = typeFilter === "all" || l.type === typeFilter;
      const matchesLevel = levelFilter === "all" || l.level === levelFilter;
      return matchesQuery && matchesType && matchesLevel;
    });
  }, [items, query, typeFilter, levelFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageItems = filtered.slice((page - 1) * pageSize, page * pageSize);

  const clearLogs = () => {
    setItems([]);
    setClearOpen(false);
    success("Logs cleared", "All log entries were removed.");
  };

  const handlePageSize = (size: number) => {
    setPageSize(size);
    setPage(1);
  };

  const formatTime = (timestamp: string) =>
    new Date(timestamp).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });

  const columns: Column<LogEntry>[] = [
    {
      key: "timestamp",
      header: "Timestamp",
      sortable: true,
      sortValue: (l) => l.timestamp,
      render: (l) => (
        <div className="whitespace-nowrap">
          <p className="font-semibold text-foreground">{formatDate(l.timestamp)}</p>
          <p className="text-xs text-muted-foreground">{formatTime(l.timestamp)}</p>
        </div>
      ),
    },
    {
      key: "type",
      header: "Type",
      sortable: true,
      sortValue: (l) => l.type,
      render: (l) => (
        <Badge variant={typeVariant[l.type]} className="whitespace-nowrap">
          {l.type}
        </Badge>
      ),
    },
    {
      key: "level",
      header: "Level",
      align: "center",
      sortable: true,
      sortValue: (l) => l.level,
      render: (l) => (
        <StatusBadge status={levelStatus[l.level]} label={l.level} />
      ),
    },
    {
      key: "user",
      header: "User",
      sortable: true,
      sortValue: (l) => l.user,
      render: (l) => (
        <span className="max-w-[180px] truncate text-muted-foreground">
          {l.user}
        </span>
      ),
    },
    {
      key: "action",
      header: "Action",
      sortable: true,
      sortValue: (l) => l.action,
      render: (l) => (
        <span className="whitespace-nowrap font-medium text-foreground">
          {l.action}
        </span>
      ),
    },
    {
      key: "details",
      header: "Details",
      sortable: true,
      sortValue: (l) => l.details,
      render: (l) => (
        <span className="block max-w-[220px] truncate text-muted-foreground">
          {l.details}
        </span>
      ),
    },
    {
      key: "ip",
      header: "IP",
      align: "right",
      sortable: true,
      sortValue: (l) => l.ip,
      render: (l) => (
        <code className="whitespace-nowrap rounded-md bg-muted px-2 py-0.5 font-mono text-xs text-muted-foreground">
          {l.ip}
        </code>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="System Logs"
        subtitle={`Audit trail of system activity — ${stats.total} entries.`}
        breadcrumb={[{ label: "System Logs" }]}
        actions={
          <>
            <ExportButton
              filename="system-logs"
              data={filtered.map((l) => ({
                Timestamp: l.timestamp,
                Type: l.type,
                Level: l.level,
                User: l.user,
                Action: l.action,
                Details: l.details,
                IP: l.ip,
              }))}
              disabled={filtered.length === 0}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => setClearOpen(true)}
              disabled={items.length === 0}
            >
              <FiTrash2 className="h-4 w-4" aria-hidden />
              Clear logs
            </Button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="flex items-center gap-4 p-5">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <FiList className="h-5 w-5" aria-hidden />
          </span>
          <div>
            <p className="text-sm text-muted-foreground">Total entries</p>
            <p className="text-2xl font-extrabold text-foreground">
              {formatNumber(stats.total)}
            </p>
          </div>
        </Card>
        <Card className="flex items-center gap-4 p-5">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
            <FiAlertCircle className="h-5 w-5" aria-hidden />
          </span>
          <div>
            <p className="text-sm text-muted-foreground">Errors</p>
            <p className="text-2xl font-extrabold text-foreground">
              {formatNumber(stats.errors)}
            </p>
          </div>
        </Card>
        <Card className="flex items-center gap-4 p-5">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-warning/15 text-warning">
            <FiTriangle className="h-5 w-5" aria-hidden />
          </span>
          <div>
            <p className="text-sm text-muted-foreground">Warnings</p>
            <p className="text-2xl font-extrabold text-foreground">
              {formatNumber(stats.warnings)}
            </p>
          </div>
        </Card>
        <Card className="flex items-center gap-4 p-5">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-success/10 text-success">
            <FiLogIn className="h-5 w-5" aria-hidden />
          </span>
          <div>
            <p className="text-sm text-muted-foreground">Logins</p>
            <p className="text-2xl font-extrabold text-foreground">
              {formatNumber(stats.logins)}
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
        searchPlaceholder="Search by user, action, details or IP..."
        leftSlot={
          <>
            <Select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setPage(1);
              }}
              containerClassName="sm:w-40"
              className="h-10"
            >
              <option value="all">All types</option>
              <option value="login">Login</option>
              <option value="activity">Activity</option>
              <option value="error">Error</option>
              <option value="audit">Audit</option>
            </Select>
            <Select
              value={levelFilter}
              onChange={(e) => {
                setLevelFilter(e.target.value);
                setPage(1);
              }}
              containerClassName="sm:w-40"
              className="h-10"
            >
              <option value="all">All levels</option>
              <option value="info">Info</option>
              <option value="warning">Warning</option>
              <option value="error">Error</option>
              <option value="success">Success</option>
            </Select>
          </>
        }
      />

      <DataTable<LogEntry>
        columns={columns}
        rows={pageItems}
        rowKey={(l) => l.id}
        pagination={{
          page,
          totalPages,
          totalItems: filtered.length,
          pageSize,
          onPageChange: setPage,
          onPageSizeChange: handlePageSize,
          pageSizeOptions: [10, 25, 50],
        }}
        empty={{
          icon: <FiList className="h-7 w-7" aria-hidden />,
          title: "No logs found",
          description: "Try adjusting your search or filters.",
        }}
      />

      <ConfirmDialog
        open={clearOpen}
        onClose={() => setClearOpen(false)}
        onConfirm={clearLogs}
        title="Clear all logs?"
        description="This will permanently remove every log entry. This action cannot be undone."
        confirmLabel="Clear logs"
      />
    </div>
  );
}
