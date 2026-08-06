"use client";

import { useState } from "react";
import Link from "next/link";
import { FiChevronRight, FiHeadphones, FiMessageCircle, FiSearch } from "react-icons/fi";
import { Container } from "@/components/ui/Container";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Card } from "@/components/ui/Card";
import { Accordion } from "@/components/ui/Accordion";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

const faqs = [
  {
    category: "Orders & Shipping",
    items: [
      {
        q: "How long does shipping take?",
        a: "Standard shipping takes 2–4 business days for most orders. Express shipping is available at checkout and arrives in 1–2 business days. You'll receive a tracking number by email as soon as your order ships.",
      },
      {
        q: "How much does shipping cost?",
        a: "Shipping is free on all orders over $100. For orders under $100, standard shipping is a flat rate of $12. Express shipping is calculated at checkout based on your destination.",
      },
      {
        q: "Can I track my order?",
        a: "Absolutely. Once your order ships, you'll receive an email with a tracking number. You can also track it anytime from your order history page in your account.",
      },
      {
        q: "Can I change or cancel my order after placing it?",
        a: "You can cancel an order for free within 1 hour of placing it, as long as it hasn't shipped. To change items or addresses, contact our support team as soon as possible and we'll do our best to help.",
      },
    ],
  },
  {
    category: "Returns & Refunds",
    items: [
      {
        q: "What is your return policy?",
        a: "We offer a 30-day return window on most items. Items must be unused, in their original packaging, and include all tags and accessories. Some clearance and personalized items are non-returnable.",
      },
      {
        q: "How do I start a return?",
        a: "Go to your order history, select the order, and click 'Start a return'. You'll receive a prepaid return label by email. Drop your package at any authorized carrier location.",
      },
      {
        q: "When will I get my refund?",
        a: "Once your return is received and inspected (usually within 2–3 business days), your refund is processed to the original payment method. It can take 5–10 business days to appear, depending on your bank.",
      },
      {
        q: "What if my item arrived damaged?",
        a: "We're sorry to hear that! Contact our support team within 48 hours of delivery with photos of the damage, and we'll send a replacement or issue a full refund right away.",
      },
    ],
  },
  {
    category: "Payments & Account",
    items: [
      {
        q: "What payment methods do you accept?",
        a: "We accept all major credit and debit cards (Visa, Mastercard, Amex, Discover), PayPal, Apple Pay, Google Pay, and Shop Pay. All payments are processed securely with 256-bit encryption.",
      },
      {
        q: "Is it safe to shop on NovaMart?",
        a: "Yes. Our checkout is PCI-DSS compliant and all transactions are encrypted. We never store your full card details on our servers.",
      },
      {
        q: "How do I apply a coupon code?",
        a: "Add items to your cart, then enter the coupon code in the 'Apply coupon' field on the cart page before proceeding to checkout. The discount will be reflected in your order summary.",
      },
      {
        q: "How do I create an account?",
        a: "Click 'Sign in' in the header, then 'Create one now'. You can also register during checkout. With an account you can track orders, save wishlists, and check out faster.",
      },
    ],
  },
];

export default function FaqPage() {
  const [query, setQuery] = useState("");

  const normalized = query.trim().toLowerCase();
  const filtered = normalized
    ? faqs
        .map((group) => ({
          ...group,
          items: group.items.filter(
            (item) =>
              item.q.toLowerCase().includes(normalized) ||
              item.a.toLowerCase().includes(normalized)
          ),
        }))
        .filter((group) => group.items.length > 0)
    : faqs;

  return (
    <Container className="py-6">
      <Breadcrumb items={[{ label: "Help Center", href: "/faq" }, { label: "FAQ" }]} />

      <div className="mx-auto max-w-3xl py-6 text-center">
        <p className="text-xs font-bold uppercase tracking-widest text-primary">
          Help center
        </p>
        <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
          Frequently asked questions
        </h1>
        <p className="mt-4 text-muted-foreground">
          Find quick answers to the most common questions. Can&apos;t find what
          you&apos;re looking for?{" "}
          <Link href="/contact" className="font-semibold text-primary hover:text-primary-strong">
            Contact support
          </Link>
          .
        </p>
        <div className="mx-auto mt-8 max-w-md">
          <Input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search questions, e.g. 'return policy'..."
            leftIcon={<FiSearch className="h-4 w-4" aria-hidden />}
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="mx-auto max-w-md py-10 text-center">
          <p className="text-sm text-muted-foreground">
            No results for &ldquo;{query}&rdquo;. Try a different keyword or browse all
            topics below.
          </p>
        </div>
      ) : (
        <div className="mx-auto max-w-3xl space-y-10 pb-10">
          {filtered.map((group) => (
            <div key={group.category}>
              <h2 className="mb-4 text-lg font-extrabold text-foreground">
                {group.category}
              </h2>
              <Accordion
                items={group.items.map((item) => ({
                  title: item.q,
                  content: item.a,
                }))}
              />
            </div>
          ))}
        </div>
      )}

      <Card className="mx-auto my-10 flex max-w-3xl flex-col items-center justify-between gap-5 p-6 text-center sm:flex-row sm:text-left">
        <div className="flex items-center gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <FiHeadphones className="h-6 w-6" aria-hidden />
          </span>
          <div>
            <p className="font-bold text-foreground">Still need help?</p>
            <p className="text-sm text-muted-foreground">
              Our support team is online 24/7 to assist you.
            </p>
          </div>
        </div>
        <div className="flex shrink-0 gap-3">
          <Button href="/contact" variant="outline" size="sm">
            <FiMessageCircle className="mr-1.5 h-4 w-4" aria-hidden />
            Contact us
          </Button>
          <Button href="/contact" size="sm">
            Live chat
            <FiChevronRight className="ml-1.5 h-4 w-4" aria-hidden />
          </Button>
        </div>
      </Card>
    </Container>
  );
}
