import type { Metadata } from "next";
import DaArrearsUI from "./_components/DaArrearsUI";

export const metadata: Metadata = {
  title: "DA Arrears Calculator for AP Teachers",
  description:
    "Free Dearness Allowance (DA) arrears calculator for AP government teachers. Enter old/new DA percentage and period for a month-by-month arrears estimate.",
  alternates: { canonical: "/tools/da-arrears" },
};

export default function DaArrearsPage() {
  return <DaArrearsUI />;
}
