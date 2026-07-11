"use client";

import { ReactNode, useState, useTransition } from "react";
import { toast } from "sonner";
import { getRestaurantReviews } from "../api/get-restaurant-reviews";
import { Reviews } from "../types";
import { Review } from "./review";

interface ReviewsListProps {
  slug: string;
  initialCursor: string | null;
  currentUserId?: string | null;
  children: ReactNode;
}

export function ReviewsList({
  slug,
  initialCursor,
  currentUserId,
  children,
}: ReviewsListProps) {
  const [items, setItems] = useState<Reviews[]>([]);
  const [cursor, setCursor] = useState(initialCursor);
  const [isPending, startTransition] = useTransition();

  function loadMore() {
    startTransition(async () => {
      if (!cursor) return;

      try {
        const page = await getRestaurantReviews(slug, { cursor });
        setItems((prev) => [...prev, ...page.items]);
        setCursor(page.nextCursor);
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Something went wrong",
        );
      }
    });
  }

  return (
    <div className="my-6">
      {children}

      {items.map((r) => (
        <Review
          key={r.id}
          id={r.id}
          restaurantSlug={slug}
          reviewerId={r.reviewerId}
          currentUserId={currentUserId}
          author={r.reviewer.email}
          date={r.createdAt}
          rating={r.rating}
          body={r.comment}
        />
      ))}

      {cursor && (
        <button
          type="button"
          onClick={loadMore}
          disabled={isPending}
          className="mt-2 text-sm font-semibold text-primary hover:underline disabled:opacity-50"
        >
          {isPending ? "Loading…" : "Load more reviews"}
        </button>
      )}
    </div>
  );
}
