import { updateReview } from "../update-review";

describe("updateReview", () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  it("patches the review by id and returns it", async () => {
    const payload = { rating: 4, comment: "Updated thoughts" };
    const review = {
      id: "1",
      restaurantId: "r1",
      reviewerId: "u1",
      ...payload,
    };
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => review,
    });

    const result = await updateReview("1", payload);

    expect(global.fetch).toHaveBeenCalledWith(
      "/reviews/1",
      expect.objectContaining({
        method: "PATCH",
        credentials: "include",
        body: JSON.stringify(payload),
      }),
    );
    expect(result).toEqual(review);
  });

  it("throws the server error message on failure", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 403,
      json: async () => ({ message: "You do not own this review" }),
    });

    await expect(
      updateReview("1", { rating: 4, comment: "Updated" }),
    ).rejects.toThrow("You do not own this review");
  });
});
