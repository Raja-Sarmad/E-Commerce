"use client";

import Link from "next/link";
import { FiHeart } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import { ProductImage } from "@/components/ui/ProductImage";
import { useFormatPrice } from "@/hooks/use-format-price";
import { toggleWishlist, selectIsInWishlist } from "@/lib/rtk/wishlistSlice";
import { toast } from "@/hooks/use-toast";
import type { Product } from "@/lib/types";
import { cn } from "@/lib/utils";

type RelatedProductCardProps = {
  product: Product;
};

export function RelatedProductCard({ product }: RelatedProductCardProps) {
  const formatPrice = useFormatPrice();
  const dispatch = useDispatch();
  const wishlisted = useSelector(selectIsInWishlist(product.id));
  const image = product.images[0] ?? "";

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(toggleWishlist(product));
    toast.success(
      wishlisted ? "Removed from wishlist" : "Added to wishlist",
      product.name
    );
  };

  return (
    <Link href={`/shop/${product.slug}`} className="group block">
      <article className="overflow-hidden rounded-xl border border-border/60 bg-card transition-shadow hover:shadow-md">
        <div className="relative aspect-[3/4] overflow-hidden bg-muted/30">
          <ProductImage
            src={image}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            imgClassName="object-cover object-center transition duration-500 group-hover:scale-[1.03]"
          />
        </div>

        <div className="flex items-end justify-between gap-2 px-2.5 py-2.5 sm:gap-3 sm:px-4 sm:py-3.5">
          <div className="min-w-0 flex-1">
            <h3 className="line-clamp-2 text-xs font-semibold leading-snug text-foreground sm:text-sm">
              {product.name}
            </h3>
            <p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">{formatPrice(product.price)}</p>
          </div>
          <button
            type="button"
            onClick={handleWishlist}
            aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
            className={cn(
              "mb-0.5 shrink-0 p-1.5 transition-colors sm:p-1",
              wishlisted
                ? "text-destructive"
                : "text-muted-foreground hover:text-primary"
            )}
          >
            <FiHeart className={cn("h-[18px] w-[18px]", wishlisted && "fill-current")} aria-hidden />
          </button>
        </div>
      </article>
    </Link>
  );
}
