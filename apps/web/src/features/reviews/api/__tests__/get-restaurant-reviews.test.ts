import { getRestaurantReviews } from "../get-restaurant-reviews";

describe("getRestaurantReviews", () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  it("fetches reviews for a restaurant slug with no query params by default", async () => {
    const page = { items: [], nextCursor: null };
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => page,
    });

    const result = await getRestaurantReviews("the-french-place");

    expect(global.fetch).toHaveBeenCalledWith(
      "/restaurants/the-french-place/reviews",
      expect.objectContaining({ next: { revalidate: 15 } }),
    );
    expect(result).toEqual(page);
  });

  it("includes cursor and limit when provided", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ items: [], nextCursor: null }),
    });

    await getRestaurantReviews("the-french-place", {
      cursor: "abc",
      limit: 10,
    });

    const [url] = (global.fetch as jest.Mock).mock.calls[0];
    expect(url).toBe(
      "/restaurants/the-french-place/reviews?cursor=abc&limit=10",
    );
  });

  it("throws when the API call fails", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: false });

    await expect(getRestaurantReviews("the-french-place")).rejects.toThrow(
      "Failed to load reviews. Please try again.",
    );
  });
});
