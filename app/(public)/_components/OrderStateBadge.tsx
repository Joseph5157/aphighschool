import type { OrderState } from "@prisma/client";
import Badge from "./Badge";

// Badge has no `kumkum` variant today, so `superseded` uses `tamarind` — the
// nearest existing red-family variant. It cannot fall back to `neutral`: that
// is already `archived`, and the two states would render identically. Adding a
// real `kumkum` Badge token is a Milestone F item.
const VARIANT: Record<OrderState, "success" | "turmeric" | "tamarind" | "neutral"> = {
  current: "success",
  amended: "turmeric",
  superseded: "tamarind",
  archived: "neutral",
};

const EXPLANATION: Record<OrderState, string> = {
  current: "This order is in force.",
  amended: "This order has been amended by a later order.",
  superseded: "This order has been replaced by a later order.",
  archived: "Historical record, no longer in force.",
};

export default function OrderStateBadge({
  state,
  label,
}: {
  state: OrderState;
  label: string;
}) {
  return (
    <div className="w-full bg-paperRaised border border-hair rounded-xl p-4 md:p-5 mb-6">
      <div className="text-[10px] font-mono tracking-wider text-inkSoft mb-2">
        Document Status
      </div>
      <div className="flex items-center gap-3 flex-wrap">
        <Badge variant={VARIANT[state]} size="sm" shape="pill" dot>
          {label}
        </Badge>
        <span className="text-xs text-inkSoft">{EXPLANATION[state]}</span>
      </div>
    </div>
  );
}
