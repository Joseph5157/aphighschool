import React from "react";
import Badge from "./Badge";

export interface GoirBadgeProps {
  /**
   * The document's recorded verification flag.
   *
   * Optional and nullable on purpose: several surfaces select a partial post
   * where the field may be absent. "Not recorded" and "recorded as false" mean
   * the same thing here — render nothing — so the type does not force callers
   * to invent a value for a check that never happened.
   */
  verified?: boolean | null;
  size?: "sm" | "md";
}

/**
 * The "GOIR Verified" marker.
 *
 * The rule this exists to hold in one place: **it renders only when a check was
 * recorded, and there is no unverified state.** Absence renders nothing — no
 * grey badge, no "not verified" label, no warning icon — because absence of a
 * recorded check is not evidence of a problem, and implying otherwise would
 * misrepresent our own coverage (docs/ui/DESIGN_SYSTEM.md §12.2).
 *
 * Ten call sites across eight files each re-derived `verified && <Badge …>`.
 * That worked, but it left the rule as a convention any new surface could get
 * wrong by adding an `: <Badge>Unverified</Badge>` else-branch. Here it is
 * unexpressible: the component takes a boolean and can only return the positive
 * marker or nothing.
 *
 * Styled as metadata rather than a promotional badge — provenance, not a
 * quality rating (§12.1).
 */
export function GoirBadge({ verified, size = "sm" }: GoirBadgeProps) {
  if (!verified) return null;

  return (
    <Badge variant="tamarind" size={size} shape="pill" dot>
      GOIR Verified
    </Badge>
  );
}

export default GoirBadge;
