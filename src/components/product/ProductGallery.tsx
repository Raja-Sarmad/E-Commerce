"use client";

import { useRef, useState } from "react";
import { FiChevronDown, FiZoomIn } from "react-icons/fi";
import { ProductImage } from "@/components/ui/ProductImage";
import { cn } from "@/lib/utils";

type ProductGalleryProps = {
  images: string[];
  name: string;
};

export function ProductGallery({ images, name }: ProductGalleryProps) {
  const [active, setActive] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const thumbListRef = useRef<HTMLDivElement>(null);
  const safeImages = images.filter(Boolean);
  const galleryImages = safeImages.length > 0 ? safeImages : [""];
  const hasMultiple = galleryImages.length > 1;

  const scrollThumbs = () => {
    thumbListRef.current?.scrollBy({ top: 60, behavior: "smooth" });
  };

  return (
    <div
      className={cn(
        "mx-auto w-full max-w-[380px] gap-3 sm:max-w-[420px] lg:mx-0 lg:max-w-none lg:gap-4",
        "grid",
        hasMultiple && "lg:grid-cols-[64px_minmax(0,1fr)]"
      )}
    >
      {hasMultiple ? (
        <div className="relative order-2 lg:order-1">
          <div
            ref={thumbListRef}
            className="flex gap-2 overflow-x-auto pb-1 no-scrollbar lg:max-h-[380px] lg:flex-col lg:overflow-y-auto lg:pb-0"
          >
            {galleryImages.map((image, index) => (
              <button
                key={`${image}-${index}`}
                type="button"
                onClick={() => setActive(index)}
                aria-label={`View image ${index + 1} of ${galleryImages.length}`}
                aria-current={active === index}
                className={cn(
                  "relative shrink-0 overflow-hidden rounded-xl border-2 transition-all duration-200",
                  active === index
                    ? "border-primary shadow-[0_0_0_1px_rgba(109,40,217,0.35)]"
                    : "border-border/60 opacity-70 hover:border-primary/40 hover:opacity-100"
                )}
              >
                <div className="relative h-14 w-14 lg:h-16 lg:w-16">
                  <ProductImage
                    src={image}
                    alt={`${name} thumbnail ${index + 1}`}
                    fill
                    sizes="84px"
                    imgClassName="object-cover object-center"
                  />
                </div>
              </button>
            ))}
          </div>
          {galleryImages.length > 4 ? (
            <button
              type="button"
              onClick={scrollThumbs}
              aria-label="Scroll thumbnails"
              className="absolute -bottom-2 left-1/2 hidden -translate-x-1/2 rounded-full border border-border bg-card p-1.5 text-muted-foreground shadow-md transition-colors hover:border-primary/40 hover:text-primary lg:block"
            >
              <FiChevronDown className="h-4 w-4" aria-hidden />
            </button>
          ) : null}
        </div>
      ) : null}

      <div
        className={cn(
          "group relative order-1 overflow-hidden rounded-xl border border-border/70 bg-card shadow-md lg:order-2",
          zoomed && "cursor-zoom-out"
        )}
        onMouseMove={(e) => {
          if (!zoomed) return;
          const rect = e.currentTarget.getBoundingClientRect();
          const x = ((e.clientX - rect.left) / rect.width) * 100;
          const y = ((e.clientY - rect.top) / rect.height) * 100;
          e.currentTarget.style.setProperty("--zoom-x", `${x}%`);
          e.currentTarget.style.setProperty("--zoom-y", `${y}%`);
        }}
        onMouseLeave={() => setZoomed(false)}
        onClick={() => setZoomed((prev) => !prev)}
      >
        <div className="relative aspect-[4/5] w-full overflow-hidden">
          <ProductImage
            src={galleryImages[active]}
            alt={name}
            priority
            fill
            sizes="(max-width: 1024px) 100vw, 58vw"
            imgClassName={cn(
              "object-cover object-center transition-transform duration-500",
              zoomed &&
                "scale-[1.7] origin-[var(--zoom-x,50%)_var(--zoom-y,50%)]"
            )}
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-foreground/15 via-transparent to-transparent" />
        </div>
        <button
          type="button"
          aria-label="Zoom image"
          onClick={(e) => {
            e.stopPropagation();
            setZoomed((prev) => !prev);
          }}
          className="absolute right-3 bottom-3 flex h-9 w-9 items-center justify-center rounded-full border border-border/70 bg-card/95 text-muted-foreground shadow-sm backdrop-blur-sm transition-colors hover:border-primary/40 hover:text-primary"
        >
          <FiZoomIn className="h-4 w-4" aria-hidden />
        </button>
        {hasMultiple ? (
          <span className="absolute left-4 bottom-4 rounded-full bg-card/90 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur-sm">
            {active + 1} / {galleryImages.length}
          </span>
        ) : null}
      </div>
    </div>
  );
}
