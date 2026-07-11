import { z } from "zod";

export const reviewSchema = z.object({
  rating: z
    .number()
    .min(1, "Please select a rating")
    .max(5, "Please select a rating"),
  comment: z
    .string()
    .min(1, "Please write a review")
    .max(1000, "Review must be at most 1000 characters"),
});

export type ReviewFormValues = z.infer<typeof reviewSchema>;
