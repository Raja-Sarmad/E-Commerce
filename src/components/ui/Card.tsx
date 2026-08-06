import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type CardProps = HTMLAttributes<HTMLDivElement> & {
  hover?: boolean;
};

export function Card({ className, hover = false, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-card text-card-foreground shadow-sm",
        hover &&
          "transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lg",
        className
      )}
      {...props}
    />
  );
}
