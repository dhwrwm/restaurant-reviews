"use client";

import { useState } from "react";
import dayjs from "dayjs";
import StarRatingDisplay from "@/features/restaurants/components/star-rating-display";
import { Button } from "@/components/ui/button";
import { ReviewForm } from "./review-form";
import { DeleteReviewDialog } from "./delete-review-dialog";
import type { ReviewResponse } from "../api/create-review";

interface ReviewProps {
  id: string;
  restaurantSlug: string;
  reviewerId: string;
  currentUserId?: string | null;
  author: string;
  date: string;
  rating: number;
  body: string;
}

export function Review({
  id,
  restaurantSlug,
  reviewerId,
  currentUserId,
  author,
  date,
  rating,
  body,
}: ReviewProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);
  const [current, setCurrent] = useState({ rating, date, body });

  const isOwner = !!currentUserId && currentUserId === reviewerId;

  if (isDeleted) {
    return null;
  }

  if (isEditing) {
    return (
      <div className="my-3">
        <ReviewForm
          restaurantSlug={restaurantSlug}
          reviewId={id}
          defaultValues={{ rating: current.rating, comment: current.body }}
          onCancel={() => setIsEditing(false)}
          onSubmitted={(review: ReviewResponse) => {
            setCurrent({
              rating: review.rating,
              date: review.updatedAt,
              body: review.comment,
            });
            setIsEditing(false);
          }}
        />
      </div>
    );
  }

  return (
    <div className="p-4 my-3 shadow-sm">
      <div className="flex justify-between items-center">
        <div className="leading-loose">
          <div className="select-none">
            <StarRatingDisplay rating={current.rating} />
          </div>
        </div>
        <div className="leading-loose text-sm text-gray-600">
          By <strong>{author}</strong> on{" "}
          {dayjs(current.date).format("MMM D, YYYY")}
        </div>
      </div>
      <div>{current.body}</div>

      {isOwner && (
        <div className="mt-2 flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(true)}
          >
            Edit
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setIsDeleteDialogOpen(true)}
          >
            Delete
          </Button>
        </div>
      )}

      {isDeleteDialogOpen && (
        <DeleteReviewDialog
          id={id}
          open={isDeleteDialogOpen}
          onToggleAction={() => setIsDeleteDialogOpen((o) => !o)}
          onDeleted={() => setIsDeleted(true)}
        />
      )}
    </div>
  );
}
