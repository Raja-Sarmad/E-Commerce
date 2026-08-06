import { cn } from "@/lib/utils";
import { FiStar } from "react-icons/fi";

type RatingProps = {
  value: number;
  count?: number;
  size?: "sm" | "md" | "lg";
  showValue?: boolean;
  interactive?: boolean;
  onChange?: (value: number) => void;
  className?: string;
};

const sizeClasses = {
  sm: "h-3.5 w-3.5",
  md: "h-4 w-4",
  lg: "h-5 w-5",
};

export function Rating({
  value,
  count,
  size = "sm",
  showValue = false,
  interactive = false,
  onChange,
  className,
}: RatingProps) {
  const rounded = Math.round(value);
  const iconSize = sizeClasses[size];

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <div className="flex items-center" role={interactive ? "radiogroup" : "img"} aria-label={`Rated ${value} out of 5 stars`}>
        {[1, 2, 3, 4, 5].map((star) =>
          interactive ? (
            <button
              key={star}
              type="button"
              role="radio"
              aria-checked={rounded === star}
              aria-label={`${star} star${star > 1 ? "s" : ""}`}
              onClick={() => onChange?.(star)}
              className="p-0.5 transition-transform hover:scale-110"
            >
              <FiStar
                className={cn(
                  iconSize,
                  star <= rounded
                    ? "fill-accent text-accent"
                    : "text-muted-foreground/40"
                )}
                aria-hidden
              />
            </button>
          ) : (
            <FiStar
              key={star}
              className={cn(
                iconSize,
                star <= rounded
                  ? "fill-accent text-accent"
                  : "text-muted-foreground/40"
              )}
              aria-hidden
            />
          )
        )}
      </div>
      {showValue && (
        <span className="ml-1 text-sm font-semibold text-foreground">
          {value.toFixed(1)}
        </span>
      )}
      {count !== undefined && (
        <span className="text-xs text-muted-foreground">({count.toLocaleString()})</span>
      )}
    </div>
  );
}
