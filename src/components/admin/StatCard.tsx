import type { ReactNode } from "react";
import { FiTrendingDown, FiTrendingUp } from "react-icons/fi";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

type StatCardProps = {
  label: string;
  value: ReactNode;
  icon: ReactNode;
  change?: string;
  up?: boolean;
  changeLabel?: string;
  iconClassName?: string;
  className?: string;
};

export function StatCard({
  label,
  value,
  icon,
  change,
  up = true,
  changeLabel,
  iconClassName,
  className,
}: StatCardProps) {
  return (
    <Card className={cn("p-5", className)}>
      <div className="flex items-start justify-between gap-2">
        <span
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary",
            iconClassName
          )}
        >
          {icon}
        </span>
        {change && (
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold",
              up
                ? "bg-success/10 text-success"
                : "bg-destructive/10 text-destructive"
            )}
            title={changeLabel}
          >
            {up ? (
              <FiTrendingUp className="h-3 w-3" aria-hidden />
            ) : (
              <FiTrendingDown className="h-3 w-3" aria-hidden />
            )}
            {change}
          </span>
        )}
      </div>
      <p className="mt-4 text-2xl font-extrabold tracking-tight text-foreground">
        {value}
      </p>
      <p className="mt-1 text-sm text-muted-foreground">{label}</p>
    </Card>
  );
}
