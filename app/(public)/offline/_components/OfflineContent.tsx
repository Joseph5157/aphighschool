"use client";

import { Callout } from "@/app/(public)/_components/Callout";
import { buttonClassName } from "@/app/(public)/_components/Button";

/**
 * PWA-OFFLINE-UX-1. The service worker's navigation fallback for any
 * NETWORK_ONLY route (see app/sw.ts) — never a route users are linked to
 * directly. When the browser's own navigation to, say, /orders fails offline,
 * the worker serves this page's precached response instead. The address bar
 * still reads /orders: a Fetch API response substituted via respondWith()
 * does not change the request's URL, so "Try Again" below can be a plain
 * reload of the current location rather than a redirect parameter — there is
 * nothing to redirect, the browser is already where the reader asked to go.
 *
 * Plain <a> tags rather than next/link, deliberately: Next's client router
 * keys navigation state off the page it believes it rendered, and this page
 * can be shown under a URL that does not match it (e.g. this component's
 * markup at the address /orders). A full browser navigation sidesteps that
 * mismatch entirely instead of asking the client router to reconcile it.
 */
export default function OfflineContent() {
  return (
    <div className="max-w-xl mx-auto py-16 text-center space-y-6">
      <div className="space-y-3">
        <h1 className="text-display text-ink">You&apos;re offline</h1>
        <p className="text-sm text-inkSoft">
          Current government orders, documents and online services need an internet
          connection so we can show you the latest information.
        </p>
        <p lang="te" className="font-telugu text-sm text-inkSoft">
          ప్రస్తుత ప్రభుత్వ ఉత్తర్వులు, పత్రాలు మరియు ఆన్‌లైన్ సేవలను తాజా సమాచారంతో చూపించడానికి ఇంటర్నెట్ కనెక్షన్ అవసరం.
        </p>
      </div>

      <Callout tone="guidance" as="div" role="status">
        Your calculators are still available offline — no connection required.
      </Callout>

      <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
        {/* Full navigation, not next/link — see file comment. */}
        <a href="/tools" className={buttonClassName({ variant: "primary", size: "md" })}>
          Open Utility Tools
        </a>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className={buttonClassName({ variant: "outline", size: "md" })}
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
