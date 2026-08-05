import Link from "next/link";

const TOOLS = [
  {
    id: "tax-calculator",
    nameEn: "Income Tax Calculator",
    nameTe: "ఆదాయపు పన్ను గణన సాధనం",
    description: "Calculate FY 2025-26 tax liability under New & Old regimes.",
    badge: "RUNS ON YOUR DEVICE",
    badgeType: "ready",
    href: "/tools/tax-calculator",
  },
  {
    id: "leave-encashment",
    nameEn: "Leave Encashment Calculator",
    nameTe: "లీవ్ ఎన్‌క్యాష్‌మెంట్ కాలిక్యులేటర్",
    description: "Earned leave & half-pay leave encashment estimations for retiring teachers.",
    badge: "COMING SOON",
    badgeType: "soon",
    href: "#",
  },
  {
    id: "gpf-apgli",
    nameEn: "GPF / APGLI Calculator",
    nameTe: "జీపీఎఫ్ / ఏపీజీఎల్ఐ గణన",
    description: "General Provident Fund and APGLI maturity & loan eligibility estimator.",
    badge: "COMING SOON",
    badgeType: "soon",
    href: "#",
  },
  {
    id: "esr-manual",
    nameEn: "e-SR Manual & Checker",
    nameTe: "ఈ-ఎస్ఆర్ మార్గదర్శకాలు",
    description: "Electronic Service Register entries checklist & verification rules.",
    badge: "COMING SOON",
    badgeType: "soon",
    href: "#",
  },
  {
    id: "cfms-checker",
    nameEn: "CFMS Bill Status Checker",
    nameTe: "సీఎఫ్ఎమ్‌ఎస్ బిల్‌ స్టేటస్",
    description: "Comprehensive Financial Management System bill tracking guidance.",
    badge: "COMING SOON",
    badgeType: "soon",
    href: "#",
  },
];

export default function ToolsIndexPage() {
  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="border-b border-hair pb-4">
        <h1 className="text-2xl font-bold text-ink tracking-tight">Utility Tools</h1>
        <p className="text-xs text-inkSoft font-mono mt-1">
          Client-Side Calculators & Utilities for AP School Education Teachers
        </p>
      </div>

      {/* Tools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {TOOLS.map((tool) => {
          const isReady = tool.badgeType === "ready";

          return (
            <div
              key={tool.id}
              className={`bg-paperRaised border border-hair rounded-xl p-5 flex flex-col justify-between transition-all ${
                isReady ? "hover:border-ink/30 hover:shadow-xs" : "opacity-75"
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span
                    className={`font-mono text-[9px] uppercase tracking-wider px-2 py-0.5 rounded font-semibold ${
                      isReady
                        ? "bg-tamarind/10 text-tamarind border border-tamarind/20"
                        : "bg-hair/50 text-inkSoft"
                    }`}
                  >
                    {tool.badge}
                  </span>
                </div>

                <h2 className="font-bold text-base text-ink">{tool.nameEn}</h2>
                <div className="font-telugu text-xs text-inkSoft mt-0.5 font-medium">
                  {tool.nameTe}
                </div>

                <p className="text-xs text-inkSoft/80 font-sans mt-3 leading-relaxed">
                  {tool.description}
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-hair/50">
                {isReady ? (
                  <Link
                    href={tool.href}
                    className="inline-flex items-center gap-1 text-xs font-mono font-semibold text-ink hover:text-turmericDeep transition-colors"
                  >
                    Open Tool →
                  </Link>
                ) : (
                  <span className="text-xs font-mono text-inkSoft/60 cursor-not-allowed">
                    Under Development
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
