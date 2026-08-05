import { Providers } from "../providers";
import AdminNav from "./_components/AdminNav";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <Providers>
      <div className="min-h-screen bg-paper flex">
        <AdminNav />
        <div className="flex-1 p-8">{children}</div>
      </div>
    </Providers>
  );
}
