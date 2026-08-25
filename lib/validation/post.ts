import { isAfterTodayIST } from "@/lib/dates";

export type PostInput = {
  id?: string;
  titleEn: string;
  titleTe: string;
  summaryTe: string[];
  englishAbstract: string | null;
  statusBadge: string;
  pdfUrl: string | null;
  actionUrl: string | null;
  actionDeadline: Date | null;
  documentDate: Date | null;
  goReference: string | null;
  sourceDept: string | null;
  sourceUrl: string | null;
  categoryId: string | null;
  documentType: string | null;
  orderState: string;
  tags: string[];
  verifiedAgainstGoir: boolean;
  relatedPostIds: string[];
};

const STATUS_BADGES = ["notification", "apply_link", "hall_ticket", "results", "expired"];

// Must stay in step with the DocType and OrderState enums in prisma/schema.prisma.
// Prisma rejects an out-of-enum value at the database boundary with an opaque
// error, so these are checked here to produce an admin-readable message first.
const DOCUMENT_TYPES = ["go", "circular", "memo", "proceeding", "notification", "other"];
const ORDER_STATES = ["current", "amended", "superseded", "archived"];

// Telugu block: U+0C00–U+0C7F.
const TELUGU = /[ఀ-౿]/;

// G.O.Ms.No.129 / G.O.Rt.No.55 / Memo.No.1234 / Circular.No.7 — with or without spaces.
// Anchored at both ends (trailing whitespace only) so a valid prefix cannot be used to
// smuggle arbitrary trailing text — including markup — past the check.
const GO_REFERENCE =
  /^(G\.?O\.?\s?(Ms|Rt|P)\.?\s?No\.?\s?\d+|Memo\.?\s?No\.?\s?[\w/-]+|Circular\.?\s?No\.?\s?[\w/-]+|Proc\.?\s?No\.?\s?[\w/-]+)\s*$/i;

function isHttpsUrl(value: string): boolean {
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

export function validatePost(input: PostInput): string[] {
  const errors: string[] = [];

  if (!input.titleEn?.trim()) errors.push("English title is required.");

  if (!input.titleTe?.trim()) {
    errors.push("Telugu title is required.");
  } else if (!TELUGU.test(input.titleTe)) {
    // Guards against pasting a transliteration into the Telugu field.
    errors.push("Telugu title must contain Telugu script.");
  }

  const summary = (input.summaryTe ?? []).filter((line) => line.trim().length > 0);
  if (summary.length === 0) {
    errors.push("At least one Telugu summary line is required.");
  } else if (!summary.some((line) => TELUGU.test(line))) {
    errors.push("Telugu summary must contain Telugu script.");
  }

  if (!STATUS_BADGES.includes(input.statusBadge)) {
    errors.push("Status badge is not a recognised value.");
  }

  // documentType is optional — a post whose type has not been established yet
  // is legitimate, and lifecycle.ts treats null as a plain state document.
  if (input.documentType !== null && !DOCUMENT_TYPES.includes(input.documentType)) {
    errors.push("Document type is not a recognised value.");
  }

  // orderState is not optional: every document is in exactly one state, and the
  // column defaults to "current".
  if (!ORDER_STATES.includes(input.orderState)) {
    errors.push("Order state is not a recognised value.");
  }

  if (input.pdfUrl && !isHttpsUrl(input.pdfUrl)) {
    errors.push("PDF URL must be an https:// link.");
  }
  if (input.sourceUrl && !isHttpsUrl(input.sourceUrl)) {
    errors.push("Source URL must be an https:// link.");
  }
  if (input.actionUrl && !isHttpsUrl(input.actionUrl)) {
    errors.push("Action URL must be an https:// link.");
  }

  if (input.goReference && !GO_REFERENCE.test(input.goReference.trim())) {
    errors.push(
      "GO reference must look like G.O.Ms.No.55, G.O.Rt.No.55, Memo.No.55, or Circular.No.55, or Proc.No.55."
    );
  }

  if (input.actionDeadline && Number.isNaN(input.actionDeadline.getTime())) {
    errors.push("Action deadline is not a valid date.");
  }

  if (input.documentDate && Number.isNaN(input.documentDate.getTime())) {
    errors.push("Official document date is not a valid date.");
  } else if (input.documentDate && isAfterTodayIST(input.documentDate)) {
    // Compared against Asia/Kolkata's calendar date, not Date.now(): the only
    // admin using this form is in IST, and a raw UTC-instant comparison would
    // reject "today" as future-dated between 00:00 and 05:30 IST, when the
    // UTC calendar date is still "yesterday".
    errors.push("Official document date cannot be in the future.");
  }

  if (input.id && input.relatedPostIds.includes(input.id)) {
    errors.push("A post cannot be related to itself.");
  }
  if (new Set(input.relatedPostIds).size !== input.relatedPostIds.length) {
    errors.push("Related orders must be unique.");
  }

  // The verification claim is the site's core trust signal — it must be traceable.
  if (input.verifiedAgainstGoir && !input.sourceUrl) {
    errors.push(
      "A GOIR-verified post must carry the source URL it was verified against."
    );
  }

  return errors;
}

export function parsePostForm(formData: FormData, id?: string): PostInput {
  const str = (key: string) => String(formData.get(key) || "").trim();
  const orNull = (key: string) => str(key) || null;

  const deadlineRaw = str("actionDeadline");
  const documentDateRaw = str("documentDate");

  return {
    id,
    titleEn: str("titleEn"),
    titleTe: str("titleTe"),
    summaryTe: String(formData.get("summaryTe") || "")
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean),
    englishAbstract: orNull("englishAbstract"),
    statusBadge: str("statusBadge") || "notification",
    pdfUrl: orNull("pdfUrl"),
    actionUrl: orNull("actionUrl"),
    actionDeadline: deadlineRaw ? new Date(deadlineRaw) : null,
    documentDate: documentDateRaw ? new Date(documentDateRaw) : null,
    goReference: orNull("goReference"),
    sourceDept: orNull("sourceDept"),
    sourceUrl: orNull("sourceUrl"),
    categoryId: orNull("categoryId"),
    documentType: orNull("documentType"),
    orderState: str("orderState") || "current",
    tags: String(formData.get("tagsRaw") || "")
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean),
    verifiedAgainstGoir: formData.get("verifiedAgainstGoir") === "on",
    relatedPostIds: formData.getAll("relatedPostIds").map(String).filter(Boolean),
  };
}
