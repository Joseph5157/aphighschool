import type { Metadata } from "next";
import Breadcrumb from "@/app/(public)/_components/Breadcrumb";
import PensionersSidebar from "@/app/(public)/pensioners/_components/PensionersSidebar";
import PensionCalculatorUI from "./_components/PensionCalculatorUI";

export const metadata: Metadata = {
  title: "Service Pension & Gratuity Calculator — AP Teacher Desk",
  description:
    "Calculate Service Pension, 40% Commutation lump sum, DCRG Gratuity, and EL Encashment benefits under AP Revised Pension Rules.",
};

export default function PensionCalculatorPage() {
  return (
    <div className="space-y-6 font-sans">
      <Breadcrumb
        items={[
          { label: "Pensioners Hub", href: "/pensioners" },
          { label: "Pension & Gratuity Calculator" },
        ]}
      />

      <div className="lg:grid lg:grid-cols-12 lg:gap-6 xl:gap-8 space-y-8 lg:space-y-0">
        <div className="lg:col-span-8">
          <PensionCalculatorUI />
        </div>
        <div className="lg:col-span-4">
          <PensionersSidebar />
        </div>
      </div>
    </div>
  );
}
