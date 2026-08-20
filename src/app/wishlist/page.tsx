"use client";

import Link from "next/link";
import { useState } from "react";
import { FiHeart } from "react-icons/fi";
import { useSelector, useDispatch } from "react-redux";
import { Container } from "@/components/ui/Container";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { ProductImage } from "@/components/ui/ProductImage";
import { AuthRequiredModal } from "@/components/ui/AuthRequiredModal";
import { selectWishlistItems, removeFromWishlist } from "@/lib/rtk/wishlistSlice";
import { selectIsInCart } from "@/lib/rtk/cartSlice";
import { formatPrice, cn } from "@/lib/utils";

export default function WishlistPage() {
  const dispatch = useDispatch();
  const items = useSelector(selectWishlistItems);

  return (
    <Container className="py-6">
      <Breadcrumb items={[{ label: "Wishlist" }]} />
      <h1 className="mb-8 text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
        Wishlist
      </h1>

      {items.length === 0 ? (
        <EmptyState
          icon={<FiHeart className="h-7 w-7" aria-hidden />}
          title="Your wishlist is empty"
          description="Save your favorite items here so you never lose track of them."
          actionLabel="Discover products"
          actionHref="/shop"
        />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4">
          {items.map((product) => (
            <WishlistCard key={product.id} product={product} dispatch={dispatch} />
          ))}
        </div>
      )}
    </Container>
  );
}

import { addItem } from "@/lib/rtk/cartSlice";
import { toast } from "@/hooks/use-toast";
import { type Product } from "@/lib/types";
import { selectCartCount } from "@/lib/rtk/cartSlice";
import { useIsAdmin } from "@/hooks/use-is-admin";
import { useGetMeQuery } from "@/lib/rtk/authApi";

function WishlistCard({ product, dispatch }: { product: Product; dispatch: any }) {
  const inCart = useSelector(selectIsInCart(product.id));
  const { isAdmin } = useIsAdmin();
  const { data: user } = useGetMeQuery();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { rating, reviewsCount } = product;
  const stars = Math.round(rating);

  return (
    <article className="group relative flex flex-col rounded-2xl border border-border bg-card p-3 transition-shadow hover:shadow-lg">
      <div className="relative mb-3 overflow-hidden rounded-xl bg-white">
        <Link href={`/shop/${product.slug}`}>
          <ProductImage
            src={product.images?.[0] ?? ""}
            alt={product.name}
            className="aspect-square"
            imgClassName="object-contain p-2 transition-transform duration-300 group-hover:scale-105"
          />
        </Link>
        {product.compareAtPrice && (
          <span className="absolute left-2 top-2 rounded-full bg-destructive px-2.5 py-1 text-xs font-bold text-white">
            {Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)}% OFF
          </span>
        )}
        <button
          type="button"
          onClick={() => dispatch(removeFromWishlist(product.id))}
          aria-label={`Remove ${product.name} from wishlist`}
          className="absolute right-2 top-2 rounded-full bg-white/90 p-1.5 text-destructive shadow transition-colors hover:bg-destructive hover:text-white"
        >
          <FiHeart className="h-4 w-4 fill-current" aria-hidden />
        </button>
      </div>

      <div className="flex flex-1 flex-col px-1 pb-1">
        <p className="text-xs text-muted-foreground">{product.brand}</p>
        <Link href={`/shop/${product.slug}`} className="mt-1 clamp-2 text-sm font-semibold text-foreground transition-colors hover:text-primary">
          {product.name}
        </Link>
          <div className="mt-2 flex items-center gap-1" aria-label={`${rating} out of 5 stars from ${reviewsCount} reviews`}>
          {Array.from({ length: 5 }).map((_, i) => (
            <span key={i} className={cn("h-3.5 w-3.5", i < stars ? "text-amber-400" : "text-muted")} aria-hidden>
              ★
            </span>
          ))}
          <span className="ml-1 text-xs text-muted-foreground">({reviewsCount})</span>
        </div>
        <div className="mt-auto flex items-end justify-between pt-3">
          <div>
            <p className="text-lg font-extrabold text-foreground">{formatPrice(product.price)}</p>
            {product.compareAtPrice && (
              <p className="text-xs text-muted-foreground line-through">{formatPrice(product.compareAtPrice)}</p>
            )}
          </div>
          {!isAdmin && (
            <Button
              size="sm"
              onClick={() => {
                if (!user) {
                  setShowAuthModal(true);
                  return;
                }
                if (!inCart) dispatch(addItem({ product, quantity: 1 }));
                toast.success("Added to cart", `${product.name} has been added to your cart.`);
              }}
            >
              {inCart ? "In cart" : "Add to cart"}
            </Button>
          )}
        </div>
      </div>
      <AuthRequiredModal open={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </article>
  );
}
