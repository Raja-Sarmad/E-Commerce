import type { Category } from "@/lib/types";
import { products } from "@/lib/data/products";

function img(seed: string) {
  return `https://picsum.photos/seed/${seed}/600/600`;
}

export const categories: Category[] = [
  {
    id: "cat-electronics",
    slug: "electronics",
    name: "Electronics",
    description:
      "Headphones, laptops, cameras, smart home and more — the latest tech at great prices.",
    image: img("cat-electronics"),
    count: products.filter((p) => p.categorySlug === "electronics").length,
    featured: true,
  },
  {
    id: "cat-fashion",
    slug: "fashion",
    name: "Fashion",
    description:
      "Premium clothing, shoes, and accessories crafted from quality materials.",
    image: img("cat-fashion"),
    count: products.filter((p) => p.categorySlug === "fashion").length,
    featured: true,
  },
  {
    id: "cat-home-living",
    slug: "home-living",
    name: "Home & Living",
    description:
      "Furniture, lighting, bedding, and kitchen essentials for a beautiful home.",
    image: img("cat-home-living"),
    count: products.filter((p) => p.categorySlug === "home-living").length,
    featured: true,
  },
  {
    id: "cat-beauty-care",
    slug: "beauty-care",
    name: "Beauty & Care",
    description:
      "Skincare, cosmetics, and wellness products that make you glow.",
    image: img("cat-beauty-care"),
    count: products.filter((p) => p.categorySlug === "beauty-care").length,
    featured: true,
  },
  {
    id: "cat-sports-outdoors",
    slug: "sports-outdoors",
    name: "Sports & Outdoors",
    description:
      "Gear for every adventure — from trail summits to your local gym.",
    image: img("cat-sports-outdoors"),
    count: products.filter((p) => p.categorySlug === "sports-outdoors").length,
    featured: true,
  },
  {
    id: "cat-toys-kids",
    slug: "toys-kids",
    name: "Toys & Kids",
    description:
      "Safe, fun, and educational toys that inspire young minds.",
    image: img("cat-toys-kids"),
    count: products.filter((p) => p.categorySlug === "toys-kids").length,
    featured: true,
  },
];

export function getCategoryBySlug(slug: string) {
  return categories.find((c) => c.slug === slug);
}

export function getCategoryName(slug: string) {
  return categories.find((c) => c.slug === slug)?.name ?? slug;
}
