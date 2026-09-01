"use client";

import Link from "next/link";
import { FiShoppingBag, FiCheck } from "react-icons/fi";
import { useSelector, useDispatch } from "react-redux";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Rating } from "@/components/ui/Rating";
import { Badge } from "@/components/ui/Badge";
import { ProductImage } from "@/components/ui/ProductImage";
import { AuthRequiredModal } from "@/components/ui/AuthRequiredModal";
import { addItem, updateQuantity, selectIsInCart, selectCartItems, validateCartQuantity } from "@/lib/rtk/cartSlice";
import { toast } from "@/hooks/use-toast";
import { useIsAdmin } from "@/hooks/use-is-admin";
import { useGetMeQuery } from "@/lib/rtk/authApi";
import type { Product } from "@/lib/types";
import { useFormatPrice } from "@/hooks/use-format-price";
import { useState } from "react";

type QuickViewProps = {
  product: Product;
  open: boolean;
  onClose: () => void;
};

export function QuickView({ product, open, onClose }: QuickViewProps) {
  const formatPrice = useFormatPrice();
  const dispatch = useDispatch();
  const { isAdmin } = useIsAdmin();
  const { data: user } = useGetMeQuery();
  const inCart = useSelector(selectIsInCart(product.id));
  const cartItems = useSelector(selectCartItems);
  const [added, setAdded] = useState(false);
  const [qty, setQty] = useState(1);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const maxQuantity = Math.max(0, product.stock ?? 0);

  const discount = product.compareAtPrice
    ? Math.round(
        ((product.compareAtPrice - product.price) / product.compareAtPrice) * 100
      )
    : 0;

  const handleAdd = () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    if (product.stock === 0) {
      toast.warning("No stock available", "This product is currently out of stock.");
      return;
    }
    const check = validateCartQuantity(
      cartItems,
      product,
      qty,
      inCart ? "set" : "add"
    );
    if (!check.ok) {
      toast.warning(check.title, check.message);
      return;
    }
    if (inCart) {
      dispatch(updateQuantity({ productId: product.id, quantity: qty }));
      toast.success("Cart updated", `${qty} × ${product.name}`);
    } else {
      dispatch(addItem({ product, quantity: qty }));
      toast.success("Added to cart", `${qty} × ${product.name}`);
    }
    setAdded(true);
    setTimeout(() => {
      setAdded(false);
      setQty(1);
    }, 1200);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="xl"
      title="Quick View"
      subtitle={product.name}
    >
      <div className="grid gap-8 md:grid-cols-2">
        <div className="relative overflow-hidden rounded-xl bg-muted">
          <ProductImage
            src={product.images?.[0] ?? ""}
            alt={product.name}
            className="aspect-square w-full"
          />
          {discount > 0 && (
            <Badge variant="destructive" className="absolute left-3 top-3">
              -{discount}%
            </Badge>
          )}
        </div>

        <div className="flex flex-col">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">
            {product.brand}
          </p>
          <Link
            href={`/shop/${product.slug}`}
            onClick={onClose}
            className="mt-1 text-xl font-bold text-foreground transition-colors hover:text-primary sm:text-2xl"
          >
            {product.name}
          </Link>

          <div className="mt-2 flex flex-wrap items-center gap-3">
            <Rating value={product.rating} showValue count={product.reviewsCount} />
            <span className="text-xs text-muted-foreground">
              {product.stock} in stock
            </span>
          </div>

          <div className="mt-4 flex items-baseline gap-2.5">
            <span className="text-3xl font-extrabold text-foreground">
              {formatPrice(product.price)}
            </span>
            {product.compareAtPrice && (
              <span className="text-lg text-muted-foreground line-through">
                {formatPrice(product.compareAtPrice)}
              </span>
            )}
          </div>

          <p className="clamp-3 mt-4 text-sm leading-relaxed text-muted-foreground">
            {product.description}
          </p>

          <ul className="mt-4 space-y-1.5">
            {product.features.slice(0, 3).map((feature) => (
              <li
                key={feature}
                className="flex items-start gap-2 text-sm text-foreground"
              >
                <FiCheck className="mt-0.5 h-4 w-4 shrink-0 text-success" aria-hidden />
                {feature}
              </li>
            ))}
          </ul>

          {!isAdmin && (
            <div className="mt-6 flex items-center gap-3">
              <div className="flex items-center rounded-lg border border-border">
                <button
                  type="button"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  aria-label="Decrease quantity"
                  className="px-3 py-2.5 text-muted-foreground transition-colors hover:text-foreground"
                >
                  −
                </button>
                <span className="w-8 text-center text-sm font-semibold text-foreground">
                  {qty}
                </span>
                <button
                  type="button"
                  onClick={() => setQty((q) => Math.min(maxQuantity, q + 1))}
                  aria-label="Increase quantity"
                  className="px-3 py-2.5 text-muted-foreground transition-colors hover:text-foreground"
                >
                  +
                </button>
              </div>
              <Button onClick={handleAdd} className="flex-1" disabled={product.stock === 0}>
                {added ? (
                  <>
                    <FiCheck className="h-4 w-4" aria-hidden /> Added to cart
                  </>
                ) : inCart ? (
                  <>
                    <FiShoppingBag className="h-4 w-4" aria-hidden /> Update cart
                  </>
                ) : (
                  <>
                    <FiShoppingBag className="h-4 w-4" aria-hidden />
                    {product.stock === 0 ? "Out of stock" : "Add to cart"}
                  </>
                )}
              </Button>
            </div>
          )}

          <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
            <span className="text-sm text-muted-foreground">SKU: {product.sku}</span>
            <Link
              href={`/shop/${product.slug}`}
              onClick={onClose}
              className="text-sm font-semibold text-primary hover:text-primary-strong"
            >
              View full details
            </Link>
          </div>
        </div>
      </div>
      <AuthRequiredModal open={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </Modal>
  );
}
