import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Portal CMS — Local Dev",
  description: "AP Teachers Living Document Portal — admin CMS",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
