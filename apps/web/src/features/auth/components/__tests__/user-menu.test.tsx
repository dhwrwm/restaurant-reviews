import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import UserMenu from "../user-menu";
import { logout } from "../../api/logout";
import type { CurrentUser } from "../../api/me";

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

const user: CurrentUser = {
  id: "1",
  email: "owner@example.com",
  name: "Owner Test",
  role: "OWNER",
};

describe("UserMenu", () => {
  beforeEach(() => {
    mockedLogout.mockReset();
    mockedLogout.mockResolvedValue({ message: "ok" });
    refresh.mockReset();
  });

  it("renders the user's initial as the trigger", () => {
    render(<UserMenu user={user} />);

    expect(screen.getByTitle(user.email)).toHaveTextContent("O");
  });

  it("opens the menu to show the user's name and a sign out item", async () => {
    const interactor = userEvent.setup();
    render(<UserMenu user={user} />);

    await interactor.click(screen.getByTitle(user.email));

    expect(await screen.findByText(user.name)).toBeInTheDocument();
    expect(
      screen.getByRole("menuitem", { name: "Sign out" }),
    ).toBeInTheDocument();
  });

  it("signs the user out when the menu item is clicked", async () => {
    const interactor = userEvent.setup();
    render(<UserMenu user={user} />);

    await interactor.click(screen.getByTitle(user.email));
    await interactor.click(
      await screen.findByRole("menuitem", { name: "Sign out" }),
    );

    expect(mockedLogout).toHaveBeenCalledTimes(1);
    expect(refresh).toHaveBeenCalledTimes(1);
  });
});
