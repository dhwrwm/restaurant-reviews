import { getRestaurant } from "../get-restaurant";

describe("getRestaurant", () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  it("fetches the restaurant by slug", async () => {
    const restaurant = { id: "1", slug: "the-french-place" };
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => restaurant,
    });

    const result = await getRestaurant("the-french-place");

    expect(global.fetch).toHaveBeenCalledWith(
      "/restaurants/the-french-place",
      expect.objectContaining({ next: { revalidate: 15 } }),
    );
    expect(result).toEqual(restaurant);
  });

  it("returns null when the restaurant is not found", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 404,
    });

    const result = await getRestaurant("missing-slug");

    expect(result).toBeNull();
  });

  it("throws on other failures", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    await expect(getRestaurant("the-french-place")).rejects.toThrow(
      "Failed to load restaurant. Please try again.",
    );
  });
});
