import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RestaurantSortSelect } from "../restaurant-sort-select";

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

const SORT_STORAGE_KEY = "restaurants:sort";

describe("RestaurantSortSelect", () => {
  beforeEach(() => {
    push.mockReset();
    replace.mockReset();
    searchParams = new URLSearchParams();
    window.localStorage.clear();
  });

  it("pushes the chosen sort into the query string and stores it", async () => {
    const user = userEvent.setup();
    render(<RestaurantSortSelect />);

    await user.click(screen.getByRole("combobox"));
    await user.click(
      await screen.findByRole("option", { name: "Highest rated" }),
    );

    expect(push).toHaveBeenCalledWith("/?sort=desc", { scroll: false });
    expect(window.localStorage.getItem(SORT_STORAGE_KEY)).toBe("desc");
  });

  it("clears the stored sort when 'Default' is selected", async () => {
    searchParams = new URLSearchParams("sort=asc");
    window.localStorage.setItem(SORT_STORAGE_KEY, "asc");
    const user = userEvent.setup();
    render(<RestaurantSortSelect />);

    await user.click(screen.getByRole("combobox"));
    await user.click(await screen.findByRole("option", { name: "Default" }));

    expect(push).toHaveBeenCalledWith("/?", { scroll: false });
    expect(window.localStorage.getItem(SORT_STORAGE_KEY)).toBeNull();
  });

  it("restores a stored sort into the URL when none is present", () => {
    window.localStorage.setItem(SORT_STORAGE_KEY, "desc");
    render(<RestaurantSortSelect />);

    expect(replace).toHaveBeenCalledWith("/?sort=desc", { scroll: false });
  });

  it("does not restore a stored sort when the URL already has one", () => {
    searchParams = new URLSearchParams("sort=asc");
    window.localStorage.setItem(SORT_STORAGE_KEY, "desc");
    render(<RestaurantSortSelect />);

    expect(replace).not.toHaveBeenCalled();
  });

  it("shows the sort label, not the raw value, when a sort is already selected on mount", () => {
    searchParams = new URLSearchParams("sort=desc");
    render(<RestaurantSortSelect />);

    expect(screen.getByText("Highest rated")).toBeInTheDocument();
    expect(screen.queryByText("desc")).not.toBeInTheDocument();
  });
});
