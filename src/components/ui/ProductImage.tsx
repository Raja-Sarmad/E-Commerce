"use client";

import Image from "next/image";
import { useState } from "react";
import { FiImage } from "react-icons/fi";
import { cn } from "@/lib/utils";

type ProductImageProps = {
  src: string;
  alt: string;
  className?: string;
  imgClassName?: string;
  sizes?: string;
  priority?: boolean;
  fill?: boolean;
};

const ALLOWED_HOSTS = [
  "picsum.photos",
  "fastly.picsum.photos",
  "images.unsplash.com",
  "res.cloudinary.com",
  "localhost",
  "ronin.pk",
  "encrypted-tbn0.gstatic.com",
  "lh3.googleusercontent.com",
  "images.pexels.com",
];

const FALLBACK = `data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600"><rect width="600" height="600" fill="%23f1f5f9"/><circle cx="300" cy="250" r="90" fill="%23cbd5e1"/><rect x="180" y="360" width="240" height="60" rx="12" fill="%23cbd5e1"/><rect x="220" y="440" width="160" height="24" rx="8" fill="%23e2e8f0"/></svg>`
)}`;

function isAllowedHost(url: string): boolean {
  try {
    const hostname = new URL(url).hostname;
    return ALLOWED_HOSTS.some((h) => hostname === h || hostname.endsWith(`.${h}`));
  } catch {
    return false;
  }
}

export function ProductImage({
  src,
  alt,
  className,
  imgClassName,
  sizes = "(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw",
  priority = false,
  fill = true,
}: ProductImageProps) {
  const [failed, setFailed] = useState(false);
  const safeSrc = src || "";
  const resolved = failed || !safeSrc ? FALLBACK : safeSrc;
  const useNextImage = fill && safeSrc && isAllowedHost(resolved);

  return (
    <div className={cn("relative overflow-hidden bg-muted", className)}>
      {useNextImage ? (
        <Image
          src={resolved}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          onError={() => setFailed(true)}
          className={cn(
            "object-cover transition-transform duration-500",
            imgClassName
          )}
        />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={resolved}
          alt={alt}
          onError={() => setFailed(true)}
          className={cn(
            "h-full w-full object-cover transition-transform duration-500",
            imgClassName
          )}
        />
      )}
      {failed && (
        <div className="absolute inset-0 flex items-center justify-center">
          <FiImage className="h-12 w-12 text-muted-foreground/50" aria-hidden />
        </div>
      )}
    </div>
  );
}
