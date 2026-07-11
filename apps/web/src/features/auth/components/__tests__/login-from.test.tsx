import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LoginForm from "../login-from";
import { login } from "../../api/login";

jest.mock("../../api/login", () => ({
  login: jest.fn(),
}));

const push = jest.fn();
const refresh = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: (...args: unknown[]) => push(...args),
    replace: (...args: unknown[]) => push(...args),
    refresh: () => refresh(),
  }),
}));

const mockedLogin = login as jest.MockedFunction<typeof login>;

describe("LoginForm", () => {
  beforeEach(() => {
    mockedLogin.mockReset();
    push.mockReset();
    refresh.mockReset();
  });

  it("renders email and password fields and a submit button", () => {
    render(<LoginForm />);

    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sign in" })).toBeInTheDocument();
  });

  it("shows validation errors when submitted empty", async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    await user.click(screen.getByRole("button", { name: "Sign in" }));

    expect(
      await screen.findByText(/please enter a valid email address/i),
    ).toBeInTheDocument();
    expect(
      await screen.findByText(/password is required/i),
    ).toBeInTheDocument();
    expect(mockedLogin).not.toHaveBeenCalled();
  });

  it("logs in and redirects home on success", async () => {
    mockedLogin.mockResolvedValue({
      user: { id: "1", email: "reviewer@example.com", role: "REVIEWER" },
    });
    const user = userEvent.setup();
    render(<LoginForm />);

    await user.type(screen.getByLabelText("Email"), "reviewer@example.com");
    await user.type(screen.getByLabelText("Password"), "supersecret");
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    expect(mockedLogin).toHaveBeenCalledWith({
      email: "reviewer@example.com",
      password: "supersecret",
    });
    expect(
      await screen.findByRole("button", { name: "Sign in" }),
    ).toBeInTheDocument();
    expect(push).toHaveBeenCalledWith("/");
    expect(refresh).toHaveBeenCalledTimes(1);
  });

  it("shows an error message when login fails", async () => {
    mockedLogin.mockRejectedValue(new Error("Invalid credentials"));
    const user = userEvent.setup();
    render(<LoginForm />);

    await user.type(screen.getByLabelText("Email"), "reviewer@example.com");
    await user.type(screen.getByLabelText("Password"), "wrongpassword");
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Invalid credentials",
    );
    expect(push).not.toHaveBeenCalled();
  });
});
