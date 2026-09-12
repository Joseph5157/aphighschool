const withSerwistInit = require("@serwist/next").default;
const { OFFLINE_CHUNKS, getAdditionalPrecacheEntries } = require("./lib/pwa/precache-config");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
};

// PWA-SW-1. See docs/context/PWA_SW_DESIGN.md and app/sw.ts before changing
// any option here — every value below is a documented, evidenced decision,
// not a default left in place.
const withSerwist = withSerwistInit({
  swSrc: "app/sw.ts",
  swDest: "public/sw.js",
  scope: "/",

  // Design §11 / §12: no proactive <Link>-navigation caching, no reload
  // storm when connectivity returns.
  cacheOnNavigation: false,
  reloadOnOnline: false,

  // PWA-UPDATE-1: registration is now manual (app/(public)/_components/
  // PwaUpdateManager.tsx), not this plugin's own auto-injected client
  // script. Inspected the injected sw-entry.mjs directly: it constructs
  // `window.serwist` and calls `.register()` synchronously, prepended into
  // the "main-app" entry — before any React component has mounted. Its
  // .register() itself defers the actual navigator.serviceWorker.register()
  // call until the window "load" event, which usually gives React time to
  // attach listeners first, but "usually" is exactly the race the update UI
  // cannot afford: a client-side navigation where main-app is already
  // parsed and document.readyState is already "complete" skips that wait
  // and registers immediately. Manual registration removes the dependency
  // on that timing entirely by attaching every listener before register()
  // is ever called, in code this project owns and can test directly.
  register: false,

  // Disabled in dev so a developer is never fighting a stale production
  // worker while iterating with `npm run dev`. See PWA-SW-1 report §13 for
  // how to unregister one left over from testing a production build.
  disable: process.env.NODE_ENV === "development",

  // The allowlist. `chunks` restricts the auto-discovered webpack-asset
  // manifest to exactly the entries that back the seven OFFLINE_SAFE
  // calculators, their two navigational shells, and the shared app shell —
  // verified against next/dist/server/get-app-route-from-entrypoint.js and
  // .next/app-build-manifest.json, not guessed. Nothing else Next.js
  // compiles (admin routes included) is reachable through this list.
  chunks: OFFLINE_CHUNKS,

  // The seven calculator/shell HTML documents (revisioned by commit, not a
  // random value — see lib/pwa/precache-config.js) plus the source-owned
  // PWA assets. Providing this explicitly is what stops @serwist/next from
  // falling back to its own public/**/* directory glob.
  additionalPrecacheEntries: getAdditionalPrecacheEntries(__dirname),
});

module.exports = withSerwist(nextConfig);
