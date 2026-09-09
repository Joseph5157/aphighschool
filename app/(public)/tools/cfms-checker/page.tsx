import type { Metadata } from "next";
import CfmsCheckerUI from "./_components/CfmsCheckerUI";

export const metadata: Metadata = {
  title: "CFMS Bill Status & Payslip Guide",
  description:
    "Direct links for AP CFMS teacher bill status, GPF statements, medical reimbursement tracking, and EHS health card status, plus e-SR correction guidance.",
  alternates: { canonical: "/tools/cfms-checker" },
};

export default function CfmsCheckerPage() {
  return <CfmsCheckerUI />;
}
