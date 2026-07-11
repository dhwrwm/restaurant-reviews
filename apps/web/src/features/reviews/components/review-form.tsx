"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { cn } from "@/lib/utils";
import { createReview, ReviewResponse } from "../api/create-review";
import { updateReview } from "../api/update-review";
import { ReviewFormValues, reviewSchema } from "../schemas/review.schema";
import StarRating from "@/features/restaurants/components/star-rating";

interface ReviewFormProps {
  disabled?: boolean;
  restaurantSlug: string;
  reviewId?: string;
  defaultValues?: ReviewFormValues;
  onSubmitted?: (review: ReviewResponse) => void;
  onCancel?: () => void;
}

export function ReviewForm({
  restaurantSlug,
  reviewId,
  defaultValues,
  onSubmitted,
  onCancel,
  disabled = false,
}: ReviewFormProps) {
  const router = useRouter();
  const isEditing = !!reviewId;
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const {
    control,
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<ReviewFormValues>({
    mode: "all",
    defaultValues: defaultValues ?? { rating: 0, comment: "" },
    resolver: zodResolver(reviewSchema),
  });

  useEffect(() => {
    const subscription = watch(() => setError(null));
    return () => subscription.unsubscribe();
  }, [watch]);

  const onSubmit = async (values: ReviewFormValues) => {
    setError(null);
    setIsLoading(true);

    try {
      const review = isEditing
        ? await updateReview(reviewId, values)
        : await createReview(restaurantSlug, values);

      if (!isEditing) {
        reset();
      }

      router.refresh();
      onSubmitted?.(review);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="shadow-md px-4 py-6 rounded-lg space-y-3"
    >
      <FieldGroup>
        <Field data-invalid={!!errors.comment}>
          <FieldLabel htmlFor="comment">
            Have you been here? How did you find it?
          </FieldLabel>
          <textarea
            id="comment"
            aria-invalid={!!errors.comment}
            className={cn(
              "w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-base resize-none outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm h-36 dark:bg-input/30",
            )}
            placeholder="Write your review..."
            {...register("comment")}
            disabled={disabled}
          />
          <FieldError errors={errors.comment ? [errors.comment] : undefined} />
        </Field>

        <Field data-invalid={!!errors.rating}>
          <FieldLabel htmlFor="rating">Rating</FieldLabel>
          <Controller
            name="rating"
            control={control}
            render={({ field }) => (
              <StarRating
                rating={field.value}
                onChangeRating={field.onChange}
                size={24}
                readOnly={disabled}
              />
            )}
          />
          <FieldError errors={errors.rating ? [errors.rating] : undefined} />
        </Field>

        {error && (
          <div className="text-sm text-red-600" role="alert">
            {error}
          </div>
        )}

        <div className="mt-4 flex justify-center gap-2">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              disabled={isLoading}
              onClick={onCancel}
              className="flex-1"
            >
              Cancel
            </Button>
          )}
          <Button
            type="submit"
            disabled={isLoading || disabled}
            className="flex flex-1 justify-center rounded-md px-3 py-1.5 text-sm font-semibold leading-6"
          >
            {isLoading
              ? "Saving..."
              : isEditing
                ? "Save changes"
                : "Submit review"}
          </Button>
        </div>
      </FieldGroup>
    </form>
  );
}
