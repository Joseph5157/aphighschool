// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest";

const getServerSession = vi.fn();
vi.mock("next-auth", () => ({
  getServerSession: (...args: unknown[]) => getServerSession(...args),
}));
vi.mock("@/lib/auth", () => ({ authOptions: {} }));

import { requireAdmin } from "@/lib/auth-guard";

describe("requireAdmin", () => {
  beforeEach(() => getServerSession.mockReset());

  it("throws when there is no session", async () => {
    getServerSession.mockResolvedValue(null);
    await expect(requireAdmin()).rejects.toThrow("Unauthorized");
  });

  it("throws when the session has no user email", async () => {
    getServerSession.mockResolvedValue({ user: {} });
    await expect(requireAdmin()).rejects.toThrow("Unauthorized");
  });

  it("resolves for a session carrying an admin email", async () => {
    getServerSession.mockResolvedValue({ user: { email: "admin@test.local" } });
    await expect(requireAdmin()).resolves.toBeUndefined();
  });
});
