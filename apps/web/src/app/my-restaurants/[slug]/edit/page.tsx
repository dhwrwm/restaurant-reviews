import { notFound, redirect } from "next/navigation";
import { Role } from "types";
import { getCurrentUser } from "@/features/auth/api/me";
import { getRestaurant } from "@/features/restaurants/api/get-restaurant";
import { EditRestaurantForm } from "@/features/restaurants/components/edit-restaurant-form";

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function EditRestaurantPage({ params }: PageProps) {
  const { slug } = await params;
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== Role.OWNER) {
    redirect("/");
  }

  const restaurant = await getRestaurant(slug);

  if (!restaurant) {
    notFound();
  }

  if (restaurant.ownerId !== user.id) {
    redirect("/my-restaurants");
  }

  return (
    <div className="mt-10 max-w-2xl mx-auto w-full shadow-2xl p-6 rounded-lg mb-48">
      <h1 className="font-bold text-2xl text-gray-800 mb-6">Edit Restaurant</h1>
      <EditRestaurantForm restaurant={restaurant} />
    </div>
  );
}
