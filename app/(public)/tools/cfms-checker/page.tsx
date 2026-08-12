import type { Metadata } from "next";
import CfmsCheckerUI from "./_components/CfmsCheckerUI";

export const metadata: Metadata = {
  title: "CFMS Bill Status & Govt Portals Directory for AP Teachers — AP Teacher Desk",
  description:
    "Direct links and step-by-step guidance for AP CFMS Teacher Bill Status, Medical Reimbursement tracking, EHS Health Card status, and e-SR verification.",
};

export default function CfmsCheckerPage() {
  return <CfmsCheckerUI />;
}
