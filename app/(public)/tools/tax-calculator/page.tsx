import type { Metadata } from "next";
import TaxCalculatorUI from "./_components/TaxCalculatorUI";

export const metadata: Metadata = {
  title: "Income Tax Calculator for AP Teachers — AP Teacher Desk",
  description:
    "Free income tax calculator for AP government teachers. New and Old regime slabs for FY 2025-26. Runs entirely on your device.",
};

export default function TaxCalculatorPage() {
  return <TaxCalculatorUI />;
}
