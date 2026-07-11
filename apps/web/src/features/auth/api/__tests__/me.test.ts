import { cookies } from "next/headers";
import { getCurrentUser } from "../me";

jest.mock("next/headers", () => ({
  cookies: jest.fn(),
}));

const mockedCookies = cookies as jest.MockedFunction<typeof cookies>;

function mockCookieStore(authValue: string | undefined) {
  mockedCookies.mockResolvedValue({
    get: jest.fn((name: string) =>
      name === "auth" && authValue !== undefined
        ? { name, value: authValue }
        : undefined,
    ),
  } as never);
}

describe("getCurrentUser", () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  it("returns null without calling the API when there is no auth cookie", async () => {
    mockCookieStore(undefined);

    const result = await getCurrentUser();

    expect(result).toBeNull();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("forwards the auth cookie to /auth/me and returns the current user", async () => {
    mockCookieStore("token-123");
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        id: "1",
        name: "Ada",
        email: "a@b.com",
        role: "REVIEWER",
      }),
    });

    const result = await getCurrentUser();

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/auth/me"),
      expect.objectContaining({
        headers: { Cookie: "auth=token-123" },
        cache: "no-store",
      }),
    );
    expect(result).toEqual({
      id: "1",
      name: "Ada",
      email: "a@b.com",
      role: "REVIEWER",
    });
  });

  it("returns null when the API rejects the cookie", async () => {
    mockCookieStore("expired-token");
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 401,
    });

    const result = await getCurrentUser();

    expect(result).toBeNull();
  });
});
