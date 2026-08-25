"use client";

import { useState } from "react";

type Category = { id: string; nameEn: string };
type CandidatePost = { id: string; titleEn: string; goReference: string | null };

type PostFormClientProps = {
  action: (formData: FormData) => Promise<void>;
  postId?: string;
  initial?: {
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
    docType: string | null;
    tags: string[];
    verifiedAgainstGoir: boolean;
    relatedPostIds: string[];
  };
  categories: Category[];
  candidatePosts: CandidatePost[];
};

const STATUS_OPTIONS = [
  ["notification", "Notification"],
  ["apply_link", "Apply Open"],
  ["hall_ticket", "Hall Ticket"],
  ["results", "Results"],
  ["expired", "Expired"],
];

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
  const [docType, setDocType] = useState(initial?.docType || "");
  const [tagsRaw, setTagsRaw] = useState(initial?.tags?.join(", ") || "");
  const [verifiedAgainstGoir, setVerifiedAgainstGoir] = useState(
    initial?.verifiedAgainstGoir || false
  );

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [jsonInput, setJsonInput] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const relatedSet = new Set(initial?.relatedPostIds || []);

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
              name="docType"
              value={docType}
              onChange={(e) => setDocType(e.target.value)}
              className="w-full border border-hair rounded-lg px-3 py-2 text-sm bg-white"
            >
              <option value="">— None —</option>
              <option value="go">Government Order (GO)</option>
              <option value="circular">Circular</option>
              <option value="memo">Memo</option>
              <option value="proceeding">Proceeding</option>
              <option value="notification">Notification</option>
            </select>
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
              max={new Date().toISOString().slice(0, 10)}
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

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="verifiedAgainstGoir"
            checked={verifiedAgainstGoir}
            onChange={(e) => setVerifiedAgainstGoir(e.target.checked)}
          />
          Verified against GOIR (goir.ap.gov.in)
        </label>

        <div>
          <label className="block text-xs font-mono uppercase text-inkSoft mb-2">
            Related Orders — background context (completeness priority)
          </label>
          <div className="border border-hair rounded-lg max-h-48 overflow-y-auto bg-white">
            {candidatePosts.length === 0 && (
              <p className="text-xs text-inkSoft p-3">
                No other posts yet to link as background.
              </p>
            )}
            {candidatePosts.map((p) => (
              <label
                key={p.id}
                className="flex items-center gap-2 text-sm px-3 py-2 border-b border-hair last:border-b-0"
              >
                <input
                  type="checkbox"
                  name="relatedPostIds"
                  value={p.id}
                  defaultChecked={relatedSet.has(p.id)}
                />
                <span className="truncate">
                  {p.titleEn} {p.goReference && <span className="font-mono text-[10px] text-inkSoft">· {p.goReference}</span>}
                </span>
              </label>
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

      {/* Textarea Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl border border-hair w-full max-w-lg overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-hair bg-paperRaised">
              <h3 className="text-sm font-semibold text-ink font-mono uppercase">Paste JSON Draft</h3>
              <button
                type="button"
                onClick={() => {
                  setIsModalOpen(false);
                  setErrorMsg(null);
                }}
                className="text-inkSoft hover:text-ink text-sm px-2 py-1 rounded"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-4">
              <p className="text-xs text-inkSoft">
                Paste the JSON output from the LLM template below to automatically fill the post form fields.
              </p>

              {errorMsg && (
                <div className="p-3 bg-kumkum/10 border border-kumkum/30 rounded-lg text-xs text-kumkum font-mono">
                  {errorMsg}
                </div>
              )}

              <textarea
                value={jsonInput}
                onChange={(e) => {
                  setJsonInput(e.target.value);
                  if (errorMsg) setErrorMsg(null);
                }}
                placeholder={`{\n  "titleEn": "...",\n  "titleTe": "...",\n  "summaryTe": [...],\n  "englishAbstract": "...",\n  "goReference": "...",\n  "sourceDept": "...",\n  "statusBadge": "notification",\n  "actionDeadline": "YYYY-MM-DD"\n}`}
                rows={10}
                className="w-full font-mono text-xs p-3 border border-hair rounded-lg focus:outline-none focus:border-turmeric bg-paperRaised/50 text-ink"
              />

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setErrorMsg(null);
                  }}
                  className="px-4 py-2 text-xs font-mono font-medium text-inkSoft hover:text-ink border border-hair rounded-lg bg-white"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleLoadJson}
                  className="px-4 py-2 text-xs font-mono font-semibold text-white bg-turmericDeep hover:bg-turmericDeep/90 rounded-lg shadow-sm"
                >
                  Load
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
