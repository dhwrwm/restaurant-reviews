import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Review } from "../review";

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    refresh: jest.fn(),
  }),
}));

const baseProps = {
  id: "review-1",
  restaurantSlug: "the-french-place",
  reviewerId: "reviewer-1",
  author: "Jane Doe",
  date: "2026-01-15T00:00:00.000Z",
  rating: 4,
  body: "Great food and friendly staff.",
};

describe("Review", () => {
  it("renders the author, formatted date, rating, and body", () => {
    render(<Review {...baseProps} />);

    expect(screen.getByText("Jane Doe")).toBeInTheDocument();
    expect(screen.getByText(/Jan 15, 2026/)).toBeInTheDocument();
    expect(
      screen.getByText("Great food and friendly staff."),
    ).toBeInTheDocument();
  });

  it("renders a read-only star rating matching the review's rating", () => {
    render(<Review {...baseProps} />);

    expect(
      screen.getByRole("img", { name: "4 out of 5 stars" }),
    ).toBeInTheDocument();
    expect(screen.queryAllByRole("button")).toHaveLength(0);
  });

  it("hides edit/delete controls for a visitor who is not the reviewer", () => {
    render(<Review {...baseProps} currentUserId="someone-else" />);

    expect(
      screen.queryByRole("button", { name: /edit/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /delete/i }),
    ).not.toBeInTheDocument();
  });

  it("shows edit/delete controls to the reviewer who owns the review", () => {
    render(<Review {...baseProps} currentUserId="reviewer-1" />);

    expect(screen.getByRole("button", { name: /edit/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /delete/i })).toBeInTheDocument();
  });

  it("switches to an edit form pre-filled with the current values", async () => {
    const user = userEvent.setup();
    render(<Review {...baseProps} currentUserId="reviewer-1" />);

    await user.click(screen.getByRole("button", { name: /edit/i }));

    expect(
      screen.getByRole("button", { name: /save changes/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByDisplayValue("Great food and friendly staff."),
    ).toBeInTheDocument();
  });

  it("returns to the read-only view when editing is cancelled", async () => {
    const user = userEvent.setup();
    render(<Review {...baseProps} currentUserId="reviewer-1" />);

    await user.click(screen.getByRole("button", { name: /edit/i }));
    await user.click(screen.getByRole("button", { name: /cancel/i }));

    expect(
      screen.getByText("Great food and friendly staff."),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /edit/i })).toBeInTheDocument();
  });
});
