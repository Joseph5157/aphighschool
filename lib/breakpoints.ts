/**
 * Breakpoints shared between CSS and JavaScript.
 *
 * These mirror Tailwind's defaults. They exist as a module so a JS viewport
 * check cannot drift from the CSS that governs the same element: the sidebar
 * switched between its drawer and desktop behaviour at 768px while the bottom
 * tab bar and desktop nav switched at Tailwind's `lg` (1024px), so viewports
 * between 768px and 1023px got a mixed navigation model — a desktop push
 * sidebar and a mobile tab bar at the same time.
 *
 * docs/ui/DESIGN_SYSTEM.md §9.1 fixes `lg` as the single navigation breakpoint.
 */
export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
} as const;

/**
 * The one breakpoint at which the whole navigation model changes.
 *
 * Below it: bottom tab bar plus off-canvas drawer. At and above it: desktop
 * navigation and rails, no bottom bar. Anything that branches on "is this the
 * mobile navigation?" must use this value and the `lg:` Tailwind variant, never
 * a second hand-written number.
 */
export const NAV_BREAKPOINT = BREAKPOINTS.lg;
