import { Skeleton } from "@/components/ui/Skeleton";
import { Container } from "@/components/ui/Container";

export default function BlogPostLoading() {
  return (
    <Container className="py-6">
      <Skeleton className="h-5 w-56" />
      <div className="mx-auto max-w-3xl py-6">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="mt-4 h-10 w-full" />
        <Skeleton className="mt-4 h-6 w-2/3" />
        <div className="mt-6 flex items-center gap-3">
          <Skeleton className="h-11 w-11 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
        <Skeleton className="mt-8 aspect-[16/9] w-full rounded-3xl" />
        <div className="mt-8 space-y-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-4 w-full" />
          ))}
        </div>
      </div>
    </Container>
  );
}
