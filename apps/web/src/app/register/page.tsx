import type { Metadata } from "next";
import RegisterForm from "@/features/auth/components/register-from";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Create an account",
  description:
    "Sign up as a reviewer or a restaurant owner on Restaurant Reviews.",
};

export default function RegisterPage() {
  return (
    <div className="flex min-h-full flex-col justify-center px-6 py-12 mb-48">
      <div className="mt-10 max-w-md mx-auto w-full shadow-2xl p-6 rounded-lg">
        <RegisterForm />

        <p className="mt-10 text-center text-sm text-gray-500">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-semibold leading-6 text-primary hover:text-primary/80"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
