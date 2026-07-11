"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { LoginFormValues, loginSchema } from "../schemas/login.schema";
import { useEffect, useState } from "react";
import { login } from "../api/login";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

const LoginForm = () => {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<LoginFormValues>({
    mode: "all",
    resolver: zodResolver(loginSchema),
  });

  useEffect(() => {
    const subscription = watch(() => setError(null));
    return () => subscription.unsubscribe();
  }, [watch]);

  const onSubmit = async (values: LoginFormValues) => {
    setError(null);
    setIsSubmitting(true);

    try {
      await login(values);

      router.replace("/");
      router.refresh();
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FieldGroup>
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
            autoComplete="current-password"
            placeholder="Enter your password"
            aria-invalid={!!errors.password}
            {...register("password")}
          />
          <FieldError
            errors={errors.password ? [errors.password] : undefined}
          />
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
          {isSubmitting ? "Signing in..." : "Sign in"}
        </Button>
      </FieldGroup>
    </form>
  );
};

export default LoginForm;
