"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import Button from "@/app/(public)/_components/Button";
import Badge from "@/app/(public)/_components/Badge";

export default function AdminNav() {
  const pathname = usePathname();
  if (pathname === "/admin/login") return null;

  const NAV_ITEMS = [
    { href: "/admin/posts", label: "All Posts", icon: "📄" },
    { href: "/admin/posts/new", label: "Create Post", icon: "➕" },
    { href: "/", label: "View Website", icon: "🌐" },
  ];

  return (
    <nav className="w-64 border-r border-hair bg-paperRaised p-6 flex flex-col justify-between font-sans min-h-screen">
      <div className="space-y-6">
        <div className="flex items-center gap-2 border-b border-hair pb-4">
          <div className="w-8 h-8 rounded-lg bg-ink text-turmeric font-mono font-bold flex items-center justify-center">
            AP
          </div>
          <div>
            <div className="font-bold text-sm text-ink">AP Teacher Desk</div>
            <div className="text-[10px] font-mono text-inkSoft uppercase">Admin CMS</div>
          </div>
        </div>

        <div className="space-y-1 font-mono text-xs">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition-all ${
                  isActive
                    ? "bg-ink text-white font-bold shadow-xs"
                    : "text-inkSoft hover:text-ink hover:bg-hair/30"
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      <div className="border-t border-hair pt-4 space-y-3">
        <Badge variant="success" size="sm" shape="pill" dot>
          Admin Authenticated
        </Badge>
        <Button
          variant="outline"
          size="sm"
          fullWidth
          onClick={() => signOut({ callbackUrl: "/admin/login" })}
        >
          Sign Out
        </Button>
      </div>
    </nav>
  );
}
