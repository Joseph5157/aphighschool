// The decision of *whether* a document has recruitment stages at all, and which
// stage it is at, lives in lib/posts/lifecycle.ts. This component only draws
// the stages it is handed.
type StepperProps = {
  stages: string[];
  currentStage: number;
  isExpired: boolean;
};

export default function LifecycleStepper({ stages, currentStage, isExpired }: StepperProps) {
  return (
    // Border, radius and margin removed by SLOP-DETAIL-1 (AI_SLOP_AUDIT.md
    // A09): this is now the opening strip of the document header rather than a
    // free-standing card above it, and the header wrapper owns the frame.
    <div className="w-full bg-paperRaised p-4 md:px-6 md:py-5">
      <div className="text-meta font-mono tracking-wider text-inkSoft mb-3">
        Lifecycle Stage
      </div>

      <div className="relative flex items-center justify-between">
        {/* Horizontal Connector Line */}
        <div className="absolute left-6 right-6 top-4 h-0.5 bg-hair z-0" />

        {stages.map((label, index) => {
          const id = index + 1;
          const isDone = !isExpired && id < currentStage;
          const isCurrent = !isExpired && id === currentStage;

          return (
            // Keyed on position, not label: two stages sharing a label would
            // otherwise collide. Stages are a fixed, ordered list, so the
            // index is a stable identity here.
            <div key={id} className="relative z-10 flex flex-col items-center flex-1 text-center">
              <div
                className={`w-8 h-8 rounded-full font-mono text-xs font-bold flex items-center justify-center transition-all ${
                  isDone
                    ? "bg-turmeric text-masthead shadow-sm"
                    : isCurrent
                    ? "bg-ink text-paper border-2 border-paper shadow-md"
                    : "bg-paperRaised border-2 border-hair text-inkSoft/80"
                }`}
              >
                {isDone ? "✓" : id}
              </div>
              <span
                className={`font-mono text-xs mt-2 font-medium ${
                  isCurrent
                    ? "text-ink font-bold"
                    : isDone
                    ? "text-turmericDeep"
                    : "text-inkSoft/80"
                }`}
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
