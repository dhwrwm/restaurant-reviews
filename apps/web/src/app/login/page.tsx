import type { Metadata } from "next";
import LoginForm from "@/features/auth/components/login-from";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Log in",
  description: "Sign in to your Restaurant Reviews account.",
};

export default function LoginPage() {
  return (
    <div className="flex min-h-full flex-col justify-center px-6 py-12 mb-48">
      <div className="mt-10 max-w-md mx-auto w-full shadow-2xl p-6 rounded-lg">
        <LoginForm />

        <p className="mt-10 text-center text-sm text-gray-500">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="font-semibold leading-6 text-primary hover:text-primary/80"
          >
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
