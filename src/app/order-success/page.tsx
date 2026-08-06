"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import {
  FiCheckCircle,
  FiPackage,
  FiArrowRight,
  FiClock,
} from "react-icons/fi";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { readOrderByNumber } from "@/lib/orders-store";
import { sampleOrders } from "@/lib/data/content";
import { formatPrice, formatDate } from "@/lib/utils";

function OrderSuccessInner() {
  const searchParams = useSearchParams();
  const number = searchParams.get("number") ?? "";
  const order = readOrderByNumber(number) ?? sampleOrders.find((o) => o.number === number);

  return (
    <Container className="flex min-h-[60vh] items-center justify-center py-10">
      <div className="w-full max-w-lg text-center">
        <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-success/15">
          <FiCheckCircle className="h-10 w-10 text-success" aria-hidden />
        </span>
        <h1 className="mt-6 text-3xl font-extrabold tracking-tight text-foreground">
          Thank you for your order!
        </h1>
        <p className="mt-3 text-muted-foreground">
          Your order has been placed successfully. A confirmation email is on
          its way.
        </p>

        <div className="mt-8 rounded-2xl border border-border bg-card p-6 text-left">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div>
              <p className="text-xs text-muted-foreground">Order number</p>
              <p className="text-lg font-bold text-foreground">
                {order?.number ?? number}
              </p>
            </div>
            <span className="flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              <FiClock className="h-3.5 w-3.5" aria-hidden />
              Pending
            </span>
          </div>

          {order && (
            <>
              <div className="flex items-center justify-between py-4 text-sm">
                <span className="text-muted-foreground">Items</span>
                <span className="font-semibold text-foreground">
                  {order.items.reduce((n, i) => n + i.quantity, 0)}
                </span>
              </div>
              <div className="flex items-center justify-between border-t border-border py-4 text-sm">
                <span className="text-muted-foreground">Estimated delivery</span>
                <span className="font-semibold text-foreground">
                  {order.estimatedDelivery ? formatDate(order.estimatedDelivery) : "—"}
                </span>
              </div>
              <div className="flex items-center justify-between border-t border-border py-4 text-sm">
                <span className="text-muted-foreground">Payment</span>
                <span className="font-semibold text-foreground">
                  {order.paymentMethod}
                </span>
              </div>
              <div className="flex items-center justify-between border-t border-border pt-4">
                <span className="text-base font-bold text-foreground">Total paid</span>
                <span className="text-2xl font-extrabold text-foreground">
                  {formatPrice(order.total)}
                </span>
              </div>
            </>
          )}
        </div>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Button href={order ? `/orders/${order.number}` : "/orders"} variant="outline">
            <FiPackage className="h-4 w-4" aria-hidden />
            Track your order
          </Button>
          <Button href="/shop">
            Continue shopping
            <FiArrowRight className="h-4 w-4" aria-hidden />
          </Button>
        </div>

        <Link
          href="/orders"
          className="mt-6 inline-block text-sm font-semibold text-primary transition-colors hover:text-primary-strong"
        >
          View all orders
        </Link>
      </div>
    </Container>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense
      fallback={
        <Container className="py-20 text-center text-muted-foreground">
          Loading...
        </Container>
      }
    >
      <OrderSuccessInner />
    </Suspense>
  );
}
