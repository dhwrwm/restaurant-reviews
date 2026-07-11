import { render, screen } from "@testing-library/react";
import { RestaurantCard } from "../restaurant-card";
import { Restaurant } from "../../types";

const baseRestaurant: Restaurant = {
  id: "1",
  ownerId: "owner-1",
  slug: "the-french-place",
  name: "The French Place",
  description: "Cozy bistro serving classic French dishes.",
  previewImageUrl: null,
  address: "1 Rue de Paris",
  city: "Paris",
  state: "IDF",
  country: "France",
  cuisine: "FRENCH",
  averageRating: "4.5",
  reviewCount: 12,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

describe("RestaurantCard", () => {
  it("renders the restaurant name and description", () => {
    render(<RestaurantCard restaurant={baseRestaurant} />);

    expect(
      screen.getByRole("heading", { name: "The French Place" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Cozy bistro serving classic French dishes."),
    ).toBeInTheDocument();
  });

  it("links to the restaurant details page using its slug", () => {
    render(<RestaurantCard restaurant={baseRestaurant} />);

    expect(screen.getByRole("link", { name: /details/i })).toHaveAttribute(
      "href",
      "/restaurant/the-french-place",
    );
  });

  it("falls back to a zero rating when averageRating is missing", () => {
    render(
      <RestaurantCard
        restaurant={{ ...baseRestaurant, averageRating: undefined as never }}
      />,
    );

    expect(
      screen.getByRole("img", { name: "0 out of 5 stars" }),
    ).toBeInTheDocument();
  });
});
