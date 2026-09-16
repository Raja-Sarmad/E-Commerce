"use client";

import { useMemo } from "react";
import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { useGetStorefrontReelsQuery } from "@/lib/rtk/storefrontApi";

/** Fixed wave layout — slots 0–4 left → right. */
const SLOTS = [0, 1, 2, 3, 4] as const;

const SLOT_HEIGHT: Record<number, string> = {
  0: "h-[min(52vh,420px)]",
  1: "h-[min(38vh,300px)]",
  2: "h-[min(68vh,560px)]",
  3: "h-[min(38vh,300px)]",
  4: "h-[min(52vh,420px)]",
};

const SLOT_WIDTH: Record<number, string> = {
  0: "w-[min(16vw,200px)]",
  1: "w-[min(14vw,170px)]",
  2: "w-[min(18vw,240px)]",
  3: "w-[min(14vw,170px)]",
  4: "w-[min(16vw,200px)]",
};

function ReelCard({
  slot,
  video,
  poster,
  loading,
}: {
  slot: number;
  video?: string;
  poster?: string;
  loading?: boolean;
}) {
  const height = SLOT_HEIGHT[slot];
  const width = SLOT_WIDTH[slot];

  return (
    <article
      className={`relative shrink-0 overflow-hidden rounded-2xl border-[3px] border-primary bg-black shadow-[0_0_24px_rgba(212,175,55,0.12)] ${height} ${width}`}
    >
      {loading ? (
        <div className="absolute inset-0 animate-pulse bg-primary/10" />
      ) : video ? (
        <video
          key={video}
          src={video}
          poster={poster}
          className="absolute inset-0 h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-primary/15" />
      )}
    </article>
  );
}

export function ReelsSection() {
  const { data: reels = [], isLoading } = useGetStorefrontReelsQuery();

  const bySlot = useMemo(() => {
    const map = new Map<number, { video: string; poster?: string }>();
    for (const reel of reels) {
      if (reel.video && reel.slot >= 0 && reel.slot <= 4) {
        map.set(reel.slot, { video: reel.video, poster: reel.poster });
      }
    }
    return map;
  }, [reels]);

  return (
    <section
      id="home-content"
      aria-labelledby="reels-heading"
      className="scroll-mt-20 bg-foreground"
    >
      {/* Hero se seamless blend — same dark theme bg */}
      <div
        className="pointer-events-none h-14 bg-gradient-to-b from-black/60 via-foreground/95 to-foreground sm:h-20"
        aria-hidden
      />

      <Container className="pb-8 pt-4 sm:pb-10 sm:pt-6">
        <SectionHeader
          titleId="reels-heading"
          badge="Reels"
          title="Watch & shop"
          subtitle="See our latest styles in motion — straight from the runway to your wardrobe."
          align="center"
          className="mb-0 [&_h2]:text-background [&_p]:text-background/70"
        />
      </Container>

      <Container className="pb-16 md:pb-20">
        <div className="flex items-center justify-center gap-2 sm:gap-3 md:gap-4">
          {SLOTS.map((slot) => {
            const reel = bySlot.get(slot);
            return (
              <ReelCard
                key={slot}
                slot={slot}
                video={reel?.video}
                poster={reel?.poster}
                loading={isLoading}
              />
            );
          })}
        </div>
      </Container>
    </section>
  );
}
