import type { Metadata } from "next";
import { FiHeadphones, FiRefreshCw, FiShield, FiTruck } from "react-icons/fi";
import { Container } from "@/components/ui/Container";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

const stats = [
  { value: "500K+", label: "Happy customers" },
  { value: "12K+", label: "Products curated" },
  { value: "98%", label: "On-time delivery" },
  { value: "4.8/5", label: "Average rating" },
];

const values = [
  {
    icon: FiTruck,
    title: "Fast, free shipping",
    description:
      "Free delivery on orders over $100. Most orders arrive within 2–4 business days.",
  },
  {
    icon: FiRefreshCw,
    title: "30-day returns",
    description:
      "Changed your mind? Return any item within 30 days for a full refund.",
  },
  {
    icon: FiShield,
    title: "Secure checkout",
    description:
      "Your payment details are encrypted and never stored on our servers.",
  },
  {
    icon: FiHeadphones,
    title: "24/7 support",
    description:
      "Our friendly team is available around the clock to help you out.",
  },
];

export const metadata: Metadata = {
  title: "About NovaMart",
  description:
    "Learn about NovaMart — our story, our values, and why millions of shoppers choose us.",
};

export default function AboutPage() {
  return (
    <>
      <Container className="py-6">
        <Breadcrumb items={[{ label: "About" }]} />

        <section className="grid items-center gap-10 lg:grid-cols-2 lg:py-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-primary">
              Our story
            </p>
            <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
              Shopping made
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                {" "}
                simple.
              </span>
            </h1>
            <p className="mt-5 max-w-lg leading-relaxed text-muted-foreground">
              NovaMart started in 2019 with a simple belief: everyone deserves
              access to great products at fair prices, without the hassle. What
              began as a two-person garage operation is now a marketplace
              serving thousands of customers across the globe.
            </p>
            <p className="mt-4 max-w-lg leading-relaxed text-muted-foreground">
              Today, we partner with hundreds of trusted brands and independent
              makers to bring you a curated selection of electronics, fashion,
              home essentials, and more — backed by our 30-day return promise.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button href="/shop">Shop bestsellers</Button>
              <Button href="/contact" variant="outline">
                Talk to us
              </Button>
            </div>
          </div>
          <div className="relative">
            <div
              className="pointer-events-none absolute -right-6 -top-6 h-40 w-40 rounded-full bg-accent/20 blur-2xl"
              aria-hidden
            />
            <div className="overflow-hidden rounded-3xl border border-border shadow-2xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://picsum.photos/seed/novamart-team/900/650"
                alt="The NovaMart team at work"
                className="h-full w-full object-cover"
              />
            </div>
            <Card className="absolute -bottom-6 left-6 hidden max-w-xs p-5 sm:block">
              <p className="text-sm font-semibold text-foreground">
                &ldquo;Our mission is to make premium shopping effortless for
                everyone.&rdquo;
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                — Mara Vance, Founder & CEO
              </p>
            </Card>
          </div>
        </section>

        <section className="py-16">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {stats.map((stat) => (
              <Card key={stat.label} className="p-6 text-center">
                <p className="text-3xl font-extrabold text-primary sm:text-4xl">
                  {stat.value}
                </p>
                <p className="mt-1.5 text-sm font-medium text-muted-foreground">
                  {stat.label}
                </p>
              </Card>
            ))}
          </div>
        </section>

        <section className="py-10">
          <SectionHeader
            badge="What we stand for"
            title="The NovaMart promise"
            subtitle="Four values guide every decision we make, from product sourcing to your unboxing moment."
          />
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((value) => (
              <Card key={value.title} hover className="p-6">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <value.icon className="h-6 w-6" aria-hidden />
                </span>
                <h3 className="mt-4 font-bold text-foreground">{value.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {value.description}
                </p>
              </Card>
            ))}
          </div>
        </section>

        <section className="rounded-3xl bg-gradient-to-r from-primary to-accent p-8 sm:p-12 lg:py-16">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div className="max-w-xl">
              <h2 className="text-2xl font-extrabold text-primary-foreground sm:text-3xl">
                Ready to find your next favorite thing?
              </h2>
              <p className="mt-2 text-primary-foreground/85">
                Join thousands of happy customers. Free shipping on orders over
                $100.
              </p>
            </div>
            <Button
              href="/shop"
              variant="outline"
              size="lg"
              className="border-primary-foreground/30 bg-white/10 text-primary-foreground hover:bg-white/20"
            >
              Browse the catalog
            </Button>
          </div>
        </section>
      </Container>
    </>
  );
}
