"use client";

import { useCallback, useState } from "react";
import { todayInIST } from "@/lib/dates";
import Button from "@/app/(public)/_components/Button";
import Checkbox from "@/app/(public)/_components/Checkbox";
import Dialog from "@/app/(public)/_components/Dialog";
import Textarea from "@/app/(public)/_components/Textarea";
import {
  AUTHORING_TEMPLATES,
  DEFAULT_AUTHORING_TEMPLATE_ID,
  type AuthoringTemplate,
} from "@/lib/posts/authoring-templates";

type Category = { id: string; nameEn: string };
type CandidatePost = {
  id: string;
  titleEn: string;
  goReference: string | null;
  isDraft: boolean;
  category: { nameEn: string } | null;
};

type PostFormClientProps = {
  action: (formData: FormData) => Promise<void>;
  postId?: string;
  initial?: {
    titleEn: string;
    titleTe: string;
    summaryTe: string[];
    englishAbstract: string | null;
    content: string | null;
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
  categories: Category[];
  candidatePosts: CandidatePost[];
};

// Hand-copied labels for the three Prisma enums (DocType, OrderState,
// PostStatus) driving these <select>s. They cannot be derived: PostFormClient
// is a client component, and importing @prisma/client here to read the enum
// values would pull Prisma into the client bundle. lib/validation/post.ts can
// derive its lists via Object.values() because it is server-only.
// test/post-form-options.test.ts pins the key set of each array against the
// live Prisma enum, so adding a schema value without adding it here goes red
// there instead of silently leaving the value unreachable through this form.
export const DOCUMENT_TYPE_OPTIONS = [
  ["go", "Government Order (GO)"],
  ["circular", "Circular"],
  ["memo", "Memo"],
  ["proceeding", "Proceeding"],
  ["notification", "Notification"],
  ["other", "Other"],
];

export const ORDER_STATE_OPTIONS = [
  ["current", "Current"],
  ["amended", "Amended"],
  ["superseded", "Superseded"],
  ["archived", "Archived"],
];

export const STATUS_OPTIONS = [
  ["notification", "Notification"],
  ["apply_link", "Apply Open"],
  ["hall_ticket", "Hall Ticket"],
  ["results", "Results"],
  ["expired", "Expired"],
];

function countArticleWords(html: string): number {
  const text = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&(?:nbsp|#160);/gi, " ")
    .replace(/\s+/g, " ")
    .trim();

  return text ? text.split(" ").length : 0;
}

export default function PostFormClient({
  action,
  postId,
  initial,
  categories,
  candidatePosts,
}: PostFormClientProps) {
  // Controlled field states for pre-filling
  const [titleEn, setTitleEn] = useState(initial?.titleEn || "");
  const [titleTe, setTitleTe] = useState(initial?.titleTe || "");
  const [summaryTe, setSummaryTe] = useState(initial?.summaryTe?.join("\n") || "");
  const [englishAbstract, setEnglishAbstract] = useState(initial?.englishAbstract || "");
  const [content, setContent] = useState(initial?.content || "");
  const [authoringTemplateId, setAuthoringTemplateId] = useState<AuthoringTemplate["id"]>(
    initial?.content ? "standard_document" : DEFAULT_AUTHORING_TEMPLATE_ID
  );
  const [statusBadge, setStatusBadge] = useState(initial?.statusBadge || "notification");
  const [goReference, setGoReference] = useState(initial?.goReference || "");
  const [actionDeadline, setActionDeadline] = useState(
    initial?.actionDeadline
      ? new Date(initial.actionDeadline).toISOString().slice(0, 10)
      : ""
  );
  const [documentDate, setDocumentDate] = useState(
    initial?.documentDate
      ? new Date(initial.documentDate).toISOString().slice(0, 10)
      : ""
  );
  const [sourceDept, setSourceDept] = useState(initial?.sourceDept || "");

  const [pdfUrl, setPdfUrl] = useState(initial?.pdfUrl || "");
  const [actionUrl, setActionUrl] = useState(initial?.actionUrl || "");
  const [sourceUrl, setSourceUrl] = useState(initial?.sourceUrl || "");
  const [categoryId, setCategoryId] = useState(initial?.categoryId || "");
  const [documentType, setDocumentType] = useState(initial?.documentType || "");
  const [orderState, setOrderState] = useState(initial?.orderState || "current");
  const [tagsRaw, setTagsRaw] = useState(initial?.tags?.join(", ") || "");
  const [verifiedAgainstGoir, setVerifiedAgainstGoir] = useState(
    initial?.verifiedAgainstGoir || false
  );

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [jsonInput, setJsonInput] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // One handler behind every way out of the dialog: the close button, the
  // scrim, Escape, and Cancel. Previously two of those cleared the error and
  // the other two did not exist.
  const closeJsonDialog = useCallback(() => {
    setIsModalOpen(false);
    setErrorMsg(null);
  }, []);

  const relatedSet = new Set(initial?.relatedPostIds || []);
  const authoringTemplate =
    AUTHORING_TEMPLATES.find((template) => template.id === authoringTemplateId) ??
    AUTHORING_TEMPLATES[0];
  const contentWordCount = countArticleWords(content);

  const handleLoadJson = () => {
    setErrorMsg(null);
    const trimmed = jsonInput.trim();
    if (!trimmed) {
      setErrorMsg("Invalid JSON — check the LLM output and try again");
      return;
    }

    let parsed: any;
    try {
      parsed = JSON.parse(trimmed);
    } catch (err) {
      setErrorMsg("Invalid JSON — check the LLM output and try again");
      return;
    }

    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
      setErrorMsg("Invalid JSON — check the LLM output and try again");
      return;
    }

    if (parsed.skip === true) {
      const reason = parsed.reason || "No reason provided";
      setErrorMsg(`LLM flagged this as out of scope: ${reason}`);
      return;
    }

    // Parse and pre-fill all matching form fields automatically
    if (parsed.titleEn !== undefined && parsed.titleEn !== null) {
      setTitleEn(String(parsed.titleEn));
    }
    if (parsed.titleTe !== undefined && parsed.titleTe !== null) {
      setTitleTe(String(parsed.titleTe));
    }
    if (parsed.summaryTe !== undefined && parsed.summaryTe !== null) {
      setSummaryTe(
        Array.isArray(parsed.summaryTe)
          ? parsed.summaryTe.join("\n")
          : String(parsed.summaryTe)
      );
    }
    if (parsed.englishAbstract !== undefined && parsed.englishAbstract !== null) {
      setEnglishAbstract(String(parsed.englishAbstract));
    }
    if (parsed.goReference !== undefined && parsed.goReference !== null) {
      setGoReference(String(parsed.goReference));
    }
    if (parsed.sourceDept !== undefined && parsed.sourceDept !== null) {
      setSourceDept(String(parsed.sourceDept));
    }
    if (parsed.statusBadge !== undefined && parsed.statusBadge !== null) {
      setStatusBadge(String(parsed.statusBadge));
    }
    if (parsed.actionDeadline !== undefined && parsed.actionDeadline !== null) {
      setActionDeadline(String(parsed.actionDeadline).slice(0, 10));
    }

    setIsModalOpen(false);
    setJsonInput("");
  };

  return (
    <>
      <form action={action} className="max-w-2xl space-y-5">
        {/* Header toolbar with Paste JSON Draft button */}
        <div className="flex items-start justify-between gap-4">
          <div className="bg-turmeric/10 border-l-4 border-turmeric rounded-lg px-4 py-3 text-xs text-inkSoft flex-1">
            <strong className="text-turmericDeep font-mono uppercase text-[10px]">
              Before publishing
            </strong>
            <p className="mt-1">
              Verify against GOIR · check Telugu against the glossary · never retype tables/PTR
              data — leave them in the PDF only · link Related Orders · confirm lifecycle stage.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setIsModalOpen(true);
              setErrorMsg(null);
            }}
            className="shrink-0 px-3.5 py-2 bg-paperRaised border border-hair hover:border-turmeric text-ink font-mono text-xs font-semibold rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
          >
            <svg className="w-4 h-4 text-turmericDeep" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1.207 1.207 0 01.853.353l4.353 4.353a1.207 1.207 0 01.353.853V19a2 2 0 01-2 2z" />
            </svg>
            Paste JSON Draft
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-mono uppercase text-inkSoft mb-1">
              Title (English) *
            </label>
            <input
              name="titleEn"
              value={titleEn}
              onChange={(e) => setTitleEn(e.target.value)}
              required
              className="w-full border border-hair rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-mono uppercase text-inkSoft mb-1">
              Title (Telugu) *
            </label>
            <input
              name="titleTe"
              value={titleTe}
              onChange={(e) => setTitleTe(e.target.value)}
              required
              className="w-full border border-hair rounded-lg px-3 py-2 text-sm font-telugu"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-mono uppercase text-inkSoft mb-1">
            Telugu Summary — one bullet per line *
          </label>
          <textarea
            name="summaryTe"
            value={summaryTe}
            onChange={(e) => setSummaryTe(e.target.value)}
            required
            rows={4}
            className="w-full border border-hair rounded-lg px-3 py-2 text-sm font-telugu"
          />
        </div>

        <div>
          <label className="block text-xs font-mono uppercase text-inkSoft mb-1">
            English Abstract
          </label>
          <textarea
            name="englishAbstract"
            value={englishAbstract}
            onChange={(e) => setEnglishAbstract(e.target.value)}
            rows={2}
            className="w-full border border-hair rounded-lg px-3 py-2 text-sm"
            placeholder="Applies to: ... · Key rule: ... · Deadline: ..."
          />
        </div>

        <section
          aria-labelledby="authoring-guide-heading"
          className="space-y-4 rounded-xl border border-hair bg-paperRaised p-4"
        >
          <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_13rem] sm:items-end">
            <div>
              <h2 id="authoring-guide-heading" className="text-sm font-bold text-ink">
                Article length guide
              </h2>
              <p className="mt-1 text-xs leading-relaxed text-inkSoft">
                Choose the post type to see its writing checklist. This choice is guidance only
                and is not saved or used to fill the article.
              </p>
            </div>
            <div>
              <label
                htmlFor="authoringTemplate"
                className="mb-1 block text-xs font-semibold text-inkSoft"
              >
                Post type
              </label>
              <select
                id="authoringTemplate"
                value={authoringTemplateId}
                onChange={(event) =>
                  setAuthoringTemplateId(event.target.value as AuthoringTemplate["id"])
                }
                className="w-full rounded-lg border border-hair bg-white px-3 py-2 text-sm"
              >
                {AUTHORING_TEMPLATES.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="rounded-lg border border-turmeric/30 bg-turmeric/10 p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-bold text-ink">{authoringTemplate.label}</p>
              <span className="rounded-full bg-paperRaised px-2.5 py-1 text-xs font-semibold text-turmericDeep">
                Target: {authoringTemplate.wordTarget}
              </span>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-inkSoft">
              <strong className="text-ink">Best for:</strong> {authoringTemplate.bestFor}
            </p>
            <p className="mt-2 text-xs leading-relaxed text-inkSoft">
              {authoringTemplate.bodyGuidance}
            </p>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-xs leading-relaxed text-inkSoft">
              {authoringTemplate.checklist.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </section>

        <div>
          <div className="mb-1 flex flex-wrap items-baseline justify-between gap-2">
            <label htmlFor="content" className="block text-xs font-mono uppercase text-inkSoft">
              Structured article HTML (optional)
            </label>
            <span aria-live="polite" className="text-xs text-inkSoft">
              {contentWordCount.toLocaleString("en-IN")} words
            </span>
          </div>
          <Textarea
            id="content"
            name="content"
            mono
            value={content}
            onChange={(event) => setContent(event.target.value)}
            rows={14}
            placeholder={'<h2>What changed</h2>\n<p>Verified explanation…</p>\n<ul>\n  <li>Key point</li>\n</ul>'}
          />
          <p className="mt-1.5 text-xs leading-relaxed text-inkSoft">
            Leave blank for a short post. For longer posts, use trusted HTML with headings,
            paragraphs and lists. Never retype numeric tables, vacancy grids, pay scales or
            eligibility matrices—link the official PDF instead.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-mono uppercase text-inkSoft mb-1">
              Lifecycle Stage
            </label>
            <select
              name="statusBadge"
              value={statusBadge}
              onChange={(e) => setStatusBadge(e.target.value)}
              className="w-full border border-hair rounded-lg px-3 py-2 text-sm bg-white"
            >
              {STATUS_OPTIONS.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-mono uppercase text-inkSoft mb-1">
              Category
            </label>
            <select
              name="categoryId"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full border border-hair rounded-lg px-3 py-2 text-sm bg-white"
            >
              <option value="">— None —</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nameEn}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-mono uppercase text-inkSoft mb-1">
              Document Type
            </label>
            <select
              name="documentType"
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value)}
              className="w-full border border-hair rounded-lg px-3 py-2 text-sm bg-white"
            >
              <option value="">— None —</option>
              {DOCUMENT_TYPE_OPTIONS.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-mono uppercase text-inkSoft mb-1">
              Order State
            </label>
            <select
              name="orderState"
              value={orderState}
              onChange={(e) => setOrderState(e.target.value)}
              className="w-full border border-hair rounded-lg px-3 py-2 text-sm bg-white"
            >
              {ORDER_STATE_OPTIONS.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <p className="mt-1 text-[11px] text-inkSoft">
              Only shown for orders, circulars, memos and proceedings. Recruitment
              notifications show application stages instead.
            </p>
          </div>
        </div>

        <div>
          <label className="block text-xs font-mono uppercase text-inkSoft mb-1">
            Topic Tags (comma separated)
          </label>
          <input
            name="tagsRaw"
            value={tagsRaw}
            onChange={(e) => setTagsRaw(e.target.value)}
            placeholder="Transfers, PRC, TET"
            className="w-full border border-hair rounded-lg px-3 py-2 text-sm"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-mono uppercase text-inkSoft mb-1">
              GO / Memo Reference
            </label>
            <input
              name="goReference"
              value={goReference}
              onChange={(e) => setGoReference(e.target.value)}
              placeholder="G.O.Ms.No.129"
              className="w-full border border-hair rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-mono uppercase text-inkSoft mb-1">
              Action Deadline
            </label>
            <input
              type="date"
              name="actionDeadline"
              value={actionDeadline}
              onChange={(e) => setActionDeadline(e.target.value)}
              className="w-full border border-hair rounded-lg px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-mono uppercase text-inkSoft mb-1">
              Official Document Date
            </label>
            <input
              type="date"
              name="documentDate"
              value={documentDate}
              onChange={(e) => setDocumentDate(e.target.value)}
              max={todayInIST()}
              className="w-full border border-hair rounded-lg px-3 py-2 text-sm"
            />
            <p className="mt-1 text-[11px] text-inkSoft">
              The date the department issued this order. Leave blank if you cannot verify it —
              do not guess.
            </p>
          </div>
          <div>
            <label className="block text-xs font-mono uppercase text-inkSoft mb-1">
              Action URL
            </label>
            <input
              name="actionUrl"
              value={actionUrl}
              onChange={(e) => setActionUrl(e.target.value)}
              placeholder="https://apply.example.gov.in/..."
              className="w-full border border-hair rounded-lg px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-mono uppercase text-inkSoft mb-1">
            PDF Link (Google Drive, Day-1 storage per Section 6.1)
          </label>
          <input
            name="pdfUrl"
            value={pdfUrl}
            onChange={(e) => setPdfUrl(e.target.value)}
            placeholder="https://drive.google.com/file/d/.../view"
            className="w-full border border-hair rounded-lg px-3 py-2 text-sm"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-mono uppercase text-inkSoft mb-1">
              Source Department
            </label>
            <input
              name="sourceDept"
              value={sourceDept}
              onChange={(e) => setSourceDept(e.target.value)}
              placeholder="School Education, AP"
              className="w-full border border-hair rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-mono uppercase text-inkSoft mb-1">
              Source URL
            </label>
            <input
              name="sourceUrl"
              value={sourceUrl}
              onChange={(e) => setSourceUrl(e.target.value)}
              placeholder="https://goir.ap.gov.in/..."
              className="w-full border border-hair rounded-lg px-3 py-2 text-sm"
            />
          </div>
        </div>

        <Checkbox
          name="verifiedAgainstGoir"
          checked={verifiedAgainstGoir}
          onChange={(e) => setVerifiedAgainstGoir(e.target.checked)}
          label="Verified against GOIR (goir.ap.gov.in)"
          description="Check only after manually verifying this document against the official GOIR portal. Requires a valid https://goir.ap.gov.in source URL."
        />

        <div>
          <label className="block text-xs font-mono uppercase text-inkSoft mb-2">
            Related Orders — background context (completeness priority)
          </label>
          <div className="max-h-64 overflow-y-auto rounded-lg border border-hair bg-paperRaised">
            {candidatePosts.length === 0 && (
              <p className="text-xs text-inkSoft p-3">
                No other posts yet to link as background.
              </p>
            )}
            {candidatePosts.map((p) => (
              <Checkbox
                key={p.id}
                name="relatedPostIds"
                value={p.id}
                defaultChecked={relatedSet.has(p.id)}
                className="border-b border-hair px-3 last:border-b-0"
                label={
                  <span className="block min-w-0 py-1">
                    <span className="block truncate font-medium">{p.titleEn}</span>
                    <span className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-inkSoft">
                      <span
                        className={`rounded-full border px-2 py-0.5 font-semibold ${
                          p.isDraft
                            ? "border-hair bg-paper text-inkSoft"
                            : "border-tamarind/30 bg-tamarind/10 text-tamarind"
                        }`}
                      >
                        {p.isDraft ? "Draft — hidden until published" : "Published"}
                      </span>
                      {p.category && <span>{p.category.nameEn}</span>}
                      {p.goReference && (
                        <span className="font-mono">{p.goReference}</span>
                      )}
                    </span>
                  </span>
                }
              />
            ))}
          </div>
        </div>

        <button
          type="submit"
          className="bg-ink text-white text-sm font-semibold px-5 py-2.5 rounded-lg"
        >
          {postId ? "Save Changes" : "Create Post"}
        </button>
      </form>

      <Dialog
        open={isModalOpen}
        onClose={closeJsonDialog}
        title="Paste JSON Draft"
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={closeJsonDialog}>
              Cancel
            </Button>
            <Button variant="turmeric" size="sm" onClick={handleLoadJson}>
              Load
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-xs text-inkSoft">
            Paste the JSON output from the LLM template below to automatically fill the post form fields.
          </p>

          {errorMsg && (
            <p
              role="alert"
              className="p-3 bg-kumkum/10 border border-kumkum/30 rounded-lg text-xs text-kumkum font-mono"
            >
              {errorMsg}
            </p>
          )}

          <Textarea
            mono
            aria-label="JSON draft"
            error={Boolean(errorMsg)}
            value={jsonInput}
            onChange={(e) => {
              setJsonInput(e.target.value);
              if (errorMsg) setErrorMsg(null);
            }}
            placeholder={`{\n  "titleEn": "...",\n  "titleTe": "...",\n  "summaryTe": [...],\n  "englishAbstract": "...",\n  "goReference": "...",\n  "sourceDept": "...",\n  "statusBadge": "notification",\n  "actionDeadline": "YYYY-MM-DD"\n}`}
            rows={10}
          />
        </div>
      </Dialog>
    </>
  );
}
