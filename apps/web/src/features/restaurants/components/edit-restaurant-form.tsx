"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CUISINE_OPTIONS as cuisineOptions } from "types";
import { updateRestaurant } from "../api/update-restaurant";
import {
  CreateRestaurantFormValues,
  createRestaurantSchema,
} from "../schemas/create-restaurant.schema";
import { Restaurant } from "../types";

export function EditRestaurantForm({ restaurant }: { restaurant: Restaurant }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const {
    control,
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CreateRestaurantFormValues>({
    mode: "all",
    defaultValues: {
      name: restaurant.name,
      description: restaurant.description,
      previewImageUrl: restaurant.previewImageUrl ?? "",
      address: restaurant.address,
      city: restaurant.city,
      state: restaurant.state ?? "",
      country: restaurant.country,
      cuisine: restaurant.cuisine,
    },
    resolver: zodResolver(createRestaurantSchema),
  });

  useEffect(() => {
    const subscription = watch(() => setError(null));
    return () => subscription.unsubscribe();
  }, [watch]);

  const onSubmit = async (values: CreateRestaurantFormValues) => {
    setError(null);
    setIsLoading(true);

    try {
      await updateRestaurant(restaurant.id, {
        ...values,
        previewImageUrl: values.previewImageUrl || undefined,
      });
      toast.success(`"${values.name}" was updated.`);
      router.replace("/my-restaurants");
      router.refresh();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong";
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <FieldGroup>
        <Field data-invalid={!!errors.name}>
          <FieldLabel htmlFor="name">Restaurant name</FieldLabel>
          <Input id="name" aria-invalid={!!errors.name} {...register("name")} />
          <FieldError errors={errors.name ? [errors.name] : undefined} />
        </Field>

        <Field data-invalid={!!errors.description}>
          <FieldLabel htmlFor="description">Description</FieldLabel>
          <textarea
            id="description"
            aria-invalid={!!errors.description}
            className="resize-none h-40 block w-full rounded-lg border border-input bg-transparent px-2.5 py-1.5 text-base outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30"
            {...register("description")}
          />
          <FieldError
            errors={errors.description ? [errors.description] : undefined}
          />
        </Field>

        <Field data-invalid={!!errors.previewImageUrl}>
          <FieldLabel htmlFor="previewImageUrl">Image URL</FieldLabel>
          <Input
            id="previewImageUrl"
            type="url"
            placeholder="https://example.com/photo.jpg"
            aria-invalid={!!errors.previewImageUrl}
            {...register("previewImageUrl")}
          />
          <FieldError
            errors={
              errors.previewImageUrl ? [errors.previewImageUrl] : undefined
            }
          />
        </Field>

        <Field data-invalid={!!errors.address}>
          <FieldLabel htmlFor="address">Address</FieldLabel>
          <Input
            id="address"
            aria-invalid={!!errors.address}
            {...register("address")}
          />
          <FieldError errors={errors.address ? [errors.address] : undefined} />
        </Field>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Field data-invalid={!!errors.city}>
            <FieldLabel htmlFor="city">City</FieldLabel>
            <Input
              id="city"
              aria-invalid={!!errors.city}
              {...register("city")}
            />
            <FieldError errors={errors.city ? [errors.city] : undefined} />
          </Field>

          <Field data-invalid={!!errors.state}>
            <FieldLabel htmlFor="state">State</FieldLabel>
            <Input
              id="state"
              aria-invalid={!!errors.state}
              {...register("state")}
            />
            <FieldError errors={errors.state ? [errors.state] : undefined} />
          </Field>

          <Field data-invalid={!!errors.country}>
            <FieldLabel htmlFor="country">Country</FieldLabel>
            <Input
              id="country"
              aria-invalid={!!errors.country}
              {...register("country")}
            />
            <FieldError
              errors={errors.country ? [errors.country] : undefined}
            />
          </Field>
        </div>

        <Field data-invalid={!!errors.cuisine}>
          <FieldLabel htmlFor="cuisine">Cuisine</FieldLabel>
          <Controller
            name="cuisine"
            control={control}
            render={({ field }) => (
              <Select value={field.value ?? ""} onValueChange={field.onChange}>
                <SelectTrigger
                  id="cuisine"
                  className="w-full"
                  aria-invalid={!!errors.cuisine}
                >
                  <SelectValue placeholder="Select a cuisine" />
                </SelectTrigger>
                <SelectContent>
                  {cuisineOptions.map(({ value, label }) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          <FieldError errors={errors.cuisine ? [errors.cuisine] : undefined} />
        </Field>

        {error && (
          <div className="text-sm text-red-600" role="alert">
            {error}
          </div>
        )}

        <Button
          type="submit"
          disabled={isLoading}
          className="flex w-full justify-center rounded-md px-3 py-1.5 text-sm font-semibold leading-6"
        >
          {isLoading ? "Saving changes..." : "Save changes"}
        </Button>
      </FieldGroup>
    </form>
  );
}
