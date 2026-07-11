import { render, screen } from "@testing-library/react";
import { RestaurantFilters } from "../restaurant-filters";

jest.mock("../restaurant-filter-cities", () => ({
  RestaurantFilterCities: () => <div>City filter</div>,
}));

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn() }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
}));

describe("RestaurantFilters", () => {
  it("renders cuisine, rating, city, and sort filters", async () => {
    render(<RestaurantFilters />);

    expect(screen.getByText("Cuisine")).toBeInTheDocument();
    expect(screen.getByText("Average rating")).toBeInTheDocument();
    expect(screen.getByText("Sort by")).toBeInTheDocument();
    expect(await screen.findByText("City filter")).toBeInTheDocument();
  });
});
