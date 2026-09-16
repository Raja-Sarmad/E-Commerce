"use client";

import { useMemo, useRef, useState } from "react";
import { FiTrash2, FiUpload, FiVideo } from "react-icons/fi";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/ui/Button";
import { toast } from "@/hooks/use-toast";
import { uploadVideoToCloudinary } from "@/lib/cloudinary-upload";
import {
  useGetAdminReelsQuery,
  useCreateReelMutation,
  useUpdateReelMutation,
  useDeleteReelMutation,
  type AdminReel,
} from "@/lib/rtk/adminApi";

const SLOTS = [0, 1, 2, 3, 4] as const;

const SLOT_HEIGHT: Record<number, string> = {
  0: "h-[280px]",
  1: "h-[210px]",
  2: "h-[360px]",
  3: "h-[210px]",
  4: "h-[280px]",
};

const SLOT_WIDTH: Record<number, string> = {
  0: "w-[140px]",
  1: "w-[120px]",
  2: "w-[160px]",
  3: "w-[120px]",
  4: "w-[140px]",
};

const SLOT_LABELS: Record<number, string> = {
  0: "Card 1 — left",
  1: "Card 2 — inner",
  2: "Card 3 — center (tallest)",
  3: "Card 4 — inner",
  4: "Card 5 — right",
};

export default function AdminReelsPage() {
  const fileRefs = useRef<Record<number, HTMLInputElement | null>>({});
  const [busySlot, setBusySlot] = useState<number | null>(null);

  const { data: reels = [], isLoading } = useGetAdminReelsQuery();
  const [createReel] = useCreateReelMutation();
  const [updateReel] = useUpdateReelMutation();
  const [deleteReel] = useDeleteReelMutation();

  const bySlot = useMemo(() => {
    const map = new Map<number, AdminReel>();
    for (const reel of reels) map.set(reel.slot, reel);
    return map;
  }, [reels]);

  const uploadForSlot = async (slot: number, file: File) => {
    if (!file.type.startsWith("video/")) {
      toast.warning("Invalid file", "Please choose an MP4, WebM, or MOV video.");
      return;
    }
    if (file.size > 100 * 1024 * 1024) {
      toast.warning("File too large", "Maximum video size is 100 MB.");
      return;
    }

    setBusySlot(slot);
    try {
      const { url, publicId } = await uploadVideoToCloudinary(file);
      const existing = bySlot.get(slot);
      const body = {
        title: `Reel ${slot + 1}`,
        video: url,
        publicId,
        slot,
        active: true,
        link: "/shop",
      };

      if (existing) {
        await updateReel({ id: existing._id, body }).unwrap();
        toast.success("Video updated", `${SLOT_LABELS[slot]} saved.`);
      } else {
        await createReel(body).unwrap();
        toast.success("Video added", `${SLOT_LABELS[slot]} saved.`);
      }
    } catch (err) {
      toast.error("Upload failed", err instanceof Error ? err.message : "Could not save video.");
    } finally {
      setBusySlot(null);
    }
  };

  const removeSlot = async (slot: number) => {
    const existing = bySlot.get(slot);
    if (!existing) return;
    setBusySlot(slot);
    try {
      await deleteReel(existing._id).unwrap();
      toast.success("Video removed", `${SLOT_LABELS[slot]} cleared.`);
    } catch {
      toast.error("Error", "Could not remove video.");
    } finally {
      setBusySlot(null);
    }
  };

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Reels"
        subtitle="Homepage cards are fixed — upload a video for each slot."
        breadcrumb={[{ label: "Reels" }]}
      />

      <p className="text-sm text-muted-foreground">
        Click a card to upload or replace its video. Layout on the storefront stays the same; only
        the video inside each card changes.
      </p>

      <div className="flex items-center justify-center gap-3 rounded-2xl border border-border bg-foreground px-4 py-10">
        {isLoading
          ? SLOTS.map((slot) => (
              <div
                key={slot}
                className={`shrink-0 animate-pulse rounded-2xl border-[3px] border-primary/30 bg-primary/10 ${SLOT_HEIGHT[slot]} ${SLOT_WIDTH[slot]}`}
              />
            ))
          : SLOTS.map((slot) => {
              const reel = bySlot.get(slot);
              const busy = busySlot === slot;

              return (
                <div key={slot} className="flex flex-col items-center gap-3">
                  <div
                    className={`relative shrink-0 overflow-hidden rounded-2xl border-[3px] border-primary bg-black ${SLOT_HEIGHT[slot]} ${SLOT_WIDTH[slot]}`}
                  >
                    {reel?.video ? (
                      <video
                        src={reel.video}
                        className="h-full w-full object-cover"
                        muted
                        playsInline
                        preload="metadata"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-primary/5">
                        <FiVideo className="h-8 w-8 text-primary/40" aria-hidden />
                      </div>
                    )}
                    {busy ? (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-xs font-medium text-white">
                        Uploading…
                      </div>
                    ) : null}
                  </div>

                  <p className="text-center text-xs font-medium text-muted-foreground">
                    {SLOT_LABELS[slot]}
                  </p>

                  <input
                    ref={(el) => {
                      fileRefs.current[slot] = el;
                    }}
                    type="file"
                    accept="video/mp4,video/webm,video/quicktime"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) void uploadForSlot(slot, file);
                      e.target.value = "";
                    }}
                  />

                  <div className="flex gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={busy}
                      onClick={() => fileRefs.current[slot]?.click()}
                    >
                      <FiUpload className="h-4 w-4" aria-hidden />
                      {reel ? "Replace" : "Upload"}
                    </Button>
                    {reel ? (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        disabled={busy}
                        onClick={() => void removeSlot(slot)}
                        className="text-destructive hover:text-destructive"
                      >
                        <FiTrash2 className="h-4 w-4" aria-hidden />
                      </Button>
                    ) : null}
                  </div>
                </div>
              );
            })}
      </div>
    </div>
  );
}
