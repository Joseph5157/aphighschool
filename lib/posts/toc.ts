/**
 * How many headings a document needs before it gets a table of contents.
 * Shared by the server template (which decides the two-column layout) and the
 * client TableOfContents (which builds the list), so both use the same number.
 * It lived in the client module until the TOC threshold fix: there, the server
 * comparison was always false in production and the desktop contents list
 * rendered below the article instead of in the sticky sidebar.
 *
 * SLOP-DETAIL-1 (AI_SLOP_AUDIT.md A10). The inspected document had two
 * sections and still got the full apparatus: a collapsible bordered widget on
 * mobile announcing "(2 sections)", a sticky desktop rail, generated ids, an
 * IntersectionObserver scroll-spy and an active state — interface ceremony for
 * a document a reader can take in by scrolling.
 *
 * Four is where the list stops being a restatement of what is already on screen
 * and starts being faster than scrolling. Long official orders — the ones with
 * numbered clauses and annexures, which are exactly the documents a TOC is for
 * — clear it easily, so the capability is intact where it earns its space.
 */
export const MIN_TOC_HEADINGS = 4;
