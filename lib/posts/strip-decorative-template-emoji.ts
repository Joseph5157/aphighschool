/**
 * Removes emoji that belong to known third-party page furniture, not to the
 * source document itself. Imported legacy HTML can carry the source site's
 * WhatsApp/share, recirculation and "latest news" widgets inside `content`.
 *
 * This intentionally is not a blanket emoji scrubber: a symbol that is part
 * of quoted source material must remain reviewable as authored content. Each
 * replacement is anchored to the legacy template class that supplied it.
 */
export function stripDecorativeTemplateEmoji(content: string): string {
  return content
    // Share and channel buttons from the imported alnat WordPress template.
    .replace(/(<span\b[^>]*class=["'][^"']*alnat-wa-icon[^"']*["'][^>]*>)\s*[\u{1F4AC}\u{1F4E2}]\s*(<\/span>)/giu, "$1$2")
    // A decorative lead-in on the template's download-links heading.
    .replace(/(<div\b[^>]*class=["'][^"']*at-important-links[^"']*["'][^>]*>\s*<h3>)\s*\u{1F4E5}\s*/giu, "$1")
    // Imported recirculation and two latest-news boxes, not Related Orders.
    .replace(/(<div\b[^>]*class=["'][^"']*alnat-box-heading[^"']*["'][^>]*>\s*<span\b[^>]*>)\s*\u{1F4F0}\s*(<\/span>)/giu, "$1$2")
    .replace(/(<span\b[^>]*class=["'][^"']*atchc-post-bottom-icon[^"']*["'][^>]*>)\s*\u{1F514}\s*(<\/span>)/giu, "$1$2");
}
