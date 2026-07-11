import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ReviewForm } from "../review-form";

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    refresh: jest.fn(),
  }),
}));

describe("ReviewForm", () => {
  it("renders a comment field, star rating, and submit button", () => {
    render(<ReviewForm restaurantSlug="the-french-place" />);

    expect(screen.getByLabelText(/have you been here/i)).toBeInTheDocument();
    // 5 star buttons + the submit button
    expect(screen.getAllByRole("button")).toHaveLength(6);
    expect(
      screen.getByRole("button", { name: /submit review/i }),
    ).toBeInTheDocument();
  });

  it("shows validation errors when submitted empty", async () => {
    const user = userEvent.setup();
    render(<ReviewForm restaurantSlug="the-french-place" />);

    await user.click(screen.getByRole("button", { name: /submit review/i }));

    expect(
      await screen.findByText(/please write a review/i),
    ).toBeInTheDocument();
    expect(
      await screen.findByText(/please select a rating/i),
    ).toBeInTheDocument();
  });

  it("clears the rating error once a star is selected", async () => {
    const user = userEvent.setup();
    render(<ReviewForm restaurantSlug="the-french-place" />);

    await user.click(screen.getByRole("button", { name: /submit review/i }));
    expect(
      await screen.findByText(/please select a rating/i),
    ).toBeInTheDocument();

    const [, , , fourthStar] = screen.getAllByRole("button");
    await user.click(fourthStar);

    expect(
      screen.queryByText(/please select a rating/i),
    ).not.toBeInTheDocument();
  });

  it("clears the comment error once text is entered", async () => {
    const user = userEvent.setup();
    render(<ReviewForm restaurantSlug="the-french-place" />);

    await user.click(screen.getByRole("button", { name: /submit review/i }));
    expect(
      await screen.findByText(/please write a review/i),
    ).toBeInTheDocument();

    await user.type(
      screen.getByLabelText(/have you been here/i),
      "Great food and service!",
    );

    expect(
      screen.queryByText(/please write a review/i),
    ).not.toBeInTheDocument();
  });
});
