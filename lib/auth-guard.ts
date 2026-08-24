import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

/**
 * Server actions are POST endpoints reachable independently of route middleware.
 * middleware.ts guards /admin routes; it does NOT guard actions. Every mutating
 * action must call this as its first statement.
 */
export async function requireAdmin(): Promise<void> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    throw new Error("Unauthorized");
  }
}
