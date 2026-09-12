import type { Metadata } from "next";
import OfflineContent from "./_components/OfflineContent";

// No database dependency, no server-side data of any kind — this route must
// remain safe to precache and correct to serve from Cache Storage with zero
// network access. See app/sw.ts and docs/context/PWA_SW_DESIGN.md.
export const metadata: Metadata = {
  title: "You're Offline",
  robots: { index: false, follow: false },
};

export default function OfflinePage() {
  return <OfflineContent />;
}
