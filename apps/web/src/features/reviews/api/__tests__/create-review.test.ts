import { createReview } from "../create-review";

describe("createReview", () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  const payload = { rating: 5, comment: "Loved it" };

  it("posts the review to the restaurant's reviews endpoint", async () => {
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

    const result = await createReview("the-french-place", payload);

    expect(global.fetch).toHaveBeenCalledWith(
      "/restaurants/the-french-place/reviews",
      expect.objectContaining({
        method: "POST",
        credentials: "include",
        body: JSON.stringify(payload),
      }),
    );
    expect(result).toEqual(review);
  });

  it("throws the server error message when the reviewer already reviewed it", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 409,
      json: async () => ({
        message: "You have already reviewed this restaurant",
      }),
    });

    await expect(createReview("the-french-place", payload)).rejects.toThrow(
      "You have already reviewed this restaurant",
    );
  });
});
