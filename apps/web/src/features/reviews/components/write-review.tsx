import type { CurrentUser } from "@/features/auth/api/me";
import { ReviewForm } from "./review-form";
import Link from "next/link";
import { InfoIcon } from "lucide-react";
import { Role } from "types";

interface WriteReviewProps {
  restaurantSlug: string;
  user: CurrentUser | null;
}

export function WriteReview({ restaurantSlug, user }: WriteReviewProps) {
  if (!user) {
    return (
      <div className="shadow-md px-4 py-6 rounded-lg flex items-center gap-2">
        <InfoIcon className="text-orange-300" />
        <p className="text-sm text-gray-500">
          <Link href="/login">Sign in</Link> as reviewer to write a review.
        </p>
      </div>
    );
  }

  if (user.role === Role.OWNER) {
    return (
      <div className="shadow-md px-4 py-6 rounded-lg flex items-center gap-2">
        <InfoIcon className="text-orange-300" />
        <p className="text-sm text-gray-500">
          Restaurant owners cannot submit reviews.
        </p>
      </div>
    );
  }

  return <ReviewForm restaurantSlug={restaurantSlug} />;
}
