"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import {
  FiCheck,
  FiHeart,
  FiMaximize2,
  FiShoppingBag,
  FiShield,
  FiTruck,
  FiRefreshCw,
  FiX,
} from "react-icons/fi";
import { Button } from "@/components/ui/Button";
import { Rating } from "@/components/ui/Rating";
import { AuthRequiredModal } from "@/components/ui/AuthRequiredModal";
import {
  addItem,
  updateQuantity,
  selectIsInCart,
  selectCartItems,
  validateCartQuantity,
} from "@/lib/rtk/cartSlice";
import { toggleWishlist, selectIsInWishlist } from "@/lib/rtk/wishlistSlice";
import { toast } from "@/hooks/use-toast";
import { useIsAdmin } from "@/hooks/use-is-admin";
import { useGetMeQuery } from "@/lib/rtk/authApi";
import type { Product } from "@/lib/types";
import { useFormatPrice } from "@/hooks/use-format-price";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/lib/site";
import { useLiveStockMap } from "@/components/product/LiveStockProvider";

type ProductDetailsProps = {
  product: Product;
};

const COLOR_MAP: Record<string, string> = {
  black: "#111111",
  white: "#f5f5f5",
  navy: "#1e3a5f",
  beige: "#d4c4a8",
  grey: "#9ca3af",
  gray: "#9ca3af",
  red: "#dc2626",
  blue: "#2563eb",
  green: "#16a34a",
  brown: "#78350f",
  pink: "#ec4899",
  purple: "#7c3aed",
};

function resolveColor(value: string): string {
  const trimmed = value.trim();
  if (trimmed.startsWith("#") || trimmed.startsWith("rgb")) return trimmed;
  return COLOR_MAP[trimmed.toLowerCase()] ?? trimmed;
}

function productBadge(product: Product): string | null {
  if (product.isNew) return "New Arrival";
  if (product.onSale && product.discountPercent > 0) return `${product.discountPercent}% Off`;
  if (product.isBestSeller) return "Bestseller";
  return null;
}

export function ProductDetails({ product }: ProductDetailsProps) {
  const formatPrice = useFormatPrice();
  const dispatch = useDispatch();
  const router = useRouter();
  const { isAdmin } = useIsAdmin();
  const { data: user } = useGetMeQuery();
  const cartItems = useSelector(selectCartItems);
  const wishlisted = useSelector(selectIsInWishlist(product.id));

  const [color, setColor] = useState(product.colors[0]);
  const [size, setSize] = useState(product.sizes?.[0]);
  const [added, setAdded] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const inCart = useSelector(selectIsInCart(product.id, size, color));

  const { data: stockMap = {} } = useLiveStockMap([product.id]);
  const liveEntry = stockMap[product.id];
  const liveStock = liveEntry?.stock ?? product.stock ?? 0;
  const liveProduct = {
    ...product,
    stock: liveStock,
    variants: product.variants?.map((v) => ({
      ...v,
      stock: liveEntry?.variants?.[v.size] ?? v.stock,
    })),
  };

  const hasVariants = !!product.variants && product.variants.length > 0;
  const liveVariantStock =
    size && hasVariants
      ? (liveProduct.variants?.find((v) => v.size === size)?.stock ?? 0)
      : liveStock;

  const outOfStock = hasVariants ? liveVariantStock === 0 : liveStock === 0;
  const qty = 1;

  const discount = product.compareAtPrice
    ? Math.round(
        ((product.compareAtPrice - product.price) / product.compareAtPrice) * 100
      )
    : product.discountPercent;

  const badge = productBadge(product);
  const shortDescription =
    product.description && product.description.length > 120
      ? `${product.description.slice(0, 120)}…`
      : product.description;

  const sizeGuideText =
    product.sizeGuide?.trim() ||
    "This item runs true to size. For a relaxed fit, consider sizing up.\n\nChest (in): S 36–38 · M 39–41 · L 42–44 · XL 45–47";

  const handleSizeSelect = (s: string) => setSize(s);

  const handleAddToCart = (buyNow = false) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    if (outOfStock) {
      toast.warning("No stock available", "This size is currently out of stock.");
      return;
    }
    const cartProduct = {
      ...liveProduct,
      stock: liveVariantStock,
      variants: liveProduct.variants,
    };
    const check = validateCartQuantity(
      cartItems,
      cartProduct,
      qty,
      inCart ? "set" : "add",
      color,
      size
    );
    if (!check.ok) {
      toast.warning(check.title, check.message);
      return;
    }
    if (inCart) {
      dispatch(updateQuantity({ productId: product.id, quantity: qty, size, color }));
      toast.success("Cart updated", product.name);
    } else {
      dispatch(addItem({ product: cartProduct, quantity: qty, color, size }));
      setAdded(true);
      toast.success("Added to cart", product.name);
      setTimeout(() => setAdded(false), 1500);
    }
    if (buyNow) router.push("/checkout");
  };

  const handleWishlist = () => {
    dispatch(toggleWishlist(product));
    toast.success(
      wishlisted ? "Removed from wishlist" : "Added to wishlist",
      product.name
    );
  };

  const scrollToSizeTab = () => {
    setShowSizeGuide(true);
    document.getElementById("product-info")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="flex flex-col lg:sticky lg:top-24 lg:self-start">
      <div className="flex flex-wrap items-center gap-2 text-[11px] font-medium tracking-[0.14em] text-primary uppercase">
        <Link href={`/shop?category=${product.categorySlug}`} className="hover:underline">
          {product.category}
        </Link>
        {product.brand ? (
          <>
            <span className="text-muted-foreground/40">·</span>
            <span className="text-muted-foreground normal-case tracking-normal">{product.brand}</span>
          </>
        ) : null}
      </div>

      {badge ? (
        <span className="mt-2 inline-flex w-fit rounded-full border border-primary/25 bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold text-primary">
          {badge}
        </span>
      ) : null}

      <h1 className="font-display mt-2 text-2xl leading-tight font-semibold tracking-tight text-foreground sm:text-3xl">
        {product.name}
      </h1>

      <div className="mt-2 flex flex-wrap items-center gap-2">
        <Rating value={product.rating} showValue size="sm" />
        <span className="text-xs text-muted-foreground">
          ({product.reviewsCount.toLocaleString()} reviews)
        </span>
      </div>

      <div className="mt-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {formatPrice(product.price)}
        </span>
        {product.compareAtPrice && product.compareAtPrice > product.price ? (
          <>
            <span className="text-base text-muted-foreground line-through">
              {formatPrice(product.compareAtPrice)}
            </span>
            {discount > 0 ? (
              <span className="rounded-md bg-success/15 px-2.5 py-1 text-xs font-bold tracking-wide text-success uppercase">
                -{discount}% off
              </span>
            ) : null}
          </>
        ) : null}
      </div>

      {shortDescription ? (
        <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
          {shortDescription}
        </p>
      ) : null}

      {product.colors.length > 0 ? (
        <div className="mt-5">
          <p className="text-xs font-semibold text-foreground">Color</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {product.colors.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                aria-label={`Select color ${c}`}
                title={c}
                className={cn(
                  "h-8 w-8 rounded-full border-2 transition-all",
                  color === c
                    ? "border-primary ring-2 ring-primary/25 ring-offset-2 ring-offset-card"
                    : "border-border hover:border-primary/50"
                )}
                style={{ background: resolveColor(c) }}
              />
            ))}
          </div>
        </div>
      ) : null}

      {product.sizes && product.sizes.length > 0 ? (
        <div className="mt-5">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-semibold text-foreground">
              Size{size ? `: ${size}` : ""}
            </p>
            <button
              type="button"
              onClick={scrollToSizeTab}
              className="inline-flex items-center gap-1 text-xs font-medium text-primary transition-colors hover:text-primary-strong"
            >
              <FiMaximize2 className="h-3 w-3" aria-hidden />
              Size Guide
            </button>
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {product.sizes.map((s) => {
              const variantStock = hasVariants
                ? (liveProduct.variants?.find((v) => v.size === s)?.stock ?? 0)
                : liveStock;
              const sizeOutOfStock = variantStock === 0;
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => handleSizeSelect(s)}
                  disabled={sizeOutOfStock && s !== size}
                  className={cn(
                    "min-w-[2.75rem] rounded-lg border px-3.5 py-2 text-sm font-medium transition-all",
                    size === s
                      ? "border-foreground bg-foreground text-background shadow-md"
                      : sizeOutOfStock
                        ? "cursor-not-allowed border-border/60 text-muted-foreground/35 line-through"
                        : "border-border bg-card text-foreground hover:border-primary/45 hover:bg-muted/40"
                  )}
                >
                  {s}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      {!isAdmin ? (
        <div className="mt-6 space-y-2.5">
          <div className="flex gap-2.5">
            <Button
              onClick={() => handleAddToCart()}
              size="md"
              disabled={outOfStock}
              className="h-11 flex-1 rounded-lg text-sm font-semibold"
            >
              {added ? (
                <>
                  <FiCheck className="h-5 w-5" aria-hidden /> Added to cart
                </>
              ) : inCart ? (
                <>
                  <FiShoppingBag className="h-5 w-5" aria-hidden /> Update cart
                </>
              ) : (
                <>
                  <FiShoppingBag className="h-5 w-5" aria-hidden />
                  {outOfStock ? "Out of stock" : "Add to cart"}
                </>
              )}
            </Button>
            <button
              type="button"
              onClick={handleWishlist}
              aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
              className={cn(
                "flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border transition-all",
                wishlisted
                  ? "border-destructive/50 bg-destructive/10 text-destructive"
                  : "border-border bg-card text-foreground hover:border-primary/40 hover:text-primary"
              )}
            >
              <FiHeart className={cn("h-5 w-5", wishlisted && "fill-current")} aria-hidden />
            </button>
          </div>
          <Button
            variant="outline"
            size="md"
            disabled={outOfStock}
            onClick={() => handleAddToCart(true)}
            className="h-10 w-full rounded-lg text-sm font-semibold"
          >
            Buy now
          </Button>
        </div>
      ) : null}

      <div className="mt-5 grid grid-cols-3 gap-2 border-t border-border/70 pt-5">
        {[
          {
            icon: FiTruck,
            title: "Free Shipping",
            text: `Over ${formatPrice(siteConfig.freeShippingThreshold)}`,
          },
          { icon: FiRefreshCw, title: "Easy Returns", text: "30-day returns" },
          { icon: FiShield, title: "Secure Payment", text: "SSL encrypted" },
        ].map((item) => (
          <div
            key={item.title}
            className="py-1 text-center"
          >
            <span className="mx-auto flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
              <item.icon className="h-3.5 w-3.5" aria-hidden />
            </span>
            <p className="mt-1.5 text-[11px] font-semibold text-foreground">{item.title}</p>
            <p className="mt-0.5 text-[10px] leading-snug text-muted-foreground">{item.text}</p>
          </div>
        ))}
      </div>

      {showSizeGuide ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/60 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="size-guide-title"
        >
          <div className="max-h-[80vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-border bg-card p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <h2 id="size-guide-title" className="font-display text-2xl font-semibold text-foreground">
                Size Guide
              </h2>
              <button
                type="button"
                onClick={() => setShowSizeGuide(false)}
                aria-label="Close size guide"
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <FiX className="h-5 w-5" aria-hidden />
              </button>
            </div>
            <div className="mt-5 space-y-3 text-sm leading-relaxed text-muted-foreground">
              {sizeGuideText.split("\n").map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      <AuthRequiredModal open={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </div>
  );
}
