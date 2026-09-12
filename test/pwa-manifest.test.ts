// @vitest-environment node
//
// PWA-FOUNDATION-1. A manifest that declares an icon it does not actually ship,
// or declares the wrong size for one, fails installability silently — the
// browser simply declines to offer the install prompt with no page-level error.
// So these assertions are made against the files on disk, not just the object.
import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import manifest from "@/app/manifest";
import { SITE_NAME } from "@/lib/site";

const m = manifest();

/** Width/height from a PNG's IHDR chunk (bytes 16-24), big-endian. */
function pngSize(file: string): { width: number; height: number } {
  const buf = fs.readFileSync(path.join(process.cwd(), file));
  expect(buf.subarray(1, 4).toString("ascii"), `${file} is not a PNG`).toBe("PNG");
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
}

describe("PWA manifest", () => {
  it("is installable: standalone display, scope and start_url", () => {
    expect(m.display).toBe("standalone");
    // PWA-SW-1: "/" is NETWORK_ONLY and unreachable offline. "/tools" is
    // STATIC_SAFE, precached, and reaches every OFFLINE_SAFE calculator —
    // see docs/context/PWA_SW_DESIGN.md.
    expect(m.start_url).toBe("/tools");
    expect(m.scope).toBe("/");
    // id stays "/" across the start_url change so this reads as an update
    // to the installed app, not a new install.
    expect(m.id).toBe("/");
  });

  it("names the app from the single site-name constant rather than a second copy", () => {
    expect(m.short_name).toBe(SITE_NAME);
    expect(m.name).toContain(SITE_NAME);
  });

  it("ships every icon it declares, at the size it declares", () => {
    expect(m.icons?.length).toBeGreaterThanOrEqual(3);

    for (const icon of m.icons ?? []) {
      const declared = icon.sizes!.split("x").map(Number);
      const actual = pngSize(path.join("public", icon.src!));
      expect([actual.width, actual.height], `${icon.src} dimensions`).toEqual(declared);
      expect(icon.type).toBe("image/png");
    }
  });

  it("provides both a 192 and a 512 any-purpose icon and a maskable one", () => {
    const any = (m.icons ?? []).filter((i) => i.purpose === "any");
    const maskable = (m.icons ?? []).filter((i) => i.purpose === "maskable");

    expect(any.map((i) => i.sizes).sort()).toEqual(["192x192", "512x512"]);
    expect(maskable).toHaveLength(1);
    expect(maskable[0].sizes).toBe("512x512");
  });

  it("ships an Apple touch icon through the app/ file convention", () => {
    const { width, height } = pngSize(path.join("app", "apple-icon.png"));
    expect(width).toBe(180);
    expect(height).toBe(180);
  });

  it("uses colours that exist in the design tokens, not invented ones", () => {
    const css = fs.readFileSync(path.join(process.cwd(), "app", "globals.css"), "utf8");
    // --color-masthead is the navy the header, the icons and the declared
    // viewport.themeColor all already use.
    expect(css).toContain("--color-masthead: #1B2A4A");
    expect(m.theme_color).toBe("#1B2A4A");
    expect(m.background_color).toBe("#1B2A4A");
  });
});
