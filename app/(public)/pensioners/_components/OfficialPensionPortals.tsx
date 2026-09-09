import React from "react";

/**
 * The official government portals a retired teacher actually has to visit, with
 * one line each saying what the portal is for.
 *
 * This was `PensionersSidebar`, and it opened with a "Treasury DR Standards"
 * card: four hardcoded figures (DR rate, commutation ceiling, recovery period,
 * gratuity limit) under an "AP Treasury" badge, with no source, no effective
 * date, no GO reference and no verification field — the same unsourced-authority
 * pattern SLOP-REMOVE-1 deleted from the tools sidebar (AI_SLOP_AUDIT.md A13),
 * on a page whose readers are making pension decisions. It also painted its
 * gratuity figure with `text-emerald-700`, a raw Tailwind palette colour that
 * DESIGN_SYSTEM.md R0.2 bans outright and that does not flip in dark mode.
 *
 * The links stayed: they are sourced guidance a reader needs in order to choose
 * a task, which A15 protects. Every URL here was live-checked in `UI-LINKS-1`
 * (see test/external-links.test.ts).
 */
const HELPFUL_PORTALS = [
  {
    title: "AG AP Pension Portal",
    url: "https://agaeap.cag.gov.in/Pension/Home",
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

export default function OfficialPensionPortals() {
  return (
    <section aria-label="Official pension portals" className="space-y-3 pt-4 border-t border-hair">
      <h2 className="text-section text-ink">Official pension portals</h2>

      {/* One column at every width: this also renders inside the narrow rail on
          the three pension sub-pages, where a second column would crush it. */}
      <ul>
        {HELPFUL_PORTALS.map((portal) => (
          <li key={portal.title}>
            <a
              href={portal.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-baseline justify-between gap-3 py-3 border-b border-hair/60"
            >
              <span className="min-w-0">
                <span className="block text-card-title text-ink group-hover:text-tamarind transition-colors">
                  {portal.title}
                </span>
                <span className="block text-body text-inkSoft">{portal.desc}</span>
              </span>
              <span aria-hidden="true" className="text-inkSoft shrink-0">↗</span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
