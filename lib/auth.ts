import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

// Solo-operator model (blueprint Section 4.2): one admin, no user management UI needed.
// The password is never stored or compared in plain text: ADMIN_PASSWORD_HASH holds a
// bcrypt hash (generate one with scripts/hash-password.ts) and authorize() below
// compares the submitted password against it with bcrypt.compare.
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
        if (!credentials?.email || !credentials?.password) return null;

        const adminEmail = process.env.ADMIN_EMAIL;
        const adminHash = process.env.ADMIN_PASSWORD_HASH;

        if (!adminEmail || !adminHash) {
          throw new Error("ADMIN_EMAIL / ADMIN_PASSWORD_HASH not set in .env");
        }

        if (credentials.email !== adminEmail) return null;

        const ok = await bcrypt.compare(credentials.password, adminHash);
        if (!ok) return null;

        return { id: "admin", email: adminEmail, name: "Admin" };
      },
    }),
  ],
};
