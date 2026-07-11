import { login } from "../login";

function mockFetchResponseOnce(response: Partial<Response>) {
  (global.fetch as jest.Mock).mockResolvedValueOnce(response);
}

describe("login", () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  it("posts credentials to /auth/login and returns the user", async () => {
    mockFetchResponseOnce({
      ok: true,
      json: async () => ({
        user: { id: "1", email: "a@b.com", role: "REVIEWER" },
      }),
    });

    const result = await login({ email: "a@b.com", password: "secret123!" });

    expect(global.fetch).toHaveBeenCalledWith(
      "/auth/login",
      expect.objectContaining({
        method: "POST",
        credentials: "include",
        body: JSON.stringify({ email: "a@b.com", password: "secret123!" }),
      }),
    );
    expect(result).toEqual({
      user: { id: "1", email: "a@b.com", role: "REVIEWER" },
    });
  });

  it("throws the server error message on invalid credentials", async () => {
    mockFetchResponseOnce({
      ok: false,
      status: 401,
      json: async () => ({ message: "Invalid credentials" }),
    });

    await expect(
      login({ email: "a@b.com", password: "wrong" }),
    ).rejects.toThrow("Invalid credentials");
  });
});
