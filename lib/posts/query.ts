import { Prisma, type DocType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { ORDER_BY_OFFICIAL_DATE } from "@/lib/dates";
import { canonicalTopic, interpretQuery, tagFormsFor, type QueryInterpretation } from "@/lib/terminology";

const DOC_TYPES: DocType[] = ["go", "circular", "memo", "proceeding", "notification", "other"];

/**
 * The most results one search returns. Shared with the topic counts so a
 * count above it is shown as `${SEARCH_RESULT_LIMIT}+` rather than a number
 * the destination search cannot list (PR #7 review).
 */
export const SEARCH_RESULT_LIMIT = 100;

export type SearchParams = {
  q?: string;
  type?: string;
  category?: string;
  tag?: string;
  from?: string;
  to?: string;
};

const SELECT = {
  id: true,
  slug: true,
  titleEn: true,
  titleTe: true,
  goReference: true,
  summaryTe: true,
  tags: true,
  documentType: true,
  documentDate: true,
  createdAt: true,
  category: { select: { nameEn: true, slug: true } },
  relatedFrom: {
    where: { approved: true, relatedPost: { isDraft: false } },
    select: { relatedPost: { select: { slug: true, titleEn: true } } },
  },
} satisfies Prisma.PostSelect;

export type SearchResult = Prisma.PostGetPayload<{ select: typeof SELECT }>;

const RECENT_DOCUMENT_SELECT = {
  id: true,
  slug: true,
  titleEn: true,
  documentType: true,
  documentDate: true,
  createdAt: true,
  verifiedAgainstGoir: true,
  orderState: true,
} satisfies Prisma.PostSelect;

export type RecentDocument = Prisma.PostGetPayload<{ select: typeof RECENT_DOCUMENT_SELECT }>;

function textFilter(q: string): Prisma.PostWhereInput {
  const contains = { contains: q, mode: "insensitive" } as const;
  return {
    OR: [
      { titleEn: contains },
      { titleTe: contains },
      { goReference: contains },
      { englishAbstract: contains },
      { sourceDept: contains },
      { summaryTe: { hasSome: [q] } },
      { tags: { has: q } },
      // Postgres array columns cannot do a case-insensitive substring match in
      // Prisma, so tags and summary lines are also matched by raw id lookup below.
    ],
  };
}

function escapeLike(value: string): string {
  return value.replace(/[\\%_]/g, (c) => `\\${c}`);
}

/**
 * Every searchable text field of a post as one string, with the zero-width
 * joiners Telugu text often carries removed so it compares against the
 * normalised query tokens. concat_ws puts a space between fields, so a
 * whitespace-free token can never match across a field boundary.
 */
const SEARCH_HAYSTACK = Prisma.sql`regexp_replace(
  concat_ws(' ', "titleEn", "titleTe", "goReference", "englishAbstract", "sourceDept",
    array_to_string("summaryTe", ' '), array_to_string("tags", ' ')),
  '[\\u200B-\\u200D\\uFEFF]', '', 'g')`;

/**
 * TERM-SEARCH-1: the published posts a recognised teacher term points at.
 * Every recognised term narrows (document types: any of them; each topic: its
 * canonical tag or a reviewed `legacyTags` value — never a search alias), and
 * every unrecognised part of the query must still appear — numbers as whole numbers, so `GO 22` matches
 * G.O.Ms.No.22 but not No.122, and words as substrings. Callers OR this with
 * the literal match, so it can only add results a literal search misses.
 */
async function idsForInterpretation(meaning: QueryInterpretation): Promise<string[]> {
  const conditions: Prisma.Sql[] = [Prisma.sql`"isDraft" = false`];
  if (meaning.documentTypes.length) {
    conditions.push(Prisma.sql`"documentType"::text = ANY(${meaning.documentTypes})`);
  }
  for (const tags of meaning.topicTags) {
    const forms = tags.flatMap(tagFormsFor);
    conditions.push(Prisma.sql`EXISTS (SELECT 1 FROM unnest("tags") t WHERE lower(t) = ANY(${forms}))`);
  }
  for (const n of meaning.numbers) {
    conditions.push(Prisma.sql`${SEARCH_HAYSTACK} ~ ${`(^|[^0-9])${n}([^0-9]|$)`}`);
  }
  for (const w of meaning.words) {
    conditions.push(Prisma.sql`${SEARCH_HAYSTACK} ILIKE ${`%${escapeLike(w)}%`}`);
  }
  const rows = await prisma.$queryRaw<Array<{ id: string }>>`
    SELECT id FROM "Post" WHERE ${Prisma.join(conditions, " AND ")}
  `;
  return rows.map((row) => row.id);
}

/**
 * Published posts carrying any of the given lower-cased tag forms (whole tag,
 * case-insensitive). The single rule behind both the `?tag=` filter and the
 * topic counts, so a chip or card count always equals its search results.
 */
async function publishedIdsWithTagForms(forms: string[]): Promise<string[]> {
  if (forms.length === 0) return [];
  const rows = await prisma.$queryRaw<Array<{ id: string }>>`
    SELECT id FROM "Post"
    WHERE "isDraft" = false
      AND EXISTS (SELECT 1 FROM unnest("tags") x WHERE lower(x) = ANY(${forms}))
  `;
  return rows.map((row) => row.id);
}

export async function searchPosts(params: SearchParams): Promise<SearchResult[]> {
  const q = params.q?.trim();
  const hasFilter =
    Boolean(q) || Boolean(params.type) || Boolean(params.category) ||
    Boolean(params.tag) || Boolean(params.from) || Boolean(params.to);

  if (!hasFilter) return [];

  const and: Prisma.PostWhereInput[] = [{ isDraft: false }];

  if (q) {
    // Array columns need a raw ILIKE to match substrings inside elements.
    const arrayMatches = await prisma.$queryRaw<Array<{ id: string }>>`
      SELECT id FROM "Post"
      WHERE "isDraft" = false
        AND (
          EXISTS (SELECT 1 FROM unnest("tags") t WHERE t ILIKE ${"%" + q + "%"})
          OR EXISTS (SELECT 1 FROM unnest("summaryTe") s WHERE s ILIKE ${"%" + q + "%"})
        )
    `;
    const ids = arrayMatches.map((row) => row.id);
    // Literal matching is always kept; a recognised term only adds to it.
    // interpretQuery returns null for unknown text, which stays literal-only.
    const meaning = interpretQuery(q);
    const termIds = meaning ? await idsForInterpretation(meaning) : [];
    const matchedIds = [...new Set([...ids, ...termIds])];
    and.push({ OR: [textFilter(q), ...(matchedIds.length ? [{ id: { in: matchedIds } }] : [])] });
  }

  if (params.type) {
    // An unrecognised type must narrow to nothing, never widen to everything.
    if (!DOC_TYPES.includes(params.type as DocType)) return [];
    and.push({ documentType: params.type as DocType });
  }

  if (params.category) and.push({ category: { slug: params.category } });
  if (params.tag) {
    const t = params.tag.trim();
    // TERM-TOPICS-1: a canonical topic tag also accepts its reviewed
    // legacyTags (e.g. ?tag=Rationalisation finds a post tagged PTR); any
    // other tag matches itself. Whole tag, case-insensitive.
    const tagged = (await publishedIdsWithTagForms(tagFormsFor(t))).map((id) => ({ id }));
    if (canonicalTopic(t)) {
      // A canonical topic is matched by tags alone, so the count shown on its
      // chip or /topics card is exactly what this search returns. The title
      // fallback below is not applied: for short tags it is noise (`DA`
      // matches "Update", "Candidates", "Mandal").
      if (tagged.length === 0) return [];
      and.push({ OR: tagged });
    } else {
      and.push({
        OR: [
          ...tagged,
          { titleEn: { contains: t, mode: "insensitive" } },
          { titleTe: { contains: t, mode: "insensitive" } },
        ],
      });
    }
  }

  if (params.from || params.to) {
    const range: Prisma.DateTimeFilter = {};
    if (params.from) range.gte = new Date(params.from);
    if (params.to) range.lte = new Date(params.to);
    and.push({ OR: [{ documentDate: range }, { documentDate: null, createdAt: range }] });
  }

  return prisma.post.findMany({
    where: { AND: and },
    select: SELECT,
    orderBy: ORDER_BY_OFFICIAL_DATE as never,
    take: SEARCH_RESULT_LIMIT,
  });
}

/** A compact discovery list. This is intentionally separate from search results. */
export async function recentPublishedDocuments(take = 5): Promise<RecentDocument[]> {
  return prisma.post.findMany({
    where: { isDraft: false },
    select: RECENT_DOCUMENT_SELECT,
    orderBy: ORDER_BY_OFFICIAL_DATE as never,
    take: Math.min(Math.max(take, 1), 6),
  });
}

/**
 * Filters a curated candidate list down to the ones that would actually
 * return a result right now, using the exact same matching `searchPosts`
 * itself does. A quick-search suggestion that leads to "no matching
 * documents" is an unsupported claim — UI_AUDIT.md F30 — so candidates are
 * verified against real content rather than kept on the strength of being a
 * plausible teacher search term.
 */
export async function quickSearchChips(candidates: string[]): Promise<string[]> {
  const checks = await Promise.all(
    candidates.map(async (chip) => ({
      chip,
      hasResults: (await searchPosts({ q: chip })).length > 0,
    }))
  );
  return checks.filter((c) => c.hasResults).map((c) => c.chip);
}

/**
 * How many published posts carry each candidate topic, computed with the
 * same rule as its `?tag=` search (publishedIdsWithTagForms). The search lists
 * at most SEARCH_RESULT_LIMIT of them, so display a count through
 * `formatTopicCount`, which never states a number the search cannot show.
 * Candidates with no published posts are omitted.
 */
export async function publishedTagCounts(candidates: string[]): Promise<Map<string, number>> {
  const counts = new Map<string, number>();
  for (const tag of candidates) {
    const n = (await publishedIdsWithTagForms(tagFormsFor(tag))).length;
    if (n > 0) counts.set(tag, n);
  }
  return counts;
}

/**
 * Filters a curated topic-tag candidate list down to tags that at least one
 * published post actually carries. Same "no unsupported claim" reasoning as
 * `quickSearchChips`, applied to the `?tag=` filter chips instead of the
 * free-text search chips.
 */
export async function tagsWithPublishedContent(candidates: string[]): Promise<string[]> {
  const counts = await publishedTagCounts(candidates);
  return candidates.filter((tag) => counts.has(tag));
}

/**
 * A topic's published count as shown to readers: the exact number up to
 * SEARCH_RESULT_LIMIT, which is also what its `?tag=` search lists, and
 * `100+` beyond it, since the search then shows only the first 100.
 */
export function formatTopicCount(count: number): string {
  if (count > SEARCH_RESULT_LIMIT) return `${SEARCH_RESULT_LIMIT}+ published documents`;
  return `${count} published ${count === 1 ? "document" : "documents"}`;
}
