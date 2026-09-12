import type { MetadataRoute } from "next";
import { SITE_NAME } from "@/lib/site";

/**
 * PWA-FOUNDATION-1 — installability only.
 *
 * Next.js serves this at /manifest.webmanifest and injects the <link
 * rel="manifest"> itself, so no PWA library and no manual tag are needed.
 *
 * This gate deliberately adds NO service worker and NO caching. Per
 * docs/context/PWA_AUDIT.md, caching is the dangerous half of a PWA for this
 * product: government orders, documents, search and category results carry
 * lifecycle state and GOIR verification, and `revalidatePath()` cannot reach a
 * cache living on a reader's device. Installability is safe on its own because
 * it changes no request handling.
 *
 * PWA-SW-1 correction: `start_url` was originally "/", but "/" is
 * NETWORK_ONLY (docs/context/PWA_SW_DESIGN.md) — a cold offline launch of
 * the installed app from "/" would have nothing to render. `/tools` is
 * STATIC_SAFE, precached by PWA-SW-1, and is the shell that reaches every
 * OFFLINE_SAFE calculator, so it is the correct offline entry point.
 * `scope` stays "/" — this only changes where the app opens, not what the
 * service worker controls. `id` stays "/" on purpose (see below) so this
 * is read as an update to the existing installed app, not a new one.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    // Pins app identity. Without it, a later start_url change would register
    // as a different app rather than an update to this one.
    id: "/",
    name: `${SITE_NAME} — AP School Education Orders & Circulars`,
    short_name: SITE_NAME,
    description:
      "Telugu-first summaries of AP School Education government orders, circulars and " +
      "teacher notifications, with lifecycle status and provenance shown for each, plus " +
      "pay, tax, pension and leave calculators. Independent and unofficial.",
    start_url: "/tools",
    scope: "/",
    display: "standalone",
    // Matches the light-mode `viewport.themeColor` already declared in
    // app/(public)/layout.tsx and the --color-masthead token.
    theme_color: "#1B2A4A",
    // The same navy as the icons' own background, so the splash screen shows
    // no icon edge. Deliberately not the light paper (#EDE8DC): a cream splash
    // would flash bright before a dark-mode reader's first paint.
    background_color: "#1B2A4A",
    orientation: "any",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      // Full-bleed, opaque, glyphs inside the central 80% safe circle, so
      // Android can crop it to any silhouette without clipping the mark.
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
