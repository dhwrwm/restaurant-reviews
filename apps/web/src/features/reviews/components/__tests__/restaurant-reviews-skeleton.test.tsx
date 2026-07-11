import { render } from "@testing-library/react";
import RestaurantReviewsSkeleton from "../restaurant-reviews-skeleton";

describe("RestaurantReviewsSkeleton", () => {
  it("renders three hidden placeholder rows", () => {
    const { container } = render(<RestaurantReviewsSkeleton />);

    const root = container.firstChild as HTMLElement;
    expect(root).toHaveAttribute("aria-hidden", "true");
    expect(root.children).toHaveLength(3);
  });
});
