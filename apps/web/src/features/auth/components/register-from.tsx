"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ROLE_OPTIONS } from "types";
import { RegisterFormValues, registerSchema } from "../schemas/register.schema";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { register as registerUser } from "../api/register";
import { useRouter } from "next/navigation";

const RegisterForm = () => {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    mode: "all",
    resolver: zodResolver(registerSchema),
  });

  useEffect(() => {
    const subscription = watch(() => setError(null));
    return () => subscription.unsubscribe();
  }, [watch]);

  const onSubmit = async (values: RegisterFormValues) => {
    setError(null);
    setIsLoading(true);

    try {
      await registerUser({
        name: values.name,
        email: values.email,
        password: values.password,
        role: values.role,
      });

      router.replace("/");
      router.refresh();
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FieldGroup>
        <Field data-invalid={!!errors.name}>
          <FieldLabel htmlFor="name">Name</FieldLabel>
          <Input
            id="name"
            type="name"
            autoComplete="name"
            placeholder="Enter your name"
            aria-invalid={!!errors.name}
            {...register("name")}
          />
          <FieldError errors={errors.name ? [errors.name] : undefined} />
        </Field>
        <Field data-invalid={!!errors.email}>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="Enter your email"
            aria-invalid={!!errors.email}
            {...register("email")}
          />
          <FieldError errors={errors.email ? [errors.email] : undefined} />
        </Field>

        <Field data-invalid={!!errors.password}>
          <FieldLabel htmlFor="password">Password</FieldLabel>
          <Input
            id="password"
            type="password"
            placeholder="Enter your password"
            autoComplete="new-password"
            aria-invalid={!!errors.password}
            {...register("password")}
          />
          <FieldError
            errors={errors.password ? [errors.password] : undefined}
          />
        </Field>

        <Field data-invalid={!!errors.confirmPassword}>
          <FieldLabel htmlFor="confirmPassword">Confirm password</FieldLabel>
          <Input
            id="confirmPassword"
            type="password"
            placeholder="Confirm your password"
            autoComplete="new-password"
            aria-invalid={!!errors.confirmPassword}
            {...register("confirmPassword")}
          />
          <FieldError
            errors={
              errors.confirmPassword ? [errors.confirmPassword] : undefined
            }
          />
        </Field>

        <Field data-invalid={!!errors.role}>
          <FieldLabel htmlFor="role">I am a</FieldLabel>
          <Controller
            name="role"
            control={control}
            defaultValue={undefined}
            render={({ field }) => (
              <Select value={field?.value ?? ""} onValueChange={field.onChange}>
                <SelectTrigger
                  id="role"
                  className="w-full"
                  aria-invalid={!!errors.role}
                >
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  {ROLE_OPTIONS.map(({ value, label }) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          <FieldError errors={errors.role ? [errors.role] : undefined} />
        </Field>

        {error && (
          <div className="text-sm text-red-600 mt-2" role="alert">
            {error}
          </div>
        )}

        <Button
          type="submit"
          className="flex w-full justify-center rounded-md px-3 py-1.5 text-sm font-semibold leading-6"
        >
          {isLoading ? "Creating account..." : "Create account"}
        </Button>
      </FieldGroup>
    </form>
  );
};

export default RegisterForm;
