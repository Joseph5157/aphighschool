import type { Metadata } from "next";
import Breadcrumb from "@/app/(public)/_components/Breadcrumb";
import ToolsSidebar from "@/app/(public)/tools/_components/ToolsSidebar";
import PrcCalculatorUI from "./_components/PrcCalculatorUI";

export const metadata: Metadata = {
  title: "PRC Pay Fixation & Arrears Calculator — AP Teacher Desk",
  description:
    "Interactive AP RPS 2022 Master Scale Pay Fixation & Arrears Calculator for government teachers and employees in Andhra Pradesh and Telangana.",
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

      <div className="lg:grid lg:grid-cols-12 lg:gap-6 xl:gap-8 space-y-8 lg:space-y-0">
        <div className="lg:col-span-8">
          <PrcCalculatorUI />
        </div>
        <div className="lg:col-span-4">
          <ToolsSidebar />
        </div>
      </div>
    </div>
  );
}
