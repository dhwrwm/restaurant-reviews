import { cookies } from "next/headers";
import { getMyRestaurants } from "../get-my-restaurants";

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

describe("getMyRestaurants", () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  it("returns an empty page without calling the API when there is no auth cookie", async () => {
    mockCookieStore(undefined);

    const result = await getMyRestaurants({ page: 2, pageSize: 5 });

    expect(global.fetch).not.toHaveBeenCalled();
    expect(result).toEqual({
      data: [],
      pagination: { page: 2, pageSize: 5, total: 0, totalPages: 0 },
    });
  });

  it("forwards the auth cookie to /restaurants/mine and returns the page", async () => {
    mockCookieStore("token-123");
    const page = {
      data: [{ id: "1" }],
      pagination: { page: 1, pageSize: 10, total: 1, totalPages: 1 },
    };
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => page,
    });

    const result = await getMyRestaurants();

    expect(global.fetch).toHaveBeenCalledWith(
      "/restaurants/mine?page=1&pageSize=10",
      expect.objectContaining({
        headers: { Cookie: "auth=token-123" },
        cache: "no-store",
      }),
    );
    expect(result).toEqual(page);
  });

  it("throws when the API call fails", async () => {
    mockCookieStore("token-123");
    (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: false });

    await expect(getMyRestaurants()).rejects.toThrow(
      "Failed to load your restaurants. Please try again.",
    );
  });
});
