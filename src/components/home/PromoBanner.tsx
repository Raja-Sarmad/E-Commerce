import Link from "next/link";
import { FiArrowRight, FiShield, FiTag, FiTruck } from "react-icons/fi";
import { Container } from "@/components/ui/Container";
import { ProductImage } from "@/components/ui/ProductImage";

export function PromoBanner() {
  return (
    <section aria-label="Promotions" className="py-12 sm:py-16">
      <Container>
        <div className="grid gap-5 lg:grid-cols-2">
          <Link
            href="/shop?category=home-living"
            className="group relative overflow-hidden rounded-3xl"
          >
            <ProductImage
              src="https://picsum.photos/seed/promo-home-living/900/600"
              alt="Home & Living sale"
              className="h-72 w-full sm:h-80"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" aria-hidden />
            <div className="absolute inset-0 flex flex-col justify-center p-8 sm:p-12">
              <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-accent px-3 py-1 text-xs font-bold text-accent-foreground">
                <FiTag className="h-3.5 w-3.5" aria-hidden />
                Up to 30% off
              </span>
              <h3 className="mt-3 max-w-xs text-2xl font-extrabold text-white sm:text-3xl">
                Elevate your home & living space
              </h3>
              <p className="mt-2 max-w-sm text-sm text-white/80">
                Furniture, lighting, bedding and more — curated for modern living.
              </p>
              <span className="mt-5 inline-flex w-fit items-center gap-2 rounded-xl bg-white/10 px-5 py-2.5 text-sm font-bold text-white backdrop-blur transition-colors group-hover:bg-white group-hover:text-foreground">
                Shop the collection
                <FiArrowRight className="h-4 w-4" aria-hidden />
              </span>
            </div>
          </Link>

          <div className="grid gap-5">
            <Link
              href="/shop?sale=on"
              className="group relative overflow-hidden rounded-3xl"
            >
              <ProductImage
                src="https://picsum.photos/seed/promo-fashion/900/400"
                alt="Fashion deals"
                className="h-36 w-full sm:h-40"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-primary-strong/60" aria-hidden />
              <div className="absolute inset-0 flex items-center justify-between p-6 sm:p-8">
                <div>
                  <h3 className="text-xl font-extrabold text-white sm:text-2xl">
                    Fashion must-haves
                  </h3>
                  <p className="mt-1 text-sm text-white/80">
                    New arrivals every week
                  </p>
                </div>
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-primary transition-transform group-hover:scale-110">
                  <FiArrowRight className="h-5 w-5" aria-hidden />
                </span>
              </div>
            </Link>

            <div className="grid gap-5 sm:grid-cols-2">
              <Link
                href="/shop?category=electronics"
                className="group relative overflow-hidden rounded-3xl bg-foreground p-6 sm:p-8"
              >
                <div className="absolute -right-6 -top-6 h-28 w-28 rounded-full bg-primary/30 blur-2xl transition-all group-hover:bg-primary/50" aria-hidden />
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/20 text-primary">
                  <FiShield className="h-5 w-5" aria-hidden />
                </span>
                <h3 className="mt-4 text-lg font-extrabold text-background">
                  2-year warranty
                </h3>
                <p className="mt-1 text-xs text-background/70">
                  On every electronic we sell
                </p>
              </Link>
              <Link
                href="/shop"
                className="group relative overflow-hidden rounded-3xl bg-accent p-6 sm:p-8"
              >
                <div className="absolute -right-6 -top-6 h-28 w-28 rounded-full bg-white/30 blur-2xl" aria-hidden />
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/20 text-accent-foreground">
                  <FiTruck className="h-5 w-5" aria-hidden />
                </span>
                <h3 className="mt-4 text-lg font-extrabold text-accent-foreground">
                  Free express delivery
                </h3>
                <p className="mt-1 text-xs text-accent-foreground/80">
                  On orders over $100
                </p>
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
