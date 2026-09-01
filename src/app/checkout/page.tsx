"use client";

import dynamic from "next/dynamic";
import { Container } from "@/components/ui/Container";
import { Breadcrumb } from "@/components/ui/Breadcrumb";

const CheckoutClient = dynamic(
  () => import("@/components/checkout/CheckoutClient"),
  {
    ssr: false,
    loading: () => (
      <Container className="py-6">
        <Breadcrumb items={[{ label: "Cart", href: "/cart" }, { label: "Checkout" }]} />
        <h1 className="mb-6 text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
          Checkout
        </h1>
        <div className="rounded-2xl border border-border bg-card p-10 text-center">
          <p className="text-sm text-muted-foreground">Loading checkout...</p>
        </div>
      </Container>
    ),
  }
);

export default function CheckoutPage() {
  return <CheckoutClient />;
}
