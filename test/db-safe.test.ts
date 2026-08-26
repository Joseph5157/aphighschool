// @vitest-environment node
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { safeQuery, optionalQuery, DatabaseUnavailableError } from "@/lib/db-safe";

describe("safeQuery", () => {
  let errorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  });
  afterEach(() => errorSpy.mockRestore());

  it("returns the value on success", async () => {
    await expect(safeQuery("posts", async () => [1, 2, 3])).resolves.toEqual([1, 2, 3]);
  });

  it("throws DatabaseUnavailableError on failure", async () => {
    await expect(
      safeQuery("posts", async () => {
        throw new Error("connection refused");
      })
    ).rejects.toBeInstanceOf(DatabaseUnavailableError);
  });

  it("logs the label and the underlying error", async () => {
    await safeQuery("homepage-feed", async () => {
      throw new Error("connection refused");
    }).catch(() => {});
    expect(errorSpy).toHaveBeenCalled();
    const logged = errorSpy.mock.calls[0].join(" ");
    expect(logged).toContain("homepage-feed");
    expect(logged).toContain("connection refused");
  });

  it("does not swallow the failure into an empty array", async () => {
    const result = await safeQuery("posts", async () => {
      throw new Error("boom");
    }).catch((e) => e);
    expect(Array.isArray(result)).toBe(false);
  });
});

describe("optionalQuery", () => {
  beforeEach(() => vi.spyOn(console, "error").mockImplementation(() => {}));

  it("returns the value on success", async () => {
    await expect(optionalQuery("sidebar", async () => ["a"], [])).resolves.toEqual(["a"]);
  });

  it("returns the fallback on failure", async () => {
    await expect(
      optionalQuery(
        "sidebar",
        async () => {
          throw new Error("boom");
        },
        []
      )
    ).resolves.toEqual([]);
  });
});
