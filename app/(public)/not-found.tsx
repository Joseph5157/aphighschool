import type { Metadata } from "next";
import NotFoundContent from "./_components/NotFoundContent";

export const metadata: Metadata = {
  title: "Page Not Found",
  robots: { index: false, follow: true },
};

export default function PublicNotFound() {
  return <NotFoundContent />;
}
