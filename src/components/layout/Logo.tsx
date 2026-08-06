import Link from "next/link";
import { FiShoppingBag } from "react-icons/fi";
import { cn } from "@/lib/utils";

type LogoProps = {
  className?: string;
  size?: "sm" | "md" | "lg";
};

export function Logo({ className, size = "md" }: LogoProps) {
  const iconSizes = { sm: "h-8 w-8", md: "h-10 w-10", lg: "h-12 w-12" };
  const textSizes = { sm: "text-lg", md: "text-xl", lg: "text-2xl" };
  return (
    <Link
      href="/"
      aria-label="NovaMart home"
      className={cn("group inline-flex items-center gap-2.5", className)}
    >
      <span
        className={cn(
          "flex items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary-strong text-primary-foreground shadow-md transition-transform duration-300 group-hover:scale-105",
          iconSizes[size]
        )}
      >
        <FiShoppingBag className="h-[55%] w-[55%]" aria-hidden />
      </span>
      <span className={cn("font-extrabold tracking-tight text-foreground", textSizes[size])}>
        Nova<span className="text-primary">Mart</span>
      </span>
    </Link>
  );
}
