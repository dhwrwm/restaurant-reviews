import type { Metadata } from "next";
import { getCurrentUser } from "@/features/auth/api/me";
import { CreateRestaurantForm } from "@/features/restaurants/components/create-restaurant-form";
import { redirect } from "next/navigation";
import { Role } from "types";

export const metadata: Metadata = {
  title: "Add a Restaurant",
  robots: { index: false, follow: false },
};

export default async function AddRestaurantPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== Role.OWNER) {
    redirect("/");
  }
  return (
    <div className="mt-10 max-w-2xl mx-auto w-full shadow-2xl p-6 rounded-lg mb-48">
      <CreateRestaurantForm />
    </div>
  );
}
