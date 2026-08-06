"use client";

import Link from "next/link";
import { FiHeart, FiShoppingBag, FiTrash2 } from "react-icons/fi";
import { Container } from "@/components/ui/Container";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { EmptyState } from "@/components/ui/EmptyState";
import { ProductImage } from "@/components/ui/ProductImage";
import { Rating } from "@/components/ui/Rating";
import { Button } from "@/components/ui/Button";
import { useWishlist } from "@/context/WishlistProvider";
import { useCart } from "@/context/CartProvider";
import { useToast } from "@/context/ToastProvider";
import { formatPrice } from "@/lib/utils";

export default function WishlistPage() {
  const { items, removeFromWishlist, clearWishlist } = useWishlist();
  const { addItem } = useCart();
  const { success } = useToast();

  const handleAddToCart = (product: (typeof items)[number]) => {
    addItem(product);
    success("Added to cart", product.name);
  };

  return (
    <Container className="py-6">
      <Breadcrumb items={[{ label: "Wishlist" }]} />
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
            My Wishlist
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {items.length} item{items.length === 1 ? "" : "s"} saved
          </p>
        </div>
        {items.length > 0 && (
          <Button variant="ghost" onClick={clearWishlist} className="text-destructive hover:text-destructive">
            Clear wishlist
          </Button>
        )}
      </div>

      {items.length === 0 ? (
        <EmptyState
          icon={<FiHeart className="h-7 w-7" aria-hidden />}
          title="Your wishlist is empty"
          description="Save products you love and come back to them anytime. Tap the heart icon on any product to add it here."
          actionLabel="Discover products"
          actionHref="/shop"
        />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
          {items.map((product) => (
            <div
              key={product.id}
              className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="relative aspect-square overflow-hidden">
                <Link href={`/shop/${product.slug}`} aria-label={product.name}>
                  <ProductImage
                    src={product.images[0]}
                    alt={product.name}
                    className="h-full w-full transition-transform duration-500 group-hover:scale-105"
                  />
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    removeFromWishlist(product.id);
                    success("Removed from wishlist", product.name);
                  }}
                  aria-label={`Remove ${product.name} from wishlist`}
                  className="absolute right-2.5 top-2.5 flex h-9 w-9 items-center justify-center rounded-full bg-card text-destructive shadow-md transition-all hover:scale-110"
                >
                  <FiTrash2 className="h-4 w-4" aria-hidden />
                </button>
              </div>
              <div className="flex flex-1 flex-col gap-1.5 p-4">
                <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {product.brand}
                </span>
                <Link
                  href={`/shop/${product.slug}`}
                  className="clamp-2 text-sm font-semibold leading-snug text-foreground transition-colors hover:text-primary"
                >
                  {product.name}
                </Link>
                <Rating value={product.rating} count={product.reviewsCount} />
                <div className="mt-auto flex items-center justify-between pt-2">
                  <span className="text-lg font-bold text-foreground">
                    {formatPrice(product.price)}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleAddToCart(product)}
                    disabled={product.stock === 0}
                    aria-label={`Add ${product.name} to cart`}
                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground transition-all hover:bg-primary-strong disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <FiShoppingBag className="h-4 w-4" aria-hidden />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Container>
  );
}
