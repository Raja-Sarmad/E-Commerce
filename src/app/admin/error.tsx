"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { FiAlertTriangle, FiRefreshCw } from "react-icons/fi";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Admin page error:", error);
  }, [error]);

  return (
    <Card className="flex flex-col items-center gap-4 p-10 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <FiAlertTriangle className="h-7 w-7" aria-hidden />
      </span>
      <div>
        <h2 className="text-lg font-bold text-foreground">Something went wrong</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          An unexpected error occurred. Please try again.
        </p>
        {error.digest && (
          <p className="mt-2 font-mono text-xs text-muted-foreground/60">
            Error: {error.digest}
          </p>
        )}
      </div>
      <Button onClick={reset} leftIcon={<FiRefreshCw className="h-4 w-4" aria-hidden />}>
        Try again
      </Button>
    </Card>
  );
}
