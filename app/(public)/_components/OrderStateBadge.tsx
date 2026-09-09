import type { OrderState } from "@prisma/client";
import Badge from "./Badge";
import { ORDER_STATE_VARIANT } from "./lifecyclePill";

const EXPLANATION: Record<OrderState, string> = {
  current: "This order is in force.",
  amended: "This order has been amended by a later order.",
  superseded: "This order has been replaced by a later order.",
  archived: "Historical record, no longer in force.",
};

/**
 * A document's lifecycle state, in a word plus a plain-language sentence.
 *
 * SLOP-DETAIL-1 (AI_SLOP_AUDIT.md A09) turned this from a standalone
 * full-width card into the strip that opens the document header. It used to be
 * its own bordered panel, labelled "Document Status", sitting above a second
 * bordered masthead that repeated the category, reference, department and date
 * a third card then repeated again — three large panels before the order text.
 *
 * The label went with the card: the state word and its sentence say what this
 * is, and a heading above them naming the concept added nothing. Both the word
 * and the sentence stay, because DESIGN_SYSTEM.md §2.4 forbids carrying a
 * status in colour alone, and this is the most consequential fact on the page.
 *
 * It stays on paper rather than moving onto the navy masthead: the badge
 * variants are tinted fills built for the paper ground, and putting the
 * product's single most important marker on a ground its contrast was never
 * measured against would be trading a real risk for a cosmetic one.
 */
export default function OrderStateBadge({
  state,
  label,
}: {
  state: OrderState;
  label: string;
}) {
  return (
    <div className="bg-paperRaised px-4 py-3 md:px-6 flex items-center gap-3 flex-wrap">
      <Badge variant={ORDER_STATE_VARIANT[state]} size="sm" shape="pill" dot>
        {label}
      </Badge>
      <span className="text-body text-inkSoft">{EXPLANATION[state]}</span>
    </div>
  );
}
