import type { Metadata } from "next";
import Breadcrumb from "@/app/(public)/_components/Breadcrumb";
import PrcCalculatorUI from "./_components/PrcCalculatorUI";

export const metadata: Metadata = {
  title: "PRC Pay Fixation & Arrears Calculator",
  description:
    "AP RPS 2022 Master Scale pay fixation and arrears calculator for government teachers and employees in Andhra Pradesh.",
  alternates: { canonical: "/tools/prc-calculator" },
};

export default function PrcCalculatorPage() {
  return (
    <div className="space-y-6 font-sans">
      <Breadcrumb
        items={[
          { label: "Utility Tools", href: "/tools" },
          { label: "PRC Pay Fixation Calculator" },
        ]}
      />

      {/*
        The 8/4 split existed only to hold ToolsSidebar, removed by SLOP-REMOVE-1
        (AI_SLOP_AUDIT.md A13). The calculator now owns the full width.
      */}
      <PrcCalculatorUI />
    </div>
  );
}
