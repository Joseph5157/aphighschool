import type { DocType } from "@prisma/client";

/**
 * TERM-SEARCH-1 — the controlled teacher vocabulary.
 *
 * Source of truth: docs/context/TERM_NAV_1_PLAN.md §6 (document types) and §7
 * (teacher topics), approved by the founder as written. Every alias below is
 * copied from those tables; the only additions are the two worked examples in
 * §10 (`జీవో`, `ఆర్జిత సెలవు`). Do not grow these lists from competitor pages
 * or guesswork — add a term here only after it is added to the plan.
 *
 * The stored value is always the canonical key (`DocType` or the canonical
 * tag). Display labels and aliases are presentation/search data only.
 */

export type DocumentTerm = {
  type: Exclude<DocType, "other">;
  display: string;
  telugu: string[];
  aliases: string[];
};

export type TopicTerm = {
  /** The canonical tag stored on a post. */
  tag: string;
  display: string;
  telugu: string[];
  aliases: string[];
};

export const DOCUMENT_TERMS: DocumentTerm[] = [
  {
    type: "go",
    display: "GOs",
    telugu: ["జీవోలు", "ప్రభుత్వ ఉత్తర్వులు"],
    aliases: ["GO", "G.O.", "G.O.Ms.No", "GO copy", "Government Order", "ఉత్తర్వులు", "జీవో"],
  },
  {
    type: "proceeding",
    display: "Proceedings",
    telugu: ["ప్రొసీడింగ్స్"],
    aliases: ["Proceeding", "Proceedings", "Proc.", "Rc", "Rc.No.", "కార్యాలయ ఉత్తర్వులు"],
  },
  {
    type: "memo",
    display: "Memos",
    telugu: ["మెమోలు"],
    aliases: ["Memo", "Memorandum", "Circular Memo", "మెమో"],
  },
  {
    type: "circular",
    display: "Circulars",
    telugu: ["సర్క్యులర్లు"],
    aliases: ["Circular", "Cir.", "సర్క్యులర్"],
  },
  {
    type: "notification",
    display: "Notifications",
    telugu: ["నోటిఫికేషన్లు", "ప్రకటనలు"],
    aliases: ["Notification", "Notice", "ప్రకటన", "నోటిఫికేషన్"],
  },
];

export const TOPIC_TERMS: TopicTerm[] = [
  {
    tag: "Transfers",
    display: "Teacher Transfers",
    telugu: ["ఉపాధ్యాయ బదిలీలు"],
    aliases: ["transfer", "బదిలీలు", "counselling", "web counselling"],
  },
  {
    tag: "Rationalisation",
    display: "Rationalisation & Re-apportionment",
    telugu: ["రేషనలైజేషన్", "హేతుబద్ధీకరణ"],
    aliases: ["rationalization", "reapportionment", "re-apportionment", "PTR", "surplus teacher"],
  },
  {
    tag: "Promotions",
    display: "Promotions & Seniority",
    telugu: ["పదోన్నతులు & సీనియారిటీ"],
    aliases: ["promotion", "seniority", "panel", "vacancy"],
  },
  {
    tag: "Service Rules",
    display: "Service Rules",
    telugu: ["సర్వీస్ రూల్స్", "సేవా నిబంధనలు"],
    aliases: ["APSSR", "probation", "regularisation", "cadre"],
  },
  {
    tag: "Leave Rules",
    display: "Leave Rules",
    telugu: ["సెలవు నిబంధనలు"],
    aliases: ["EL", "HPL", "CCL", "CL", "EOL", "surrender leave", "earned leave", "ఆర్జిత సెలవు"],
  },
  {
    tag: "PRC",
    display: "PRC & Pay Fixation",
    telugu: ["పీఆర్‌సీ & పే ఫిక్సేషన్"],
    aliases: ["RPS", "revised pay scales", "fitment", "AAS"],
  },
  {
    tag: "DA",
    display: "DA & Arrears",
    telugu: ["డీఏ & బకాయిలు"],
    aliases: ["dearness allowance", "DA arrears", "DR"],
  },
  {
    tag: "DSC",
    display: "DSC Recruitment",
    telugu: ["డీఎస్సీ నియామకాలు"],
    aliases: ["TRT", "recruitment", "SA posts", "SGT posts"],
  },
  {
    tag: "TET",
    display: "AP TET",
    telugu: ["ఏపీ టెట్"],
    aliases: ["APTET", "teacher eligibility test"],
  },
  {
    tag: "Exams",
    display: "Exams & SCERT",
    telugu: ["పరీక్షలు & ఎస్సీఈఆర్టీ"],
    aliases: ["SA1", "SA2", "FA", "CCE", "answer key", "model paper", "LEAP"],
  },
  {
    tag: "School Administration",
    display: "School Administration",
    telugu: ["పాఠశాల నిర్వహణ"],
    aliases: ["MDM", "PM POSHAN", "UDISE", "academic calendar", "Nadu Nedu", "grants"],
  },
  {
    tag: "CFMS",
    display: "CFMS & Bills",
    telugu: ["సిఎఫ్‌ఎమ్‌ఎస్ & బిల్లులు"],
    aliases: ["bill status", "payslip", "DDO", "STO", "treasury"],
  },
  {
    tag: "GPF/APGLI",
    display: "GPF, ZPPF & APGLI",
    telugu: ["జీపీఎఫ్, జడ్పీపీఎఫ్ & ఏపీజీఎల్ఐ"],
    aliases: ["provident fund", "annual slip", "policy", "loan"],
  },
  {
    tag: "EHS",
    display: "EHS & Medical Reimbursement",
    telugu: ["ఈహెచ్ఎస్ & వైద్య రీయింబర్స్‌మెంట్"],
    aliases: ["health card", "referral hospital", "MR bill"],
  },
  {
    tag: "Pension",
    display: "Pension & Retirement",
    telugu: ["పెన్షన్ & పదవీ విరమణ"],
    aliases: ["retirement", "gratuity", "DCRG", "commutation", "PPO", "AG", "DR"],
  },
];

/**
 * Splits text into comparable tokens. Case, punctuation, `&`/"and" and the
 * zero-width (non-)joiners Telugu text often carries are not meaningful for
 * matching; a run of single Latin letters is an initialism (`G.O.` → `go`).
 */
export function normaliseTokens(text: string): string[] {
  const raw = text
    .normalize("NFC")
    .replace(/[​-‍﻿]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .split(/[^\p{L}\p{M}\p{N}]+/u)
    .filter(Boolean);

  const tokens: string[] = [];
  let initials = "";
  for (const token of raw) {
    if (/^[a-z]$/.test(token)) {
      initials += token;
      continue;
    }
    if (initials) tokens.push(initials);
    initials = "";
    tokens.push(token);
  }
  if (initials) tokens.push(initials);
  return tokens;
}

type Intent = { kind: "document"; type: DocumentTerm["type"] } | { kind: "topic"; tag: string };

const ALIAS_INDEX = new Map<string, Intent[]>();
let longestAlias = 1;

function index(phrase: string, intent: Intent) {
  const tokens = normaliseTokens(phrase);
  if (tokens.length === 0) return;
  const key = tokens.join(" ");
  const existing = ALIAS_INDEX.get(key) ?? [];
  const duplicate = existing.some((i) =>
    i.kind === "document" && intent.kind === "document"
      ? i.type === intent.type
      : i.kind === "topic" && intent.kind === "topic" && i.tag === intent.tag
  );
  if (!duplicate) ALIAS_INDEX.set(key, [...existing, intent]);
  longestAlias = Math.max(longestAlias, tokens.length);
}

for (const term of DOCUMENT_TERMS) {
  for (const phrase of [term.type, term.display, ...term.telugu, ...term.aliases]) {
    index(phrase, { kind: "document", type: term.type });
  }
}
for (const term of TOPIC_TERMS) {
  for (const phrase of [term.tag, term.display, ...term.telugu, ...term.aliases]) {
    index(phrase, { kind: "topic", tag: term.tag });
  }
}

export type QueryInterpretation = {
  /** Document types named by the query; a post may be any one of them. */
  documentTypes: DocumentTerm["type"][];
  /**
   * Topics named by the query. Each inner list is one recognised term (an
   * ambiguous alias such as `DR` can mean more than one topic); a post must
   * satisfy every term.
   */
  topicTags: string[][];
  /** Unrecognised whole numbers — reference numbers such as the 22 in `GO 22`. */
  numbers: string[];
  /** Unrecognised words, each still required as a literal substring. */
  words: string[];
};

/**
 * Reads a free-text query against the controlled vocabulary. Returns null when
 * nothing in it is a known term: an unknown query stays a plain literal search
 * and is never widened (TERM_NAV_1_PLAN.md §10 rule 5).
 */
export function interpretQuery(query: string): QueryInterpretation | null {
  const tokens = normaliseTokens(query);
  const documentTypes = new Set<DocumentTerm["type"]>();
  const topicTags: string[][] = [];
  const numbers: string[] = [];
  const words: string[] = [];
  let recognised = false;

  for (let i = 0; i < tokens.length; ) {
    let matched = false;
    for (let len = Math.min(longestAlias, tokens.length - i); len > 0; len--) {
      const intents = ALIAS_INDEX.get(tokens.slice(i, i + len).join(" "));
      if (!intents) continue;
      recognised = true;
      const docs = intents.filter((x): x is Extract<Intent, { kind: "document" }> => x.kind === "document");
      const tags = intents.flatMap((x) => (x.kind === "topic" ? [x.tag] : []));
      docs.forEach((d) => documentTypes.add(d.type));
      if (tags.length && !topicTags.some((g) => g.join("|") === tags.join("|"))) topicTags.push(tags);
      i += len;
      matched = true;
      break;
    }
    if (matched) continue;
    const token = tokens[i];
    (/^\d+$/.test(token) ? numbers : words).push(token);
    i += 1;
  }

  if (!recognised) return null;
  return { documentTypes: [...documentTypes], topicTags, numbers, words };
}

/**
 * Every lower-cased form a stored tag may take for a canonical topic: the tag
 * itself plus its aliases, so content tagged before TERM-TOPICS-1 retagging
 * (e.g. a legacy `PTR` or `MDM` tag) still answers its canonical topic.
 */
export function tagFormsFor(tag: string): string[] {
  const term = TOPIC_TERMS.find((t) => t.tag === tag);
  const forms = term ? [term.tag, term.display, ...term.telugu, ...term.aliases] : [tag];
  return [...new Set(forms.map((f) => f.toLowerCase()))];
}
