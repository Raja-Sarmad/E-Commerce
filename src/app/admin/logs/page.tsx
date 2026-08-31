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
import { DateRangeFilter } from "@/components/admin/DateRangeFilter";
import { dateRangeFromPreset, type DateRangePreset } from "@/lib/admin-filters";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { ExportButton } from "@/components/admin/ExportButton";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { toast } from "@/hooks/use-toast";
import {
  useGetAdminLogsQuery,
  useClearLogsMutation,
  type AdminLog,
} from "@/lib/rtk/adminApi";
import { formatDate, formatNumber } from "@/lib/utils";

const PER_PAGE = 10;

const typeVariant: Record<string, "primary" | "info" | "destructive" | "outline"> = {
  login: "primary",
  activity: "info",
  error: "destructive",
  audit: "outline",
};

const levelStatus: Record<string, string> = {
  info: "info",
  warning: "warning",
  error: "failed",
  success: "succeeded",
};

export default function AdminLogsPage() {
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [levelFilter, setLevelFilter] = useState("all");
  const [dateRange, setDateRange] = useState<DateRangePreset>("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PER_PAGE);
  const [clearOpen, setClearOpen] = useState(false);

  const dates = useMemo(() => dateRangeFromPreset(dateRange), [dateRange]);

  const { data: logsData, isLoading } = useGetAdminLogsQuery({
    page,
    limit: pageSize,
    search: query || undefined,
    type: typeFilter !== "all" ? typeFilter : undefined,
    level: levelFilter !== "all" ? levelFilter : undefined,
    ...dates,
  });
  const [clearLogsApi] = useClearLogsMutation();

  const items: AdminLog[] = logsData?.items ?? [];
  const totalPages = logsData?.totalPages ?? 1;
  const totalItems = logsData?.total ?? items.length;
  const pageItems = items;

  const stats = useMemo(
    () => ({
      total: totalItems,
      errors: items.filter((l) => l.level === "error").length,
      warnings: items.filter((l) => l.level === "warning").length,
      logins: items.filter((l) => l.type === "login").length,
    }),
    [items, totalItems]
  );

  const handleClearLogs = async () => {
    try {
      await clearLogsApi().unwrap();
      setClearOpen(false);
      toast.success("Logs cleared", "All log entries were removed.");
    } catch {
      toast.error("Failed", "Could not clear logs.");
    }
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

  const columns: Column<AdminLog>[] = [
    {
      key: "timestamp",
      header: "Timestamp",
      sortable: true,
      sortValue: (l) => l.createdAt,
      render: (l) => (
        <div className="whitespace-nowrap">
          <p className="font-semibold text-foreground">{formatDate(l.createdAt)}</p>
          <p className="text-xs text-muted-foreground">{formatTime(l.createdAt)}</p>
        </div>
      ),
    },
    {
      key: "type",
      header: "Type",
      sortable: true,
      sortValue: (l) => l.type,
      render: (l) => (
        <Badge variant={typeVariant[l.type] ?? "outline"} className="whitespace-nowrap">
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
        <StatusBadge status={levelStatus[l.level] ?? "info"} label={l.level} />
      ),
    },
    {
      key: "user",
      header: "User",
      sortable: true,
      sortValue: (l) => l.user ?? "",
      render: (l) => (
        <span className="max-w-[180px] truncate text-muted-foreground">
          {l.user ?? "System"}
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
              data={pageItems.map((l) => ({
                Timestamp: l.createdAt,
                Type: l.type,
                Level: l.level,
                User: l.user ?? "System",
                Action: l.action,
                Details: l.details,
                IP: l.ip,
              }))}
              disabled={pageItems.length === 0}
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
            <DateRangeFilter
              value={dateRange}
              onChange={(v) => {
                setDateRange(v);
                setPage(1);
              }}
            />
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

      <DataTable<AdminLog>
        columns={columns}
        rows={pageItems}
        rowKey={(l) => l._id}
        loading={isLoading}
        pagination={{
          page,
          totalPages,
          totalItems: totalItems,
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
        onConfirm={handleClearLogs}
        title="Clear all logs?"
        description="This will permanently remove every log entry. This action cannot be undone."
        confirmLabel="Clear logs"
      />
    </div>
  );
}
