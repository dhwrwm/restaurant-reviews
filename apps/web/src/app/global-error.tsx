"use client";

import { useEffect } from "react";
import "./globals.css";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.debug(error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
          <h1 className="text-2xl font-bold text-gray-800">
            Something went wrong
          </h1>
          <p className="max-w-md text-sm text-gray-500">
            The application failed to load. Please try again.
          </p>
          <button
            onClick={reset}
            className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/80"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
