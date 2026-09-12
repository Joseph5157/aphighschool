"use client";

import { useEffect, useRef, useState } from "react";
import { buttonClassName } from "./Button";

/**
 * PWA-UPDATE-1. Registers the service worker manually and surfaces a small,
 * non-blocking prompt when a new version has finished precaching and is
 * waiting to take over — never automatically.
 *
 * Registration is manual (next.config.js sets `register: false`) rather than
 * @serwist/next's own auto-injected client script, on inspected evidence:
 * that script constructs `window.serwist` and calls `.register()`
 * synchronously, prepended into the "main-app" entry, before any React
 * component mounts. `.register()` itself defers the actual
 * `navigator.serviceWorker.register()` call until the window "load" event
 * UNLESS `document.readyState` is already "complete" at call time — which it
 * can be on a client-side navigation where main-app was already parsed. That
 * is exactly the race an update UI cannot afford: a worker already waiting
 * before this component's listener attaches would be missed. Registering
 * here means every listener is attached before `register()` is ever called,
 * in code this project owns and tests directly.
 *
 * skipWaiting/clientsClaim/navigationPreload/cacheOnNavigation/
 * reloadOnOnline are all still false — see app/sw.ts and next.config.js.
 * This component never calls `self.skipWaiting()` itself or asks the worker
 * to; it only ever sends the standard `{ type: "SKIP_WAITING" }` message
 * (via Serwist's own `messageSkipWaiting()`) in direct response to the
 * reader clicking "Update now".
 */

type UpdateStatus = "idle" | "available" | "dismissed" | "updating" | "update-failed";

// How the browser tells a service worker it may stop waiting. Not this
// project's invention — it is the de facto standard message every
// Workbox/Serwist-generated worker already listens for (see app/sw.ts's
// `skipWaiting: false` branch, which registers exactly this listener).
type SerwistWindowModule = typeof import("@serwist/window");
type SerwistWindowInstance = InstanceType<SerwistWindowModule["Serwist"]>;

// Deliberately low frequency: this only matters for a PWA tab left open
// across a deployment. Once an hour is enough to notice within a normal
// session without polling the network on every tab focus.
const VISIBILITY_UPDATE_CHECK_INTERVAL_MS = 60 * 60 * 1000;

// If activation hasn't completed in this long after Update now, stop
// waiting and surface a failure instead of leaving the button stuck.
const ACTIVATION_TIMEOUT_MS = 15000;

export default function PwaUpdateManager() {
  const [status, setStatus] = useState<UpdateStatus>("idle");
  const waitingSwRef = useRef<ServiceWorker | null>(null);
  const serwistRef = useRef<SerwistWindowInstance | null>(null);
  const registeredRef = useRef(false);
  const isUpdatingRef = useRef(false);
  const lastUpdateCheckRef = useRef(0);

  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
    // Never register twice — this effect can only legitimately run once per
    // full page load (the component lives in the public root layout and is
    // never remounted by route navigation), but the guard is explicit and
    // synchronous rather than relying on that alone.
    if (registeredRef.current) return;
    registeredRef.current = true;

    let cancelled = false;

    (async () => {
      const { Serwist } = await import("@serwist/window");
      if (cancelled) return;

      const serwist = new Serwist("/sw.js", { scope: "/" });
      serwistRef.current = serwist;

      // Attached before register() so this catches both a worker that
      // becomes waiting during this session AND one that was already
      // waiting when the page opened (Serwist dispatches "waiting" for
      // both cases — see @serwist/window's Serwist.ts register()).
      //
      // This never fires on a genuine first-ever install: a worker with no
      // existing controller for its scope activates immediately without
      // entering the waiting phase, so "waiting" simply never dispatches.
      serwist.addEventListener("waiting", (event) => {
        // sw is typed optional on the shared event base, but the "waiting"
        // event always sets it (see @serwist/window's Serwist.ts, both
        // dispatch sites). Guarded rather than asserted.
        if (!event.sw) return;
        waitingSwRef.current = event.sw;
        setStatus("available");
      });

      await serwist.register();
      lastUpdateCheckRef.current = Date.now();
    })();

    const onVisibilityChange = () => {
      if (document.visibilityState !== "visible") return;
      const serwist = serwistRef.current;
      if (!serwist) return;
      const now = Date.now();
      if (now - lastUpdateCheckRef.current < VISIBILITY_UPDATE_CHECK_INTERVAL_MS) return;
      lastUpdateCheckRef.current = now;
      void serwist.update();
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, []);

  const handleLater = () => {
    // In-memory only: this component never unmounts across client-side
    // navigation (it lives in the public root layout), so this dismissal
    // already holds for "the rest of this usage session" without needing
    // sessionStorage. A full page reload is a new session boundary, and a
    // still-genuinely-waiting update reappearing there is not nagging.
    setStatus("dismissed");
  };

  const handleUpdateNow = () => {
    if (isUpdatingRef.current) return;
    const sw = waitingSwRef.current;
    const serwist = serwistRef.current;
    if (!sw || !serwist) return;

    isUpdatingRef.current = true;
    setStatus("updating");

    let settled = false;
    const finish = (outcome: "activated" | "failed") => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timeoutId);
      sw.removeEventListener("statechange", onStateChange);
      if (outcome === "activated") {
        // Exactly one reload, triggered only by this explicit user action.
        window.location.reload();
      } else {
        isUpdatingRef.current = false;
        setStatus("update-failed");
      }
    };

    // clientsClaim is false, so a "controlling" event on this already-open
    // page is not guaranteed at all — the new worker activates but does not
    // seize existing clients. The only reliable signal that it is safe to
    // reload into the new version is the waiting worker's own state
    // reaching "activated" directly.
    const onStateChange = () => {
      if (sw.state === "activated") finish("activated");
      else if (sw.state === "redundant") finish("failed");
    };
    sw.addEventListener("statechange", onStateChange);

    const timeoutId = window.setTimeout(() => finish("failed"), ACTIVATION_TIMEOUT_MS);

    serwist.messageSkipWaiting();

    // Covers the race where activation completed between attaching the
    // listener and this line.
    if (sw.state === "activated") finish("activated");
  };

  if (status !== "available" && status !== "updating" && status !== "update-failed") {
    return null;
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-x-0 bottom-[calc(64px+env(safe-area-inset-bottom))] z-40 mx-auto flex max-w-sm items-start gap-3 rounded-xl border border-hair bg-paperRaised p-4 shadow-lg lg:bottom-4 lg:left-4 lg:right-auto lg:mx-0"
    >
      <div className="min-w-0 flex-1 space-y-1">
        <p className="font-mono text-xs font-bold uppercase tracking-wider text-ink">Update available</p>
        <p className="text-sm text-inkSoft">A newer version of AP Teacher Desk is ready.</p>
        {status === "update-failed" && (
          <p className="text-sm text-kumkum">The update could not be applied. You can try again.</p>
        )}
      </div>
      <div className="flex shrink-0 flex-col gap-2">
        <button
          type="button"
          onClick={handleUpdateNow}
          disabled={status === "updating"}
          aria-busy={status === "updating" || undefined}
          className={buttonClassName({ variant: "tamarind", size: "sm" })}
        >
          {status === "updating" ? "Updating…" : "Update now"}
        </button>
        <button
          type="button"
          onClick={handleLater}
          disabled={status === "updating"}
          className={buttonClassName({ variant: "ghost", size: "sm" })}
        >
          Later
        </button>
      </div>
    </div>
  );
}
