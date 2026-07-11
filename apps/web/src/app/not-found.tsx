import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
      <h1 className="text-2xl font-bold text-gray-800">Page not found</h1>
      <p className="max-w-md text-sm text-gray-500">
        We couldn&apos;t find what you were looking for. It may have been moved
        or deleted.
      </p>
      <Button nativeButton={false} render={<Link href="/" />}>
        Go home
      </Button>
    </div>
  );
}
