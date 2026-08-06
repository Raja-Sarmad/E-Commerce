"use client";

import { FiRotateCcw } from "react-icons/fi";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <Container className="flex min-h-[60vh] items-center justify-center py-16">
      <div className="max-w-md text-center">
        <p className="text-xs font-bold uppercase tracking-widest text-destructive">
          Something went wrong
        </p>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-foreground">
          We hit a snag
        </h1>
        <p className="mt-3 text-muted-foreground">
          An unexpected error occurred while rendering this page. Please try
          again.
        </p>
        {error.digest && (
          <p className="mt-3 rounded-lg bg-muted px-3 py-2 font-mono text-xs text-muted-foreground">
            Error ID: {error.digest}
          </p>
        )}
        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <Button onClick={reset} leftIcon={<FiRotateCcw className="h-4 w-4" aria-hidden />}>
            Try again
          </Button>
          <Button href="/" variant="outline">
            Back to home
          </Button>
        </div>
      </div>
    </Container>
  );
}
