export type AuthoringTemplate = {
  id: "short_update" | "standard_document" | "recruitment_exam" | "detailed_explainer";
  label: string;
  bestFor: string;
  wordTarget: string;
  bodyGuidance: string;
  checklist: readonly string[];
};

/**
 * Editorial guidance only. Selecting a template must never generate filler,
 * alter an existing draft, or become part of the saved post record.
 */
export const AUTHORING_TEMPLATES: readonly AuthoringTemplate[] = [
  {
    id: "short_update",
    label: "Short update",
    bestFor: "A link, deadline change, brief result, or one-point clarification.",
    wordTarget: "120–250 words",
    bodyGuidance:
      "Usually leave the article body blank. The title, Telugu summary, short English abstract, source card and related orders form the complete post.",
    checklist: [
      "State what changed and who it affects.",
      "Add a deadline or action link only when one genuinely exists.",
      "Link the official PDF or source; do not lengthen the post with repetition.",
    ],
  },
  {
    id: "standard_document",
    label: "Order / circular",
    bestFor: "A normal GO, circular, memo, or proceeding that needs a verified explanation.",
    wordTarget: "350–700 words",
    bodyGuidance:
      "Use a short introduction followed by clear section headings, paragraphs and lists. Explain the effect of the document instead of reproducing it.",
    checklist: [
      "Identify the document and its practical purpose.",
      "Summarise 5–8 verified points in plain language.",
      "Add a ‘What teachers should do’ section only when action is required.",
      "Connect amendments or background documents through Related Orders.",
    ],
  },
  {
    id: "recruitment_exam",
    label: "Recruitment / exam",
    bestFor: "A notification, application window, hall ticket, examination, or result update.",
    wordTarget: "700–1,200 words",
    bodyGuidance:
      "Organise the explanation around the current lifecycle stage, verified dates, the official application path and the next action.",
    checklist: [
      "Make the current stage and closing date immediately clear.",
      "Separate eligibility guidance, application steps and selection process.",
      "Do not reproduce vacancy, fee, pay-scale or eligibility tables; link the official PDF.",
      "Remove expired calls to action when the lifecycle stage changes.",
    ],
  },
  {
    id: "detailed_explainer",
    label: "Detailed rules / explainer",
    bestFor: "A complex policy, service rule, multi-order topic, or durable reference guide.",
    wordTarget: "1,000–1,600 words",
    bodyGuidance:
      "Build a scannable article with at least four meaningful H2/H3 headings so the page can show its table of contents.",
    checklist: [
      "Open with scope: who is covered, what changed and from when.",
      "Use descriptive headings, short paragraphs and ordered steps.",
      "Distinguish the current rule from older or amended instructions.",
      "Keep numeric matrices and official tables in their source PDFs.",
      "Finish with official sources and complete Related Orders.",
    ],
  },
] as const;

export const DEFAULT_AUTHORING_TEMPLATE_ID: AuthoringTemplate["id"] = "short_update";

