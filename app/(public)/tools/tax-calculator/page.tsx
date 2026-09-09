import type { Metadata } from "next";
import TaxCalculatorUI from "./_components/TaxCalculatorUI";

export const metadata: Metadata = {
  title: "Income Tax Calculator for AP Teachers",
  description:
    "Free income tax calculator for AP government teachers. New and Old regime slabs for FY 2025-26. Runs entirely on your device.",
  alternates: { canonical: "/tools/tax-calculator" },
};

export default function TaxCalculatorPage() {
  return <TaxCalculatorUI />;
}
