import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

// NAV-HEADER-320-1: the header brand link previously carried `shrink-0` on
// the whole `<Link>` (icon + text stack together). That gave the group's
// containing flex item an automatic min-width equal to its full natural
// size at every viewport — driven by the subtitle line ("AP School
// Education", 148.2px) rather than the shorter primary wordmark (104.8px) —
// so it never compressed, and at 320px it measurably overlapped the theme
// toggle (docs/context/NAV_HEADER_320_PLAN.md). The fix moves `shrink-0` to
// just the fixed-size AP mark, lets the text stack shrink (`min-w-0`),
// keeps the primary wordmark whole (`whitespace-nowrap`, never truncates),
// and lets only the secondary subtitle compress (`truncate`). `lg:shrink-0`
// on the outer brand group re-pins this to its pre-fix, exact-baseline
// width once DesktopNav appears at 1024px, where the row is already fully
// committed and any extra shrink would truncate the subtitle on desktop.
describe("header brand group narrow-phone shrink (NAV-HEADER-320-1)", () => {
  const layout = fs.readFileSync(path.join(process.cwd(), "app/(public)/layout.tsx"), "utf8");

  function brandBlock(): string {
    const start = layout.indexOf('<Link href="/" className="group');
    expect(start, "header brand <Link> not found").toBeGreaterThan(-1);
    const end = layout.indexOf("</Link>", start);
    expect(end).toBeGreaterThan(start);
    return layout.slice(start, end);
  }

  it("does not put shrink-0 on the whole brand Link (the regressing pattern)", () => {
    const link = brandBlock();
    const linkOpenTag = link.slice(0, link.indexOf(">") + 1);
    expect(linkOpenTag).not.toMatch(/\bshrink-0\b/);
  });

  it("protects the fixed-size AP mark with shrink-0", () => {
    const link = brandBlock();
    const apMarkOpenTag = link.slice(link.indexOf("<div"), link.indexOf(">", link.indexOf("<div")) + 1);
    expect(apMarkOpenTag).toMatch(/\bshrink-0\b/);
  });

  it("lets the text stack shrink below its content width (min-w-0)", () => {
    const link = brandBlock();
    // The text-stack wrapper is the second top-level <div> inside the Link.
    const textStackStart = link.indexOf("<div", link.indexOf("</div>"));
    const textStackOpenTag = link.slice(textStackStart, link.indexOf(">", textStackStart) + 1);
    expect(textStackOpenTag).toMatch(/\bmin-w-0\b/);
  });

  it("keeps the primary wordmark whole — nowrap, never truncated", () => {
    const link = brandBlock();
    const wordmarkStart = link.indexOf("AP Teacher Desk");
    const wordmarkOpenTag = link.slice(0, wordmarkStart).match(/<div className="([^"]*)">\s*$/);
    expect(wordmarkOpenTag, "could not find wordmark's own opening tag").not.toBeNull();
    const cls = wordmarkOpenTag![1];
    expect(cls).toMatch(/\bwhitespace-nowrap\b/);
    expect(cls).not.toMatch(/\btruncate\b/);
  });

  it("lets only the secondary subtitle compress — truncate, not nowrap-only", () => {
    const link = brandBlock();
    const subtitleStart = link.indexOf("AP School Education");
    const subtitleOpenTag = link.slice(0, subtitleStart).match(/<div className="([^"]*)">\s*$/);
    expect(subtitleOpenTag, "could not find subtitle's own opening tag").not.toBeNull();
    expect(subtitleOpenTag![1]).toMatch(/\btruncate\b/);
  });

  it("re-pins the brand group to its baseline (unshrunk) width once DesktopNav appears at lg", () => {
    const groupStart = layout.indexOf('<div className="flex items-center gap-3 min-w-0 lg:shrink-0">');
    expect(groupStart, "brand group wrapper with lg:shrink-0 not found").toBeGreaterThan(-1);
  });
});
