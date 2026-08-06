import type { ReactNode } from "react";
import Link from "next/link";
import { FiLock, FiShield, FiTruck } from "react-icons/fi";
import { Container } from "@/components/ui/Container";
import { Logo } from "@/components/layout/Logo";
import { Badge } from "@/components/ui/Badge";

type AuthShellProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
};

export function AuthShell({ title, subtitle, children, footer }: AuthShellProps) {
  return (
    <div className="relative overflow-hidden">
      <div
        className="pointer-events-none absolute -left-40 -top-40 h-96 w-96 rounded-full bg-primary/10 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-accent/10 blur-3xl"
        aria-hidden
      />
      <Container className="relative flex min-h-[70vh] items-center justify-center py-12">
        <div className="grid w-full max-w-5xl gap-10 lg:grid-cols-2">
          <div className="hidden flex-col justify-center lg:flex">
            <Logo size="lg" />
            <h2 className="mt-6 text-3xl font-extrabold leading-tight tracking-tight text-foreground">
              Join the NovaMart community
            </h2>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
              Access your wishlist, track orders in real time, and enjoy member-only
              deals the moment they go live.
            </p>
            <div className="mt-8 space-y-4">
              {[
                { icon: FiTruck, text: "Free shipping on orders over $100" },
                { icon: FiShield, text: "Secure checkout with bank-grade encryption" },
                { icon: FiLock, text: "Your data is never shared with third parties" },
              ].map((item) => (
                <div key={item.text} className="flex items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <item.icon className="h-4 w-4" aria-hidden />
                  </span>
                  <p className="text-sm font-medium text-foreground">{item.text}</p>
                </div>
              ))}
            </div>
            <div className="mt-10 flex items-center gap-2">
              <Badge variant="accent" dot>
                New members get 10% off
              </Badge>
            </div>
          </div>

          <div className="animate-fade-in-up">
            <div className="rounded-3xl border border-border bg-card p-8 shadow-xl">
              <div className="mb-6 lg:hidden">
                <Logo />
              </div>
              <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
                {title}
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
              <div className="mt-6">{children}</div>
              {footer && <div className="mt-6 border-t border-border pt-5">{footer}</div>}
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}

export function AuthFooter({
  text,
  linkLabel,
  href,
}: {
  text: string;
  linkLabel: string;
  href: string;
}) {
  return (
    <p className="text-center text-sm text-muted-foreground">
      {text}{" "}
      <Link href={href} className="font-semibold text-primary hover:text-primary-strong">
        {linkLabel}
      </Link>
    </p>
  );
}
