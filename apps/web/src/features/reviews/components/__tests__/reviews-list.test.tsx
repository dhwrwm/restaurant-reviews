import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { toast } from "sonner";
import { ReviewsList } from "../reviews-list";
import { getRestaurantReviews } from "../../api/get-restaurant-reviews";
import type { Reviews } from "../../types";

jest.mock("../../api/get-restaurant-reviews", () => ({
  getRestaurantReviews: jest.fn(),
}));

jest.mock("sonner", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

const mockedGetRestaurantReviews = getRestaurantReviews as jest.MockedFunction<
  typeof getRestaurantReviews
>;
const mockedToastError = toast.error as jest.MockedFunction<typeof toast.error>;

function makeReview(overrides: Partial<Reviews> = {}): Reviews {
  return {
    id: "review-1",
    restaurantId: "restaurant-1",
    reviewerId: "reviewer-1",
    rating: 5,
    comment: "Loved it",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    reviewer: { id: "reviewer-1", email: "fan@example.com", name: "Fan" },
    ...overrides,
  };
}

describe("ReviewsList", () => {
  beforeEach(() => {
    mockedGetRestaurantReviews.mockReset();
    mockedToastError.mockReset();
  });

  it("renders the children (already-loaded reviews) without a load more button when there is no cursor", () => {
    render(
      <ReviewsList slug="the-french-place" initialCursor={null}>
        <div>Server rendered review</div>
      </ReviewsList>,
    );

    expect(screen.getByText("Server rendered review")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /load more reviews/i }),
    ).not.toBeInTheDocument();
  });

  it("shows a load more button when there is a cursor", () => {
    render(
      <ReviewsList slug="the-french-place" initialCursor="cursor-1">
        <div>Server rendered review</div>
      </ReviewsList>,
    );

    expect(
      screen.getByRole("button", { name: /load more reviews/i }),
    ).toBeInTheDocument();
  });

  it("fetches and appends the next page when load more is clicked", async () => {
    mockedGetRestaurantReviews.mockResolvedValue({
      items: [makeReview({ id: "review-2", comment: "Second review" })],
      nextCursor: null,
    });
    const user = userEvent.setup();

    render(
      <ReviewsList slug="the-french-place" initialCursor="cursor-1">
        <div>Server rendered review</div>
      </ReviewsList>,
    );

    await user.click(
      screen.getByRole("button", { name: /load more reviews/i }),
    );

    expect(mockedGetRestaurantReviews).toHaveBeenCalledWith(
      "the-french-place",
      { cursor: "cursor-1" },
    );
    expect(await screen.findByText("Second review")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /load more reviews/i }),
    ).not.toBeInTheDocument();
  });

  it("keeps the load more button when another cursor is returned", async () => {
    mockedGetRestaurantReviews.mockResolvedValue({
      items: [makeReview({ id: "review-2" })],
      nextCursor: "cursor-2",
    });
    const user = userEvent.setup();

    render(
      <ReviewsList slug="the-french-place" initialCursor="cursor-1">
        <div>Server rendered review</div>
      </ReviewsList>,
    );

    await user.click(
      screen.getByRole("button", { name: /load more reviews/i }),
    );

    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: /load more reviews/i }),
      ).toBeInTheDocument(),
    );
  });

  it("shows a toast and keeps the button when loading the next page fails", async () => {
    mockedGetRestaurantReviews.mockRejectedValue(
      new Error("Failed to load reviews. Please try again."),
    );
    const user = userEvent.setup();

    render(
      <ReviewsList slug="the-french-place" initialCursor="cursor-1">
        <div>Server rendered review</div>
      </ReviewsList>,
    );

    await user.click(
      screen.getByRole("button", { name: /load more reviews/i }),
    );

    await waitFor(() =>
      expect(mockedToastError).toHaveBeenCalledWith(
        "Failed to load reviews. Please try again.",
      ),
    );
    expect(
      screen.getByRole("button", { name: /load more reviews/i }),
    ).toBeInTheDocument();
  });
});
