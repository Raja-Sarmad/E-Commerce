import { Badge } from "@/components/ui/Badge";
import { statusToBadge } from "@/lib/data/admin";

type StatusBadgeProps = {
  status: string;
  label?: string;
  className?: string;
};

export function StatusBadge({ status, label, className }: StatusBadgeProps) {
  const variant = statusToBadge[status] ?? "outline";
  return (
    <Badge variant={variant} dot className={className}>
      {label ?? status}
    </Badge>
  );
}
