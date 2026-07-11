import { getCities } from "../get-cities";

describe("getCities", () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  it("fetches and returns the list of cities", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ["Paris", "Lyon"],
    });

    const result = await getCities();

    expect(global.fetch).toHaveBeenCalledWith(
      "/restaurants/cities",
      expect.objectContaining({ next: { revalidate: 60 } }),
    );
    expect(result).toEqual(["Paris", "Lyon"]);
  });

  it("throws when the API call fails", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: false });

    await expect(getCities()).rejects.toThrow(
      "Failed to load cities. Please try again.",
    );
  });
});
