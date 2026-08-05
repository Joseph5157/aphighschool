"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    if (res?.error) {
      setError("Invalid email or password.");
    } else {
      router.push("/admin/posts");
      router.refresh();
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-8 bg-paper">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-paperRaised border border-hair rounded-xl p-8"
      >
        <h1 className="text-lg font-bold mb-1">Admin Login</h1>
        <p className="text-xs text-inkSoft mb-6 font-mono">Solo-operator access only</p>

        <label className="block text-xs font-mono uppercase text-inkSoft mb-1">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-hair rounded-lg px-3 py-2 mb-4 text-sm"
          required
        />

        <label className="block text-xs font-mono uppercase text-inkSoft mb-1">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border border-hair rounded-lg px-3 py-2 mb-4 text-sm"
          required
        />

        {error && <p className="text-kumkum text-xs mb-4">{error}</p>}

        <button
          type="submit"
          className="w-full bg-ink text-white rounded-lg py-2.5 text-sm font-semibold"
        >
          Sign in
        </button>
      </form>
    </main>
  );
}
