import type { Metadata } from "next";
import GpfApgliUI from "./_components/GpfApgliUI";

export const metadata: Metadata = {
  title: "GPF & APGLI Interest & Loan Calculator — AP Teacher Desk",
  description:
    "Free online GPF compound interest, Part-Final loan eligibility, and APGLI maturity estimator for AP & TS government teachers.",
};

export default function GpfApgliPage() {
  return <GpfApgliUI />;
}
