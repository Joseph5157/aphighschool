import type { Metadata } from "next";
import GpfApgliUI from "./_components/GpfApgliUI";

export const metadata: Metadata = {
  title: "GPF & APGLI Interest & Loan Calculator",
  description:
    "Free GPF compound interest, Part-Final loan eligibility, and APGLI maturity estimator for AP government teachers.",
  alternates: { canonical: "/tools/gpf-apgli" },
};

export default function GpfApgliPage() {
  return <GpfApgliUI />;
}
