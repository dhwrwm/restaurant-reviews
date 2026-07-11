import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import StarRating from "../star-rating";

describe("StarRating", () => {
  it("renders five stars", () => {
    render(<StarRating rating={3} readOnly />);

    expect(screen.getAllByRole("button")).toHaveLength(5);
  });

  it("disables all stars when read-only", () => {
    render(<StarRating rating={3} readOnly />);

    for (const button of screen.getAllByRole("button")) {
      expect(button).toBeDisabled();
    }
  });

  it("disables all stars when no onChangeRating handler is provided", () => {
    render(<StarRating rating={3} />);

    for (const button of screen.getAllByRole("button")) {
      expect(button).toBeDisabled();
    }
  });

  it("calls onChangeRating with the selected star value", async () => {
    const user = userEvent.setup();
    const onChangeRating = jest.fn();

    render(<StarRating rating={0} onChangeRating={onChangeRating} />);

    await user.click(screen.getAllByRole("button")[2]);

    expect(onChangeRating).toHaveBeenCalledWith(3);
  });

  it("does not call onChangeRating when disabled by readOnly", async () => {
    const user = userEvent.setup();
    const onChangeRating = jest.fn();

    render(
      <StarRating rating={0} onChangeRating={onChangeRating} readOnly />,
    );

    await user.click(screen.getAllByRole("button")[2]);

    expect(onChangeRating).not.toHaveBeenCalled();
  });
});
