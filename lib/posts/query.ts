import type { DocType, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { ORDER_BY_OFFICIAL_DATE } from "@/lib/dates";

const DOC_TYPES: DocType[] = ["go", "circular", "memo", "proceeding", "notification", "other"];

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
    and.push({ OR: [textFilter(q), ...(ids.length ? [{ id: { in: ids } }] : [])] });
  }

  if (params.type) {
    // An unrecognised type must narrow to nothing, never widen to everything.
    if (!DOC_TYPES.includes(params.type as DocType)) return [];
    and.push({ documentType: params.type as DocType });
  }

  if (params.category) and.push({ category: { slug: params.category } });
  if (params.tag) {
    const t = params.tag.trim();
    and.push({
      OR: [
        { tags: { has: t } },
        { titleEn: { contains: t, mode: "insensitive" } },
        { titleTe: { contains: t, mode: "insensitive" } },
      ],
    });
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
    take: 100,
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
