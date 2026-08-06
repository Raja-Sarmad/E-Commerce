import Link from "next/link";
import { FiHome, FiSearch } from "react-icons/fi";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <Container className="flex min-h-[60vh] items-center justify-center py-16">
      <div className="text-center">
        <p className="text-[120px] font-extrabold leading-none tracking-tight text-primary sm:text-[160px]">
          404
        </p>
        <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
          This page wandered off
        </h1>
        <p className="mx-auto mt-3 max-w-md text-muted-foreground">
          The page you&apos;re looking for doesn&apos;t exist, was moved, or is taking a
          coffee break. Let&apos;s get you back on track.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button href="/" leftIcon={<FiHome className="h-4 w-4" aria-hidden />}>
            Back to home
          </Button>
          <Button href="/shop" variant="outline" leftIcon={<FiSearch className="h-4 w-4" aria-hidden />}>
            Browse products
          </Button>
        </div>
        <p className="mt-8 text-sm text-muted-foreground">
          Need help?{" "}
          <Link href="/contact" className="font-semibold text-primary hover:text-primary-strong">
            Contact support
          </Link>
        </p>
      </div>
    </Container>
  );
}
