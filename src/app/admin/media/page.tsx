"use client";

import { useMemo, useRef, useState } from "react";
import {
  FiFileText,
  FiFolder,
  FiImage,
  FiTrash2,
  FiUpload,
  FiVideo,
} from "react-icons/fi";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { FilterBar } from "@/components/admin/FilterBar";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { ExportButton } from "@/components/admin/ExportButton";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Modal } from "@/components/ui/Modal";
import { toast } from "@/hooks/use-toast";
import {
  useGetMediaQuery,
  useUploadMediaMutation,
  useDeleteMediaMutation,
} from "@/lib/rtk/adminApi";
import { getErrorMessage } from "@/lib/rtk/baseApi";
import { cn, formatDate } from "@/lib/utils";

type MediaFile = {
  id: string;
  name: string;
  url: string;
  type: "image" | "video" | "document";
  size: string;
  folder: string;
  uploadedAt: string;
};

const typeVariant: Record<
  MediaFile["type"],
  "primary" | "info" | "outline"
> = {
  image: "primary",
  video: "info",
  document: "outline",
};

function toMediaFile(raw: Record<string, unknown>): MediaFile {
  const mime = String(raw.mimeType ?? "");
  const type: MediaFile["type"] = mime.startsWith("video/")
    ? "video"
    : mime.startsWith("application/") || mime.startsWith("text/")
      ? "document"
      : "image";
  const sizeBytes = Number(raw.size ?? 0);
  const size =
    sizeBytes > 0
      ? sizeBytes > 1024 * 1024
        ? `${(sizeBytes / (1024 * 1024)).toFixed(1)} MB`
        : `${Math.round(sizeBytes / 1024)} KB`
      : "—";
  return {
    id: String(raw._id ?? ""),
    name: String(raw.name ?? raw.originalName ?? "Untitled"),
    url: String(raw.url ?? ""),
    type,
    size,
    folder: String(raw.folder ?? "Other"),
    uploadedAt: String(raw.uploadedAt ?? raw.createdAt ?? new Date().toISOString()),
  };
}

export default function AdminMediaPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { data: rawFiles = [], isLoading } = useGetMediaQuery({});
  const [uploadMedia, { isLoading: isUploading }] = useUploadMediaMutation();
  const [deleteMedia] = useDeleteMediaMutation();

  const items = useMemo(() => rawFiles.map(toMediaFile), [rawFiles]);

  const [folder, setFolder] = useState("all");
  const [query, setQuery] = useState("");
  const [uploadOpen, setUploadOpen] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [uploadName, setUploadName] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<MediaFile | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((f) => {
      const matchesFolder = folder === "all" || f.folder === folder;
      const matchesQuery = !q || f.name.toLowerCase().includes(q);
      return matchesFolder && matchesQuery;
    });
  }, [items, folder, query]);

  const folders = useMemo(
    () => [...new Set(items.map((f) => f.folder))].sort(),
    [items]
  );
  const folderCount = (name: string) =>
    items.filter((f) => f.folder === name).length;

  const openUpload = () => {
    setPendingFile(null);
    setUploadName("");
    setUploadOpen(true);
  };

  const handleUpload = async () => {
    if (!pendingFile) {
      toast.warning("File required", "Please choose a file to upload.");
      return;
    }
    try {
      const form = new FormData();
      form.append("file", pendingFile);
      if (uploadName.trim()) form.append("name", uploadName.trim());
      if (folder !== "all") form.append("folder", folder);
      await uploadMedia(form).unwrap();
      setUploadOpen(false);
      toast.success(
        "File uploaded",
        `"${uploadName.trim() || pendingFile.name}" was added to the media library.`
      );
    } catch (err) {
      toast.warning("Upload failed", getErrorMessage(err));
    }
  };

  const remove = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMedia(deleteTarget.id).unwrap();
      toast.success("File removed", `"${deleteTarget.name}" was deleted.`);
      setDeleteTarget(null);
    } catch (err) {
      toast.warning("Could not delete", getErrorMessage(err));
    }
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Media Library"
        subtitle={`Manage images, videos and documents — ${items.length} files total.`}
        breadcrumb={[{ label: "Media" }]}
        actions={
          <ExportButton
            filename="media"
            data={filtered.map((f) => ({
              Name: f.name,
              Type: f.type,
              Size: f.size,
              Folder: f.folder,
              Uploaded: f.uploadedAt,
              URL: f.url,
            }))}
            disabled={filtered.length === 0}
          />
        }
      />

      <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
        <aside className="w-full shrink-0 sm:w-56">
          <div className="space-y-1">
            <button
              type="button"
              onClick={() => setFolder("all")}
              className={cn(
                "flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
                folder === "all"
                  ? "bg-primary/10 font-semibold text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <span className="flex min-w-0 items-center gap-2">
                <FiFolder className="h-4 w-4 shrink-0" aria-hidden />
                <span className="truncate">All media</span>
              </span>
              <span className="text-xs text-muted-foreground">
                {items.length}
              </span>
            </button>
            {folders.map((name) => (
              <button
                key={name}
                type="button"
                onClick={() => setFolder(name)}
                className={cn(
                  "flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
                  folder === name
                    ? "bg-primary/10 font-semibold text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <span className="flex min-w-0 items-center gap-2">
                  <FiFolder className="h-4 w-4 shrink-0" aria-hidden />
                  <span className="truncate">{name}</span>
                </span>
                <span className="text-xs text-muted-foreground">
                  {folderCount(name)}
                </span>
              </button>
            ))}
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <FilterBar
            searchValue={query}
            onSearchChange={setQuery}
            searchPlaceholder="Search by file name..."
            rightSlot={
              <Button size="sm" onClick={openUpload}>
                <FiUpload className="h-4 w-4" aria-hidden />
                Upload
              </Button>
            }
          />

          {!isLoading && filtered.length === 0 ? (
            <div className="mt-6">
              <EmptyState
                icon={<FiImage className="h-7 w-7" aria-hidden />}
                title="No media files found"
                description="Try adjusting your search or folder, or upload a new file."
                actionLabel="Upload file"
                onAction={openUpload}
              />
            </div>
          ) : (
            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {filtered.map((file) => (
                <Card key={file.id} className="group overflow-hidden">
                  <div className="relative aspect-square overflow-hidden bg-muted">
                    {file.type === "document" ? (
                      <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                        <FiFileText className="h-10 w-10" aria-hidden />
                      </div>
                    ) : file.url ? (
                      <>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={file.url}
                          alt={file.name}
                          className="h-full w-full object-cover"
                        />
                        {file.type === "video" && (
                          <span className="absolute inset-0 flex items-center justify-center bg-black/30">
                            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-foreground">
                              <FiVideo className="h-5 w-5" aria-hidden />
                            </span>
                          </span>
                        )}
                      </>
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                        <FiImage className="h-10 w-10" aria-hidden />
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(file)}
                      aria-label={`Delete ${file.name}`}
                      className="absolute right-2 top-2 rounded-lg bg-card/90 p-2 text-destructive opacity-0 shadow-sm transition-opacity hover:bg-destructive hover:text-white group-hover:opacity-100"
                    >
                      <FiTrash2 className="h-4 w-4" aria-hidden />
                    </button>
                  </div>
                  <div className="p-3">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {file.name}
                    </p>
                    <div className="mt-1 flex items-center justify-between gap-2">
                      <span className="text-xs text-muted-foreground">
                        {file.size}
                      </span>
                      <Badge variant={typeVariant[file.type]}>
                        {file.type}
                      </Badge>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {formatDate(file.uploadedAt)}
                    </p>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      <Modal
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        title="Upload file"
        subtitle="Add a file to the media library."
        size="md"
      >
        <div className="space-y-4">
          <input
            ref={fileInputRef}
            type="file"
            onChange={(e) => setPendingFile(e.target.files?.[0] ?? null)}
            className="block w-full text-sm text-foreground file:mr-3 file:rounded-lg file:border-0 file:bg-primary/10 file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-primary"
          />
          {pendingFile && (
            <p className="text-xs text-muted-foreground">
              Selected:{" "}
              <span className="font-semibold text-foreground">
                {pendingFile.name}
              </span>{" "}
              ({Math.round(pendingFile.size / 1024)} KB)
            </p>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setUploadOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              loading={isUploading}
              leftIcon={!isUploading ? <FiUpload className="h-4 w-4" aria-hidden /> : undefined}
            >
              Upload file
            </Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={remove}
        title="Delete file?"
        description={`This will permanently remove "${deleteTarget?.name}". This action cannot be undone.`}
        confirmLabel="Delete"
      />
    </div>
  );
}
