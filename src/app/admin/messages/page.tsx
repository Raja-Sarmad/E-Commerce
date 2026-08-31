"use client";

import { useMemo, useState } from "react";
import { FiArchive, FiInbox, FiMail, FiSearch, FiSend, FiStar } from "react-icons/fi";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Modal } from "@/components/ui/Modal";
import { EmptyState } from "@/components/ui/EmptyState";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { DateRangeFilter } from "@/components/admin/DateRangeFilter";
import { dateRangeFromPreset, type DateRangePreset } from "@/lib/admin-filters";
import { AdminAvatar } from "@/components/admin/AdminAvatar";
import { ExportButton } from "@/components/admin/ExportButton";
import { toast } from "@/hooks/use-toast";
import {
  useGetAdminMessagesQuery,
  useUpdateMessageMutation,
  useDeleteMessageMutation,
  type AdminMessage,
} from "@/lib/rtk/adminApi";
import { getErrorMessage } from "@/lib/rtk/baseApi";
import { formatDateLong, timeAgo } from "@/lib/utils";
import { cn } from "@/lib/utils";

export default function AdminMessagesPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateRange, setDateRange] = useState<DateRangePreset>("all");
  const [query, setQuery] = useState("");
  const [replyOpen, setReplyOpen] = useState(false);
  const [replyText, setReplyText] = useState("");

  const dates = useMemo(() => dateRangeFromPreset(dateRange), [dateRange]);

  const { data } = useGetAdminMessagesQuery({
    search: query || undefined,
    status: statusFilter !== "all" ? statusFilter : undefined,
    limit: 100,
    ...dates,
  });

  const [updateMessage] = useUpdateMessageMutation();
  const [deleteMessage] = useDeleteMessageMutation();

  const items: AdminMessage[] = data?.items ?? [];

  const selected = items.find((m) => m._id === selectedId) ?? null;
  const filtered = items;

  const toggleRead = async (message: AdminMessage) => {
    const newStatus = message.status === "read" ? "unread" : "read";
    try {
      await updateMessage({ id: message._id, body: { status: newStatus } }).unwrap();
      toast.info(
        newStatus === "read" ? "Marked as read" : "Marked as unread",
        `Message from ${message.name}.`
      );
    } catch (err) {
      toast.error("Error", getErrorMessage(err));
    }
  };

  const toggleStar = async (message: AdminMessage) => {
    try {
      await updateMessage({ id: message._id, body: { starred: !message.starred } }).unwrap();
      toast.info(
        !message.starred ? "Starred" : "Unstarred",
        `Message from ${message.name}.`
      );
    } catch (err) {
      toast.error("Error", getErrorMessage(err));
    }
  };

  const toggleArchive = async (message: AdminMessage) => {
    const newStatus = message.status === "archived" ? "read" : "archived";
    try {
      await updateMessage({ id: message._id, body: { status: newStatus } }).unwrap();
      toast.info(
        newStatus === "archived" ? "Archived" : "Unarchived",
        `Message from ${message.name}.`
      );
    } catch (err) {
      toast.error("Error", getErrorMessage(err));
    }
  };

  const sendReply = () => {
    if (!replyText.trim()) {
      toast.warning("Empty reply", "Write a message before sending.");
      return;
    }
    toast.success("Reply sent", `Your reply to ${selected?.email} has been queued.`);
    setReplyText("");
    setReplyOpen(false);
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Messages"
        subtitle={`Inbox of customer contact messages — ${items.filter((m) => m.status === "unread").length} unread.`}
        breadcrumb={[{ label: "Messages" }]}
        actions={
          <ExportButton
            filename="contact-messages"
            data={filtered.map((m) => ({
              Name: m.name,
              Email: m.email,
              Subject: m.subject,
              Message: m.message,
              Date: m.createdAt,
              Status: m.status,
              Starred: m.starred ? "Yes" : "No",
            }))}
            disabled={filtered.length === 0}
          />
        }
      />

      <div className="grid items-start gap-6 lg:grid-cols-[1fr_2fr]">
        <Card className="flex h-full flex-col overflow-hidden">
          <div className="space-y-3 border-b border-border p-4">
            <DateRangeFilter
              value={dateRange}
              onChange={setDateRange}
              containerClassName="w-full"
            />
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              containerClassName="sm:w-full"
              className="h-10"
              aria-label="Filter by status"
            >
              <option value="all">All messages</option>
              <option value="unread">Unread</option>
              <option value="read">Read</option>
              <option value="archived">Archived</option>
            </Select>
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name or subject..."
              leftIcon={<FiSearch className="h-4 w-4" aria-hidden />}
              className="h-10"
            />
          </div>
          <div className="max-h-[calc(100vh-24rem)] min-h-[420px] divide-y divide-border overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="flex h-full min-h-[420px] flex-col items-center justify-center gap-3 p-6 text-center">
                <FiInbox className="h-7 w-7 text-muted-foreground" aria-hidden />
                <p className="text-sm text-muted-foreground">No messages match your filters.</p>
              </div>
            ) : (
              filtered.map((message) => (
                <div
                  key={message._id}
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelectedId(message._id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") setSelectedId(message._id);
                  }}
                  className={cn(
                    "flex w-full cursor-pointer items-start gap-3 px-4 py-3.5 text-left transition-colors hover:bg-muted/40",
                    selectedId === message._id && "bg-primary/5"
                  )}
                >
                  <AdminAvatar name={message.name} size="sm" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p
                        className={cn(
                          "truncate text-sm text-foreground",
                          message.status === "unread" ? "font-bold" : "font-medium"
                        )}
                      >
                        {message.name}
                      </p>
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {timeAgo(message.createdAt)}
                      </span>
                    </div>
                    <p className="truncate text-sm text-muted-foreground">{message.subject}</p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1.5">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleStar(message);
                      }}
                      aria-label={message.starred ? "Unstar message" : "Star message"}
                      className={cn(
                        "rounded-lg p-1 transition-colors",
                        message.starred
                          ? "text-warning"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                    >
                      <FiStar
                        className={cn("h-4 w-4", message.starred && "fill-current")}
                        aria-hidden
                      />
                    </button>
                    {message.status === "unread" && (
                      <span className="h-2 w-2 rounded-full bg-primary" aria-hidden />
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {selected ? (
          <Card className="flex h-full flex-col p-6">
            <div className="flex items-start justify-between gap-4">
              <h2 className="text-xl font-bold text-foreground">{selected.subject}</h2>
              <button
                type="button"
                onClick={() => toggleStar(selected)}
                aria-label={selected.starred ? "Unstar message" : "Star message"}
                className={cn(
                  "rounded-lg p-2 transition-colors",
                  selected.starred
                    ? "text-warning"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <FiStar className={cn("h-5 w-5", selected.starred && "fill-current")} aria-hidden />
              </button>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-3 border-b border-border pb-5">
              <AdminAvatar name={selected.name} size="md" />
              <div className="min-w-0">
                <p className="font-semibold text-foreground">{selected.name}</p>
                <p className="flex items-center gap-1.5 truncate text-sm text-muted-foreground">
                  <FiMail className="h-3.5 w-3.5 shrink-0" aria-hidden />
                  {selected.email}
                </p>
              </div>
              <span className="ml-auto text-xs text-muted-foreground">
                {formatDateLong(selected.createdAt)}
              </span>
            </div>

            <div className="mt-5 flex-1">
              <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                {selected.message}
              </p>
            </div>

            <div className="mt-6 flex flex-wrap gap-2 border-t border-border pt-5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => toggleRead(selected)}
              >
                {selected.status === "read" ? "Mark as unread" : "Mark as read"}
              </Button>
              <Button variant="outline" size="sm" onClick={() => toggleStar(selected)}>
                {selected.starred ? "Unstar" : "Star"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                leftIcon={<FiArchive className="h-4 w-4" aria-hidden />}
                onClick={() => toggleArchive(selected)}
              >
                {selected.status === "archived" ? "Unarchive" : "Archive"}
              </Button>
              <Button
                size="sm"
                leftIcon={<FiSend className="h-4 w-4" aria-hidden />}
                onClick={() => setReplyOpen(true)}
              >
                Reply
              </Button>
            </div>
          </Card>
        ) : (
          <EmptyState
            icon={<FiInbox className="h-7 w-7" aria-hidden />}
            title="No message selected"
            description="Select a message from the list to read and reply to it."
          />
        )}
      </div>

      <Modal
        open={replyOpen}
        onClose={() => setReplyOpen(false)}
        title={selected ? `Reply to ${selected.name}` : "Reply"}
        subtitle={selected?.email}
        size="md"
      >
        <Textarea
          label="Message"
          value={replyText}
          onChange={(e) => setReplyText(e.target.value)}
          placeholder="Write your reply..."
          rows={6}
        />
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="outline" onClick={() => setReplyOpen(false)}>
            Cancel
          </Button>
          <Button onClick={sendReply} leftIcon={<FiSend className="h-4 w-4" aria-hidden />}>
            Send reply
          </Button>
        </div>
      </Modal>
    </div>
  );
}
