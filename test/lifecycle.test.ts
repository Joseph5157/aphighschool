// @vitest-environment node
import { describe, it, expect } from "vitest";
import { resolveLifecycle } from "@/lib/posts/lifecycle";

describe("resolveLifecycle", () => {
  it("shows recruitment stages for a notification", () => {
    const view = resolveLifecycle({
      documentType: "notification",
      statusBadge: "hall_ticket",
      orderState: "current",
    });
    expect(view.kind).toBe("recruitment");
    if (view.kind !== "recruitment") throw new Error("wrong kind");
    expect(view.stages).toEqual(["Notified", "Apply open", "Hall ticket", "Results"]);
    expect(view.currentStage).toBe(3);
  });

  it("never shows recruitment stages for a circular", () => {
    const view = resolveLifecycle({
      documentType: "circular",
      statusBadge: "results",
      orderState: "current",
    });
    expect(view.kind).toBe("state");
  });

  it("never shows Hall ticket or Results for a government order", () => {
    const view = resolveLifecycle({
      documentType: "go",
      statusBadge: "expired",
      orderState: "archived",
    });
    if (view.kind !== "state") throw new Error("wrong kind");
    expect(view.label).toBe("Archived");
    expect(JSON.stringify(view)).not.toMatch(/Hall ticket|Results/);
  });

  it("labels each order state", () => {
    const cases = [
      ["current", "Current"],
      ["amended", "Amended"],
      ["superseded", "Superseded"],
      ["archived", "Archived"],
    ] as const;
    for (const [state, label] of cases) {
      const view = resolveLifecycle({ documentType: "memo", statusBadge: "notification", orderState: state });
      if (view.kind !== "state") throw new Error("wrong kind");
      expect(view.label).toBe(label);
    }
  });

  it("treats an unknown document type as a plain state document", () => {
    const view = resolveLifecycle({
      documentType: null,
      statusBadge: "apply_link",
      orderState: "current",
    });
    expect(view.kind).toBe("state");
  });

  it("marks an expired recruitment notification as expired at the final stage", () => {
    const view = resolveLifecycle({
      documentType: "notification",
      statusBadge: "expired",
      orderState: "current",
    });
    if (view.kind !== "recruitment") throw new Error("wrong kind");
    expect(view.isExpired).toBe(true);
    expect(view.currentStage).toBe(4);
  });
});
