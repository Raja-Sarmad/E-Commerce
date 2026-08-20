"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FiArrowRight, FiPackage } from "react-icons/fi";
import { Container } from "@/components/ui/Container";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { EmptyState } from "@/components/ui/EmptyState";
import { Badge } from "@/components/ui/Badge";
import { useGetMeQuery } from "@/lib/rtk/authApi";
import { useGetMyOrdersQuery } from "@/lib/rtk/authApi";
import type { Order, OrderStatus } from "@/lib/types";
import { formatPrice, formatDate } from "@/lib/utils";

const statusVariant: Record<OrderStatus, "warning" | "info" | "success" | "destructive" | "secondary"> = {
  pending: "warning",
  processing: "info",
  shipped: "info",
  delivered: "success",
  cancelled: "destructive",
};

export default function OrdersPage() {
  const { data: user } = useGetMeQuery();
  const isAuthenticated = Boolean(user);
  const { data: orders = [], isLoading } = useGetMyOrdersQuery(undefined, {
    skip: !isAuthenticated,
  });

  return (
    <Container className="py-6">
      <Breadcrumb items={[{ label: "Orders" }]} />
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
          My Orders
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Track, review, or reorder from your order history.
        </p>
      </div>

      {!isAuthenticated ? (
        <EmptyState
          icon={<FiPackage className="h-7 w-7" aria-hidden />}
          title="Sign in to view your orders"
          description="Log in to see your order history, track shipments, and manage returns."
          actionLabel="Sign in"
          actionHref="/login"
        />
      ) : isLoading ? (
        <p className="py-8 text-sm text-muted-foreground">Loading your orders...</p>
      ) : orders.length === 0 ? (
        <EmptyState
          icon={<FiPackage className="h-7 w-7" aria-hidden />}
          title="No orders yet"
          description="When you place an order it will appear here so you can track it."
          actionLabel="Start shopping"
          actionHref="/shop"
        />
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/orders/${order.number}`}
              className="group block rounded-2xl border border-border bg-card p-5 transition-all hover:-translate-y-0.5 hover:shadow-lg"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-bold text-foreground">
                    Order #{order.number}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Placed on {formatDate(order.createdAt)} ·{" "}
                    {order.items.reduce((n, i) => n + i.quantity, 0)} items
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={statusVariant[order.status]} dot>
                    {order.status}
                  </Badge>
                  <span className="text-lg font-extrabold text-foreground">
                    {formatPrice(order.total)}
                  </span>
                  <FiArrowRight
                    className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary"
                    aria-hidden
                  />
                </div>
              </div>
              <div className="mt-4 flex gap-2 overflow-hidden">
                {order.items.slice(0, 5).map((item) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={item.productId}
                    src={item.image}
                    alt={item.name}
                    className="h-14 w-14 rounded-lg border border-border object-cover"
                  />
                ))}
                {order.items.length > 5 && (
                  <span className="flex h-14 w-14 items-center justify-center rounded-lg bg-muted text-xs font-bold text-muted-foreground">
                    +{order.items.length - 5}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </Container>
  );
}
