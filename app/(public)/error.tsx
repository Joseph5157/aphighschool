"use client";

import { useEffect } from "react";

export default function PublicError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[public route error]", error.digest ?? "", error.message);
  }, [error]);

  return (
    <div className="max-w-xl mx-auto py-16 text-center space-y-4">
      <h1 className="text-display text-ink">This page could not be loaded</h1>
      <p className="text-sm text-inkSoft">
        Something went wrong on our side — this is not an empty section. Please try
        again in a moment.
      </p>
      <p lang="te" className="font-telugu text-sm text-inkSoft">
        సాంకేతిక సమస్య కారణంగా ఈ పేజీ లోడ్ కాలేదు. దయచేసి కొద్దిసేపటి తర్వాత ప్రయత్నించండి.
      </p>
      <button
        onClick={reset}
        className="font-mono text-xs font-bold text-tamarind border border-tamarind/40 rounded-lg px-4 py-2 hover:bg-tamarind/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tamarind"
      >
        Try again
      </button>
    </div>
  );
}
