import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SignOutButton from "../sign-out-button";
import { logout } from "../../api/logout";

jest.mock("../../api/logout", () => ({
  logout: jest.fn(),
}));

const refresh = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    refresh: () => refresh(),
  }),
}));

const mockedLogout = logout as jest.MockedFunction<typeof logout>;

describe("SignOutButton", () => {
  beforeEach(() => {
    mockedLogout.mockReset();
    refresh.mockReset();
  });

  it("renders a sign out button", () => {
    render(<SignOutButton />);

    expect(
      screen.getByRole("button", { name: "Sign out" }),
    ).toBeInTheDocument();
  });

  it("calls logout and refreshes the router when clicked", async () => {
    mockedLogout.mockResolvedValue({ message: "ok" });
    const user = userEvent.setup();
    render(<SignOutButton />);

    await user.click(screen.getByRole("button", { name: "Sign out" }));

    expect(mockedLogout).toHaveBeenCalledTimes(1);
    expect(refresh).toHaveBeenCalledTimes(1);
  });

  it("shows a signing out state and disables the button while pending", async () => {
    let resolveLogout: (value: { message: string }) => void;
    mockedLogout.mockReturnValue(
      new Promise((resolve) => {
        resolveLogout = resolve;
      }),
    );
    const user = userEvent.setup();
    render(<SignOutButton />);

    const button = screen.getByRole("button", { name: "Sign out" });
    await user.click(button);

    expect(
      screen.getByRole("button", { name: "Signing out..." }),
    ).toBeDisabled();

    resolveLogout!({ message: "ok" });
    expect(
      await screen.findByRole("button", { name: "Sign out" }),
    ).not.toBeDisabled();
  });
});
