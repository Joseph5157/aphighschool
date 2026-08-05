import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

// Solo-operator model (blueprint Section 4.2): one admin, no user management UI needed.
// For local dev this compares plain env values. Before any real deployment, swap the
// password check for a hashed comparison (e.g. bcrypt) — do not ship plain-text compare.
export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: { signIn: "/admin/login" },
  providers: [
    CredentialsProvider({
      name: "Admin Login",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials) return null;
        const adminEmail = process.env.ADMIN_EMAIL;
        const adminPassword = process.env.ADMIN_PASSWORD;

        if (!adminEmail || !adminPassword) {
          throw new Error("ADMIN_EMAIL / ADMIN_PASSWORD not set in .env");
        }

        if (credentials.email === adminEmail && credentials.password === adminPassword) {
          return { id: "admin", email: adminEmail, name: "Admin" };
        }
        return null;
      },
    }),
  ],
};
