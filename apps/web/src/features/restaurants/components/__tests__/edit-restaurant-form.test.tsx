import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { toast } from "sonner";
import { EditRestaurantForm } from "../edit-restaurant-form";
import { updateRestaurant } from "../../api/update-restaurant";
import { Restaurant } from "../../types";

jest.mock("../../api/update-restaurant", () => ({
  updateRestaurant: jest.fn(),
}));

jest.mock("sonner", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

const push = jest.fn();
const replace = jest.fn();
const refresh = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: (...args: unknown[]) => push(...args),
    replace: (...args: unknown[]) => replace(...args),
    refresh: () => refresh(),
  }),
}));

const mockedUpdateRestaurant = updateRestaurant as jest.MockedFunction<
  typeof updateRestaurant
>;
const mockedToast = toast as jest.Mocked<typeof toast>;

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

describe("EditRestaurantForm", () => {
  beforeEach(() => {
    mockedUpdateRestaurant.mockReset();
    push.mockReset();
    replace.mockReset();
    refresh.mockReset();
    mockedToast.success.mockReset();
    mockedToast.error.mockReset();
  });

  it("prefills the fields with the restaurant's current values", () => {
    render(<EditRestaurantForm restaurant={restaurant} />);

    expect(screen.getByLabelText("Restaurant name")).toHaveValue(
      "The French Place",
    );
    expect(screen.getByLabelText("Description")).toHaveValue(
      "Cozy bistro serving classic French dishes.",
    );
    expect(screen.getByLabelText("Address")).toHaveValue("1 Rue de Paris");
    expect(screen.getByLabelText("City")).toHaveValue("Paris");
    expect(screen.getByLabelText("State")).toHaveValue("IDF");
    expect(screen.getByLabelText("Country")).toHaveValue("France");
    expect(screen.getByRole("combobox")).toHaveTextContent("FRENCH");
  });

  it("shows a validation error when a required field is cleared", async () => {
    const user = userEvent.setup();
    render(<EditRestaurantForm restaurant={restaurant} />);

    await user.clear(screen.getByLabelText("Restaurant name"));
    await user.click(screen.getByRole("button", { name: "Save changes" }));

    expect(
      await screen.findByText(/name must be at least 2 characters/i),
    ).toBeInTheDocument();
    expect(mockedUpdateRestaurant).not.toHaveBeenCalled();
  });

  it("submits the updated values and redirects to my restaurants on success", async () => {
    mockedUpdateRestaurant.mockResolvedValue(restaurant);
    const user = userEvent.setup();
    render(<EditRestaurantForm restaurant={restaurant} />);

    await user.clear(screen.getByLabelText("Restaurant name"));
    await user.type(
      screen.getByLabelText("Restaurant name"),
      "The Updated Place",
    );
    await user.click(screen.getByRole("button", { name: "Save changes" }));

    expect(mockedUpdateRestaurant).toHaveBeenCalledWith(
      "1",
      expect.objectContaining({ name: "The Updated Place" }),
    );
    expect(replace).toHaveBeenCalledWith("/my-restaurants");
    expect(refresh).toHaveBeenCalledTimes(1);
    expect(mockedToast.success).toHaveBeenCalledWith(
      '"The Updated Place" was updated.',
    );
  });

  it("shows an error message and toast when the update fails", async () => {
    mockedUpdateRestaurant.mockRejectedValue(new Error("Update failed"));
    const user = userEvent.setup();
    render(<EditRestaurantForm restaurant={restaurant} />);

    await user.click(screen.getByRole("button", { name: "Save changes" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Update failed");
    expect(replace).not.toHaveBeenCalled();
    expect(mockedToast.error).toHaveBeenCalledWith("Update failed");
  });
});
