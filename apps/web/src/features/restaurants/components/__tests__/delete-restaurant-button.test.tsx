import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { toast } from "sonner";
import { DeleteRestaurantButton } from "../delete-restaurant-button";
import { deleteRestaurant } from "../../api/delete-restaurant";

jest.mock("../../api/delete-restaurant", () => ({
  deleteRestaurant: jest.fn(),
}));

jest.mock("sonner", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

const refresh = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    refresh: () => refresh(),
  }),
}));

const mockedDeleteRestaurant = deleteRestaurant as jest.MockedFunction<
  typeof deleteRestaurant
>;
const mockedToast = toast as jest.Mocked<typeof toast>;

describe("DeleteRestaurantButton", () => {
  beforeEach(() => {
    mockedDeleteRestaurant.mockReset();
    mockedToast.success.mockReset();
    mockedToast.error.mockReset();
    refresh.mockReset();
  });

  it("does not delete when the confirmation dialog is cancelled", async () => {
    const user = userEvent.setup();
    render(<DeleteRestaurantButton id="1" name="The French Place" />);

    await user.click(screen.getByRole("button", { name: "Delete" }));
    expect(
      await screen.findByRole("dialog", { name: "Delete restaurant" }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Cancel" }));

    expect(mockedDeleteRestaurant).not.toHaveBeenCalled();
  });

  it("deletes, shows a success toast, and refreshes when confirmed", async () => {
    mockedDeleteRestaurant.mockResolvedValue(undefined);
    const user = userEvent.setup();
    render(<DeleteRestaurantButton id="1" name="The French Place" />);

    await user.click(screen.getByRole("button", { name: "Delete" }));
    await user.click(
      await screen.findByRole("button", { name: "Yes, delete" }),
    );

    expect(mockedDeleteRestaurant).toHaveBeenCalledWith("1");
    await waitFor(() => expect(refresh).toHaveBeenCalledTimes(1));
    expect(mockedToast.success).toHaveBeenCalledWith(
      '"The French Place" was deleted.',
    );
  });

  it("shows an error toast and re-enables the button when deletion fails", async () => {
    mockedDeleteRestaurant.mockRejectedValue(new Error("Network error"));
    const user = userEvent.setup();
    render(<DeleteRestaurantButton id="1" name="The French Place" />);

    await user.click(screen.getByRole("button", { name: "Delete" }));
    await user.click(
      await screen.findByRole("button", { name: "Yes, delete" }),
    );

    await waitFor(() =>
      expect(mockedToast.error).toHaveBeenCalledWith("Network error"),
    );
    expect(
      screen.getByRole("button", { name: "Yes, delete" }),
    ).not.toBeDisabled();
    expect(refresh).not.toHaveBeenCalled();
  });
});
