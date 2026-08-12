import Link from "next/link";
import Button from "@/app/(public)/_components/Button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/app/(public)/_components/Card";
import Badge from "@/app/(public)/_components/Badge";

const TOOLS = [
  {
    id: "tax-calculator",
    nameEn: "Income Tax Calculator",
    nameTe: "ఆదాయపు పన్ను గణన సాధనం",
    description: "Calculate FY 2025-26 & FY 2024-25 tax liability under New & Old regimes with AP Teacher pay heads (Basic, DA, HRA, 80C, 80D, 24B).",
    badge: "RUNS ON YOUR DEVICE",
    badgeVariant: "success" as const,
    href: "/tools/tax-calculator",
  },
  {
    id: "leave-encashment",
    nameEn: "Leave Encashment Calculator",
    nameTe: "లీవ్ ఎన్‌క్యాష్‌మెంట్ కాలిక్యులేటర్",
    description: "Earned leave & half-pay leave surrender bill encashment estimations for AP & TS teachers.",
    badge: "RUNS ON YOUR DEVICE",
    badgeVariant: "success" as const,
    href: "/tools/leave-encashment",
  },
  {
    id: "gpf-apgli",
    nameEn: "GPF / APGLI Calculator",
    nameTe: "జీపీఎఫ్ / ఏపీజీఎల్ఐ గణన",
    description: "General Provident Fund 7.1% interest growth, Part-Final loan eligibility & APGLI premium slab matcher.",
    badge: "RUNS ON YOUR DEVICE",
    badgeVariant: "success" as const,
    href: "/tools/gpf-apgli",
  },
  {
    id: "cfms-checker",
    nameEn: "CFMS Bill Status & Portal Checker",
    nameTe: "సీఎఫ్ఎమ్‌ఎస్ బిల్‌ స్టేటస్ & పోర్టల్ మార్గదర్శి",
    description: "Direct links and step-by-step guides for CFMS Teacher Payslips, Medical Reimbursement, EHS cards, & e-SR.",
    badge: "DIRECTORY & GUIDES",
    badgeVariant: "tamarind" as const,
    href: "/tools/cfms-checker",
  },
];

export default function ToolsIndexPage() {
  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="border-b border-hair pb-4">
        <h1 className="text-2xl font-bold text-ink tracking-tight">Utility Tools</h1>
        <p className="text-xs text-inkSoft font-mono mt-1">
          Client-Side Calculators & Utilities for AP & TS School Education Teachers
        </p>
      </div>

      {/* Tools Grid using Card, Badge, and Button Tier 1 Components */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {TOOLS.map((tool) => (
          <Card key={tool.id} hoverable className="flex flex-col justify-between">
            <div>
              <CardHeader className="border-b-0 pb-2">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <Badge variant={tool.badgeVariant} size="sm" shape="pill" dot>
                    {tool.badge}
                  </Badge>
                </div>
                <CardTitle>{tool.nameEn}</CardTitle>
                <div className="font-telugu text-xs text-inkSoft font-medium">
                  {tool.nameTe}
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                <p className="text-xs text-inkSoft/80 font-sans leading-relaxed">
                  {tool.description}
                </p>
              </CardContent>
            </div>

            <CardFooter className="bg-paper/50">
              <Link href={tool.href} className="w-full">
                <Button variant="primary" size="sm" fullWidth rightIcon={<span>→</span>}>
                  Open Tool
                </Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
