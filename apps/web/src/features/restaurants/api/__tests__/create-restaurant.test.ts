import { createRestaurant } from "../create-restaurant";

describe("createRestaurant", () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  const payload = {
    name: "The French Place",
    address: "1 Rue de Paris",
    city: "Paris",
    country: "France",
    cuisine: "FRENCH" as never,
  };

  it("posts the restaurant payload to /restaurants and returns it", async () => {
    const restaurant = { id: "1", slug: "the-french-place", ...payload };
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => restaurant,
    });

    const result = await createRestaurant(payload);

    expect(global.fetch).toHaveBeenCalledWith(
      "/restaurants",
      expect.objectContaining({
        method: "POST",
        credentials: "include",
        body: JSON.stringify(payload),
      }),
    );
    expect(result).toEqual(restaurant);
  });

  it("throws the server error message on failure", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({ message: "Name is required" }),
    });

    await expect(createRestaurant(payload)).rejects.toThrow("Name is required");
  });
});
