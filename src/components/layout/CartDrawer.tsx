"use client";

import Link from "next/link";
import { FiTrash2, FiMinus, FiPlus } from "react-icons/fi";
import { Drawer } from "@/components/ui/Drawer";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { ProductImage } from "@/components/ui/ProductImage";
import { useCart } from "@/context/CartProvider";
import { formatPrice } from "@/lib/utils";

type CartDrawerProps = {
  open: boolean;
  onClose: () => void;
};

export function CartDrawer({ open, onClose }: CartDrawerProps) {
  const { items, count, subtotal, updateQuantity, removeItem } = useCart();

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Your Cart"
      subtitle={`${count} item${count === 1 ? "" : "s"}`}
      size="md"
      footer={
        items.length > 0 ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Subtotal</span>
              <span className="text-lg font-bold text-foreground">
                {formatPrice(subtotal)}
              </span>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                href="/cart"
                onClick={onClose}
              >
                View Cart
              </Button>
              <Button
                className="flex-1"
                href="/checkout"
                onClick={onClose}
              >
                Checkout
              </Button>
            </div>
          </div>
        ) : null
      }
    >
      {items.length === 0 ? (
        <EmptyState
          icon={<FiPlus className="h-7 w-7" aria-hidden />}
          title="Your cart is empty"
          description="Looks like you haven't added anything yet. Explore our products and find something you'll love."
          actionLabel="Start shopping"
          actionHref="/shop"
        />
      ) : (
        <ul className="space-y-4">
          {items.map((item) => (
            <li
              key={`${item.product.id}-${item.color}-${item.size}`}
              className="flex gap-3.5 rounded-xl border border-border bg-card p-3"
            >
              <Link
                href={`/shop/${item.product.slug}`}
                onClick={onClose}
                className="shrink-0"
              >
                <ProductImage
                  src={item.product.images[0]}
                  alt={item.product.name}
                  className="h-20 w-20 rounded-lg"
                  imgClassName="rounded-lg"
                />
              </Link>
              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex items-start justify-between gap-2">
                  <Link
                    href={`/shop/${item.product.slug}`}
                    onClick={onClose}
                    className="clamp-2 text-sm font-semibold text-foreground transition-colors hover:text-primary"
                  >
                    {item.product.name}
                  </Link>
                  <button
                    type="button"
                    onClick={() => removeItem(item.product.id)}
                    aria-label={`Remove ${item.product.name} from cart`}
                    className="shrink-0 rounded-md p-1 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                  >
                    <FiTrash2 className="h-4 w-4" aria-hidden />
                  </button>
                </div>
                {(item.color || item.size) && (
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {item.color && (
                      <span className="mr-2 inline-flex items-center gap-1">
                        <span
                          className="inline-block h-3 w-3 rounded-full border border-border"
                          style={{ background: item.color }}
                          aria-hidden
                        />
                        Color
                      </span>
                    )}
                    {item.size && <span>Size: {item.size}</span>}
                  </p>
                )}
                <div className="mt-auto flex items-center justify-between pt-2">
                  <div className="flex items-center rounded-lg border border-border">
                    <button
                      type="button"
                      onClick={() =>
                        updateQuantity(item.product.id, item.quantity - 1)
                      }
                      aria-label="Decrease quantity"
                      className="p-1.5 text-muted-foreground transition-colors hover:text-foreground"
                    >
                      <FiMinus className="h-3.5 w-3.5" aria-hidden />
                    </button>
                    <span className="w-8 text-center text-sm font-semibold text-foreground">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        updateQuantity(item.product.id, item.quantity + 1)
                      }
                      aria-label="Increase quantity"
                      className="p-1.5 text-muted-foreground transition-colors hover:text-foreground"
                    >
                      <FiPlus className="h-3.5 w-3.5" aria-hidden />
                    </button>
                  </div>
                  <span className="text-sm font-bold text-foreground">
                    {formatPrice(item.product.price * item.quantity)}
                  </span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Drawer>
  );
}
