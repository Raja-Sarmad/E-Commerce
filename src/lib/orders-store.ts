"use client";

import type { Order } from "./types";

const STORAGE_KEY = "novamart-orders";

export type PlacedOrder = Order;

export function saveOrder(order: Order) {
  if (typeof window === "undefined") return;
  const orders = readOrders();
  const existing = orders.filter((o) => o.id !== order.id);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify([order, ...existing]));
}

export function readOrders(): Order[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Order[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function readOrderById(id: string): Order | undefined {
  return readOrders().find((o) => o.id === id);
}

export function readOrderByNumber(number: string): Order | undefined {
  return readOrders().find((o) => o.number === number);
}

export function generateOrderNumber() {
  const prefix = "NM";
  const random = Math.floor(100000 + Math.random() * 900000);
  return `${prefix}-${random}`;
}
