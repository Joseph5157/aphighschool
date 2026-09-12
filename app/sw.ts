/// <reference lib="webworker" />

// PWA-SW-1 / PWA-OFFLINE-UX-1. Implements exactly what
// docs/context/PWA_SW_DESIGN.md decided and nothing else. Read that document
// before changing anything here.
//
// This file deliberately does NOT import `defaultCache` from
// "@serwist/next/worker". Inspecting that export directly (see the
// PWA-SW-1 report) shows it registers NetworkFirst handlers for RSC
// (`RSC: 1`), RSC prefetch (`Next-Router-Prefetch: 1`), and every HTML
// document on the site — which would cache government-order and document
// pages this product must never serve stale. `runtimeCaching` stays empty
// in the constructor: PWA v1 caches nothing at runtime as a side effect of
// a network request succeeding. The only offline capability this worker
// provides is the precache built at compile time (see next.config.js),
// scoped to the seven OFFLINE_SAFE calculators, their two navigational
// shells, the offline fallback page below, and their required static
// assets.
//
// One runtime ROUTE is registered below, after construction — a navigation
// fallback, not a caching strategy. It uses NetworkOnly, which never reads
// or writes Cache Storage, and only supplies a precached response when the
// network genuinely fails. See PWA-OFFLINE-UX-1's report for why this is
// architecturally distinct from NetworkFirst/StaleWhileRevalidate.
//
// Because a precache match always wins first (Serwist registers its
// PrecacheRoute before any runtime route, and routing is first-match-wins —
// verified by reading serwist/src/Serwist.ts), the fallback below never
// intercepts a calculator or shell document: those already match the
// precache directly. It only ever runs for a real document navigation to
// something NOT precached — i.e. every freshness-sensitive route, and any
// STATIC_SAFE page this project chose not to precache.
//
// RSC requests are unaffected by any of this: `request.mode` for an RSC
// fetch is not "navigate" (verified in PWA-SW-DESIGN-1's F2), so the
// fallback route below never matches one, on any route, calculators
// included. Every RSC request — `?_rsc=` on any path — falls straight
// through to the network exactly as before.
import type { PrecacheEntry } from "serwist";
import { NetworkOnly, PrecacheFallbackPlugin, Serwist } from "serwist";

// __SW_MANIFEST is a webpack DefinePlugin-style string replacement performed
// by @serwist/next's InjectManifest plugin at build time (injectionPoint
// "self.__SW_MANIFEST"), not a real runtime global — there is no upstream
// type for it.
declare const self: ServiceWorkerGlobalScope & {
  __SW_MANIFEST: (PrecacheEntry | string)[];
};

const OFFLINE_FALLBACK_URL = "/offline";

/**
 * Admin and NextAuth paths stay outside the service worker's behaviour
 * entirely — not just outside caching, per PWA_SW_DESIGN.md §10's
 * `isExcludedFromServiceWorker`. A failed offline navigation to /admin falls
 * through with no route matching at all, so the browser shows its own
 * native offline error exactly as it would with no service worker present.
 */
function isExcludedFromNavigationFallback(pathname: string): boolean {
  return pathname === "/admin" || pathname.startsWith("/admin/") || pathname.startsWith("/api/");
}

const serwist = new Serwist({
  // Injected by @serwist/next's webpack plugin at build time from the
  // explicit `chunks` and `additionalPrecacheEntries` scoping in
  // next.config.js — never Serwist's own default glob.
  precacheEntries: self.__SW_MANIFEST,

  // Conservative lifecycle for this gate. A newly installed worker does
  // not seize existing tabs; that is PWA-UPDATE-1's decision to make
  // deliberately, not a default to fall into here.
  skipWaiting: false,
  clientsClaim: false,
  navigationPreload: false,

  // No blanket runtime caching strategy of any kind.
  runtimeCaching: [],
});

// The one navigation fallback: real document navigations only (RSC and
// every other request type never reach this), excluding admin/auth, using a
// strategy that never touches Cache Storage on success — it can only ever
// return the network's own response, or (via the plugin below) the already-
// precached /offline page when the network throws.
serwist.registerCapture(
  ({ request, url }: { request: Request; url: URL }) =>
    request.mode === "navigate" && !isExcludedFromNavigationFallback(url.pathname),
  new NetworkOnly({
    plugins: [
      new PrecacheFallbackPlugin({
        fallbackUrls: [OFFLINE_FALLBACK_URL],
        serwist,
      }),
    ],
  })
);

serwist.addEventListeners();
