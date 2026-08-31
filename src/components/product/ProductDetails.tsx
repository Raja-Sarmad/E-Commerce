"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import {
  FiBarChart2,
  FiCheck,
  FiHeart,
  FiMinus,
  FiPlus,
  FiShare2,
  FiShoppingBag,
  FiShield,
  FiTruck,
  FiRefreshCw,
} from "react-icons/fi";
import { Button } from "@/components/ui/Button";
import { Rating } from "@/components/ui/Rating";
import { Badge } from "@/components/ui/Badge";
import { AuthRequiredModal } from "@/components/ui/AuthRequiredModal";
import {
  addItem,
  updateQuantity,
  selectIsInCart,
  selectCartItems,
  validateCartQuantity,
} from "@/lib/rtk/cartSlice";
import { toggleWishlist, selectIsInWishlist } from "@/lib/rtk/wishlistSlice";
import { toggleCompare, selectIsInCompare } from "@/lib/rtk/compareSlice";
import { toast } from "@/hooks/use-toast";
import { useIsAdmin } from "@/hooks/use-is-admin";
import { useGetMeQuery } from "@/lib/rtk/authApi";
import type { Product } from "@/lib/types";
import { formatPrice, getStockLabel } from "@/lib/utils";
import { cn } from "@/lib/utils";

type ProductDetailsProps = {
  product: Product;
};

export function ProductDetails({ product }: ProductDetailsProps) {
  const dispatch = useDispatch();
  const { isAdmin } = useIsAdmin();
  const { data: user } = useGetMeQuery();
  const inCart = useSelector(selectIsInCart(product.id));
  const cartItems = useSelector(selectCartItems);
  const wishlisted = useSelector(selectIsInWishlist(product.id));
  const compared = useSelector(selectIsInCompare(product.id));
  const router = useRouter();

  const [qty, setQty] = useState(1);
  const [color, setColor] = useState(product.colors[0]);
  const [size, setSize] = useState(product.sizes?.[0]);
  const [added, setAdded] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const outOfStock = product.stock === 0;
  const maxQuantity = Math.max(0, product.stock ?? 0);
  const discount = product.compareAtPrice
    ? Math.round(
        ((product.compareAtPrice - product.price) / product.compareAtPrice) * 100
      )
    : 0;

  const handleAddToCart = (buyNow = false) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    if (outOfStock) {
      toast.warning("No stock available", "This product is currently out of stock.");
      return;
    }
    const check = validateCartQuantity(
      cartItems,
      product,
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
      dispatch(updateQuantity({ productId: product.id, quantity: qty }));
      toast.success("Cart updated", `${qty} × ${product.name}`);
    } else {
      dispatch(addItem({ product, quantity: qty, color, size }));
      setAdded(true);
      toast.success("Added to cart", `${qty} × ${product.name}`);
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

  const handleCompare = () => {
    dispatch(toggleCompare(product));
    toast.success(compared ? "Removed from compare" : "Added to compare", product.name);
  };

  const handleShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: product.name, url });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success("Link copied", "Product link copied to clipboard.");
      }
    } catch {
      toast.success("Link copied", "Product link copied to clipboard.");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="text-xs uppercase tracking-wide">
            {product.brand}
          </Badge>
          {discount > 0 && <Badge variant="destructive">Save {discount}%</Badge>}
          {product.isNew && <Badge variant="success">New Arrival</Badge>}
          {product.isBestSeller && <Badge variant="accent">Best Seller</Badge>}
        </div>
        <h1 className="mt-3 text-2xl font-extrabold leading-tight tracking-tight text-foreground sm:text-3xl">
          {product.name}
        </h1>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <Rating value={product.rating} showValue size="md" />
          <a
            href="#reviews"
            className="text-sm text-muted-foreground underline-offset-2 hover:text-primary hover:underline"
          >
            {product.reviewsCount.toLocaleString()} reviews
          </a>
          <span className="text-sm text-muted-foreground">| SKU: {product.sku}</span>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        <span className="text-3xl font-extrabold text-foreground sm:text-4xl">
          {formatPrice(product.price)}
        </span>
        {product.compareAtPrice && (
          <>
            <span className="text-xl text-muted-foreground line-through">
              {formatPrice(product.compareAtPrice)}
            </span>
            <Badge variant="success">
              You save {formatPrice(product.compareAtPrice - product.price)}
            </Badge>
          </>
        )}
      </div>

      <p
        className={cn(
          "flex items-center gap-2 text-sm font-semibold",
          outOfStock
            ? "text-destructive"
            : product.stock <= 10
              ? "text-warning"
              : "text-success"
        )}
      >
        <span
          className={cn(
            "inline-block h-2.5 w-2.5 rounded-full",
            outOfStock
              ? "bg-destructive"
              : product.stock <= 10
                ? "bg-warning"
                : "bg-success"
          )}
        />
        {getStockLabel(product)}
      </p>

      <p className="text-sm leading-relaxed text-muted-foreground">
        {product.description}
      </p>

      {product.colors.length > 0 && (
        <div>
          <p className="text-sm font-semibold text-foreground">
            Color:{" "}
            <span className="font-normal text-muted-foreground">
              {product.colors.find((c) => c === color)
                ? "Selected"
                : "Choose"}
            </span>
          </p>
          <div className="mt-2.5 flex gap-2">
            {product.colors.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                aria-label={`Select color ${c}`}
                className={cn(
                  "h-9 w-9 rounded-full border-2 transition-all",
                  color === c
                    ? "border-primary ring-2 ring-primary/30"
                    : "border-border hover:border-muted-foreground"
                )}
                style={{ background: c }}
              />
            ))}
          </div>
        </div>
      )}

      {product.sizes && product.sizes.length > 0 && (
        <div>
          <p className="text-sm font-semibold text-foreground">Size</p>
          <div className="mt-2.5 flex flex-wrap gap-2">
            {product.sizes.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSize(s)}
                className={cn(
                  "rounded-lg border px-3.5 py-2 text-sm font-medium transition-all",
                  size === s
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border text-foreground hover:border-primary/50"
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="mt-2 flex flex-wrap items-center gap-3">
        {!isAdmin && (
          <>
            <div className="flex items-center rounded-xl border border-border">
              <button
                type="button"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                aria-label="Decrease quantity"
                className="px-3.5 py-3 text-muted-foreground transition-colors hover:text-foreground"
              >
                <FiMinus className="h-4 w-4" aria-hidden />
              </button>
              <span className="w-10 text-center text-sm font-bold text-foreground">
                {qty}
              </span>
              <button
                type="button"
                onClick={() => setQty((q) => Math.min(maxQuantity, q + 1))}
                aria-label="Increase quantity"
                className="px-3.5 py-3 text-muted-foreground transition-colors hover:text-foreground"
              >
                <FiPlus className="h-4 w-4" aria-hidden />
              </button>
            </div>

            <Button
              onClick={() => handleAddToCart()}
              size="lg"
              disabled={outOfStock}
              className="flex-1 sm:flex-none sm:min-w-44"
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

            <Button
              variant="accent"
              size="lg"
              disabled={outOfStock}
              onClick={() => handleAddToCart(true)}
            >
              Buy now
            </Button>
          </>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={handleWishlist}
          className={cn(
            "inline-flex flex-1 items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition-all sm:flex-none",
            wishlisted
              ? "border-destructive bg-destructive/10 text-destructive"
              : "border-border text-foreground hover:border-destructive/50 hover:text-destructive"
          )}
        >
          <FiHeart className="h-4 w-4" aria-hidden />
          {wishlisted ? "In wishlist" : "Wishlist"}
        </button>
        <button
          type="button"
          onClick={handleCompare}
          className={cn(
            "inline-flex flex-1 items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition-all sm:flex-none",
            compared
              ? "border-primary bg-primary/10 text-primary"
              : "border-border text-foreground hover:border-primary/50 hover:text-primary"
          )}
        >
          <FiBarChart2 className="h-4 w-4" aria-hidden />
          {compared ? "In compare" : "Compare"}
        </button>
        <button
          type="button"
          onClick={handleShare}
          aria-label="Share this product"
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-semibold text-foreground transition-all hover:border-primary/50 hover:text-primary sm:flex-none"
        >
          <FiShare2 className="h-4 w-4" aria-hidden />
          Share
        </button>
      </div>

      <div className="grid gap-3 rounded-2xl border border-border bg-card p-4 sm:grid-cols-3">
        {[
          { icon: FiTruck, title: "Free delivery", text: "On orders over $100" },
          { icon: FiRefreshCw, title: "Easy returns", text: "30-day returns" },
          { icon: FiShield, title: "Secure checkout", text: "256-bit SSL" },
        ].map((item) => (
          <div key={item.title} className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <item.icon className="h-4 w-4" aria-hidden />
            </span>
            <div>
              <p className="text-xs font-bold text-foreground">{item.title}</p>
              <p className="text-[11px] text-muted-foreground">{item.text}</p>
            </div>
          </div>
        ))}
      </div>

      <AuthRequiredModal open={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </div>
  );
}
