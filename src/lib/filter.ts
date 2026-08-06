import type { Product } from "./types";

export type ProductQuery = {
  category?: string;
  brand?: string;
  min?: string;
  max?: string;
  rating?: string;
  inStock?: string;
  sale?: string;
  sort?: string;
  q?: string;
};

export function filterAndSortProducts(
  products: Product[],
  query: ProductQuery,
  searchFn?: (q: string) => Product[]
) {
  let result = [...products];

  if (query.q) {
    result = searchFn ? searchFn(query.q) : result;
  }

  if (query.category) {
    result = result.filter((p) => p.categorySlug === query.category);
  }

  if (query.brand) {
    const brands = query.brand.split(",");
    result = result.filter((p) => brands.includes(p.brand));
  }

  if (query.min) {
    const min = Number(query.min);
    if (!Number.isNaN(min)) {
      result = result.filter((p) => p.price >= min);
    }
  }
  if (query.max) {
    const max = Number(query.max);
    if (!Number.isNaN(max)) {
      result = result.filter((p) => p.price <= max);
    }
  }

  if (query.rating) {
    const rating = Number(query.rating);
    if (!Number.isNaN(rating)) {
      result = result.filter((p) => p.rating >= rating);
    }
  }

  if (query.inStock === "true") {
    result = result.filter((p) => p.stock > 0);
  }

  if (query.sale === "on") {
    result = result.filter((p) => p.onSale);
  }

  switch (query.sort) {
    case "newest":
      result.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      break;
    case "price-asc":
      result.sort((a, b) => a.price - b.price);
      break;
    case "price-desc":
      result.sort((a, b) => b.price - a.price);
      break;
    case "rating":
      result.sort((a, b) => b.rating - a.rating);
      break;
    case "name-asc":
      result.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case "name-desc":
      result.sort((a, b) => b.name.localeCompare(a.name));
      break;
    default:
      result.sort((a, b) => {
        const featuredDiff = Number(b.isFeatured) - Number(a.isFeatured);
        if (featuredDiff !== 0) return featuredDiff;
        return b.rating - a.rating;
      });
  }

  return result;
}

export function paginate<T>(items: T[], page: number, perPage: number) {
  const start = (page - 1) * perPage;
  return {
    items: items.slice(start, start + perPage),
    total: items.length,
    totalPages: Math.max(1, Math.ceil(items.length / perPage)),
  };
}
