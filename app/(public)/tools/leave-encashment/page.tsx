import type { Metadata } from "next";
import LeaveEncashmentUI from "./_components/LeaveEncashmentUI";

export const metadata: Metadata = {
  title: "Leave Encashment & Surrender Calculator for AP Teachers — AP Teacher Desk",
  description:
    "Free online Earned Leave (EL) surrender bill and retirement leave encashment calculator for AP and TS government school teachers. Instant client-side computation.",
};

export default function LeaveEncashmentPage() {
  return <LeaveEncashmentUI />;
}
