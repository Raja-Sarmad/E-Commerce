"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { FiArrowLeft, FiCheckCircle, FiCircle, FiMapPin } from "react-icons/fi";
import { Container } from "@/components/ui/Container";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { ProductImage } from "@/components/ui/ProductImage";
import { readOrders } from "@/lib/orders-store";
import { sampleOrders } from "@/lib/data/content";
import type { Order, OrderStatus } from "@/lib/types";
import { formatPrice, formatDate, formatDateLong, cn } from "@/lib/utils";

const statusVariant: Record<OrderStatus, "warning" | "info" | "success" | "destructive"> = {
  pending: "warning",
  processing: "info",
  shipped: "info",
  delivered: "success",
  cancelled: "destructive",
};

export default function OrderDetailsPage() {
  const params = useParams<{ number: string }>();
  const [order, setOrder] = useState<Order | undefined>();
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const number = params.number;
    const fromStore = readOrders().find((o) => o.number === number);
    const fromSamples = sampleOrders.find((o) => o.number === number);
    setOrder(fromStore ?? fromSamples);
    setLoaded(true);
  }, [params.number]);

  if (!loaded) {
    return (
      <Container className="py-20 text-center text-muted-foreground">
        Loading order...
      </Container>
    );
  }

  if (!order) {
    return (
      <Container className="py-10">
        <EmptyState
          icon={<FiMapPin className="h-7 w-7" aria-hidden />}
          title="Order not found"
          description="We couldn't find that order. Check the order number and try again."
          actionLabel="View all orders"
          actionHref="/orders"
        />
      </Container>
    );
  }

  const timelineSteps = ["Order confirmed", "Processing", "Shipped", "Delivered"];
  const statusIndex =
    order.status === "cancelled" ? -1 : timelineSteps.findIndex((s) => s.toLowerCase() === order.status) + 1;
  const currentIndex = order.status === "cancelled" ? 0 : Math.max(1, statusIndex === 0 ? 1 : statusIndex);

  return (
    <Container className="py-6">
      <Breadcrumb
        items={[{ label: "Orders", href: "/orders" }, { label: `Order ${order.number}` }]}
      />

      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
            Order #{order.number}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Placed on {formatDateLong(order.createdAt)}
          </p>
        </div>
        <Badge variant={statusVariant[order.status]} dot className="px-3 py-1.5">
          {order.status}
        </Badge>
      </div>

      {order.tracking && order.status !== "cancelled" && (
        <section className="mb-8 rounded-2xl border border-border bg-card p-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-base font-bold text-foreground">Order tracking</h2>
            <p className="text-xs text-muted-foreground">
              {order.tracking.carrier} · {order.tracking.trackingNumber}
            </p>
          </div>

          <div className="mt-6">
            <div className="flex items-center">
              {timelineSteps.map((step, index) => {
                const done = index < currentIndex;
                const isCurrent = index === currentIndex - 1;
                return (
                  <div key={step} className="flex flex-1 flex-col items-center">
                    <div className="flex w-full items-center">
                      <div
                        className={cn(
                          "h-1 flex-1 rounded-full",
                          index === 0 ? "bg-transparent" : done ? "bg-primary" : "bg-muted"
                        )}
                      />
                      <span
                        className={cn(
                          "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 transition-all",
                          done
                            ? "border-primary bg-primary text-primary-foreground"
                            : isCurrent
                              ? "border-primary bg-card text-primary"
                              : "border-border bg-card text-muted-foreground"
                        )}
                      >
                        {done ? (
                          <FiCheckCircle className="h-4 w-4" aria-hidden />
                        ) : (
                          <FiCircle className="h-4 w-4" aria-hidden />
                        )}
                      </span>
                      <div
                        className={cn(
                          "h-1 flex-1 rounded-full",
                          index === timelineSteps.length - 1 ? "bg-transparent" : done ? "bg-primary" : "bg-muted"
                        )}
                      />
                    </div>
                    <span
                      className={cn(
                        "mt-2 text-center text-xs font-semibold",
                        done || isCurrent ? "text-foreground" : "text-muted-foreground"
                      )}
                    >
                      {step}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-6 space-y-0">
            {order.tracking.events.map((event, index) => (
              <div key={index} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <span
                    className={cn(
                      "mt-1 h-2.5 w-2.5 rounded-full",
                      index === 0 ? "bg-primary" : "bg-muted-foreground/40"
                    )}
                  />
                  {index < order.tracking!.events.length - 1 && (
                    <span className="w-px flex-1 bg-border" />
                  )}
                </div>
                <div className="pb-6">
                  <p className="text-sm font-semibold text-foreground">{event.label}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDateLong(event.date)} · {event.location}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          <section className="rounded-2xl border border-border bg-card p-6">
            <h2 className="text-base font-bold text-foreground">Items</h2>
            <ul className="mt-4 space-y-4">
              {order.items.map((item) => (
                <li key={item.productId} className="flex items-center gap-4">
                  <ProductImage src={item.image} alt={item.name} className="h-16 w-16 rounded-xl" imgClassName="rounded-xl" />
                  <div className="min-w-0 flex-1">
                    <p className="clamp-1 text-sm font-semibold text-foreground">{item.name}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {formatPrice(item.price)} × {item.quantity}
                    </p>
                  </div>
                  <span className="text-sm font-bold text-foreground">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-4 border-t border-border pt-4">
              <Link
                href="/shop"
                className="text-sm font-semibold text-primary transition-colors hover:text-primary-strong"
              >
                Buy it again
              </Link>
            </div>
          </section>

          <section className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-border bg-card p-5">
              <h3 className="text-sm font-bold text-foreground">Shipping address</h3>
              <address className="mt-3 text-sm not-italic leading-relaxed text-muted-foreground">
                {order.shippingAddress.firstName} {order.shippingAddress.lastName}
                <br />
                {order.shippingAddress.address}
                <br />
                {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}
                <br />
                {order.shippingAddress.country}
                <br />
                {order.shippingAddress.phone}
              </address>
            </div>
            <div className="rounded-2xl border border-border bg-card p-5">
              <h3 className="text-sm font-bold text-foreground">Billing & payment</h3>
              <div className="mt-3 space-y-2 text-sm text-muted-foreground">
                <p>
                  {order.billingAddress.firstName} {order.billingAddress.lastName}
                  <br />
                  {order.billingAddress.address}, {order.billingAddress.city}
                </p>
                <p>
                  <span className="text-foreground">Method:</span> {order.paymentMethod}
                </p>
                <p>
                  <span className="text-foreground">Delivery:</span> {order.deliveryMethod}
                </p>
              </div>
            </div>
          </section>
        </div>

        <aside>
          <div className="rounded-2xl border border-border bg-card p-6 lg:sticky lg:top-28">
            <h2 className="text-lg font-bold text-foreground">Order summary</h2>
            <div className="mt-4 space-y-2.5 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-semibold text-foreground">{formatPrice(order.subtotal)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-success">
                  <span>Discount{order.couponCode ? ` (${order.couponCode})` : ""}</span>
                  <span className="font-semibold">-{formatPrice(order.discount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span className="font-semibold text-foreground">
                  {order.shipping === 0 ? "Free" : formatPrice(order.shipping)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax</span>
                <span className="font-semibold text-foreground">{formatPrice(order.tax)}</span>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
              <span className="text-base font-bold text-foreground">Total</span>
              <span className="text-2xl font-extrabold text-foreground">{formatPrice(order.total)}</span>
            </div>
            <Button href="/orders" variant="outline" fullWidth className="mt-6" leftIcon={<FiArrowLeft className="h-4 w-4" aria-hidden />}>
              Back to orders
            </Button>
          </div>
        </aside>
      </div>
    </Container>
  );
}
