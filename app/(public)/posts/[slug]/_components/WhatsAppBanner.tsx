import React from "react";

export default function WhatsAppBanner() {
  return (
    <div className="bg-tamarind/10 border border-tamarind/30 rounded-xl p-4 md:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xs">
      <div className="flex items-center gap-3 text-center sm:text-left">
        <div className="w-10 h-10 rounded-full bg-tamarind text-white flex items-center justify-center text-xl shrink-0 font-bold">
          📢
        </div>
        <div>
          <h4 className="font-bold text-sm text-ink">
            ఉపాధ్యాయుల లేటెస్ట్ అప్‌డేట్‌ల కోసం వాట్సాప్ ఛానెల్‌లో చేరండి
          </h4>
          <p className="text-xs font-mono text-inkSoft mt-0.5">
            Get instant AP School Education G.O.s & TET/DSC notifications directly on WhatsApp.
          </p>
        </div>
      </div>
      <a
        href="https://whatsapp.com"
        target="_blank"
        rel="noopener noreferrer"
        className="shrink-0 bg-tamarind hover:bg-tamarindDark text-white font-bold text-xs px-4 py-2.5 rounded-lg shadow-sm transition-colors flex items-center gap-2"
      >
        <span>Join WhatsApp Channel</span>
        <span>→</span>
      </a>
    </div>
  );
}
