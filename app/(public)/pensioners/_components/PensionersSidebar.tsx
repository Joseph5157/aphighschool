import React from "react";
import Link from "next/link";
import { Card } from "@/app/(public)/_components/Card";
import Badge from "@/app/(public)/_components/Badge";

const HELPFUL_PORTALS = [
  {
    title: "AG AP Pension Portal",
    url: "https://agap.cas.nic.in",
    desc: "Track PPO / GPO / CPO status at Accountant General Office (Vijayawada)",
  },
  {
    title: "CFMS NIDHI Portal",
    url: "https://cfms.ap.gov.in",
    desc: "RBPS online pension proposal submission & DDO status",
  },
  {
    title: "Jeevan Pramaan Portal",
    url: "https://jeevanpramaan.gov.in",
    desc: "Digital Life Certificate submission via Face Auth App",
  },
  {
    title: "AP EHS Health Portal",
    url: "https://www.ehs.ap.gov.in",
    desc: "Check EHS health card status & network hospitals",
  },
];

export default function PensionersSidebar() {
  return (
    <div className="space-y-6">
      {/* Current Pensioner DR Rates Widget */}
      <Card className="p-5 space-y-4 bg-paperRaised border-hair">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold font-mono text-ink uppercase tracking-wide">
            Treasury DR Standards
          </h3>
          <Badge variant="turmeric" size="sm">
            AP Treasury
          </Badge>
        </div>

        <div className="space-y-3 font-mono text-xs">
          <div className="flex justify-between items-center py-1 border-b border-hair">
            <span className="text-inkSoft">Current DR Rate:</span>
            <span className="font-bold text-ink">30.392%</span>
          </div>
          <div className="flex justify-between items-center py-1 border-b border-hair">
            <span className="text-inkSoft">Max Commutation:</span>
            <span className="font-bold text-ink">40% Basic</span>
          </div>
          <div className="flex justify-between items-center py-1 border-b border-hair">
            <span className="text-inkSoft">Commutation Recovery:</span>
            <span className="font-bold text-ink">15 Yrs (180 Mo)</span>
          </div>
          <div className="flex justify-between items-center py-1">
            <span className="text-inkSoft">Gratuity Limit:</span>
            <span className="font-bold text-emerald-700">₹16.00 Lakhs</span>
          </div>
        </div>
      </Card>

      {/* Official Government Portals for Pensioners */}
      <Card className="p-5 space-y-4 bg-paperRaised border-hair">
        <h3 className="text-xs font-bold font-mono text-ink uppercase tracking-wide">
          Official Pension Portals
        </h3>

        <div className="space-y-3">
          {HELPFUL_PORTALS.map((portal) => (
            <a
              key={portal.title}
              href={portal.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block p-3 rounded-lg border border-hair hover:border-turmeric/50 hover:bg-ink/5 transition-all group"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-ink group-hover:text-tamarind">
                  {portal.title}
                </span>
                <span className="text-xs text-inkSoft">↗</span>
              </div>
              <p className="text-[11px] text-inkSoft font-mono mt-1 leading-snug">
                {portal.desc}
              </p>
            </a>
          ))}
        </div>
      </Card>
    </div>
  );
}
