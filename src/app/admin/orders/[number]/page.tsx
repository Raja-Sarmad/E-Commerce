"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  FiArrowLeft,
  FiCheckCircle,
  FiCircle,
  FiCreditCard,
  FiFileText,
  FiHome,
  FiMapPin,
  FiPrinter,
  FiTruck,
} from "react-icons/fi";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Modal } from "@/components/ui/Modal";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import { useToast } from "@/context/ToastProvider";
import { readOrders } from "@/lib/orders-store";
import { sampleOrders } from "@/lib/data/content";
import { formatPrice, formatDate, formatDateLong, cn } from "@/lib/utils";
import type { Order, OrderStatus } from "@/lib/types";

const statusSteps: OrderStatus[] = ["pending", "processing", "shipped", "delivered"];

export default function AdminOrderDetailPage() {
  const params = useParams<{ number: string }>();
  const router = useRouter();
  const { success, info } = useToast();
  const [order, setOrder] = useState<Order | undefined>();
  const [loaded, setLoaded] = useState(false);
  const [invoiceOpen, setInvoiceOpen] = useState(false);

  useEffect(() => {
    const number = params.number;
    const fromStore = readOrders().find((o) => o.number === number);
    const fromSamples = sampleOrders.find((o) => o.number === number);
    setOrder(fromStore ?? fromSamples);
    setLoaded(true);
  }, [params.number]);

  const changeStatus = (next: OrderStatus) => {
    if (!order) return;
    setOrder({ ...order, status: next });
    info("Status updated", `Order #${order.number} is now ${next}.`);
  };

  const printInvoice = () => {
    if (typeof window === "undefined" || !order) return;
    const printContent = document.getElementById("invoice-print");
    if (!printContent) return;
    const original = document.body.innerHTML;
    document.body.innerHTML = printContent.outerHTML;
    window.print();
    document.body.innerHTML = original;
    setInvoiceOpen(false);
    success("Invoice printed", `Invoice for order #${order.number} sent to printer.`);
  };

  if (!loaded) {
    return (
      <div className="space-y-6">
        <AdminPageHeader title="Order details" subtitle="Loading order..." />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="space-y-6">
        <AdminPageHeader
          title="Order not found"
          breadcrumb={[{ label: "Orders", href: "/admin/orders" }]}
        />
        <EmptyState
          icon={<FiMapPin className="h-7 w-7" aria-hidden />}
          title="Order not found"
          description="We couldn't find that order. It may have been deleted."
          actionLabel="Back to orders"
          actionHref="/admin/orders"
        />
      </div>
    );
  }

  const currentStepIndex = statusSteps.indexOf(
    order.status === "cancelled" ? "pending" : order.status
  );
  const itemCount = order.items.reduce((sum, i) => sum + i.quantity, 0);
  const customerName = `${order.shippingAddress.firstName} ${order.shippingAddress.lastName}`;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={`Order #${order.number}`}
        subtitle={`Placed ${formatDateLong(order.createdAt)} · ${itemCount} item${itemCount === 1 ? "" : "s"}`}
        breadcrumb={[
          { label: "Orders", href: "/admin/orders" },
          { label: `#${order.number}` },
        ]}
        actions={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setInvoiceOpen(true)}
              leftIcon={<FiFileText className="h-4 w-4" aria-hidden />}
            >
              Invoice
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/admin/orders")}
              leftIcon={<FiArrowLeft className="h-4 w-4" aria-hidden />}
            >
              Back
            </Button>
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card className="overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4">
              <div>
                <h2 className="font-bold text-foreground">Order status</h2>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  Current: <StatusBadge status={order.status} />
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Select
                  value={order.status}
                  onChange={(e) => changeStatus(e.target.value as OrderStatus)}
                  containerClassName="w-44"
                  className="h-9 px-3 text-sm"
                  aria-label="Change order status"
                >
                  {statusSteps.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                  <option value="cancelled">cancelled</option>
                </Select>
                {order.status !== "cancelled" && currentStepIndex < statusSteps.length - 1 && (
                  <Button
                    size="sm"
                    onClick={() =>
                      changeStatus(statusSteps[Math.min(currentStepIndex + 1, statusSteps.length - 1)])
                    }
                  >
                    Advance
                  </Button>
                )}
              </div>
            </div>
            <div className="px-5 py-6">
              <ol className="flex items-center">
                {statusSteps.map((step, i) => {
                  const done = order.status !== "cancelled" && i <= currentStepIndex;
                  const isLast = i === statusSteps.length - 1;
                  return (
                    <li
                      key={step}
                      className={cn("flex items-center", !isLast && "flex-1")}
                    >
                      <div className="flex flex-col items-center gap-2">
                        <span
                          className={cn(
                            "flex h-9 w-9 items-center justify-center rounded-full border-2 transition-colors",
                            done
                              ? "border-success bg-success/10 text-success"
                              : "border-border bg-card text-muted-foreground"
                          )}
                        >
                          {done ? (
                            <FiCheckCircle className="h-4 w-4" aria-hidden />
                          ) : (
                            <FiCircle className="h-4 w-4" aria-hidden />
                          )}
                        </span>
                        <span
                          className={cn(
                            "text-xs font-semibold capitalize",
                            done ? "text-foreground" : "text-muted-foreground"
                          )}
                        >
                          {step}
                        </span>
                      </div>
                      {!isLast && (
                        <div
                          className={cn(
                            "mx-2 h-0.5 flex-1 rounded-full sm:mx-4",
                            i < currentStepIndex ? "bg-success" : "bg-border"
                          )}
                        />
                      )}
                    </li>
                  );
                })}
              </ol>
            </div>
          </Card>

          <Card className="overflow-hidden">
            <div className="border-b border-border px-5 py-4">
              <h2 className="font-bold text-foreground">Items</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border text-xs uppercase tracking-wider text-muted-foreground">
                    <th className="px-5 py-3 font-semibold">Product</th>
                    <th className="px-5 py-3 font-semibold">Price</th>
                    <th className="px-5 py-3 text-center font-semibold">Qty</th>
                    <th className="px-5 py-3 text-right font-semibold">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {order.items.map((item) => (
                    <tr key={item.productId} className="hover:bg-muted/40">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={item.image}
                            alt={item.name}
                            className="h-12 w-12 rounded-lg border border-border object-cover"
                          />
                          <div className="min-w-0">
                            <p className="font-semibold text-foreground">{item.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {item.productId}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-muted-foreground">
                        {formatPrice(item.price)}
                      </td>
                      <td className="px-5 py-3.5 text-center text-foreground">
                        {item.quantity}
                      </td>
                      <td className="px-5 py-3.5 text-right font-bold text-foreground">
                        {formatPrice(item.price * item.quantity)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex justify-end border-t border-border px-5 py-4">
              <dl className="w-full max-w-xs space-y-2 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <dt>Subtotal</dt>
                  <dd className="text-foreground">{formatPrice(order.subtotal)}</dd>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-muted-foreground">
                    <dt>Discount{order.couponCode ? ` (${order.couponCode})` : ""}</dt>
                    <dd className="text-success">−{formatPrice(order.discount)}</dd>
                  </div>
                )}
                <div className="flex justify-between text-muted-foreground">
                  <dt>Shipping</dt>
                  <dd className="text-foreground">
                    {order.shipping === 0 ? "Free" : formatPrice(order.shipping)}
                  </dd>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <dt>Tax</dt>
                  <dd className="text-foreground">{formatPrice(order.tax)}</dd>
                </div>
                <div className="flex justify-between border-t border-border pt-2 text-base font-bold text-foreground">
                  <dt>Total</dt>
                  <dd>{formatPrice(order.total)}</dd>
                </div>
              </dl>
            </div>
          </Card>

          {order.tracking && (
            <Card className="overflow-hidden">
              <div className="flex items-center gap-2 border-b border-border px-5 py-4">
                <FiTruck className="h-4 w-4 text-primary" aria-hidden />
                <h2 className="font-bold text-foreground">Tracking</h2>
                <Badge variant="secondary" className="ml-auto">
                  {order.tracking.carrier}
                </Badge>
              </div>
              <div className="px-5 py-4">
                <p className="font-mono text-sm text-muted-foreground">
                  Tracking # {order.tracking.trackingNumber}
                </p>
                <ol className="mt-4 space-y-4">
                  {order.tracking.events.map((event, i) => (
                    <li key={i} className="relative flex gap-4 pb-1">
                      {i < order.tracking!.events.length - 1 && (
                        <span className="absolute left-[9px] top-5 h-full w-px bg-border" aria-hidden />
                      )}
                      <span
                        className={cn(
                          "relative z-10 mt-1 h-[18px] w-[18px] shrink-0 rounded-full border-2",
                          i === 0
                            ? "border-primary bg-primary/10"
                            : "border-border bg-card"
                        )}
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-foreground">
                          {event.label}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {event.location} · {formatDate(event.date)}
                        </p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card className="p-5">
            <div className="mb-4 flex items-center gap-2">
              <FiHome className="h-4 w-4 text-primary" aria-hidden />
              <h2 className="font-bold text-foreground">Shipping address</h2>
            </div>
            <p className="text-sm font-semibold text-foreground">{customerName}</p>
            <address className="mt-1 text-sm not-italic leading-relaxed text-muted-foreground">
              {order.shippingAddress.address}
              <br />
              {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
              {order.shippingAddress.zip}
              <br />
              {order.shippingAddress.country}
              <br />
              {order.shippingAddress.phone}
            </address>
            <div className="mt-4 space-y-2 border-t border-border pt-4 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Delivery</span>
                <span className="font-medium text-foreground">{order.deliveryMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">ETA</span>
                <span className="font-medium text-foreground">
                  {formatDate(order.estimatedDelivery)}
                </span>
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <div className="mb-4 flex items-center gap-2">
              <FiCreditCard className="h-4 w-4 text-primary" aria-hidden />
              <h2 className="font-bold text-foreground">Billing</h2>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Payment</span>
                <span className="font-medium text-foreground">{order.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Paid</span>
                <span className="font-medium text-foreground">
                  {order.status === "cancelled" ? "—" : formatPrice(order.total)}
                </span>
              </div>
            </div>
            <div className="mt-4 border-t border-border pt-4">
              <p className="text-sm font-semibold text-foreground">Billing address</p>
              <address className="mt-1 text-sm not-italic leading-relaxed text-muted-foreground">
                {order.billingAddress.address}, {order.billingAddress.city},{" "}
                {order.billingAddress.state} {order.billingAddress.zip},{" "}
                {order.billingAddress.country}
              </address>
            </div>
          </Card>
        </div>
      </div>

      <Modal
        open={invoiceOpen}
        onClose={() => setInvoiceOpen(false)}
        title="Invoice"
        subtitle={`Order #${order.number}`}
        size="lg"
      >
        <div className="space-y-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-2xl font-extrabold tracking-tight text-foreground">
                NovaMart
              </p>
              <p className="text-sm text-muted-foreground">Invoice #{order.number}</p>
            </div>
            <div className="text-right text-sm text-muted-foreground">
              <p>Date: {formatDate(order.createdAt)}</p>
              <p>Status: {order.status}</p>
            </div>
          </div>
          <div className="grid gap-4 text-sm sm:grid-cols-2">
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Billed to
              </p>
              <p className="font-semibold text-foreground">{customerName}</p>
              <address className="text-muted-foreground not-italic">
                {order.billingAddress.address}, {order.billingAddress.city},{" "}
                {order.billingAddress.state} {order.billingAddress.zip},{" "}
                {order.billingAddress.country}
              </address>
            </div>
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Ship to
              </p>
              <p className="font-semibold text-foreground">{customerName}</p>
              <address className="text-muted-foreground not-italic">
                {order.shippingAddress.address}, {order.shippingAddress.city},{" "}
                {order.shippingAddress.state} {order.shippingAddress.zip},{" "}
                {order.shippingAddress.country}
              </address>
            </div>
          </div>
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border text-xs uppercase tracking-wider text-muted-foreground">
                <th className="py-2 font-semibold">Item</th>
                <th className="py-2 text-center font-semibold">Qty</th>
                <th className="py-2 text-right font-semibold">Price</th>
                <th className="py-2 text-right font-semibold">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {order.items.map((item) => (
                <tr key={item.productId}>
                  <td className="py-2.5 font-medium text-foreground">{item.name}</td>
                  <td className="py-2.5 text-center text-muted-foreground">
                    {item.quantity}
                  </td>
                  <td className="py-2.5 text-right text-muted-foreground">
                    {formatPrice(item.price)}
                  </td>
                  <td className="py-2.5 text-right font-semibold text-foreground">
                    {formatPrice(item.price * item.quantity)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <dl className="ml-auto w-full max-w-xs space-y-2 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <dt>Subtotal</dt>
              <dd>{formatPrice(order.subtotal)}</dd>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-muted-foreground">
                <dt>Discount</dt>
                <dd className="text-success">−{formatPrice(order.discount)}</dd>
              </div>
            )}
            <div className="flex justify-between text-muted-foreground">
              <dt>Shipping</dt>
              <dd>{order.shipping === 0 ? "Free" : formatPrice(order.shipping)}</dd>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <dt>Tax</dt>
              <dd>{formatPrice(order.tax)}</dd>
            </div>
            <div className="flex justify-between border-t border-border pt-2 text-base font-bold text-foreground">
              <dt>Total</dt>
              <dd>{formatPrice(order.total)}</dd>
            </div>
          </dl>
          <div className="flex justify-end gap-2 border-t border-border pt-4">
            <Button
              variant="outline"
              onClick={() => setInvoiceOpen(false)}
            >
              Close
            </Button>
            <Button onClick={printInvoice} leftIcon={<FiPrinter className="h-4 w-4" aria-hidden />}>
              Print invoice
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
