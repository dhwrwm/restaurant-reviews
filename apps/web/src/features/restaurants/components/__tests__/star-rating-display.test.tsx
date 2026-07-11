import { render, screen } from "@testing-library/react";
import StarRatingDisplay from "../star-rating-display";

describe("StarRatingDisplay", () => {
  it("exposes the rating as a single accessible unit, not interactive controls", () => {
    render(<StarRatingDisplay rating={4.5} />);

    expect(
      screen.getByRole("img", { name: "4.5 out of 5 stars" }),
    ).toBeInTheDocument();
    expect(screen.queryAllByRole("button")).toHaveLength(0);
  });

  it("defaults to a zero rating when none is provided", () => {
    render(<StarRatingDisplay />);

    expect(
      screen.getByRole("img", { name: "0 out of 5 stars" }),
    ).toBeInTheDocument();
  });
});
