import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import RegisterForm from "../register-from";
import { register } from "../../api/register";

jest.mock("../../api/register", () => ({
  register: jest.fn(),
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

const mockedRegister = register as jest.MockedFunction<typeof register>;

async function fillValidForm(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText("Name"), "New User");
  await user.type(screen.getByLabelText("Email"), "newuser@example.com");
  await user.type(screen.getByLabelText("Password"), "Str0ng!Pass");
  await user.type(screen.getByLabelText("Confirm password"), "Str0ng!Pass");
  await user.click(screen.getByRole("combobox"));
  await user.click(await screen.findByRole("option", { name: "Reviewer" }));
}

describe("RegisterForm", () => {
  beforeEach(() => {
    mockedRegister.mockReset();
    push.mockReset();
    refresh.mockReset();
  });

  it("renders name, email, password, confirm password, and role fields", () => {
    render(<RegisterForm />);

    expect(screen.getByLabelText("Name")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByLabelText("Confirm password")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Create account" }),
    ).toBeInTheDocument();
  });

  it("shows validation errors when submitted empty", async () => {
    const user = userEvent.setup();
    render(<RegisterForm />);

    await user.click(screen.getByRole("button", { name: "Create account" }));

    expect(await screen.findByText(/name is required/i)).toBeInTheDocument();
    expect(
      await screen.findByText(/please enter a valid email address/i),
    ).toBeInTheDocument();
    expect(
      await screen.findByText(/password is required/i),
    ).toBeInTheDocument();
    expect(
      await screen.findByText(/please select a role/i),
    ).toBeInTheDocument();
    expect(mockedRegister).not.toHaveBeenCalled();
  });

  it("shows an error when the passwords do not match", async () => {
    const user = userEvent.setup();
    render(<RegisterForm />);

    await user.type(screen.getByLabelText("Name"), "New User");
    await user.type(screen.getByLabelText("Email"), "newuser@example.com");
    await user.type(screen.getByLabelText("Password"), "Str0ng!Pass");
    await user.type(screen.getByLabelText("Confirm password"), "Different1!");
    await user.click(screen.getByRole("combobox"));
    await user.click(await screen.findByRole("option", { name: "Reviewer" }));
    await user.click(screen.getByRole("button", { name: "Create account" }));

    expect(
      await screen.findByText(/passwords do not match/i),
    ).toBeInTheDocument();
    expect(mockedRegister).not.toHaveBeenCalled();
  });

  it("registers and redirects home on success", async () => {
    mockedRegister.mockResolvedValue({
      user: {
        id: "1",
        name: "New User",
        email: "newuser@example.com",
        role: "REVIEWER",
      },
    });
    const user = userEvent.setup();
    render(<RegisterForm />);

    await fillValidForm(user);
    await user.click(screen.getByRole("button", { name: "Create account" }));

    expect(mockedRegister).toHaveBeenCalledWith({
      name: "New User",
      email: "newuser@example.com",
      password: "Str0ng!Pass",
      role: "REVIEWER",
    });
    expect(push).toHaveBeenCalledWith("/");
    expect(refresh).toHaveBeenCalledTimes(1);
  });

  it("shows an error message when registration fails", async () => {
    mockedRegister.mockRejectedValue(new Error("Email already in use"));
    const user = userEvent.setup();
    render(<RegisterForm />);

    await fillValidForm(user);
    await user.click(screen.getByRole("button", { name: "Create account" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Email already in use",
    );
    expect(push).not.toHaveBeenCalled();
  });
});
