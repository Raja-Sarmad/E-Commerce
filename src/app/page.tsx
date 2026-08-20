import type { Metadata } from "next";
import { Hero } from "@/components/home/Hero";
import { CategoryShowcase } from "@/components/home/CategoryShowcase";
import { ProductSection } from "@/components/home/ProductSection";
import { FlashSale } from "@/components/home/FlashSale";
import { PromoBanner } from "@/components/home/PromoBanner";
import { BrandShowcase } from "@/components/home/BrandShowcase";
import { Testimonials } from "@/components/home/Testimonials";
import {
  getFeaturedProducts,
  getBestSellers,
  getNewArrivals,
  getFlashSaleProducts,
  getTrendingProducts,
  getRecommendedProducts,
} from "@/lib/api/server";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Premium Shopping, Delivered",
};

async function safeFetch<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch {
    return [] as unknown as T;
  }
}

export default async function HomePage() {
  const [featured, bestSellers, newArrivals, flash, trending, recommended] =
    await Promise.all([
      safeFetch(getFeaturedProducts),
      safeFetch(getBestSellers),
      safeFetch(getNewArrivals),
      safeFetch(getFlashSaleProducts),
      safeFetch(getTrendingProducts),
      safeFetch(getRecommendedProducts),
    ]);

  return (
    <div className="overflow-hidden">
      <Hero />
      <CategoryShowcase />
      <ProductSection
        badge="Hand-picked"
        title="Featured products"
        subtitle="Our editors' picks of the season — quality you can trust."
        products={featured}
        linkLabel="View all"
        linkHref="/shop"
      />
      <FlashSale products={flash} />
      <ProductSection
        badge="Most popular"
        title="Best sellers"
        subtitle="The products everyone is adding to their carts right now."
        products={bestSellers}
        linkLabel="See more"
        linkHref="/shop"
      />
      <PromoBanner />
      <ProductSection
        badge="Just landed"
        title="New arrivals"
        subtitle="Fresh drops added weekly. Be the first to own them."
        products={newArrivals}
        linkLabel="Browse new"
        linkHref="/shop?sort=newest"
      />
      <BrandShowcase />
      <ProductSection
        badge="On the rise"
        title="Trending now"
        subtitle="Fastest-growing favorites our customers can't get enough of."
        products={trending}
        linkLabel="View trends"
        linkHref="/shop"
      />
      <Testimonials />
      <ProductSection
        badge="Top rated"
        title="Recommended for you"
        subtitle="Highly rated picks, chosen just for you."
        products={recommended}
        linkLabel="Shop all"
        linkHref="/shop"
      />
    </div>
  );
}
