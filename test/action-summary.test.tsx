import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import fs from "node:fs";
import path from "node:path";
import ActionSummary from "@/app/(public)/posts/[slug]/_components/ActionSummary";

const templates = ["GoMemoTemplate.tsx", "NotificationTemplate.tsx"].map((file) =>
  fs.readFileSync(path.join(process.cwd(), "app", "(public)", "posts", "[slug]", "_templates", file), "utf8")
);

const basePost = {
  summaryTe: ["ఇది రచయిత అందించిన తెలుగు సారాంశం."],
  englishAbstract: "An authored English brief.",
  goReference: "G.O.Ms.No.129",
  sourceDept: "School Education, AP",
  documentDate: new Date("2024-02-08T00:00:00.000Z"),
  createdAt: new Date("2026-08-24T10:00:00.000Z"),
  actionDeadline: new Date("2026-08-30T00:00:00.000Z"),
  verifiedAgainstGoir: true,
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

  it("renders optional facts only when explicit and labels a fallback date honestly", () => {
    render(<ActionSummary post={{ ...basePost, goReference: null, sourceDept: null, documentDate: null, actionDeadline: null, verifiedAgainstGoir: false }} />);
    expect(screen.queryByText("G.O. / Reference")).not.toBeInTheDocument();
    expect(screen.queryByText("Department")).not.toBeInTheDocument();
    expect(screen.getByText("Added to portal")).toBeInTheDocument();
    expect(screen.queryByText("Important date")).not.toBeInTheDocument();
    expect(screen.queryByText("GOIR verification")).not.toBeInTheDocument();
    expect(screen.queryByText("Official Date")).not.toBeInTheDocument();
    expect(screen.queryByText(/goir\.ap\.gov\.in/i)).not.toBeInTheDocument();
  });

  it("renders explicit deadline and GOIR verification", () => {
    render(<ActionSummary post={basePost} />);
    expect(screen.getByText("Important date")).toBeInTheDocument();
    expect(screen.getByText("GOIR verification")).toBeInTheDocument();
    expect(screen.getByText("Verified")).toBeInTheDocument();
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
    const [goMemo, notification] = templates;

    for (const text of ["Official Gazette PDF Attachment", "Verified PDF source", "Open Original GO PDF"]) {
      expect(goMemo).not.toContain(text);
    }
    for (const text of ["Apply Online / Official Portal", "Download Official Notification PDF", "Official Repository"]) {
      expect(notification).not.toContain(text);
    }
  });
});
