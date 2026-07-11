import { logout } from "../logout";

function mockFetchResponseOnce(response: Partial<Response>) {
  (global.fetch as jest.Mock).mockResolvedValueOnce(response);
}

describe("logout", () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  it("posts to /auth/logout and returns the confirmation message", async () => {
    mockFetchResponseOnce({
      ok: true,
      json: async () => ({ message: "Logged out successfully" }),
    });

    const result = await logout();

    expect(global.fetch).toHaveBeenCalledWith(
      "/auth/logout",
      expect.objectContaining({ method: "POST", credentials: "include" }),
    );
    expect(result).toEqual({ message: "Logged out successfully" });
  });

  it("throws the server error message on failure", async () => {
    mockFetchResponseOnce({
      ok: false,
      status: 500,
      json: async () => ({ message: "Something broke" }),
    });

    await expect(logout()).rejects.toThrow("Something broke");
  });
});
