import { deleteReview } from "../delete-review";

describe("deleteReview", () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  it("sends a DELETE request for the review id", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => undefined,
    });

    await deleteReview("1");

    expect(global.fetch).toHaveBeenCalledWith(
      "/reviews/1",
      expect.objectContaining({ method: "DELETE", credentials: "include" }),
    );
  });

  it("throws the server error message on failure", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 403,
      json: async () => ({ message: "You do not own this review" }),
    });

    await expect(deleteReview("1")).rejects.toThrow(
      "You do not own this review",
    );
  });
});
