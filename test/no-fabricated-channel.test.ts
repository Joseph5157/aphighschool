import { describe, it, expect } from "vitest";
import { tsxFiles, readSource, stripComments } from "./class-source";

// AGENTS.md hard rule #3 / PRODUCT.md non-goal: "No WhatsApp or push-notification
// integration unless that decision is explicitly reopened. Any UI implying such a
// channel exists is a defect." UI-CONTENT-1 removed the WhatsAppBanner component,
// which linked to the generic https://whatsapp.com homepage under a claimed
// channel that never existed (UI_AUDIT.md F16). This guard keeps it removed.
describe("no fabricated messaging-channel UI in the public app", () => {
  it("never mentions WhatsApp anywhere under app/(public)", () => {
    const files = tsxFiles("app/(public)");
    const hits: string[] = [];

    for (const file of files) {
      const source = stripComments(readSource(file));
      if (/whatsapp/i.test(source)) hits.push(file);
    }

    expect(hits).toEqual([]);
  });
});
