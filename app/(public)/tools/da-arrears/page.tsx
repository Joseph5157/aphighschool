import type { Metadata } from "next";
import DaArrearsUI from "./_components/DaArrearsUI";

export const metadata: Metadata = {
  title: "DA Arrears Calculator for AP Teachers — AP Teacher Desk",
  description:
    "Free online Dearness Allowance (DA) arrears calculator for AP and TS government teachers. Enter your old/new DA percentage and period to get an instant month-by-month arrears estimate.",
};

export default function DaArrearsPage() {
  return <DaArrearsUI />;
}
