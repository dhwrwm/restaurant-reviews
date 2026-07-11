import { render, screen } from "@testing-library/react";
import Header from "../header";
import type { CurrentUser } from "@/features/auth/api/me";

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    refresh: jest.fn(),
  }),
}));

const reviewer: CurrentUser = {
  id: "1",
  email: "reviewer@example.com",
  name: "Reviewer Test",
  role: "REVIEWER",
};

const owner: CurrentUser = {
  id: "2",
  email: "owner@example.com",
  name: "Owner Test",
  role: "OWNER",
};

describe("Header", () => {
  it("shows sign in/register links and no owner nav for guests", () => {
    render(<Header user={null} />);

    expect(
      screen.getAllByRole("link", { name: "Sign in" }).length,
    ).toBeGreaterThan(0);
    expect(
      screen.getAllByRole("link", { name: "Register" }).length,
    ).toBeGreaterThan(0);
    expect(screen.queryByText("Add Restaurant")).not.toBeInTheDocument();
    expect(screen.queryByText("My Restaurants")).not.toBeInTheDocument();
  });

  it("hides owner-only nav links for a logged-in reviewer", async () => {
    render(<Header user={reviewer} />);

    expect(await screen.findByTitle(reviewer.email)).toBeInTheDocument();
    expect(screen.queryByText("Add Restaurant")).not.toBeInTheDocument();
    expect(screen.queryByText("My Restaurants")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "Sign in" }),
    ).not.toBeInTheDocument();
  });

  it("shows Add Restaurant and My Restaurants links for a logged-in owner", async () => {
    render(<Header user={owner} />);

    expect(await screen.findByTitle(owner.email)).toBeInTheDocument();

    const links = screen.getAllByRole("link", { name: "Add Restaurant" });
    expect(links.length).toBeGreaterThan(0);
    for (const link of links) {
      expect(link).toHaveAttribute("href", "/add-restaurant");
    }

    const myRestaurantsLinks = screen.getAllByRole("link", {
      name: "My Restaurants",
    });
    expect(myRestaurantsLinks.length).toBeGreaterThan(0);
    for (const link of myRestaurantsLinks) {
      expect(link).toHaveAttribute("href", "/my-restaurants");
    }
  });

  it("links the logo back to the homepage", () => {
    render(<Header user={null} />);

    expect(
      screen.getByRole("link", { name: "Restaurant Reviews" }),
    ).toHaveAttribute("href", "/");
  });
});
