"use client";

import { useEffect } from "react";
import Link from "next/link";
import {
  FiCalendar,
  FiEdit2,
  FiMail,
  FiPackage,
  FiShield,
  FiUser,
} from "react-icons/fi";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useGetMeQuery } from "@/lib/rtk/authApi";
import { formatDate, formatPrice } from "@/lib/utils";
import { readOrders } from "@/lib/orders-store";
import { sampleOrders } from "@/lib/data/content";

export default function ProfilePage() {
  const { data: user } = useGetMeQuery();

  const recentOrders = [...readOrders(), ...sampleOrders]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3);

  if (!user) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
            Hi, {user.name.split(" ")[0]}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Here&apos;s what&apos;s happening with your account.
          </p>
        </div>
        <Button href="/account/edit" variant="outline" size="sm">
          <FiEdit2 className="mr-1.5 h-3.5 w-3.5" aria-hidden />
          Edit profile
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Orders placed", value: String(readOrders().length) },
          { label: "In wishlist", value: "—" },
          { label: "Account type", value: user.role === "admin" ? "Admin" : "Customer" },
            { label: "Member since", value: formatDate(user.joinedAt) },
          ].map((stat) => (
          <Card key={stat.label} className="p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {stat.label}
            </p>
            <p className="mt-2 truncate text-xl font-extrabold text-foreground">
              {stat.value}
            </p>
          </Card>
        ))}
      </div>

      <Card className="overflow-hidden">
        <div className="border-b border-border px-5 py-4">
          <h2 className="font-bold text-foreground">Profile details</h2>
        </div>
        <dl className="divide-y divide-border">
          {[
            { icon: FiUser, label: "Full name", value: user.name },
            { icon: FiMail, label: "Email address", value: user.email },
            {
              icon: FiShield,
              label: "Role",
              value: (
                <Badge variant={user.role === "admin" ? "primary" : "outline"}>
                  {user.role}
                </Badge>
              ),
            },
            {
              icon: FiCalendar,
              label: "Member since",
              value: formatDate(user.joinedAt),
            },
          ].map((row) => (
            <div key={row.label} className="flex items-center gap-4 px-5 py-4">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                <row.icon className="h-4 w-4" aria-hidden />
              </span>
              <dt className="w-36 shrink-0 text-sm font-semibold text-muted-foreground">
                {row.label}
              </dt>
              <dd className="text-sm font-medium text-foreground">{row.value}</dd>
            </div>
          ))}
        </dl>
      </Card>

      <Card className="overflow-hidden">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="font-bold text-foreground">Recent orders</h2>
          <Link
            href="/orders"
            className="text-sm font-semibold text-primary hover:text-primary-strong"
          >
            View all
          </Link>
        </div>
        {recentOrders.length === 0 ? (
          <div className="px-5 py-10 text-center">
            <FiPackage className="mx-auto h-10 w-10 text-muted-foreground/50" aria-hidden />
            <p className="mt-3 text-sm text-muted-foreground">
              You haven&apos;t placed any orders yet.
            </p>
            <Button href="/shop" className="mt-4" size="sm">
              Start shopping
            </Button>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {recentOrders.map((order) => (
              <li key={order.id}>
                <Link
                  href={`/orders/${order.number}`}
                  className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 transition-colors hover:bg-muted/40"
                >
                  <div>
                    <p className="text-sm font-bold text-foreground">
                      {order.number}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {formatDate(order.createdAt)} · {order.items.length} item
                      {order.items.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-foreground">
                    {formatPrice(order.total)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
