"use client";

type ThumbZoneProps = {
  pdfUrl: string;
  sourceUrl?: string | null;
};

export default function ThumbZoneBar({ pdfUrl, sourceUrl }: ThumbZoneProps) {
  const scrollToPdf = () => {
    const el = document.getElementById("pdf-viewer-section");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    } else {
      window.open(pdfUrl, "_blank");
    }
  };

  return (
    <aside
      aria-label="Action Toolbar"
      className="fixed bottom-0 left-0 right-0 z-50 bg-paperRaised/95 backdrop-blur border-t border-hair p-3 sm:p-4 flex items-center justify-center gap-3 shadow-lg"
    >
      <div className="max-w-xl w-full mx-auto flex items-center justify-between gap-3">
        {/* Primary Action Button */}
        <button
          onClick={scrollToPdf}
          className="flex-1 h-[48px] min-h-[48px] bg-ink hover:bg-inkSoft text-paper font-mono font-bold text-sm tracking-wider uppercase rounded-xl flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.99]"
        >
          <span>📄 VIEW FULL ORDER</span>
        </button>

        {/* Secondary Icon Button */}
        {sourceUrl && (
          <a
            href={sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-[48px] h-[48px] min-w-[48px] min-h-[48px] bg-paperRaised border border-hair rounded-xl flex items-center justify-center text-ink hover:text-turmericDeep hover:border-ink/30 transition-all shadow-sm"
            title="Open source link"
            aria-label="Open source link"
          >
            ↗
          </a>
        )}
      </div>
    </aside>
  );
}
