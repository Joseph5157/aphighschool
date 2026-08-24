// @vitest-environment node
import { describe, it, expect, beforeAll } from "vitest";
import bcrypt from "bcryptjs";
import { authOptions } from "@/lib/auth";

const PASSWORD = "correct-horse-battery-staple";

function authorizeFn() {
  // next-auth v4's CredentialsProvider() factory returns a stub `authorize: () => null`
  // on the provider object itself and stashes our real config (including the real
  // authorize callback) under `.options` — the merge that installs it onto the
  // top-level provider happens inside next-auth's internal request handling, which
  // this unit test never invokes. So we reach into `.options.authorize` directly.
  const provider = authOptions.providers[0] as unknown as {
    options: {
      authorize: (c: Record<string, string> | undefined) => Promise<unknown>;
    };
  };
  return provider.options.authorize;
}

describe("admin credentials provider", () => {
  beforeAll(() => {
    process.env.ADMIN_EMAIL = "admin@test.local";
    process.env.ADMIN_PASSWORD_HASH = bcrypt.hashSync(PASSWORD, 10);
  });

  it("accepts the correct email and password", async () => {
    const user = await authorizeFn()({ email: "admin@test.local", password: PASSWORD });
    expect(user).toMatchObject({ id: "admin", email: "admin@test.local" });
  });

  it("rejects a wrong password", async () => {
    const user = await authorizeFn()({ email: "admin@test.local", password: "wrong" });
    expect(user).toBeNull();
  });

  it("rejects a wrong email", async () => {
    const user = await authorizeFn()({ email: "someone@else.com", password: PASSWORD });
    expect(user).toBeNull();
  });

  it("returns null when credentials are missing", async () => {
    const user = await authorizeFn()(undefined);
    expect(user).toBeNull();
  });
});
