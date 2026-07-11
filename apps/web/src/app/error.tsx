"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
      <h1 className="text-2xl font-bold text-gray-800">Something went wrong</h1>
      <p className="max-w-md text-sm text-gray-500">
        We couldn&apos;t load this page. Please try again, or head back to the
        homepage.
      </p>
      <div className="flex gap-3">
        <Button onClick={reset}>Try again</Button>
        <Button
          variant="outline"
          nativeButton={false}
          render={<Link href="/" />}
        >
          Go home
        </Button>
      </div>
    </div>
  );
}
