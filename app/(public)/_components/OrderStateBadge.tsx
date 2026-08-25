import type { OrderState } from "@prisma/client";
import Badge from "./Badge";
import { ORDER_STATE_VARIANT } from "./lifecyclePill";

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
        <Badge variant={ORDER_STATE_VARIANT[state]} size="sm" shape="pill" dot>
          {label}
        </Badge>
        <span className="text-xs text-inkSoft">{EXPLANATION[state]}</span>
      </div>
    </div>
  );
}
