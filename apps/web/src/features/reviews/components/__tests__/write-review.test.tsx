import { render, screen } from "@testing-library/react";
import { WriteReview } from "../write-review";
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

describe("WriteReview", () => {
  it("prompts guests to sign in instead of showing the form", () => {
    render(<WriteReview restaurantSlug="the-french-place" user={null} />);

    expect(screen.getByRole("link", { name: /sign in/i })).toHaveAttribute(
      "href",
      "/login",
    );
    expect(
      screen.queryByLabelText(/have you been here/i),
    ).not.toBeInTheDocument();
  });

  it("tells owners they cannot submit reviews", () => {
    render(<WriteReview restaurantSlug="the-french-place" user={owner} />);

    expect(
      screen.getByText(/restaurant owners cannot submit reviews/i),
    ).toBeInTheDocument();
    expect(
      screen.queryByLabelText(/have you been here/i),
    ).not.toBeInTheDocument();
  });

  it("renders the review form for reviewers", () => {
    render(<WriteReview restaurantSlug="the-french-place" user={reviewer} />);

    expect(screen.getByLabelText(/have you been here/i)).toBeInTheDocument();
  });
});
