import Link from "next/link";
import { FiArrowRight, FiShoppingBag } from "react-icons/fi";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { ProductImage } from "@/components/ui/ProductImage";
import { Badge } from "@/components/ui/Badge";
import { FreeShippingText } from "@/components/ui/FreeShippingText";

const slides = [
  {
    id: "hero-1",
    kicker: "New Season Drop",
    title: "Sound that moves you",
    subtitle:
      "The Aurora Wireless Headphones Pro — studio-grade audio with 45dB noise cancellation and 40-hour battery.",
    cta: { label: "Shop Headphones", href: "/shop?category=electronics" },
    image:
      "https://picsum.photos/seed/aurora-wireless-headphones-pro-1/900/900",
    accent: "from-primary/90 to-primary-strong/80",
  },
];

export function Hero() {
  const slide = slides[0];
  return (
    <section aria-label="Featured banner" className="relative">
      <Container className="pt-4 sm:pt-6">
        <div className="relative overflow-hidden rounded-3xl bg-foreground">
          <div
            className={`absolute inset-0 bg-gradient-to-r ${slide.accent}`}
            aria-hidden
          />
          <div
            className="absolute inset-0 opacity-[0.08]"
            style={{
              backgroundImage:
                "radial-gradient(circle at 2px 2px, white 1.5px, transparent 0)",
              backgroundSize: "32px 32px",
            }}
            aria-hidden
          />
          <div className="relative grid gap-0 lg:grid-cols-2">
            <div className="flex flex-col justify-center px-6 py-12 text-white sm:px-12 sm:py-16 lg:py-24">
              <Badge
                variant="accent"
                className="w-fit text-background"
              >
                {slide.kicker}
              </Badge>
              <h1 className="mt-5 max-w-md text-3xl font-extrabold leading-tight tracking-tight sm:text-5xl">
                {slide.title}
              </h1>
              <p className="mt-4 max-w-md text-sm leading-relaxed text-white/85 sm:text-base">
                {slide.subtitle}
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button href={slide.cta.href} variant="accent" size="lg">
                  <FiShoppingBag className="h-5 w-5" aria-hidden />
                  {slide.cta.label}
                </Button>
                <Button
                  href="/shop?sale=on"
                  variant="ghost"
                  size="lg"
                  className="border border-white/25 text-white hover:bg-white/10"
                >
                  View Flash Sale
                  <FiArrowRight className="h-4 w-4" aria-hidden />
                </Button>
              </div>
              <dl className="mt-10 flex flex-wrap gap-x-10 gap-y-4">
                {[
                  ["50k+", "Happy customers"],
                  ["4.8/5", "Average rating"],
                  ["24h", "Fast delivery"],
                ].map(([value, label]) => (
                  <div key={label}>
                    <dt className="text-xl font-extrabold sm:text-2xl">
                      {value}
                    </dt>
                    <dd className="text-xs text-white/70">{label}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <div className="relative hidden lg:block">
              <div className="absolute inset-0 flex items-center justify-center p-10">
                <div className="animate-float relative aspect-square w-full max-w-md">
                  <ProductImage
                    src={slide.image}
                    alt={slide.title}
                    className="h-full w-full rounded-3xl shadow-2xl"
                  />
                  <div className="absolute -left-6 top-10 rounded-2xl border border-white/20 bg-white/10 px-4 py-3 backdrop-blur-md">
                    <p className="text-[10px] uppercase tracking-wide text-white/70">
                      Best Seller
                    </p>
                    <p className="text-sm font-bold text-white">
                      -20% this week
                    </p>
                  </div>
                  <div className="absolute -bottom-5 right-8 rounded-2xl border border-white/20 bg-white/10 px-4 py-3 backdrop-blur-md">
                    <p className="text-[10px] uppercase tracking-wide text-white/70">
                      Free shipping
                    </p>
                    <p className="text-sm font-bold text-white">
                      <FreeShippingText prefix="On orders " suffix="+" />
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
