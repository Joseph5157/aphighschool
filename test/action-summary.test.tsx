import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import fs from "node:fs";
import path from "node:path";
import ActionSummary from "@/app/(public)/posts/[slug]/_components/ActionSummary";
import OfficialSourceCard from "@/app/(public)/posts/[slug]/_components/OfficialSourceCard";

const template = fs.readFileSync(
  path.join(
    process.cwd(),
    "app",
    "(public)",
    "posts",
    "[slug]",
    "_templates",
    "DocumentTemplate.tsx",
  ),
  "utf8",
);

const summaryPost = {
  summaryTe: ["ఇది రచయిత అందించిన తెలుగు సారాంశం."],
  englishAbstract: "An authored English brief.",
};

const sourcePost = {
  sourceDept: "School Education Department",
  documentDate: new Date("2026-03-12T00:00:00Z"),
  createdAt: new Date("2026-04-01T00:00:00Z"),
  verifiedAgainstGoir: true,
  actionUrl: "https://example.com/action",
  pdfUrl: "https://example.com/document.pdf",
  sourceUrl: "https://example.com/source",
};

describe("reusable post introduction", () => {
  it("renders authored Telugu with lang=te and the English abstract", () => {
    render(<ActionSummary post={summaryPost} />);
    expect(screen.getByText(summaryPost.summaryTe[0]).closest("ul")).toHaveAttribute(
      "lang",
      "te",
    );
    expect(screen.getByText(summaryPost.englishAbstract)).toBeInTheDocument();
  });

  it("renders no empty At a Glance card when authored summary fields are absent", () => {
    const { container } = render(
      <ActionSummary post={{ summaryTe: [], englishAbstract: null }} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("keeps provenance and actions out of the authored summary", () => {
    render(<ActionSummary post={summaryPost} />);
    for (const label of [
      "Official source",
      "Open document PDF",
      "Open action link",
      "View source",
      "Department",
      "GOIR verification",
    ]) {
      expect(screen.queryByText(label), label).not.toBeInTheDocument();
    }
  });

  it("renders source facts and outbound actions together", () => {
    const { container } = render(<OfficialSourceCard post={sourcePost} />);

    expect(screen.getByRole("heading", { name: "Official source" })).toBeInTheDocument();
    expect(screen.getByText("School Education Department")).toBeInTheDocument();
    expect(screen.getByText(/Issued/)).toBeInTheDocument();
    expect(screen.getByText("GOIR Verified")).toBeInTheDocument();

    expect(screen.getByRole("link", { name: /Open document PDF/i })).toHaveAttribute(
      "href",
      sourcePost.pdfUrl,
    );
    expect(screen.getByRole("link", { name: /Open action link/i })).toHaveAttribute(
      "href",
      sourcePost.actionUrl,
    );
    expect(screen.getByRole("link", { name: /View source/i })).toHaveAttribute(
      "href",
      sourcePost.sourceUrl,
    );

    for (const link of screen.getAllByRole("link")) {
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", "noopener noreferrer");
    }
    expect(container.querySelector("a button")).toBeNull();
  });

  it("keeps the source card useful when no outbound link exists", () => {
    render(
      <OfficialSourceCard
        post={{
          ...sourcePost,
          actionUrl: null,
          pdfUrl: null,
          sourceUrl: null,
        }}
      />,
    );
    expect(screen.getByText("School Education Department")).toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("passes only sanitized competitor-sensitive URLs to the source card", () => {
    expect(template).toContain("const safeActionUrl = dropCompetitorLink(post.actionUrl)");
    expect(template).toContain("const safeSourceUrl = dropCompetitorLink(post.sourceUrl)");
    expect(template).toContain("<OfficialSourceCard post={sourcePost} />");
    expect(template).not.toContain("Step-by-Step Procedure Guide");
    expect(template).not.toContain("Executive Order Brief");
    expect(template).not.toContain("Quick Fact");
  });

  it("does not introduce unsupported official-source claims", () => {
    for (const text of [
      "Official Gazette PDF Attachment",
      "Verified PDF source",
      "Open Original GO PDF",
      "Apply Online / Official Portal",
      "Download Official Notification PDF",
      "Official Repository",
    ]) {
      expect(template).not.toContain(text);
    }
  });
});
