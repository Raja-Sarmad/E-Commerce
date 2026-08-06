"use client";

import Link from "next/link";
import {
  FiArrowRight,
  FiMinus,
  FiPlus,
  FiTag,
  FiTrash2,
  FiShoppingBag,
  FiX,
} from "react-icons/fi";
import { Container } from "@/components/ui/Container";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { EmptyState } from "@/components/ui/EmptyState";
import { ProductImage } from "@/components/ui/ProductImage";
import { useCart } from "@/context/CartProvider";
import { useToast } from "@/context/ToastProvider";
import { siteConfig } from "@/lib/site";
import { formatPrice, cn } from "@/lib/utils";
import { useState } from "react";

export default function CartPage() {
  const {
    items,
    subtotal,
    discount,
    shipping,
    tax,
    total,
    coupon,
    updateQuantity,
    removeItem,
    applyCoupon,
    removeCoupon,
    clearCart,
  } = useCart();
  const { success, error } = useToast();
  const [code, setCode] = useState("");

  const freeShippingLeft = Math.max(0, siteConfig.freeShippingThreshold - (subtotal - discount));
  const progress = Math.min(100, ((subtotal - discount) / siteConfig.freeShippingThreshold) * 100);

  const handleApplyCoupon = () => {
    if (!code.trim()) return;
    const ok = applyCoupon(code.trim());
    if (ok) {
      success("Coupon applied", `Code ${code.trim().toUpperCase()} applied successfully.`);
      setCode("");
    } else {
      error("Invalid coupon", "This code is invalid, expired, or doesn't meet the minimum spend.");
    }
  };

  const handleCheckout = () => {
    if (items.length === 0) return;
    if (typeof window !== "undefined") {
      window.location.href = "/checkout";
    }
  };

  return (
    <Container className="py-6">
      <Breadcrumb items={[{ label: "Cart" }]} />
      <h1 className="mb-8 text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
        Shopping Cart
      </h1>

      {items.length === 0 ? (
        <EmptyState
          icon={<FiShoppingBag className="h-7 w-7" aria-hidden />}
          title="Your cart is empty"
          description="Looks like you haven't added anything yet. Explore our products and find something you'll love."
          actionLabel="Start shopping"
          actionHref="/shop"
        />
      ) : (
        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
          <div>
            <div className="mb-4 flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3">
              <p className="flex items-center gap-2 text-sm text-foreground">
                <FiTag className="h-4 w-4 text-primary" aria-hidden />
                {freeShippingLeft > 0 ? (
                  <>
                    Add{" "}
                    <span className="font-bold text-primary">
                      {formatPrice(freeShippingLeft)}
                    </span>{" "}
                    more to unlock free shipping
                  </>
                ) : (
                  <span className="font-semibold text-success">
                    You&apos;ve unlocked free shipping!
                  </span>
                )}
              </p>
              <button
                type="button"
                onClick={clearCart}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-destructive"
              >
                Clear cart
              </button>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary to-success transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>

            <ul className="mt-6 space-y-4">
              {items.map((item) => (
                <li
                  key={`${item.product.id}-${item.color}-${item.size}`}
                  className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-4 sm:flex-row sm:items-center"
                >
                  <Link
                    href={`/shop/${item.product.slug}`}
                    className="shrink-0"
                  >
                    <ProductImage
                      src={item.product.images[0]}
                      alt={item.product.name}
                      className="h-24 w-24 rounded-xl"
                      imgClassName="rounded-xl"
                    />
                  </Link>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <Link
                          href={`/shop/${item.product.slug}`}
                          className="clamp-2 text-sm font-semibold text-foreground transition-colors hover:text-primary"
                        >
                          {item.product.name}
                        </Link>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {item.product.brand} · {item.product.sku}
                        </p>
                        {(item.color || item.size) && (
                          <p className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                            {item.color && (
                              <span className="inline-flex items-center gap-1.5">
                                <span
                                  className="inline-block h-3 w-3 rounded-full border border-border"
                                  style={{ background: item.color }}
                                  aria-hidden
                                />
                                Color
                              </span>
                            )}
                            {item.size && <span>Size: {item.size}</span>}
                          </p>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeItem(item.product.id)}
                        aria-label={`Remove ${item.product.name}`}
                        className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                      >
                        <FiTrash2 className="h-4 w-4" aria-hidden />
                      </button>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center rounded-lg border border-border">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          aria-label="Decrease quantity"
                          className="p-2 text-muted-foreground transition-colors hover:text-foreground"
                        >
                          <FiMinus className="h-4 w-4" aria-hidden />
                        </button>
                        <span className="w-10 text-center text-sm font-bold text-foreground">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          aria-label="Increase quantity"
                          className="p-2 text-muted-foreground transition-colors hover:text-foreground"
                        >
                          <FiPlus className="h-4 w-4" aria-hidden />
                        </button>
                      </div>
                      <div className="text-right">
                        <p className="text-base font-bold text-foreground">
                          {formatPrice(item.product.price * item.quantity)}
                        </p>
                        {item.product.compareAtPrice && (
                          <p className="text-xs text-muted-foreground line-through">
                            {formatPrice(item.product.compareAtPrice * item.quantity)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-6">
              <Link
                href="/shop"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition-colors hover:text-primary-strong"
              >
                <FiArrowRight className="h-4 w-4 rotate-180" aria-hidden />
                Continue shopping
              </Link>
            </div>
          </div>

          <div className="lg:sticky lg:top-28 lg:self-start">
            <div className="rounded-2xl border border-border bg-card p-6">
              <h2 className="text-lg font-bold text-foreground">Order summary</h2>

              <div className="mt-4 space-y-3 border-b border-border pb-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal ({items.reduce((n, i) => n + i.quantity, 0)} items)</span>
                  <span className="font-semibold text-foreground">{formatPrice(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-success">
                    <span>Discount {coupon ? `(${coupon.code})` : ""}</span>
                    <span className="font-semibold">-{formatPrice(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className={cn("font-semibold", shipping === 0 ? "text-success" : "text-foreground")}>
                    {shipping === 0 ? "Free" : formatPrice(shipping)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Estimated tax</span>
                  <span className="font-semibold text-foreground">{formatPrice(tax)}</span>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <span className="text-base font-bold text-foreground">Total</span>
                <span className="text-2xl font-extrabold text-foreground">{formatPrice(total)}</span>
              </div>

              <div className="mt-5">
                {coupon ? (
                  <div className="flex items-center justify-between rounded-xl border border-success/40 bg-success/10 px-3.5 py-2.5">
                    <span className="flex items-center gap-2 text-sm font-semibold text-success">
                      <FiTag className="h-4 w-4" aria-hidden />
                      {coupon.code}
                      {coupon.type === "percentage"
                        ? ` (-${coupon.value}%)`
                        : ` (-${formatPrice(coupon.value)})`}
                    </span>
                    <button
                      type="button"
                      onClick={removeCoupon}
                      aria-label="Remove coupon"
                      className="rounded-md p-1 text-success transition-colors hover:bg-success/20"
                    >
                      <FiX className="h-4 w-4" aria-hidden />
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Input
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      placeholder="Coupon code (try WELCOME10)"
                      aria-label="Coupon code"
                      className="h-11"
                    />
                    <Button variant="outline" onClick={handleApplyCoupon} className="shrink-0">
                      Apply
                    </Button>
                  </div>
                )}
              </div>

              <Button
                size="lg"
                fullWidth
                className="mt-5"
                onClick={handleCheckout}
              >
                Proceed to checkout
                <FiArrowRight className="h-4 w-4" aria-hidden />
              </Button>
              <p className="mt-3 text-center text-xs text-muted-foreground">
                Secure checkout · 30-day easy returns
              </p>
            </div>
          </div>
        </div>
      )}
    </Container>
  );
}
