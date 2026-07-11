import { z } from "zod";
import { Cuisine } from "types";

const cuisineValues = Object.values(Cuisine) as [Cuisine, ...Cuisine[]];

export const CuisineSchema = z.enum(cuisineValues, {
  error: () => "Please select a cuisine",
});

export const createRestaurantSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be at most 100 characters"),
  description: z
    .string()
    .min(1, "Please add a description")
    .max(1000, "Description must be at most 1000 characters"),
  previewImageUrl: z
    .union([z.literal(""), z.url("Please enter a valid image URL")])
    .optional(),
  address: z
    .string()
    .min(1, "Address is required")
    .max(255, "Address must be at most 255 characters"),
  city: z
    .string()
    .min(1, "City is required")
    .max(100, "City must be at most 100 characters"),
  state: z.string().max(100, "State must be at most 100 characters").optional(),
  country: z
    .string()
    .min(1, "Country is required")
    .max(100, "Country must be at most 100 characters"),
  cuisine: CuisineSchema,
});

export type CreateRestaurantFormValues = z.infer<typeof createRestaurantSchema>;
