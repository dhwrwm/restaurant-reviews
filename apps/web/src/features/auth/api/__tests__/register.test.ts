import { register } from "../register";

function mockFetchResponseOnce(response: Partial<Response>) {
  (global.fetch as jest.Mock).mockResolvedValueOnce(response);
}

describe("register", () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  it("posts the new account to /auth/register and returns the user", async () => {
    const payload = {
      email: "a@b.com",
      name: "Ada",
      password: "secret123!",
      role: "REVIEWER" as const,
    };

    mockFetchResponseOnce({
      ok: true,
      json: async () => ({
        user: { id: "1", name: "Ada", email: "a@b.com", role: "REVIEWER" },
      }),
    });

    const result = await register(payload);

    expect(global.fetch).toHaveBeenCalledWith(
      "/auth/register",
      expect.objectContaining({
        method: "POST",
        credentials: "include",
        body: JSON.stringify(payload),
      }),
    );
    expect(result).toEqual({
      user: { id: "1", name: "Ada", email: "a@b.com", role: "REVIEWER" },
    });
  });

  it("throws the server error message when the email is taken", async () => {
    mockFetchResponseOnce({
      ok: false,
      status: 409,
      json: async () => ({ message: "Email already exists" }),
    });

    await expect(
      register({
        email: "a@b.com",
        name: "Ada",
        password: "secret123!",
        role: "REVIEWER" as const,
      }),
    ).rejects.toThrow("Email already exists");
  });
});
