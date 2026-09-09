import type { Metadata } from "next";
import LeaveEncashmentUI from "./_components/LeaveEncashmentUI";

export const metadata: Metadata = {
  title: "Leave Encashment & Surrender Calculator",
  description:
    "Free Earned Leave (EL) surrender bill and retirement leave encashment calculator for AP government school teachers. Client-side computation.",
  alternates: { canonical: "/tools/leave-encashment" },
};

export default function LeaveEncashmentPage() {
  return <LeaveEncashmentUI />;
}
