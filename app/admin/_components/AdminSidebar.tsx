"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarCollapsible,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarTrigger,
  useSidebar,
} from "@/app/(public)/_components/Sidebar";

export default function AdminSidebar() {
  const pathname = usePathname();
  const { open, isMobile } = useSidebar();
  const collapsed = !open && !isMobile;

  if (pathname === "/admin/login") return null;

  return (

    <Sidebar collapsible="icon">
      {/* Brand Header */}
      <SidebarHeader>
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-turmeric text-ink font-bold flex items-center justify-center shrink-0">
            AP
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <div className="font-bold text-ink text-xs truncate">AP Teacher Desk</div>
              <div className="text-[10px] text-inkSoft/70 uppercase tracking-wider font-mono truncate">
                CMS Admin Panel
              </div>
            </div>
          )}
        </div>
        <SidebarTrigger className="shrink-0" />
      </SidebarHeader>

      {/* Main Navigation with Collapsible Submenus */}
      <SidebarContent>
        {/* Main Dashboard Group */}
        <SidebarGroup>
          <SidebarGroupLabel>Overview</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton href="/admin" icon="📊">
                  Dashboard
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Content Management Collapsible Submenu */}
        <SidebarGroup>
          <SidebarGroupLabel>Management</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarCollapsible title="Content & Posts" icon="📝" defaultOpen>
                <SidebarMenuSubItem>
                  <SidebarMenuSubButton href="/admin/posts">All Posts</SidebarMenuSubButton>
                </SidebarMenuSubItem>
                <SidebarMenuSubItem>
                  <SidebarMenuSubButton href="/admin/posts/new">Create New Post</SidebarMenuSubButton>
                </SidebarMenuSubItem>
                <SidebarMenuSubItem>
                  <SidebarMenuSubButton href="/orders">Categories</SidebarMenuSubButton>
                </SidebarMenuSubItem>
              </SidebarCollapsible>

              <SidebarCollapsible title="Teacher Tools" icon="🧮">
                <SidebarMenuSubItem>
                  <SidebarMenuSubButton href="/tools/tax-calculator">Tax Calculator</SidebarMenuSubButton>
                </SidebarMenuSubItem>
                <SidebarMenuSubItem>
                  <SidebarMenuSubButton href="/tools/prc-calculator">PRC Calculator</SidebarMenuSubButton>
                </SidebarMenuSubItem>
                <SidebarMenuSubItem>
                  <SidebarMenuSubButton href="/tools/gpf-apgli">GPF & APGLI</SidebarMenuSubButton>
                </SidebarMenuSubItem>
                <SidebarMenuSubItem>
                  <SidebarMenuSubButton href="/tools/cfms-checker">CFMS Status</SidebarMenuSubButton>
                </SidebarMenuSubItem>
              </SidebarCollapsible>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* External Links */}
        <SidebarGroup>
          <SidebarGroupLabel>Quick Links</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton href="/" icon="🌐">
                  View Public Site
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter>
        {!collapsed ? (
          <div className="text-[10px] text-inkSoft/70 font-mono">
            AP Teacher Desk v1.0
          </div>
        ) : (
          <div className="w-full text-center text-[10px] text-inkSoft font-mono">v1.0</div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}

