"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { CartItem, Coupon, Product } from "@/lib/types";
import { getCouponByCode } from "@/lib/data/content";
import { siteConfig } from "@/lib/site";

type CartContextValue = {
  items: CartItem[];
  count: number;
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
  coupon: Coupon | null;
  addItem: (product: Product, quantity?: number, color?: string, size?: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
  applyCoupon: (code: string) => boolean;
  removeCoupon: () => void;
  isInCart: (productId: string) => boolean;
};

const CartContext = createContext<CartContextValue | undefined>(undefined);

const STORAGE_KEY = "novamart-cart";

function readStorage(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CartItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [coupon, setCoupon] = useState<Coupon | null>(null);

  useEffect(() => {
    setItems(readStorage());
  }, []);

  useEffect(() => {
    if (items.length > 0) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } else {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, [items]);

  const isInCart = useCallback(
    (productId: string) => items.some((i) => i.product.id === productId),
    [items]
  );

  const addItem = useCallback(
    (product: Product, quantity = 1, color?: string, size?: string) => {
      setItems((prev) => {
        const existing = prev.find(
          (i) =>
            i.product.id === product.id &&
            i.color === color &&
            i.size === size
        );
        if (existing) {
          return prev.map((i) =>
            i === existing ? { ...i, quantity: Math.min(i.quantity + quantity, 99) } : i
          );
        }
        return [...prev, { product, quantity, color, size }];
      });
    },
    []
  );

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    setItems((prev) =>
      prev
        .map((i) =>
          i.product.id === productId
            ? { ...i, quantity: Math.max(0, Math.min(quantity, 99)) }
            : i
        )
        .filter((i) => i.quantity > 0)
    );
  }, []);

  const removeItem = useCallback((productId: string) => {
    setItems((prev) => prev.filter((i) => i.product.id !== productId));
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    setCoupon(null);
  }, []);

  const applyCoupon = useCallback(
    (code: string) => {
      const subtotal = items.reduce(
        (sum, i) => sum + i.product.price * i.quantity,
        0
      );
      const found = getCouponByCode(code);
      if (!found) return false;
      if (subtotal < found.minSpend) return false;
      setCoupon(found);
      return true;
    },
    [items]
  );

  const removeCoupon = useCallback(() => setCoupon(null), []);

  const { subtotal, discount, shipping, tax, total, count } = useMemo(() => {
    const sub = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
    let disc = 0;
    if (coupon) {
      if (coupon.type === "percentage") {
        disc = (sub * coupon.value) / 100;
        if (coupon.maxDiscount) disc = Math.min(disc, coupon.maxDiscount);
      } else {
        disc = coupon.value;
      }
      disc = Math.min(disc, sub);
    }
    const ship =
      sub - disc >= siteConfig.freeShippingThreshold || sub === 0
        ? 0
        : siteConfig.shippingRate;
    const t = (sub - disc) * siteConfig.taxRate;
    return {
      subtotal: sub,
      discount: disc,
      shipping: ship,
      tax: t,
      total: sub - disc + ship + t,
      count: items.reduce((n, i) => n + i.quantity, 0),
    };
  }, [items, coupon]);

  const value = useMemo(
    () => ({
      items,
      count,
      subtotal,
      discount,
      shipping,
      tax,
      total,
      coupon,
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
      applyCoupon,
      removeCoupon,
      isInCart,
    }),
    [
      items,
      count,
      subtotal,
      discount,
      shipping,
      tax,
      total,
      coupon,
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
      applyCoupon,
      removeCoupon,
      isInCart,
    ]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
