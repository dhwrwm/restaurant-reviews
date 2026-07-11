import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CreateRestaurantForm } from "../create-restaurant-form";
import { createRestaurant } from "../../api/create-restaurant";

jest.mock("../../api/create-restaurant", () => ({
  createRestaurant: jest.fn(),
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

const mockedCreateRestaurant = createRestaurant as jest.MockedFunction<
  typeof createRestaurant
>;

async function fillValidForm(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText("Restaurant name"), "The French Place");
  await user.type(
    screen.getByLabelText("Description"),
    "Cozy bistro serving classic French dishes.",
  );
  await user.type(screen.getByLabelText("Address"), "1 Rue de Paris");
  await user.type(screen.getByLabelText("City"), "Paris");
  await user.type(screen.getByLabelText("Country"), "France");
  await user.click(screen.getByRole("combobox"));
  await user.click(await screen.findByRole("option", { name: "French" }));
}

describe("CreateRestaurantForm", () => {
  beforeEach(() => {
    mockedCreateRestaurant.mockReset();
    push.mockReset();
    replace.mockReset();
    refresh.mockReset();
  });

  it("renders the restaurant fields and a submit button", () => {
    render(<CreateRestaurantForm />);

    expect(screen.getByLabelText("Restaurant name")).toBeInTheDocument();
    expect(screen.getByLabelText("Description")).toBeInTheDocument();
    expect(screen.getByLabelText("Address")).toBeInTheDocument();
    expect(screen.getByLabelText("City")).toBeInTheDocument();
    expect(screen.getByLabelText("Country")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Create restaurant" }),
    ).toBeInTheDocument();
  });

  it("shows validation errors when submitted empty", async () => {
    const user = userEvent.setup();
    render(<CreateRestaurantForm />);

    await user.click(screen.getByRole("button", { name: "Create restaurant" }));

    expect(
      await screen.findByText(/name must be at least 2 characters/i),
    ).toBeInTheDocument();
    expect(
      await screen.findByText(/please add a description/i),
    ).toBeInTheDocument();
    expect(await screen.findByText(/address is required/i)).toBeInTheDocument();
    expect(await screen.findByText(/city is required/i)).toBeInTheDocument();
    expect(await screen.findByText(/country is required/i)).toBeInTheDocument();
    expect(
      await screen.findByText(/please select a cuisine/i),
    ).toBeInTheDocument();
    expect(mockedCreateRestaurant).not.toHaveBeenCalled();
  });

  it("creates the restaurant and redirects to its page on success", async () => {
    mockedCreateRestaurant.mockResolvedValue({
      id: "1",
      ownerId: "owner-1",
      slug: "the-french-place",
      name: "The French Place",
      description: "Cozy bistro serving classic French dishes.",
      previewImageUrl: null,
      address: "1 Rue de Paris",
      city: "Paris",
      state: null,
      country: "France",
      cuisine: "FRENCH",
      averageRating: "0",
      reviewCount: 0,
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    });
    const user = userEvent.setup();
    render(<CreateRestaurantForm />);

    await fillValidForm(user);
    await user.click(screen.getByRole("button", { name: "Create restaurant" }));

    expect(mockedCreateRestaurant).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "The French Place",
        description: "Cozy bistro serving classic French dishes.",
        address: "1 Rue de Paris",
        city: "Paris",
        country: "France",
        cuisine: "FRENCH",
      }),
    );
    expect(replace).toHaveBeenCalledWith("/restaurant/the-french-place");
    expect(refresh).toHaveBeenCalledTimes(1);
  });

  it("shows an error message when creation fails", async () => {
    mockedCreateRestaurant.mockRejectedValue(new Error("Something broke"));
    const user = userEvent.setup();
    render(<CreateRestaurantForm />);

    await fillValidForm(user);
    await user.click(screen.getByRole("button", { name: "Create restaurant" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Something broke",
    );
    expect(replace).not.toHaveBeenCalled();
  });
});
