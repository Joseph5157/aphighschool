// LifecycleStepper keyed its steps on the stage label, so two stages sharing a
// label collide. A static render still emits both nodes — React only warns —
// which is why this asserts on the warning rather than on the markup: a
// markup-only assertion would pass with the defect fully present.
import { describe, it, expect, vi, afterEach } from "vitest";
import { render } from "@testing-library/react";
import LifecycleStepper from "@/app/(public)/posts/[slug]/_components/LifecycleStepper";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("LifecycleStepper step identity", () => {
  it("does not collide when two stages share a label", () => {
    const errors = vi.spyOn(console, "error").mockImplementation(() => {});

    render(
      <LifecycleStepper
        stages={["Notified", "Apply open", "Notified", "Results"]}
        currentStage={3}
        isExpired={false}
      />
    );

    const duplicateKeyWarnings = errors.mock.calls
      .map((args) => args.join(" "))
      .filter((message) => /two children with the same key/i.test(message));

    expect(duplicateKeyWarnings).toEqual([]);
  });

  it("still renders every stage, including the repeated label", () => {
    const { container } = render(
      <LifecycleStepper
        stages={["Notified", "Apply open", "Notified", "Results"]}
        currentStage={3}
        isExpired={false}
      />
    );

    // Four steps: 1 and 2 are done (ticks), 3 is current, 4 is pending.
    expect(container.querySelectorAll(".flex-col").length).toBe(4);
    expect(container.innerHTML.match(/✓/g) ?? []).toHaveLength(2);
    expect(container.innerHTML).toContain(">3<");
    expect(container.innerHTML).toContain(">4<");
  });
});
