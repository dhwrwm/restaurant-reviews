import { updateRestaurant } from "../update-restaurant";

describe("updateRestaurant", () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  it("patches the restaurant by id and returns it", async () => {
    const restaurant = { id: "1", name: "New Name" };
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => restaurant,
    });

    const result = await updateRestaurant("1", { name: "New Name" });

    expect(global.fetch).toHaveBeenCalledWith(
      "/restaurants/1",
      expect.objectContaining({
        method: "PATCH",
        credentials: "include",
        body: JSON.stringify({ name: "New Name" }),
      }),
    );
    expect(result).toEqual(restaurant);
  });

  it("throws the server error message on failure", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 403,
      json: async () => ({ message: "You do not own this restaurant" }),
    });

    await expect(updateRestaurant("1", { name: "New Name" })).rejects.toThrow(
      "You do not own this restaurant",
    );
  });
});
