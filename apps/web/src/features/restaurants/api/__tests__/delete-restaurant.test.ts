import { deleteRestaurant } from "../delete-restaurant";

describe("deleteRestaurant", () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  it("sends a DELETE request for the restaurant id", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => undefined,
    });

    await deleteRestaurant("1");

    expect(global.fetch).toHaveBeenCalledWith(
      "/restaurants/1",
      expect.objectContaining({ method: "DELETE", credentials: "include" }),
    );
  });

  it("throws the server error message on failure", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 403,
      json: async () => ({ message: "You do not own this restaurant" }),
    });

    await expect(deleteRestaurant("1")).rejects.toThrow(
      "You do not own this restaurant",
    );
  });
});
