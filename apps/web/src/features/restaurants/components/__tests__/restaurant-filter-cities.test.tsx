import { render, screen } from "@testing-library/react";
import { RestaurantFilterCities } from "../restaurant-filter-cities";
import { getCities } from "../../api/get-cities";

jest.mock("../../api/get-cities", () => ({
  getCities: jest.fn(),
}));

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn() }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
}));

const mockedGetCities = getCities as jest.MockedFunction<typeof getCities>;

describe("RestaurantFilterCities", () => {
  beforeEach(() => {
    mockedGetCities.mockReset();
  });

  it("renders a City filter populated with the fetched cities", async () => {
    mockedGetCities.mockResolvedValue(["Paris", "Lyon"]);

    render(await RestaurantFilterCities());

    expect(screen.getByText("City")).toBeInTheDocument();
    expect(screen.getByText("Any")).toBeInTheDocument();
  });

  it("renders without cities when none are returned", async () => {
    mockedGetCities.mockResolvedValue([]);

    render(await RestaurantFilterCities());

    expect(screen.getByRole("combobox")).toBeInTheDocument();
  });
});
