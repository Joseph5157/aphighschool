import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import TopicsPage from "@/app/(public)/topics/page";

const TOPICS = [
  [
    "Transfers & PTR",
    ["Search Transfers documents", "/search?tag=Transfers"],
    ["Search PTR documents", "/search?tag=PTR"],
  ],
  ["TET", ["Search TET documents", "/search?tag=TET"]],
  ["DSC Recruitment", ["Search DSC documents", "/search?tag=DSC"]],
  [
    "Pay, PRC & DA",
    ["Search PRC documents", "/search?tag=PRC"],
    ["Search DA documents", "/search?tag=DA"],
  ],
  ["Pension & Retirement", ["Open pension guidance", "/pensioners"]],
  [
    "Service Records, Leave & Benefits",
    ["Open CFMS and service-record guides", "/tools/cfms-checker"],
    ["Open leave encashment guide", "/tools/leave-encashment"],
  ],
] as const;

describe("Teacher Topics hub", () => {
  it("renders all six AP teacher topics with their expected internal links", () => {
    render(<TopicsPage />);

    for (const [title, ...links] of TOPICS) {
      expect(screen.getByRole("heading", { name: title })).toBeInTheDocument();
      for (const [label, href] of links) {
        expect(screen.getByRole("link", { name: label })).toHaveAttribute("href", href);
      }
    }
  });

  it("separates document-topic filters from service guides", () => {
    render(<TopicsPage />);
    expect(screen.getByRole("heading", { name: "Document topics" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Service guides" })).toBeInTheDocument();
    expect(screen.getAllByText("Document topic")).toHaveLength(4);
    expect(screen.getAllByText("Service guide")).toHaveLength(2);
  });
});
