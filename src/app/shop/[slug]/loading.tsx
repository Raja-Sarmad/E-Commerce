import { Skeleton } from "@/components/ui/Skeleton";
import { Container } from "@/components/ui/Container";

export default function ProductPageLoading() {
  return (
    <Container className="py-6">
      <Skeleton className="mb-8 h-5 w-72" />
      <div className="grid gap-10 lg:grid-cols-2">
        <div className="space-y-3">
          <Skeleton className="aspect-square w-full rounded-3xl" />
          <div className="flex gap-3">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-20 w-20 rounded-xl" />
            ))}
          </div>
        </div>
        <div className="space-y-4 py-2">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-9 w-28" />
          <div className="space-y-2 pt-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-2/3" />
          </div>
          <Skeleton className="mt-6 h-12 w-full rounded-xl" />
          <Skeleton className="mt-3 h-12 w-full rounded-xl" />
        </div>
      </div>
      <div className="mt-16">
        <Skeleton className="mb-6 h-8 w-52" />
        <Skeleton className="h-40 w-full rounded-2xl" />
      </div>
    </Container>
  );
}
