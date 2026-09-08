"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

type BottomBarContextValue = {
  claimed: boolean;
  claim: () => void;
  release: () => void;
};

const BottomBarContext = createContext<BottomBarContextValue | null>(null);

/**
 * Arbitrates the single fixed bottom bar a route is allowed
 * (docs/ui/DESIGN_SYSTEM.md §5.4).
 *
 * Audit finding F1: post detail pages mounted TWO of them. `ThumbZoneBar` is
 * `fixed bottom-0` with no responsive hiding, and `BottomNav` is `fixed
 * bottom-0 lg:hidden`, so below 1024px both occupied the same strip — and the
 * shell reserved room for one, so article content sat under them as well.
 *
 * They cannot simply hide each other with CSS: one is rendered by the layout
 * and the other by the page, so neither knows the other exists. This is the
 * smallest thing that lets them agree — a page-level bar claims the slot, and
 * the site-wide nav yields while it is held.
 *
 * Navigation is not lost when the nav bar yields: the sticky header carries the
 * menu trigger at every width.
 */
export function BottomBarProvider({ children }: { children: React.ReactNode }) {
  const [claims, setClaims] = useState(0);

  const value = useMemo<BottomBarContextValue>(
    () => ({
      claimed: claims > 0,
      claim: () => setClaims((n) => n + 1),
      release: () => setClaims((n) => Math.max(0, n - 1)),
    }),
    [claims],
  );

  return <BottomBarContext.Provider value={value}>{children}</BottomBarContext.Provider>;
}

/**
 * Claims the bottom-bar slot for as long as the calling component is mounted.
 *
 * Counted rather than boolean so that a route rendering two claimants — a bug,
 * but a survivable one — does not release the slot when only the first
 * unmounts.
 */
export function useClaimBottomBar(): void {
  const context = useContext(BottomBarContext);

  useEffect(() => {
    if (!context) return;
    context.claim();
    return context.release;
    // Claim once per mount. `context` identity changes whenever the count
    // changes, so depending on it here would release and re-claim in a loop.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

/** True while a page-level bar holds the slot. */
export function useBottomBarClaimed(): boolean {
  return useContext(BottomBarContext)?.claimed ?? false;
}
