import Link from "next/link";
import { Great_Vibes } from "next/font/google";
import { cn } from "@/lib/utils";

const script = Great_Vibes({
  subsets: ["latin"],
  weight: "400",
});

type LogoProps = {
  className?: string;
  variant?: "default" | "script";
  size?: "sm" | "md" | "lg";
};

const textSizes = { sm: "text-base", md: "text-lg", lg: "text-xl" };

export function Logo({ className, variant = "default", size = "md" }: LogoProps) {
  if (variant === "script") {
    return (
      <Link
        href="/"
        aria-label="NovaMart home"
        className={cn(
          script.className,
          "inline-block text-[2.35rem] leading-none text-foreground transition-opacity hover:opacity-80 sm:text-[2.75rem]",
          className
        )}
      >
        NovaMart
      </Link>
    );
  }

  return (
    <Link
      href="/"
      aria-label="NovaMart home"
      className={cn(
        "font-semibold tracking-tight text-foreground transition-opacity hover:opacity-80",
        textSizes[size],
        className
      )}
    >
      NovaMart
    </Link>
  );
}
