import { render, screen } from "@testing-library/react";
import { MyRestaurantListItem } from "../my-restaurant-list-item";
import { Restaurant } from "../../types";

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    refresh: jest.fn(),
  }),
}));

const restaurant: Restaurant = {
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

describe("MyRestaurantListItem", () => {
  it("renders the restaurant name, location, and an edit link", () => {
    render(<MyRestaurantListItem restaurant={restaurant} />);

    expect(
      screen.getByRole("link", { name: "The French Place" }),
    ).toHaveAttribute("href", "/restaurant/the-french-place");
    expect(screen.getByText("Paris, IDF, France")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Edit" })).toHaveAttribute(
      "href",
      "/my-restaurants/the-french-place/edit",
    );
  });

  it("renders a delete button", () => {
    render(<MyRestaurantListItem restaurant={restaurant} />);

    expect(screen.getByRole("button", { name: "Delete" })).toBeInTheDocument();
  });
});
