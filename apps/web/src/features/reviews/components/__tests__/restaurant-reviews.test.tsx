import { render, screen } from "@testing-library/react";
import RestaurantReviews from "../restaurant-reviews";
import { getRestaurantReviews } from "../../api/get-restaurant-reviews";
import { getCurrentUser } from "../../../auth/api/me";
import type { CurrentUser } from "@/features/auth/api/me";
import type { Reviews } from "../../types";

jest.mock("../../api/get-restaurant-reviews", () => ({
  getRestaurantReviews: jest.fn(),
}));

jest.mock("../../../auth/api/me", () => ({
  getCurrentUser: jest.fn(),
}));

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    refresh: jest.fn(),
  }),
}));

const mockedGetRestaurantReviews = getRestaurantReviews as jest.MockedFunction<
  typeof getRestaurantReviews
>;
const mockedGetCurrentUser = getCurrentUser as jest.MockedFunction<
  typeof getCurrentUser
>;

const reviewer: CurrentUser = {
  id: "1",
  email: "reviewer@example.com",
  name: "Reviewer Test",
  role: "REVIEWER",
};

const review: Reviews = {
  id: "review-1",
  restaurantId: "restaurant-1",
  reviewerId: "reviewer-1",
  rating: 5,
  comment: "Wonderful meal",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
  reviewer: { id: "reviewer-1", email: "fan@example.com", name: "Fan" },
};

describe("RestaurantReviews", () => {
  beforeEach(() => {
    mockedGetRestaurantReviews.mockReset();
    mockedGetCurrentUser.mockReset();
  });

  it("shows the write-review prompt for guests and lists fetched reviews", async () => {
    mockedGetRestaurantReviews.mockResolvedValue({
      items: [review],
      nextCursor: null,
    });
    mockedGetCurrentUser.mockResolvedValue(null);

    render(await RestaurantReviews({ slug: "the-french-place" }));

    expect(screen.getByRole("link", { name: /sign in/i })).toBeInTheDocument();
    expect(screen.getByText("Fan")).toBeInTheDocument();
    expect(screen.getByText("Wonderful meal")).toBeInTheDocument();
  });

  it("shows the review form for a signed-in reviewer", async () => {
    mockedGetRestaurantReviews.mockResolvedValue({
      items: [],
      nextCursor: null,
    });
    mockedGetCurrentUser.mockResolvedValue(reviewer);

    render(await RestaurantReviews({ slug: "the-french-place" }));

    expect(screen.getByLabelText(/have you been here/i)).toBeInTheDocument();
  });
});
