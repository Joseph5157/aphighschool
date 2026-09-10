import { describe, expect, it } from "vitest";
import { stripDecorativeTemplateEmoji } from "@/lib/posts/strip-decorative-template-emoji";

describe("A03 — imported template emoji stay out of rendered document content", () => {
  it("removes all six known decorative markers while retaining their labels and document text", () => {
    const chat = String.fromCodePoint(0x1f4ac);
    const announcement = String.fromCodePoint(0x1f4e2);
    const inbox = String.fromCodePoint(0x1f4e5);
    const newspaper = String.fromCodePoint(0x1f4f0);
    const bell = String.fromCodePoint(0x1f514);
    const imported = [
      `<span class="alnat-wa-icon">${chat}</span><span>Share this post</span>`,
      `<span class="alnat-wa-icon">${announcement}</span><span>Join the channel</span>`,
      `<div class="at-important-links"><h3>${inbox} Important Downloads</h3></div>`,
      `<div class="alnat-box-heading"><span aria-hidden="true">${newspaper}</span><span>Related Posts</span></div>`,
      `<span class="atchc-post-bottom-icon">${bell}</span><span>AP Teachers Latest News</span>`,
      `<span class="atchc-post-bottom-icon">${bell}</span><span>Teachers Softwares</span>`,
      `<p>Quoted source marker: ${announcement} this remains authored text.</p>`,
      '<table><tr><td>Official table value 120</td></tr></table>',
    ].join("");

    const rendered = stripDecorativeTemplateEmoji(imported);

    expect(rendered).not.toContain(`<span class="alnat-wa-icon">${chat}</span>`);
    expect(rendered).not.toContain(`<span class="alnat-wa-icon">${announcement}</span>`);
    expect(rendered).not.toContain(`<h3>${inbox} Important Downloads</h3>`);
    expect(rendered).not.toContain(`<span aria-hidden="true">${newspaper}</span>`);
    expect(rendered).not.toContain(`<span class="atchc-post-bottom-icon">${bell}</span>`);
    expect(rendered).toContain("Share this post");
    expect(rendered).toContain("Important Downloads");
    expect(rendered).toContain("Related Posts");
    expect(rendered).toContain(`Quoted source marker: ${announcement} this remains authored text.`);
    expect(rendered).toContain("Official table value 120");
  });
});
