import type { Metadata } from "next";
import CfmsCheckerUI from "./_components/CfmsCheckerUI";

export const metadata: Metadata = {
  title: "CFMS Bill Status & Payslip Guide",
  description:
    "Direct links and guidance for AP CFMS teacher bill status, medical reimbursement tracking, EHS health card status, and e-SR verification.",
  alternates: { canonical: "/tools/cfms-checker" },
};

export default function CfmsCheckerPage() {
  return <CfmsCheckerUI />;
}
