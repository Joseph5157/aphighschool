import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import fs from "node:fs";
import path from "node:path";
import ActionSummary from "@/app/(public)/posts/[slug]/_components/ActionSummary";

// UI-PATTERNS-1 merged the two 95%-identical templates into one shell.
const templates = ["DocumentTemplate.tsx"].map((file) =>
  fs.readFileSync(path.join(process.cwd(), "app", "(public)", "posts", "[slug]", "_templates", file), "utf8")
);

// SLOP-DETAIL-1 (AI_SLOP_AUDIT.md A09) removed this card's fact table. Its five
// rows — reference, department, the labelled date, the deadline and the GOIR
// check — were all already in the document header a few hundred pixels above.
// The rules those rows were guarded by did not go anywhere: they are asserted
// on the header now, in test/detail-header.test.tsx, which renders the real
// DocumentTemplate rather than this card.
const basePost = {
  summaryTe: ["ఇది రచయిత అందించిన తెలుగు సారాంశం."],
  englishAbstract: "An authored English brief.",
  actionUrl: "https://example.com/action",
  pdfUrl: "https://example.com/document.pdf",
  sourceUrl: "https://example.com/source",
};

describe("ActionSummary", () => {
  it("renders authored Telugu with lang=te and the English abstract", () => {
    render(<ActionSummary post={basePost} />);
    expect(screen.getByText(basePost.summaryTe[0]).closest("ul")).toHaveAttribute("lang", "te");
    expect(screen.getByText(basePost.englishAbstract)).toBeInTheDocument();
  });

  it("does not synthesize a summary when authored summary fields are absent", () => {
    render(<ActionSummary post={{ ...basePost, summaryTe: [], englishAbstract: null }} />);
    expect(screen.queryByText(basePost.summaryTe[0])).not.toBeInTheDocument();
    expect(screen.queryByText(basePost.englishAbstract)).not.toBeInTheDocument();
  });

  it("renders nothing at all when there is no summary, abstract or link", () => {
    const { container } = render(
      <ActionSummary
        post={{ summaryTe: [], englishAbstract: null, actionUrl: null, pdfUrl: null, sourceUrl: null }}
      />
    );
    // An empty bordered card announcing "At a Glance" over nothing is the
    // filler this gate exists to remove.
    expect(container).toBeEmptyDOMElement();
  });

  it("no longer repeats facts the document header already states", () => {
    render(<ActionSummary post={basePost} />);
    for (const label of [
      "G.O. / Reference",
      "Department",
      "Important date",
      "GOIR verification",
      "Author-provided summary and document facts",
    ]) {
      expect(screen.queryByText(label), label).not.toBeInTheDocument();
    }
  });

  it("uses neutral safe links without nested controls", () => {
    const { container } = render(<ActionSummary post={basePost} />);
    expect(screen.getByRole("link", { name: /Open action link/i })).toHaveAttribute("href", basePost.actionUrl);
    expect(screen.getByRole("link", { name: /Open PDF/i })).toHaveAttribute("href", basePost.pdfUrl);
    expect(screen.getByRole("link", { name: /Source link/i })).toHaveAttribute("href", basePost.sourceUrl);
    for (const link of screen.getAllByRole("link")) {
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", "noopener noreferrer");
    }
    expect(container.querySelector("a button")).toBeNull();
  });

  it("keeps a document's own source route when it has one and no summary", () => {
    render(
      <ActionSummary
        post={{ summaryTe: [], englishAbstract: null, actionUrl: null, pdfUrl: null, sourceUrl: "https://example.com/source" }}
      />
    );
    expect(screen.getByRole("link", { name: /Source link/i })).toBeInTheDocument();
  });

  it("does not expose unsupported questions or generic notification procedures", () => {
    render(<ActionSummary post={basePost} />);
    for (const text of ["Who is affected?", "What changed?", "What should I do?"]) {
      expect(screen.queryByText(text)).not.toBeInTheDocument();
    }
    for (const template of templates) {
      expect(template).toContain("<ActionSummary post={post} />");
      expect(template).not.toContain("Step-by-Step Procedure Guide");
      expect(template).not.toContain("Executive Order Brief");
      expect(template).not.toContain("Quick Fact");
      expect(template).not.toContain("goir.ap.gov.in (Verified)");
    }
  });

  it("removes unsupported official-source and procedure claims from the templates", () => {
    // One template now serves both document kinds, so every banned phrase is
    // checked against it rather than split by which template used to render it.
    const BANNED = [
      "Official Gazette PDF Attachment",
      "Verified PDF source",
      "Open Original GO PDF",
      "Apply Online / Official Portal",
      "Download Official Notification PDF",
      "Official Repository",
    ];

    for (const template of templates) {
      for (const text of BANNED) expect(template).not.toContain(text);
    }
  });
});
