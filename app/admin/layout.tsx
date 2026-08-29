import { Providers } from "../providers";
import { SidebarProvider, SidebarInset } from "@/app/(public)/_components/Sidebar";
import AdminSidebar from "./_components/AdminSidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <Providers>
      <SidebarProvider defaultOpen={true}>
        <AdminSidebar />
        <SidebarInset className="p-6 md:p-8">
          {children}
        </SidebarInset>
      </SidebarProvider>
    </Providers>
  );
}

