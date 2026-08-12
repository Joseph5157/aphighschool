"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ADMIN_LINKS = [
  { href: "/admin", label: "Dashboard", icon: "📊" },
  { href: "/admin/posts", label: "Manage Posts", icon: "📝" },
  { href: "/admin/categories", label: "Categories", icon: "📁" },
  { href: "/", label: "View Public Site", icon: "🌐" },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-ink text-white min-h-screen p-5 flex flex-col justify-between shrink-0 font-mono text-xs border-r border-white/10 hidden md:flex">
      <div className="space-y-6">
        {/* Brand Header */}
        <div className="flex items-center gap-3 border-b border-white/10 pb-4">
          <div className="w-8 h-8 rounded-lg bg-turmeric text-ink font-bold flex items-center justify-center">
            AP
          </div>
          <div>
            <div className="font-bold text-white text-sm">AP Teacher Desk</div>
            <div className="text-[10px] text-white/50 uppercase tracking-wider">CMS Admin Panel</div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1">
          {ADMIN_LINKS.map((link) => {
            const isActive = link.href === "/admin" ? pathname === "/admin" : pathname.startsWith(link.href) && link.href !== "/";

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition-all ${
                  isActive
                    ? "bg-turmeric text-ink font-bold shadow-xs"
                    : "text-white/70 hover:text-white hover:bg-white/10"
                }`}
              >
                <span>{link.icon}</span>
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer */}
      <div className="border-t border-white/10 pt-4 text-[10px] text-white/40">
        AP Teacher Desk CMS v1.0
      </div>
    </aside>
  );
}
