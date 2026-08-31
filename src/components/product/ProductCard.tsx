"use client";

import { useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  FiBarChart2,
  FiEye,
  FiHeart,
  FiShoppingBag,
  FiMinus,
  FiPlus,
} from "react-icons/fi";
import { useSelector, useDispatch } from "react-redux";
import { ProductImage } from "@/components/ui/ProductImage";
import { Rating } from "@/components/ui/Rating";
import { Badge } from "@/components/ui/Badge";
import { AuthRequiredModal } from "@/components/ui/AuthRequiredModal";
const QuickView = dynamic(() => import("./QuickView").then((m) => m.QuickView), { ssr: false });
import {
  addItem,
  updateQuantity,
  removeItem,
  selectCartItems,
  selectIsInCart,
  selectCartItemQuantity,
  validateCartQuantity,
} from "@/lib/rtk/cartSlice";
import { toggleWishlist, selectIsInWishlist } from "@/lib/rtk/wishlistSlice";
import { toggleCompare, selectIsInCompare } from "@/lib/rtk/compareSlice";
import { toast } from "@/hooks/use-toast";
import { useIsAdmin } from "@/hooks/use-is-admin";
import { useGetMeQuery } from "@/lib/rtk/authApi";
import type { Product } from "@/lib/types";
import { formatPrice, getStockLabel } from "@/lib/utils";

type ProductCardProps = {
  product: Product;
  priority?: boolean;
};

export function ProductCard({ product, priority = false }: ProductCardProps) {
  const dispatch = useDispatch();
  const cartItems = useSelector(selectCartItems);
  const inCart = useSelector(selectIsInCart(product.id));
  const cartQuantity = useSelector(selectCartItemQuantity(product.id));
  const wishlisted = useSelector(selectIsInWishlist(product.id));
  const compared = useSelector(selectIsInCompare(product.id));

  const { isAdmin } = useIsAdmin();
  const { data: user } = useGetMeQuery();
  const [quickView, setQuickView] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const outOfStock = (product.stock ?? 0) === 0;

  const handleAddToCart = () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    if (outOfStock) {
      toast.warning("No stock available", "This product is currently out of stock.");
      return;
    }
    const check = validateCartQuantity(cartItems, product, 1, "add");
    if (!check.ok) {
      toast.warning(check.title, check.message);
      return;
    }
    dispatch(addItem({ product }));
    toast.success("Added to cart", product.name);
  };

  const handleDecrease = () => {
    if (cartQuantity <= 1) {
      dispatch(removeItem(product.id));
      toast.info("Removed from cart", product.name);
    } else {
      dispatch(updateQuantity({ productId: product.id, quantity: cartQuantity - 1 }));
    }
  };

  const handleIncrease = () => {
    const check = validateCartQuantity(
      cartItems,
      product,
      cartQuantity + 1,
      "set"
    );
    if (!check.ok) {
      toast.warning(check.title, check.message);
      return;
    }
    dispatch(updateQuantity({ productId: product.id, quantity: cartQuantity + 1 }));
  };

  const handleWishlist = () => {
    dispatch(toggleWishlist(product));
    if (!wishlisted) {
      toast.success("Added to wishlist", product.name);
    } else {
      toast.info("Removed from wishlist", product.name);
    }
  };

  const handleCompare = () => {
    dispatch(toggleCompare(product));
    if (!compared) {
      toast.success("Added to compare", product.name);
    } else {
      toast.info("Removed from compare", product.name);
    }
  };

  const discount = product.compareAtPrice
    ? Math.round(
        ((product.compareAtPrice - product.price) / product.compareAtPrice) * 100
      )
    : 0;

  return (
    <>
      <div className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
        <div className="relative aspect-square overflow-hidden">
          <Link
            href={`/shop/${product.slug}`}
            aria-label={product.name}
            className="block h-full w-full"
          >
            <ProductImage
              src={product.images?.[0] ?? ""}
              alt={product.name}
              priority={priority}
              className="h-full w-full transition-transform duration-500 group-hover:scale-105"
            />
          </Link>

          <div className="pointer-events-none absolute inset-x-3 top-3 flex flex-wrap items-start justify-between gap-2">
            <div className="flex flex-col gap-1.5">
              {discount > 0 && (
                <Badge variant="destructive">-{discount}%</Badge>
              )}
              {product.isNew && <Badge variant="success">New</Badge>}
              {product.isBestSeller && (
                <Badge variant="accent">Best Seller</Badge>
              )}
            </div>
            {product.stock <= 10 && product.stock > 0 && (
              <Badge variant="warning" dot>
                Low stock
              </Badge>
            )}
          </div>

          <div className="absolute inset-x-3 bottom-3 flex translate-y-2 gap-2 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
            {!isAdmin && (
              inCart ? (
                <div className="flex flex-1 items-center justify-between rounded-xl bg-foreground/90 px-1 py-1 text-background backdrop-blur">
                  <button
                    type="button"
                    onClick={handleDecrease}
                    aria-label="Decrease quantity"
                    className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-background/15"
                  >
                    <FiMinus className="h-4 w-4" aria-hidden />
                  </button>
                  <span className="text-sm font-bold tabular-nums">
                    {cartQuantity}
                  </span>
                  <button
                    type="button"
                    onClick={handleIncrease}
                    aria-label="Increase quantity"
                    className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-background/15"
                  >
                    <FiPlus className="h-4 w-4" aria-hidden />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={outOfStock}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-foreground/90 py-2.5 text-sm font-semibold text-background backdrop-blur transition-colors hover:bg-primary disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <FiShoppingBag className="h-4 w-4" aria-hidden />
                  {outOfStock ? "Out of stock" : "Add to cart"}
                </button>
              )
            )}
            <button
              type="button"
              onClick={() => setQuickView(true)}
              aria-label={`Quick view ${product.name}`}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-card text-foreground shadow-md transition-colors hover:bg-primary hover:text-primary-foreground"
            >
              <FiEye className="h-4 w-4" aria-hidden />
            </button>
          </div>

          <div className="absolute right-3 top-16 flex flex-col gap-2 opacity-100 transition-all sm:opacity-0 sm:translate-x-2 sm:group-hover:translate-x-0 sm:group-hover:opacity-100">
            <button
              type="button"
              onClick={handleWishlist}
              aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
              className={`flex h-9 w-9 items-center justify-center rounded-full shadow-md transition-colors ${
                wishlisted
                  ? "bg-destructive text-destructive-foreground"
                  : "bg-card text-foreground hover:bg-destructive hover:text-destructive-foreground"
              }`}
            >
              <FiHeart className="h-4 w-4" aria-hidden />
            </button>
            <button
              type="button"
              onClick={handleCompare}
              aria-label={compared ? "Remove from compare" : "Add to compare"}
              className={`flex h-9 w-9 items-center justify-center rounded-full shadow-md transition-colors ${
                compared
                  ? "bg-primary text-primary-foreground"
                  : "bg-card text-foreground hover:bg-primary hover:text-primary-foreground"
              }`}
            >
              <FiBarChart2 className="h-4 w-4" aria-hidden />
            </button>
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-1.5 p-4">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {product.brand}
            </span>
            <span
              className={`text-xs font-semibold ${
                outOfStock
                  ? "text-destructive"
                  : product.stock <= 10
                    ? "text-warning"
                    : "text-success"
              }`}
            >
              {getStockLabel(product)}
            </span>
          </div>

          <Link
            href={`/shop/${product.slug}`}
            className="clamp-2 text-sm font-semibold leading-snug text-foreground transition-colors hover:text-primary"
          >
            {product.name}
          </Link>

          <div className="flex items-center gap-1.5">
            <Rating value={product.rating} count={product.reviewsCount} />
          </div>

          <div className="mt-auto flex items-baseline gap-2 pt-1">
            <span className="text-lg font-bold text-foreground">
              {formatPrice(product.price)}
            </span>
            {product.compareAtPrice && (
              <span className="text-sm text-muted-foreground line-through">
                {formatPrice(product.compareAtPrice)}
              </span>
            )}
          </div>
        </div>
      </div>

      <QuickView
        product={product}
        open={quickView}
        onClose={() => setQuickView(false)}
      />
      <AuthRequiredModal open={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </>
  );
}
