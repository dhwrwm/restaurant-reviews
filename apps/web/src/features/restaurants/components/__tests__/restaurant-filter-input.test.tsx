import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RestaurantFilterInput } from "../restaurant-filter-input";

const push = jest.fn();
const replace = jest.fn();
let searchParams = new URLSearchParams();

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: (...args: unknown[]) => push(...args),
    replace: (...args: unknown[]) => replace(...args),
  }),
  usePathname: () => "/",
  useSearchParams: () => searchParams,
}));

const options = [
  { value: "FRENCH", label: "French" },
  { value: "ITALIAN", label: "Italian" },
];

describe("RestaurantFilterInput", () => {
  beforeEach(() => {
    push.mockReset();
    replace.mockReset();
    searchParams = new URLSearchParams();
    window.localStorage.clear();
  });

  it("shows the placeholder when no value is selected", () => {
    render(
      <RestaurantFilterInput
        label="Cuisine"
        placeholder="Any"
        queryKey="cuisine"
        options={options}
      />,
    );

    expect(screen.getByText("Cuisine")).toBeInTheDocument();
    expect(screen.getByText("Any")).toBeInTheDocument();
  });

  it("pushes the selected option into the query string, resets the page, and stores it", async () => {
    searchParams = new URLSearchParams("page=2");
    const user = userEvent.setup();
    render(
      <RestaurantFilterInput
        label="Cuisine"
        placeholder="Any"
        queryKey="cuisine"
        options={options}
      />,
    );

    await user.click(screen.getByRole("combobox"));
    await user.click(await screen.findByRole("option", { name: "French" }));

    expect(push).toHaveBeenCalledWith("/?cuisine=FRENCH", { scroll: false });
    expect(window.localStorage.getItem("restaurants:filter:cuisine")).toBe(
      "FRENCH",
    );
  });

  it("removes the query param and stored value when 'All' is selected", async () => {
    searchParams = new URLSearchParams("cuisine=FRENCH");
    window.localStorage.setItem("restaurants:filter:cuisine", "FRENCH");
    const user = userEvent.setup();
    render(
      <RestaurantFilterInput
        label="Cuisine"
        placeholder="Any"
        queryKey="cuisine"
        options={options}
      />,
    );

    await user.click(screen.getByRole("combobox"));
    await user.click(await screen.findByRole("option", { name: "All" }));

    expect(push).toHaveBeenCalledWith("/?", { scroll: false });
    expect(
      window.localStorage.getItem("restaurants:filter:cuisine"),
    ).toBeNull();
  });

  it("restores a stored value into the URL when none is present", () => {
    window.localStorage.setItem("restaurants:filter:cuisine", "ITALIAN");

    render(
      <RestaurantFilterInput
        label="Cuisine"
        placeholder="Any"
        queryKey="cuisine"
        options={options}
      />,
    );

    expect(replace).toHaveBeenCalledWith("/?cuisine=ITALIAN", {
      scroll: false,
    });
  });

  it("does not restore a stored value when the URL already has one", () => {
    searchParams = new URLSearchParams("cuisine=FRENCH");
    window.localStorage.setItem("restaurants:filter:cuisine", "ITALIAN");

    render(
      <RestaurantFilterInput
        label="Cuisine"
        placeholder="Any"
        queryKey="cuisine"
        options={options}
      />,
    );

    expect(replace).not.toHaveBeenCalled();
  });

  it("shows the option label, not the raw value, when a value is already selected on mount", () => {
    searchParams = new URLSearchParams("cuisine=FRENCH");
    render(
      <RestaurantFilterInput
        label="Cuisine"
        placeholder="Any"
        queryKey="cuisine"
        options={options}
      />,
    );

    expect(screen.getByText("French")).toBeInTheDocument();
    expect(screen.queryByText("FRENCH")).not.toBeInTheDocument();
  });

  it("keeps separate storage per queryKey", async () => {
    const user = userEvent.setup();
    render(
      <RestaurantFilterInput
        label="Average rating"
        placeholder="Any"
        queryKey="minRating"
        options={[{ value: "4", label: "4+" }]}
      />,
    );

    await user.click(screen.getByRole("combobox"));
    await user.click(await screen.findByRole("option", { name: "4+" }));

    expect(window.localStorage.getItem("restaurants:filter:minRating")).toBe(
      "4",
    );
    expect(
      window.localStorage.getItem("restaurants:filter:cuisine"),
    ).toBeNull();
  });
});
