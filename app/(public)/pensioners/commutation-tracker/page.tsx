import type { Metadata } from "next";
import Breadcrumb from "@/app/(public)/_components/Breadcrumb";
import PensionersSidebar from "@/app/(public)/pensioners/_components/PensionersSidebar";
import CommutationTrackerUI from "./_components/CommutationTrackerUI";

export const metadata: Metadata = {
  title: "Commutation 180-Month Restoration Tracker — AP Teacher Desk",
  description:
    "Track the 180-month recovery timeline for 40% commuted pension and generate an application to STO Treasury for full basic pension restoration.",
};

export default function CommutationTrackerPage() {
  return (
    <div className="space-y-6 font-sans">
      <Breadcrumb
        items={[
          { label: "Pensioners Hub", href: "/pensioners" },
          { label: "Commutation Restoration Tracker" },
        ]}
      />

      <div className="lg:grid lg:grid-cols-12 lg:gap-6 xl:gap-8 space-y-8 lg:space-y-0">
        <div className="lg:col-span-8">
          <CommutationTrackerUI />
        </div>
        <div className="lg:col-span-4">
          <PensionersSidebar />
        </div>
      </div>
    </div>
  );
}
