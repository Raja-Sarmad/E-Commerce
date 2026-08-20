"use client";

import { useMemo, useState } from "react";
import { FiCheckCircle, FiSend } from "react-icons/fi";
import { Rating } from "@/components/ui/Rating";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Badge } from "@/components/ui/Badge";
import { toast } from "@/hooks/use-toast";
import { useProductReviews } from "@/hooks/use-catalog";
import type { Product } from "@/lib/types";
import { formatDate, timeAgo } from "@/lib/utils";

type ReviewsSectionProps = {
  product: Product;
};

export function ReviewsSection({ product }: ReviewsSectionProps) {
  const { data: serverReviews = [] } = useProductReviews(product.id);
  const [localReviews, setLocalReviews] = useState(product.reviews ?? []);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState({ name: "", rating: 5, title: "", body: "" });

  const reviews = serverReviews.length > 0 ? serverReviews : localReviews;

  const breakdown = useMemo(() => {
    const buckets = [5, 4, 3, 2, 1].map((star) => {
      const count = reviews.filter((r) => Math.round(r.rating) === star).length;
      return { star, count, percent: reviews.length ? (count / reviews.length) * 100 : 0 };
    });
    const average =
      reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : product.rating;
    return { buckets, average };
  }, [reviews, product.rating]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.title.trim() || !form.body.trim()) return;
    const review = {
      id: `rv-${Date.now()}`,
      userId: "current-user",
      name: form.name.trim(),
      rating: form.rating,
      title: form.title.trim(),
      body: form.body.trim(),
      date: new Date().toISOString(),
      verified: true,
      helpful: 0,
    };
    setLocalReviews((prev) => [review, ...prev]);
    setFormOpen(false);
    setForm({ name: "", rating: 5, title: "", body: "" });
    toast.success("Review submitted", "Thank you for your feedback!");
  };

  return (
    <div id="reviews" className="scroll-mt-28">
      <div className="grid gap-10 lg:grid-cols-[300px_1fr]">
        <div>
          <h3 className="text-lg font-bold text-foreground">Customer reviews</h3>
          <div className="mt-4 flex items-end gap-3">
            <span className="text-5xl font-extrabold text-foreground">
              {breakdown.average.toFixed(1)}
            </span>
            <div className="pb-1.5">
              <Rating value={breakdown.average} size="md" />
              <p className="mt-1 text-xs text-muted-foreground">
                Based on {product.reviewsCount.toLocaleString()} ratings
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-2">
            {breakdown.buckets.map((bucket) => (
              <div key={bucket.star} className="flex items-center gap-2.5">
                <span className="w-3 text-xs font-medium text-muted-foreground">
                  {bucket.star}
                </span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-accent"
                    style={{ width: `${bucket.percent}%` }}
                  />
                </div>
                <span className="w-8 text-right text-xs text-muted-foreground">
                  {bucket.count}
                </span>
              </div>
            ))}
          </div>

          <Button
            variant="outline"
            className="mt-6 w-full"
            onClick={() => setFormOpen((prev) => !prev)}
          >
            Write a review
          </Button>
        </div>

        <div>
          {formOpen && (
            <form
              onSubmit={handleSubmit}
              className="animate-fade-in-up mb-8 rounded-2xl border border-border bg-card p-6"
            >
              <h4 className="text-base font-bold text-foreground">
                Share your experience
              </h4>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <Input
                  label="Your name"
                  name="review-name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Jane Doe"
                  required
                />
                <div className="flex flex-col gap-1.5">
                  <span className="text-sm font-medium text-foreground">
                    Your rating
                  </span>
                  <div className="flex h-11 items-center">
                    <Rating
                      value={form.rating}
                      size="lg"
                      interactive
                      onChange={(rating) => setForm({ ...form, rating })}
                    />
                  </div>
                </div>
                <Input
                  label="Review title"
                  name="review-title"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Sum it up in one line"
                  required
                  containerClassName="sm:col-span-2"
                />
                <Textarea
                  label="Your review"
                  name="review-body"
                  value={form.body}
                  onChange={(e) => setForm({ ...form, body: e.target.value })}
                  placeholder="What did you like or dislike?"
                  required
                  containerClassName="sm:col-span-2"
                />
              </div>
              <Button type="submit" className="mt-4" leftIcon={<FiSend className="h-4 w-4" aria-hidden />}>
                Submit review
              </Button>
            </form>
          )}

          {reviews.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No reviews yet. Be the first to review this product.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {reviews.map((review) => (
                <li key={review.id} className="py-6 first:pt-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                      {review.name.charAt(0)}
                    </span>
                    <div>
                      <p className="flex items-center gap-2 text-sm font-bold text-foreground">
                        {review.name}
                        {review.verified && (
                          <span className="flex items-center gap-0.5 text-xs font-medium text-success">
                            <FiCheckCircle className="h-3.5 w-3.5" aria-hidden />
                            Verified
                          </span>
                        )}
                      </p>
                      <span className="text-xs text-muted-foreground" title={formatDate(review.date)}>
                        {timeAgo(review.date)}
                      </span>
                    </div>
                    <Rating value={review.rating} className="ml-auto" />
                  </div>
                  <h5 className="mt-3 text-sm font-semibold text-foreground">
                    {review.title}
                  </h5>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                    {review.body}
                  </p>
                  <div className="mt-3 flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {review.helpful} people found this helpful
                    </Badge>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
