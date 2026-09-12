/// <reference lib="webworker" />

// PWA-SW-1. Implements exactly what docs/context/PWA_SW_DESIGN.md decided and
// nothing else. Read that document before changing anything here.
//
// This file deliberately does NOT import `defaultCache` from
// "@serwist/next/worker". Inspecting that export directly (see the
// PWA-SW-1 report) shows it registers NetworkFirst handlers for RSC
// (`RSC: 1`), RSC prefetch (`Next-Router-Prefetch: 1`), and every HTML
// document on the site — which would cache government-order and document
// pages this product must never serve stale. `runtimeCaching` is empty on
// purpose: PWA v1 caches nothing at runtime. The only offline capability
// this worker provides is the precache built at compile time (see
// next.config.js), which is scoped to the seven OFFLINE_SAFE calculators,
// their two navigational shells, and their required static assets.
//
// Because runtimeCaching is empty, any request whose URL isn't an exact
// match for a precached entry — including every RSC request (`?_rsc=`,
// on any route, calculators included), every freshness-sensitive page,
// and every admin/auth route — falls straight through to the network.
// That is the intended, and only, behaviour for everything not precached.
import type { PrecacheEntry } from "serwist";
import { Serwist } from "serwist";

// __SW_MANIFEST is a webpack DefinePlugin-style string replacement performed
// by @serwist/next's InjectManifest plugin at build time (injectionPoint
// "self.__SW_MANIFEST"), not a real runtime global — there is no upstream
// type for it.
declare const self: ServiceWorkerGlobalScope & {
  __SW_MANIFEST: (PrecacheEntry | string)[];
};

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

  // No runtime caching of any kind. Nothing is added to a cache as a
  // side effect of a network request succeeding.
  runtimeCaching: [],
});

serwist.addEventListeners();
