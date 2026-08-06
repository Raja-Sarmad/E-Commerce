"use client";

import { useState } from "react";
import { ProductImage } from "@/components/ui/ProductImage";
import { cn } from "@/lib/utils";

type ProductGalleryProps = {
  images: string[];
  name: string;
};

export function ProductGallery({ images, name }: ProductGalleryProps) {
  const [active, setActive] = useState(0);
  const [zoomed, setZoomed] = useState(false);

  return (
    <div className="grid gap-3 sm:grid-cols-[80px_1fr]">
      <div className="order-2 flex gap-3 sm:order-1 sm:flex-col">
        {images.map((image, index) => (
          <button
            key={image}
            type="button"
            onClick={() => setActive(index)}
            aria-label={`View image ${index + 1} of ${images.length}`}
            aria-current={active === index}
            className={cn(
              "relative overflow-hidden rounded-xl border-2 transition-all",
              active === index
                ? "border-primary shadow-md"
                : "border-transparent opacity-70 hover:opacity-100"
            )}
          >
            <ProductImage
              src={image}
              alt={`${name} image ${index + 1}`}
              className="h-16 w-16 sm:h-20 sm:w-20"
            />
          </button>
        ))}
      </div>

      <div
        className={cn(
          "group relative order-1 overflow-hidden rounded-2xl border border-border sm:order-2",
          zoomed && "img-zoom-enter cursor-zoom-out"
        )}
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const x = ((e.clientX - rect.left) / rect.width) * 100;
          const y = ((e.clientY - rect.top) / rect.height) * 100;
          e.currentTarget.style.setProperty("--zoom-x", `${x}%`);
          e.currentTarget.style.setProperty("--zoom-y", `${y}%`);
        }}
        onMouseEnter={() => setZoomed(true)}
        onMouseLeave={() => setZoomed(false)}
        onClick={() => setZoomed((prev) => !prev)}
        style={
          zoomed
            ? ({
                cursor: "zoom-out",
              } as React.CSSProperties)
            : undefined
        }
      >
        <div
          className={cn("overflow-hidden", zoomed && "cursor-zoom-out")}
        >
          <ProductImage
            src={images[active]}
            alt={name}
            priority
            className={cn(
              "aspect-square w-full transition-transform duration-300",
              zoomed &&
                "scale-[1.7] origin-[var(--zoom-x,50%)_var(--zoom-y,50%)]"
            )}
          />
        </div>
        {!zoomed && (
          <span className="pointer-events-none absolute bottom-3 right-3 rounded-full bg-background/80 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur opacity-0 transition-opacity group-hover:opacity-100">
            Hover to zoom
          </span>
        )}
      </div>
    </div>
  );
}
