"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

export default function AdminNav() {
  const pathname = usePathname();
  if (pathname === "/admin/login") return null;

  return (
    <nav className="w-56 border-r border-hair bg-paperRaised p-6 flex flex-col">
      <div className="font-bold mb-8">Portal Admin</div>
      <Link href="/admin/posts" className="text-sm mb-3 hover:text-turmericDeep">
        Posts
      </Link>
      <Link href="/admin/posts/new" className="text-sm mb-3 hover:text-turmericDeep">
        + New Post
      </Link>
      <button
        onClick={() => signOut({ callbackUrl: "/admin/login" })}
        className="mt-auto text-xs font-mono text-inkSoft text-left"
      >
        Sign out
      </button>
    </nav>
  );
}
