"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FiArrowRight,
  FiMinus,
  FiPlus,
  FiTag,
  FiTrash2,
  FiShoppingBag,
  FiX,
} from "react-icons/fi";
import { useSelector, useDispatch } from "react-redux";
import { Container } from "@/components/ui/Container";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { EmptyState } from "@/components/ui/EmptyState";
import { ProductImage } from "@/components/ui/ProductImage";
import {
  selectCartItems,
  selectCartTotals,
  selectCartCoupon,
  selectCartHydrated,
  updateQuantity,
  removeItem,
  clearCart,
  applyCoupon,
  removeCoupon,
  validateCartQuantity,
} from "@/lib/rtk/cartSlice";
import { useValidateCouponMutation } from "@/lib/rtk/storefrontApi";
import { toast } from "@/hooks/use-toast";
import { useGetMeQuery } from "@/lib/rtk/authApi";
import { useIsAdmin } from "@/hooks/use-is-admin";
import { siteConfig } from "@/lib/site";
import { useFormatPrice } from "@/hooks/use-format-price";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { useSyncCartStock } from "@/hooks/use-sync-cart-stock";

export default function CartPage() {
  const formatPrice = useFormatPrice();
  const dispatch = useDispatch();
  const router = useRouter();
  const { isAdmin } = useIsAdmin();
  const { data: user } = useGetMeQuery();
  const items = useSelector(selectCartItems);
  const cartHydrated = useSelector(selectCartHydrated);
  const { subtotal, discount, shipping, total } = useSelector(selectCartTotals);
  const coupon = useSelector(selectCartCoupon);
  const [validateCoupon] = useValidateCouponMutation();
  const [mounted, setMounted] = useState(false);
  const [code, setCode] = useState("");

  useSyncCartStock({ notify: true });

  const freeShippingLeft = Math.max(0, siteConfig.freeShippingThreshold - (subtotal - discount));
  const progress = Math.min(100, ((subtotal - discount) / siteConfig.freeShippingThreshold) * 100);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isAdmin) router.replace("/admin");
  }, [isAdmin, router]);

  useEffect(() => {
    if (mounted && !user && !isAdmin) {
      router.replace("/login?redirect=/cart");
    }
  }, [mounted, user, isAdmin, router]);

  const handleApplyCoupon = async () => {
    if (!code.trim()) return;
    try {
      const result = await validateCoupon({ code: code.trim() }).unwrap();
      const couponData = result as unknown as { code: string; type: string; value: number; minSpend: number; maxDiscount?: number };
      dispatch(applyCoupon({
        code: couponData.code,
        type: couponData.type as "percentage" | "fixed",
        value: couponData.value,
        minSpend: couponData.minSpend,
        maxDiscount: couponData.maxDiscount,
        expiresAt: "",
        active: true,
      }));
      toast.success("Coupon applied", `Code ${code.trim().toUpperCase()} applied successfully.`);
      setCode("");
    } catch {
      toast.error("Invalid coupon", "This code is invalid, expired, or doesn't meet the minimum spend.");
    }
  };

  return (
    <Container className="py-6">
      <Breadcrumb items={[{ label: "Cart" }]} />
      <h1 className="mb-8 text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
        Shopping Cart
      </h1>

      {!mounted || !cartHydrated ? (
        <p className="py-8 text-sm text-muted-foreground">Loading your cart...</p>
      ) : items.length === 0 ? (
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
                onClick={() => dispatch(clearCart())}
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
                      src={item.product.images?.[0] ?? ""}
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
                        onClick={() => dispatch(removeItem(item.product.id))}
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
                          onClick={() => dispatch(updateQuantity({ productId: item.product.id, quantity: item.quantity - 1 }))}
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
                          onClick={() => {
                            const check = validateCartQuantity(
                              items,
                              item.product,
                              item.quantity + 1,
                              "set",
                              item.color,
                              item.size
                            );
                            if (!check.ok) {
                              toast.warning(check.title, check.message);
                              return;
                            }
                            dispatch(
                              updateQuantity({
                                productId: item.product.id,
                                quantity: item.quantity + 1,
                              })
                            );
                          }}
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
                      onClick={() => dispatch(removeCoupon())}
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
                href="/checkout"
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
