import { getRestaurants } from "../get-restaurants";

describe("getRestaurants", () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  it("defaults to page 1 / pageSize 12 and returns the page", async () => {
    const page = {
      data: [],
      pagination: { page: 1, pageSize: 12, total: 0, totalPages: 0 },
    };
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => page,
    });

    const result = await getRestaurants();

    const [url] = (global.fetch as jest.Mock).mock.calls[0];
    expect(url).toBe("/restaurants?page=1&pageSize=12");
    expect(result).toEqual(page);
  });

  it("only includes optional filters that are provided", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: [],
        pagination: { page: 2, pageSize: 5, total: 0, totalPages: 0 },
      }),
    });

    await getRestaurants({
      page: 2,
      pageSize: 5,
      city: "Paris",
      cuisine: "FRENCH" as never,
      minRating: 4,
      sort: "asc",
    });

    const [url] = (global.fetch as jest.Mock).mock.calls[0];
    expect(url).toBe(
      "/restaurants?page=2&pageSize=5&city=Paris&cuisine=FRENCH&minRating=4&sort=asc",
    );
  });

  it("throws when the API call fails", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: false });

    await expect(getRestaurants()).rejects.toThrow(
      "Failed to load restaurants. Please try again.",
    );
  });
});
