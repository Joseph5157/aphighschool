type StepperProps = {
  statusBadge: string;
};

const STAGES = [
  { id: 1, label: "Notified" },
  { id: 2, label: "Apply open" },
  { id: 3, label: "Hall ticket" },
  { id: 4, label: "Results" },
];

function getStageIndex(statusBadge: string): { current: number; isExpired: boolean } {
  switch (statusBadge) {
    case "notification":
      return { current: 1, isExpired: false };
    case "apply_link":
      return { current: 2, isExpired: false };
    case "hall_ticket":
      return { current: 3, isExpired: false };
    case "results":
      return { current: 4, isExpired: false };
    case "expired":
      return { current: 4, isExpired: true };
    default:
      return { current: 1, isExpired: false };
  }
}

export default function LifecycleStepper({ statusBadge }: StepperProps) {
  const { current, isExpired } = getStageIndex(statusBadge);

  return (
    <div className="w-full bg-paperRaised border border-hair rounded-xl p-4 md:p-5 mb-6">
      <div className="text-[10px] font-mono tracking-wider text-inkSoft mb-3">
        Lifecycle Stage
      </div>

      <div className="relative flex items-center justify-between">
        {/* Horizontal Connector Line */}
        <div className="absolute left-6 right-6 top-4 h-0.5 bg-hair z-0" />

        {STAGES.map((stage) => {
          const isDone = !isExpired && stage.id < current;
          const isCurrent = !isExpired && stage.id === current;
          const isPending = isExpired || stage.id > current;

          return (
            <div key={stage.id} className="relative z-10 flex flex-col items-center flex-1 text-center">
              <div
                className={`w-8 h-8 rounded-full font-mono text-xs font-bold flex items-center justify-center transition-all ${
                  isDone
                    ? "bg-turmeric text-ink shadow-sm"
                    : isCurrent
                    ? "bg-ink text-turmeric border-2 border-turmeric shadow-md"
                    : "bg-paperRaised border-2 border-hair text-inkSoft/60"
                }`}
              >
                {isDone ? "✓" : stage.id}
              </div>
              <span
                className={`font-mono text-[11px] mt-2 font-medium ${
                  isCurrent
                    ? "text-ink font-bold"
                    : isDone
                    ? "text-turmericDeep"
                    : "text-inkSoft/60"
                }`}
              >
                {stage.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
