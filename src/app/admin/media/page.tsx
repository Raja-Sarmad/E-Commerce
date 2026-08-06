"use client";

import { useMemo, useState } from "react";
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
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { useToast } from "@/context/ToastProvider";
import {
  generateId,
  mediaFiles,
  mediaFoldersList,
} from "@/lib/data/admin";
import type { MediaFile } from "@/lib/data/admin";
import { cn, formatDate } from "@/lib/utils";

const typeVariant: Record<
  MediaFile["type"],
  "primary" | "info" | "outline"
> = {
  image: "primary",
  video: "info",
  document: "outline",
};

type UploadForm = {
  name: string;
  type: MediaFile["type"];
};

const emptyUpload: UploadForm = {
  name: "",
  type: "image",
};

export default function AdminMediaPage() {
  const { success, warning } = useToast();
  const [items, setItems] = useState<MediaFile[]>(mediaFiles);
  const [folder, setFolder] = useState("all");
  const [query, setQuery] = useState("");
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadForm, setUploadForm] = useState<UploadForm>(emptyUpload);
  const [deleteTarget, setDeleteTarget] = useState<MediaFile | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((f) => {
      const matchesFolder = folder === "all" || f.folder === folder;
      const matchesQuery = !q || f.name.toLowerCase().includes(q);
      return matchesFolder && matchesQuery;
    });
  }, [items, folder, query]);

  const folderCount = (name: string) =>
    mediaFoldersList.find((f) => f.name === name)?.files ?? 0;

  const openUpload = () => {
    setUploadForm(emptyUpload);
    setUploadOpen(true);
  };

  const handleUpload = () => {
    const name = uploadForm.name.trim();
    if (!name) {
      warning("File name required", "Please enter a file name.");
      return;
    }
    const targetFolder = folder === "all" ? "Other" : folder;
    const file: MediaFile = {
      id: generateId("mf"),
      name,
      url: `https://picsum.photos/seed/upload-${Date.now()}/600/600`,
      type: uploadForm.type,
      size: "—",
      folder: targetFolder,
      uploadedAt: new Date().toISOString(),
    };
    setItems((prev) => [file, ...prev]);
    setUploadOpen(false);
    setUploadForm(emptyUpload);
    success("File uploaded", `“${name}” was added to the media library.`);
  };

  const remove = () => {
    if (!deleteTarget) return;
    setItems((prev) => prev.filter((f) => f.id !== deleteTarget.id));
    success("File removed", `“${deleteTarget.name}” was deleted.`);
    setDeleteTarget(null);
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
                {mediaFiles.length}
              </span>
            </button>
            {mediaFoldersList.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFolder(f.name)}
                className={cn(
                  "flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
                  folder === f.name
                    ? "bg-primary/10 font-semibold text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <span className="flex min-w-0 items-center gap-2">
                  <FiFolder className="h-4 w-4 shrink-0" aria-hidden />
                  <span className="truncate">{f.name}</span>
                </span>
                <span className="text-xs text-muted-foreground">
                  {folderCount(f.name)}
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

          {filtered.length === 0 ? (
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
                    ) : (
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
          <Input
            type="file"
            label="File"
            hint="Demo upload — pick any file; only the name is stored."
            containerClassName=""
          />
          <Input
            label="Name"
            value={uploadForm.name}
            onChange={(e) => setUploadForm({ ...uploadForm, name: e.target.value })}
            placeholder="e.g. product-01.jpg"
          />
          <Select
            label="Type"
            value={uploadForm.type}
            onChange={(e) =>
              setUploadForm({
                ...uploadForm,
                type: e.target.value as MediaFile["type"],
              })
            }
          >
            <option value="image">Image</option>
            <option value="video">Video</option>
            <option value="document">Document</option>
          </Select>
          <p className="text-xs text-muted-foreground">
            The file will be added to the{" "}
            <span className="font-semibold text-foreground">
              {folder === "all" ? "Other" : folder}
            </span>{" "}
            folder.
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setUploadOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpload}>
              <FiUpload className="h-4 w-4" aria-hidden />
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
        description={`This will permanently remove “${deleteTarget?.name}”. This action cannot be undone.`}
        confirmLabel="Delete"
      />
    </div>
  );
}
